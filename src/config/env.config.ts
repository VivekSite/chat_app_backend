import { join } from 'path'
import dotenv from 'dotenv'
import { envSchema } from '../validations/env.validation'

const envFilePath = join(__dirname, './../../.env')
dotenv.config({ path: envFilePath })

const Vars = envSchema.parse(process.env)

const AppConfig = {
  NODE_ENV: Vars.NODE_ENV,
  PORT: Vars.PORT || 8080,
  MONGO_URI: Vars.MONGO_URI,
  REDIS_URL: Vars.REDIS_URL,
  AUTH: {
    ACCESS_TOKEN_SECRET: Vars.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: Vars.REFRESH_TOKEN_SECRET,
    HASH_SECRET: Vars.HASH_SECRET,
    OTP_SECRET: Vars.OTP_SECRET
  },
  EMAIL: {
    SENDER: Vars.EMAIL_SENDER,
    PASS_KEY: Vars.EMAIL_PASS_KEY
  }
}

export { AppConfig }
