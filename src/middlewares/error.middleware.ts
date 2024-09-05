import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status'
import mongoose from 'mongoose'

import { AppConfig } from '../config/env.config'
import { ApiError } from '../utils/error.util'

const errorConverter = (
  err: Error | ApiError,
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  let error = err
  if (!(error instanceof ApiError)) {
    const statusCode =
      error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR
    const message = error.message || httpStatus[statusCode]
    error = new ApiError(statusCode, message, err.stack)
  }

  next(error)
}

const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  let { statusCode, message } = err
  if (AppConfig.NODE_ENV === 'production') {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
  }

  res.locals.errorMessage = err.message

  const response = {
    statusCode,
    message,
    ...(AppConfig.NODE_ENV === 'development' && { stack: err.stack })
  }

  return res.status(statusCode).send(response)
}

export { errorConverter, errorHandler }
