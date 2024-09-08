import { RawData } from 'ws'
import { SocketMessageSchema } from '../validations/socket.validation'
import { clients } from './clients'
import { JwtPayload } from 'jsonwebtoken'

export const MessageHandler = async (message: RawData, auth: JwtPayload) => {
  const jsonMessage = JSON.parse(message.toString())
  const data = SocketMessageSchema.parse(jsonMessage)

  const receivers = data.receivers
  receivers.forEach(receiver => {
    const receiverDetails = clients.get(receiver.email)
    if (receiverDetails && receiverDetails.ws.OPEN) {
      receiverDetails.ws.send(data.message)
      console.log(`Message sent to ${receiver.email} from &${auth.email}`, data.message)
    }
  })
}

export const CloseHandler = async (auth: JwtPayload) => {
  console.log(`Client ${auth.email} disconnected`)
}
