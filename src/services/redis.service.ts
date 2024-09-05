import { Redis } from 'ioredis'
import { AppConfig } from '../config/env.config'

const client = new Redis(AppConfig.REDIS_URL)

client.on('connect', () => {
  console.log('Connected to redis server...')
})

client.on('ready', () => {
  console.log('Connected to redis server and ready to use...')
})

client.on('error', (error: Error) => {
  console.log('Error with redis:', error.message)
})

client.on('end', () => {
  console.log('Client disconnected from redis!')
})

export default client
