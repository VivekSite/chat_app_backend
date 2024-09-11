import { RawData } from 'ws'
import { SocketMessageSchema } from '../validations/socket.validation'
import { clients } from './clients'
import { JwtPayload } from 'jsonwebtoken'
import { getConversationById } from '../services/conversation.service'
import cache from 'persistent-cache'
import { createMessage } from '../services/message.service'
import { Types } from 'mongoose'

const conversationCache = cache({
  duration: 1000 * 3600,
  base: '.cache',
  persist: true,
  name: 'conversationCache'
})

export const MessageHandler = async (message: RawData, auth: JwtPayload) => {
  const jsonMessage = JSON.parse(message.toString())
  const data = SocketMessageSchema.parse(jsonMessage)

  let cachedConversation = conversationCache.getSync(data.conversationId.toString())
  if (!cachedConversation) {
    cachedConversation = await getConversationById(data.conversationId);
    conversationCache.putSync(data.conversationId.toString(), cachedConversation)
  }

  const receivers: Types.ObjectId[] = cachedConversation.userIds;
  receivers.forEach(receiver => {
    const receiverDetails = clients.get(receiver.toString())
    if (receiverDetails && receiverDetails.ws.OPEN) {
      receiverDetails.ws.send(data.body)
      console.log(`Message sent to ${receiver} from &${auth.id}`, data.body)
    }
  })

  await createMessage(data.body, data.conversationId, new Types.ObjectId(auth.id))
}

export const CloseHandler = async (auth: JwtPayload) => {
  console.log(`Client ${auth.email} disconnected`)
}
