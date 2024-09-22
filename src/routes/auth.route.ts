import { Router } from 'express'
import {
  logoutHandler,
  signInHandler,
  signUpHandler,
  statusHandler,
  verifyToken,
  refreshTokenHandler,
  forgotPasswordHandler,
  resetPasswordHandler
} from '../controllers/auth.controller'
import {
  validateRegistrationBody,
  validateLoginBody,
  authMiddleware,
  validateResetPasswordBody
} from '../middlewares/auth.middleware'

const app = Router()

app.post('/sign_up', validateRegistrationBody, signUpHandler)
app.post('/sign_in', validateLoginBody, signInHandler)
app.post('/logout', authMiddleware, logoutHandler)
app.get('/status', authMiddleware, statusHandler)
app.post('/refresh-token', refreshTokenHandler)
app.post('/verify', verifyToken)

app.post('/forgot_password', forgotPasswordHandler)
app.patch('/reset_password', validateResetPasswordBody, resetPasswordHandler)

export default app
