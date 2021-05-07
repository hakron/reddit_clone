import argon2 from 'argon2'
import { Resolver, Ctx, Arg, Mutation, Field, ObjectType, Query } from 'type-graphql'
import { EntityManager } from '@mikro-orm/postgresql'
import { User } from '../entities/User'
import { MyContext } from '../types'
import { COOKIE_NAME } from '../constants'
import { UsernamePasswordInput } from './usernamePasswordInput'
import { validateRegister } from '../utils/validateRegister'
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

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    me(
        @Ctx() { req, em }: MyContext
    ) {
        if (!req.session.userId) {
            return null
        }
        const user = em.findOne(User, { id: req.session.userId })
        return user
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {req}: MyContext
    ) {
        // const user = await em.findOne(User, {email})
        return true
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options)
        if (errors) {
            return {errors}
        }
        const hashedPassword = await argon2.hash(options.password)
        let user
        try {
            const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert(
                {
                    username: options.username,
                    password: hashedPassword,
                    email: options.email,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ).returning('*')
            user = result[0]
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
        req.session!.userId = user.id

        return {
            user
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, usernameOrEmail.includes("@")
        ? { email: usernameOrEmail } 
        : { username: usernameOrEmail } 
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
        // await em.persistAndFlush(user)
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