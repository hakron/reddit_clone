import { Request, Response } from 'express'
import { Redis } from 'ioredis'

export type MyContext = {
    req: Request & { session?: Express.session }
    redis: Redis
    res: Response
}