import { Router } from 'express'
import authRoutes from './auth.route'
import conversationRoutes from './conversation.route'
import { authMiddleware } from '../middlewares/auth.middleware'

const app = Router({
  mergeParams: true
})

app.use('/auth', authRoutes)
app.use('/conversation', authMiddleware, conversationRoutes)

export default app
