import z from 'zod'

const envSchema = z.object({
  PORT: z.string({
    required_error: 'Port not defined!'
  }),
  NODE_ENV: z.string({
    required_error: 'Node environment not defined!'
  }),
  MONGO_URI: z.string({
    required_error: 'MonGO URI not defined!'
  }),
  REDIS_URL: z.string({
    required_error: 'Redis URL not defined!'
  }),
  ACCESS_TOKEN_SECRET: z.string({
    required_error: 'Access Token Secret not defined!'
  }),
  REFRESH_TOKEN_SECRET: z.string({
    required_error: 'Refresh Token Secret not defined!'
  }),
  HASH_SECRET: z.string({
    required_error: 'Hash Secret not defined!'
  }),
  OTP_SECRET: z.string({
    required_error: 'OTP Secret not defined!'
  }),
  EMAIL_SENDER: z.string({
    required_error: 'Sender email is not defined!'
  }),
  EMAIL_PASS_KEY: z.string({
    required_error: 'Email pass key is not defined!'
  })
})

export { envSchema }
