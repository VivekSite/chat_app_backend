import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import { emailValidator, passwordValidator } from '../validations/auth.validation'
import { verifyAccessToken } from '../utils/token.util'
import { catchAsync } from '../utils/catchAsync.util'

const validateRegistrationBody = (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body

  // Validate Name
  if (!username || username.length < 3) {
    return res.status(400).json({
      message: 'Username must be at least of 3 characters'
    })
  }

  // Validate Email
  if (!email) {
    return res.status(400).json({
      message: 'Email is required!'
    })
  } else {
    if (!emailValidator(email)) {
      return res.status(400).json({
        message: 'Invalid email!'
      })
    }
  }

  // Validate password
  if (!password) {
    return res.status(400).json({
      message: 'Password is required!'
    })
  } else {
    if (!passwordValidator(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
      })
    }
  }

  next()
}

const validateLoginBody = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  // Validate Email
  if (!email) {
    return res.status(400).json({
      message: 'Email is required!'
    })
  }

  // Validate password
  if (!password) {
    return res.status(400).json({
      message: 'Password is required!'
    })
  }

  next()
}

const validateResetPasswordBody = (req: Request, res: Response, next: NextFunction) => {
  const { otp, password, email } = req.body

  if (!otp) {
    return res.status(400).send({
      success: false,
      message: 'OTP is required!'
    })
  } else if (otp.length !== 6) {
    return res.status(400).send({
      success: false,
      message: 'Invalid OTP!'
    })
  }

  // Validate Email
  if (!email) {
    return res.status(400).json({
      message: 'Email is required!'
    })
  } else {
    if (!emailValidator(email)) {
      return res.status(400).json({
        message: 'Invalid email!'
      })
    }
  }

  // Validate new password
  if (!password) {
    return res.status(400).json({
      message: 'Password is required!'
    })
  } else {
    if (!passwordValidator(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
      })
    }
  }

  next()
}

const authMiddleware = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken)
    if (!payload) { 
      return res.status(403).json({
        success: false,
        message: 'Invalid Auth',
      })
    }

    req.auth = payload as jwt.JwtPayload
    next()
    return;
  }

  return res.status(401).json({
    success: false,
    message: 'Authorization Required'
  })
})

export { validateRegistrationBody, validateLoginBody, authMiddleware, validateResetPasswordBody }
