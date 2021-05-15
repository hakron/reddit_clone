import argon2 from 'argon2'
import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from 'type-graphql'
import { v4 } from 'uuid'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants'
import { User } from '../entities/User'
import { MyContext } from '../types'
import { sendEmail } from '../utils/sendEmail'
import { validateRegister } from '../utils/validateRegister'
import { UsernamePasswordInput } from './usernamePasswordInput'
@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string

}
@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() { req }: MyContext) {
        //show the email if the user is allowed
        if (req.session.userId === user.id) {
            return user.email
        }
        return ""
    }

    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
        if (!req.session.userId) {
            return null
        }
        return User.findOne(req.session.userId)
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 3) {
            return {
                errors: [{
                    field: 'newPassword',
                    message: 'Length must be greater than 3'
                }]
            }
        }
        const userId = await redis.get(FORGET_PASSWORD_PREFIX + token)
        if (!userId) {
            return {
                errors: [{
                    field: 'token',
                    message: 'token expired'
                }]
            }
        }
        const userIdNum = parseInt(userId)
        const user = await User.findOne(userIdNum)
        if (!user) {
            return {
                errors: [{
                    field: 'token',
                    message: 'user no longer exists'
                }]
            }
        }
        await User.update({ id: userIdNum }, { password: await argon2.hash(newPassword) })
        req.session.userId = user.id
        return { user }
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email } })
        if (!user) {
            //email not in db
            return true
        }
        const token = v4()

        redis.set(
            FORGET_PASSWORD_PREFIX + token,
            user.id,
            "ex",
            1000 * 60 * 60 * 24 * 3
        ); // 3 days

        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
        );
        return true
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options)
        if (errors) {
            return { errors }
        }
        const hashedPassword = await argon2.hash(options.password)
        let user
        try {
            const result = await User.create({
                username: options.username,
                password: hashedPassword,
                email: options.email
            }).save()
            console.log(`result`, result)
            user = result
        } catch (e) {
            if (e.code === '23505') {
                return {
                    errors: [{
                        field: 'username',
                        message: 'Username already exist'
                    }]
                }
                //duplicate username error
            }
            console.log(`error:`, e.message)
        }
        //store user id session
        //this will set a cookie
        req.session!.userId = user?.id

        return {
            user
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(usernameOrEmail.includes("@")
            ? { where: { email: usernameOrEmail } }
            : { where: { username: usernameOrEmail } }
        )
        if (!user) {
            return {
                errors: [{
                    field: 'username',
                    message: 'Username does not exist'
                }]
            }
        }
        const valid = await argon2.verify(user.password, password)
        if (!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: 'Incorrect password'
                }]
            }
        }
        req.session!.userId = user.id
        return {
            user
        }
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        return new Promise((resolve) => req.session.destroy((e) => {
            res.clearCookie(COOKIE_NAME)
            if (e) {
                console.log(`e`, e)
                resolve(false)
                return
            }
            resolve(true)
        }))
    }
}