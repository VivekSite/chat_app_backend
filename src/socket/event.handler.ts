import WebSocket, { RawData } from 'ws'
import { SocketMessageSchema } from '../validations/socket.validation'
import { clients } from './clients'
import { JwtPayload } from 'jsonwebtoken'
import cache from 'persistent-cache'
import { createConversationHandler } from '../controllers/socket.controller'

const conversationCache = cache({
  duration: 1000 * 3600,
  base: '.cache',
  persist: true,
  name: 'conversationCache'
})

export const MessageHandler = async (message: RawData, auth: JwtPayload, socket: WebSocket) => {
  const jsonMessage = JSON.parse(message.toString())
  const messageData = SocketMessageSchema.parse(jsonMessage)

  switch (messageData.event) {
  case "conversation:new":
    createConversationHandler(messageData.data, auth, socket);
    break;
  default:
    break;
  }
}

export const CloseHandler = async (auth: JwtPayload) => {
  console.log(`Client ${auth.email} disconnected`)
}
