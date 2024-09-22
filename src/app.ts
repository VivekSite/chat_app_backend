import mongoSanitize from 'express-mongo-sanitize'
import httpStatus from 'http-status'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import appRoutes from './routes/index'
import { ApiError } from './utils/error.util'
import { errorConverter, errorHandler } from './middlewares/error.middleware'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(
  cors({
    credentials: true
  })
)
app.options('*', cors())

app.use(helmet())
app.use(mongoSanitize())

app.use('/api/v1', appRoutes)

app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'))
})

app.use(errorConverter)
app.use(errorHandler)

export default app
