import argon2 from 'argon2'
import { Resolver, Ctx, Arg, Mutation, InputType, Field, ObjectType, Query } from 'type-graphql'
import { EntityManager } from '@mikro-orm/postgresql'
import { User } from '../entities/User'
import { MyContext } from '../types'

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

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

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: 'Length must be greater than 2'
                }]
            }
        }

        if (options.password.length <= 3) {
            return {
                errors: [{
                    field: 'password',
                    message: 'Length must be greater than 3'
                }]
            }
        }
        const hashedPassword = await argon2.hash(options.password)
        let user
        try {
          const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert(
                {
                    username: options.username,
                    password: hashedPassword,
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
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username })
        if (!user) {
            return {
                errors: [{
                    field: 'username',
                    message: 'Username does not exist'
                }]
            }
        }
        const valid = await argon2.verify(user.password, options.password)
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
}