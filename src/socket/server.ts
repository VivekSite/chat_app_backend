import { WebSocketServer, WebSocket, RawData } from 'ws'
import { createServer, IncomingMessage } from 'node:http'
import { Request } from 'express'

import { MessageHandler, CloseHandler } from './event.handler'
import { verifyAccessToken } from '../utils/token.util'
import { heartbeat } from '../utils/socket.util'
import { clients } from './../socket/clients'
import app from '../app'

const HEARTBEAT_INTERVAL = 1000 * 15

const server = createServer(app)
const web_socket_server = new WebSocketServer({ noServer: true })

server.on('upgrade', async (req, socket, head) => {
  socket.on('error', err => {
    console.error('Error before upgrading:', err)
  })

  // perform auth
  let access_token
  const cookie_string = (req as Request).headers.cookie
  if (!cookie_string) {
    const url = new URL(req.url as string, `ws://${req.headers.host}`)
    access_token = url.searchParams.get('access_token')
  } else {
    const cookies = cookie_string.split(';')
    access_token = cookies
      .find((cookie: string) => cookie.trim().startsWith('accessToken='))
      ?.split('=')[1]
  }

  if (!access_token) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    return
  }

  try {
    const payload = await verifyAccessToken(access_token);
    req.auth = payload

    web_socket_server.handleUpgrade(req, socket, head, (ws, req) => {
      web_socket_server.emit('connection', ws, req)
    })
    // eslint-disable-next-line no-unused-vars
  } catch (_error) {
    socket.write('HTTP/1.1 400 Invalid access token\r\n\r\n')
    socket.destroy()
    return
  }
})

web_socket_server.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  ws.on('error', err => {
    console.error('Error after connection', err)
  })

  ws.isAlive = true
  console.log('New client connected', req.auth.email)

  const clientData = {
    id: req.auth.id,
    email: req.auth.email,
    name: req.auth.name,
    ws
  }
  clients.set(req.auth.id, clientData)

  ws.on('pong', () => {
    console.log('pong')
    ws.isAlive = true
  })

  ws.on('message', (message: RawData) => {
    MessageHandler(message, req.auth, ws)
      .catch((error: any) => {
        console.error("Error while processing message")
        console.error(error.message)
      })
  })
  
  ws.on('close', () => {
    CloseHandler(req.auth).catch((error: any) => {
      console.error("Error while closing connection")
      console.error(error.message)
    })
  })
})

const interval = setInterval(() => {
  console.log('firing interval')
  web_socket_server.clients.forEach(client => {
    heartbeat(client as WebSocket, 1)
  })
}, HEARTBEAT_INTERVAL)

web_socket_server.on('close', () => {
  clearInterval(interval)
})

export { server, web_socket_server }
