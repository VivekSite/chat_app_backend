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
  conversationId: ObjectIdString('conversationId is required!'),
  body: z.string({
    required_error: 'message can not be empty!'
  }),
})
