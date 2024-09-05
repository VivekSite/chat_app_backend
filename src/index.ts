import { Server } from 'http'
import { AppConfig } from './config/env.config.js'
import { server, web_socket_server } from './server.js'
import { ConnectDB } from './utils/db.util'
import redisClient from './services/redis.service'

let httpServer: Server
const port = AppConfig.PORT

ConnectDB(AppConfig.MONGO_URI).then(() => {
  httpServer = server.listen(port, () => {
    console.info(`Listening to port ${port}`)
  })
})

const exitHandler = () => {
  console.log('Terminating All Services...')
  web_socket_server.close()
  console.info('Terminated WebSocket Server')
  redisClient.quit()
  console.info('Terminated Redis Server')

  if (httpServer) {
    httpServer.close()
    console.info('Terminated Node Server')
  }
  process.exit(1)
}

const unexpectedErrorHandler = (error: Error) => {
  console.error(error)
  exitHandler()
}

process.on('SIGINT', () => {
  exitHandler()
})
process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)
