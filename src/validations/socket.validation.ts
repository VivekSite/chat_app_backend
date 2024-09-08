import z from 'zod'

const ReceiversSchema = z.object({
  email: z
    .string({
      required_error: 'Receivers email is required!'
    })
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email!')
})

export const SocketMessageSchema = z.object({
  message: z.string({
    required_error: 'message can not be empty!'
  }),
  receivers: z.array(ReceiversSchema)
})
