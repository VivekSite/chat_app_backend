import { Router } from 'express'
import authRoutes from './auth.route'
import conversationRoutes from './conversation.route'
import userRoutes from './user.route'
import { authMiddleware } from '../middlewares/auth.middleware'

const app = Router({
  mergeParams: true
})

app.use('/auth', authRoutes)
app.use('/conversation', authMiddleware, conversationRoutes)
app.use('/users', authMiddleware, userRoutes)

export default app
