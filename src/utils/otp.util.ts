import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { AppConfig } from '../config/env.config'
import redisClient from '../services/redis.service'
import { generateMD5Hash } from './hash.util'

const generateOTP = async (userId: string) => {
  if (!AppConfig.AUTH.OTP_SECRET) {
    throw new Error('OTP_SECRET not found!')
  }

  const secret = AppConfig.AUTH.OTP_SECRET

  const randomBytes = crypto.randomBytes(3)
  const timestamp = Date.now()
  const bufferData = Buffer.concat([
    randomBytes,
    Buffer.from(userId.toString()),
    Buffer.from(timestamp.toString())
  ])

  const hash = crypto.createHash('sha256')
  const combinedHash = hash.update(bufferData)
  const updatedHash = combinedHash.update(secret)
  const finalHash = updatedHash.digest('hex')

  const OTP = parseInt(finalHash, 16) % 1000000
  const OTPString = OTP.toString().padEnd(6, '0')
  const hashedOTP = bcrypt.hashSync(OTPString, 10)
  await redisClient.set(generateMD5Hash(`${userId}_otp`), hashedOTP, 'EX', 10 * 60)

  return OTPString
}

const compareOTP = async (otp: number, userId: string) => {
  const OTP = await redisClient.get(generateMD5Hash(`${userId}_otp`))
  if (!OTP) {
    return false
  }
  return bcrypt.compareSync(otp.toString(), OTP)
}

export { generateOTP, compareOTP }
