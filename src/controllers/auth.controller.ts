import { userModel } from '../models'
import bcrypt from 'bcryptjs'

import { catchAsync } from '../utils/catchAsync.util'
import redisClient from './../services/redis.service'
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} from '../utils/token.util'
import { compareOTP, generateOTP } from '../utils/otp.util'
import { sendGmail } from './../services/nodemailer.service'
import { generateMD5Hash } from '../utils/hash.util.js'
import httpStatus from 'http-status'

export const signUpHandler = catchAsync(async (req, res) => {
  const { username, email, password } = req.body

  const existingUser = await userModel.findOne({ email })

  if (existingUser) {
    return res.status(409).send({
      success: false,
      message: `User with email ${email} already exists`
    })
  }

  const hashedPassword = bcrypt.hashSync(password, 10)
  const user = await userModel.create({
    username,
    email,
    password: hashedPassword
  })

  const payload = {
    id: user._id,
    username,
    email
  }
  // Sign a token
  const accessToken = await signAccessToken(email, payload)
  const refreshToken = await signRefreshToken(email, payload)

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'none'
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'none'
  })

  return res.status(200).json({
    success: true,
    message: 'User created successfully'
  })
})

export const signInHandler = catchAsync(async (req, res) => {
  const { email, password } = req.body

  const existingUser = await userModel.findOne({ email: email })

  if (!existingUser) {
    return res.status(httpStatus.NOT_FOUND).send({
      success: false,
      message: `User with email ${email} not found`
    })
  }

  const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password as string)
  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: 'Wrong password!'
    })
  }

  const payload = {
    email,
    id: existingUser._id,
    username: existingUser.username
  }
  // Sign a token
  const accessToken = await signAccessToken(email, payload)
  const refreshToken = await signRefreshToken(email, payload)

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'none'
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'none'
  })

  return res.status(200).json({
    success: true,
    message: 'Login successful'
  })
})

export const statusHandler = catchAsync(async (req, res) => {
  const auth = req.auth
  if (auth) {
    return res.status(200).send({
      success: true,
      message: 'Auth Is Valid.',
      auth
    })
  }

  return res.status(403).send({
    success: false,
    message: 'Invalid Auth!'
  })
})

export const refreshTokenHandler = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) {
    return res.send({
      success: false,
      message: 'Refresh token is required!'
    })
  }

  const payload = await verifyRefreshToken(refreshToken)
  if (!payload || !payload.email) {
    return res.send({
      success: false,
      message: 'Invalid refresh token'
    })
  }

  const { email } = payload
  const newPayload = { email, name: payload.name, id: payload.id }
  const accessToken = await signAccessToken(email, newPayload)
  const newRefreshToken = await signRefreshToken(email, newPayload)

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'none'
  })
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'none'
  })

  return res.send({
    success: true,
    message: 'Token generated successfully',
    auth: payload
  })
})

export const logoutHandler = catchAsync(async (req, res) => {
  const { email } = req.auth

  await redisClient.del(generateMD5Hash(`${email}_refresh_token`))
  await redisClient.del(generateMD5Hash(`${email}_access_token`))
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')

  return res.send({
    success: true,
    message: 'Logged Out Successfully'
  })
})

export const verifyToken = catchAsync(async (req, res) => {
  const { accessToken } = req.body
  if (!accessToken) {
    return res.status(400).send({
      success: false,
      message: 'Access token is required!'
    })
  }

  const payload = await verifyAccessToken(accessToken)
  return res.status(200).send({
    success: true,
    payload
  })
})

export const forgotPasswordHandler = catchAsync(async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).send({
      success: false,
      message: 'Email is required!'
    })
  }

  const user = await userModel.findOne({ email })
  if (!user) {
    return res.status(404).send({
      success: false,
      message: `No user found with email ${email}`
    })
  }

  const otp = await generateOTP(email)

  await sendGmail(
    email,
    `Received reset password request`,
    `Use this OTP to reset your password: ${otp}`
  )

  return res.status(200).send({
    success: true,
    message: 'OTP is sent on registered email'
  })
})

export const resetPasswordHandler = catchAsync(async (req, res) => {
  const { otp, password, email } = req.body

  const isCorrectOTP = await compareOTP(otp, email)
  if (!isCorrectOTP) {
    return res.status(401).send({
      success: false,
      message: 'Invalid OTP'
    })
  }

  const hashedPassword = bcrypt.hashSync(password, 10)
  await userModel.findOneAndUpdate({ email }, { password: hashedPassword })
  await redisClient.del(generateMD5Hash(`${email}_otp`))

  return res.status(200).send({
    success: true,
    message: 'Password updated successfully'
  })
})
