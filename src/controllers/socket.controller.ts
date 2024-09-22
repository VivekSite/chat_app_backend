import { conversationModel } from '../models'
import WebSocket from 'ws'
import { JwtPayload } from 'jsonwebtoken'
import { CreateConversationSchema } from '../validations/socket.validation'

export const createConversationHandler = async (
  data: unknown,
  auth: JwtPayload,
  socket: WebSocket
) => {
  try {
    const { user } = CreateConversationSchema.parse(data)

    const existingConversation = await conversationModel
      .findOne({
        userIds: { $all: [user.id, auth.id] }
      })
      .populate('messages')

    if (existingConversation) {
      socket.send(
        JSON.stringify({
          event: 'conversation:new',
          data: {
            success: true,
            conversation: existingConversation
          }
        })
      )
      return
    }

    const newConversation = await conversationModel.create({
      createdBy: auth.id,
      userIds: [user.id, auth.id]
    })

    socket.send(
      JSON.stringify({
        event: 'conversation:new',
        data: {
          success: true,
          conversation: newConversation
        }
      })
    )
    return
  } catch (error: any) {
    console.error('Error generated while socket transmission: ', error)

    socket.send(
      JSON.stringify({
        event: 'conversation:new',
        data: {
          success: false,
          message: error?.message || 'Something went wrong'
        }
      })
    )
  }
}
