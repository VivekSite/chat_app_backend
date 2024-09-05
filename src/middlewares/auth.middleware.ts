import { emailValidator, passwordValidator } from '../validations/auth.validation'
import { AppConfig } from './../config/env.config'
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const validateRegistrationBody = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body

  // Validate Name
  if (!name || name.length < 3) {
    return res.status(400).json({
      message: 'Name must be at least of 3 characters'
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

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const cookie_string = req.headers.cookie

  if (!cookie_string) {
    return res.send({
      success: false,
      message: 'Looks like you are not logged in!'
    })
  }

  const cookies = cookie_string.split(';')
  const accessToken = cookies
    .find((cookie: string) => cookie.trim().startsWith('accessToken='))
    ?.split('=')[1]
  if (accessToken) {
    return jwt.verify(accessToken, AppConfig.AUTH.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid Auth'
        })
      }

      req.auth = decoded as jwt.JwtPayload
      next()
    })
  }

  return res.status(403).json({
    success: false,
    message: 'Authorization Required'
  })
}

export { validateRegistrationBody, validateLoginBody, authMiddleware, validateResetPasswordBody }
