import jwt from 'jsonwebtoken'
import { AppConfig } from '../config/env.config'
import redisClient from '../services/redis.service'
import { ApiError } from './error.util.js'
import httpStatus from 'http-status'
import { generateMD5Hash } from './hash.util'

export const signAccessToken = (userId: string, payload = {}) => {
  return new Promise((resolve, reject) => {
    const secret = AppConfig.AUTH.ACCESS_TOKEN_SECRET
    const options = {
      expiresIn: '1h',
      issuer: 'auth service',
      audience: userId
    }

    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.error('Error while signing access token', err)
        reject(
          new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
          )
        )
      }

      const RedisKey = generateMD5Hash(`${userId}_access_token`)
      redisClient
        .set(RedisKey, token as string, 'EX', 3600)
        .then(() => resolve(token))
        .catch(err => {
          console.error('Error while signing access token', err)
          reject(
            new ApiError(
              httpStatus.INTERNAL_SERVER_ERROR,
              httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
            )
          )
        })
    })
  })
}

export const signRefreshToken = (userId: string, payload = {}) => {
  return new Promise((resolve, reject) => {
    const secret = AppConfig.AUTH.REFRESH_TOKEN_SECRET
    const options = {
      expiresIn: '1y',
      issuer: 'auth service',
      audience: userId
    }
    jwt.sign(payload, secret, options, async (err, token) => {
      if (err) {
        console.error('Error while signing refresh token', err.message)
        reject(
          new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
          )
        )
      }

      const RedisKey = generateMD5Hash(`${userId}_refresh_token`)
      redisClient
        .set(RedisKey, token as string, 'EX', 365 * 24 * 3600)
        .then(() => resolve(token))
        .catch(err => {
          console.error('Error while signing refresh token', err)
          reject(
            new ApiError(
              httpStatus.INTERNAL_SERVER_ERROR,
              httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
            )
          )
        })
    })
  })
}

export const verifyAccessToken = (accessToken: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(accessToken, AppConfig.AUTH.ACCESS_TOKEN_SECRET, (err, payload: any) => {
      if (err) {
        console.error('Error while verifying access token:', err.message)
        if (err instanceof jwt.TokenExpiredError) {
          reject(new ApiError(httpStatus.UNAUTHORIZED, 'Expired signature'))
        }
        reject(
          new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
          )
        )
      }

      const { email } = payload
      const RedisKey = generateMD5Hash(`${email}_access_token`)
      redisClient
        .get(RedisKey)
        .then(token => {
          if (accessToken === token) return resolve(payload)
          reject(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid access token!'))
        })
        .catch(err => {
          console.error('Error while getting access token', err.message)
          reject(
            new ApiError(
              httpStatus.INTERNAL_SERVER_ERROR,
              httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
            )
          )
        })
    })
  })
}

export const verifyRefreshToken = (refreshToken: string): Promise<jwt.JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, AppConfig.AUTH.REFRESH_TOKEN_SECRET, (err, payload: any) => {
      if (err) {
        console.error('Error while verifying refresh token', err.message)
        reject(
          new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
          )
        )
      }

      const { email } = payload
      const RedisKey = generateMD5Hash(`${email}_refresh_token`)
      redisClient
        .get(RedisKey)
        .then(token => {
          if (refreshToken === token) return resolve(payload)
          reject(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token!'))
        })
        .catch(err => {
          console.error('Error while getting refresh token', err.message)
          reject(
            new ApiError(
              httpStatus.INTERNAL_SERVER_ERROR,
              httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
            )
          )
        })
    })
  })
}
