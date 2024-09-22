import { Types } from 'mongoose'
import z from 'zod'

const ObjectIdString = (err_Message: string) => {
  return z
    .string({
      required_error: err_Message
    })
    .regex(/^[0-9a-fA-F]{24}$/)
    .transform(value => new Types.ObjectId(value))
}

export const SocketMessageSchema = z.object({
  event: z.string({
    required_error: 'Event Name must be defined!'
  }),
  data: z.any({
    required_error: 'Data cannot be empty!'
  })
})

export const CreateConversationSchema = z.object({
  user: z.object({
    id: ObjectIdString('User has invalid id!'),
    email: z
      .string({
        required_error: "User's Email is required!"
      })
      .email()
  })
})
