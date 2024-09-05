import { JwtPayload } from 'jsonwebtoken'

declare module 'jsonwebtoken' {
  interface JwtPayload {
    id: string
    email: string
    name: string
  }
}
