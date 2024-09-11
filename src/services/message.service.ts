import { messageModel } from '../models'
import { Types } from 'mongoose'

export async function createMessage(
  message: string,
  conversationId: Types.ObjectId,
  senderId: Types.ObjectId
) {
  return await messageModel.create({
    body: message,
    conversationId,
    senderId
  })
}
