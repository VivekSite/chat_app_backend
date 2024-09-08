import { JwtPayload } from 'jsonwebtoken'
import { IncomingMessage } from 'node:http'

declare module 'http' {
  interface IncomingMessage {
    auth: JwtPayload
  }
}