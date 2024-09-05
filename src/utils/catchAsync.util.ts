import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ApiError } from './error.util'

export const catchAsync =
  <T extends RequestHandler>(fn: T) =>
    (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch((err: ApiError | Error) => next(err))
    }
