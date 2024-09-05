import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'node:http'
import { Request } from 'express'

import { verifyAccessToken } from './utils/token.util'
import app from './app'

const HEARTBEAT_INTERVAL = 1000 * 15
const HEARTBEAT_VALUE = 1

function heartbeat(ws: WebSocket) {
  if (!ws.isAlive) return ws.terminate()

  ws.isAlive = false
  ws.ping(HEARTBEAT_VALUE)
}

const server = createServer(app)
const web_socket_server = new WebSocketServer({ noServer: true })

server.on('upgrade', async (req, socket, head) => {
  socket.on('error', err => {
    console.error('Error before upgrading:', err)
  })

  // perform auth
  let access_token;
  const cookie_string = (req as Request).headers.cookie
  if (!cookie_string) {
    const url = new URL(req.url as string, `ws://${req.headers.host}`)
    access_token = url.searchParams.get('access_token')
  } else {
    const cookies = cookie_string.split(';')
    access_token = cookies.find((cookie: string) => cookie.trim().startsWith('accessToken='))?.split('=')[1]
  }

  if (!access_token) { 
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy()
    return;
  }

  try {
    await verifyAccessToken(access_token)
  
    web_socket_server.handleUpgrade(req, socket, head, (ws, req) => {
      web_socket_server.emit('connection', ws, req)
    })
  // eslint-disable-next-line no-unused-vars
  } catch (_error) {
    socket.write('HTTP/1.1 400 Invalid access token\r\n\r\n');
    socket.destroy()
    return;
  }
})

web_socket_server.on('connection', (ws: WebSocket) => {
  ws.on('error', err => {
    console.error('Error after connection', err)
  })

  ws.isAlive = true

  console.log('Client connected')

  ws.on('pong', () => {
    console.log('pong')
    ws.isAlive = true
  })

  ws.on('message', message => {
    console.log('Received message:', message.toString())
    ws.send('Hello from the server!')
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })
})

const interval = setInterval(() => {
  console.log('firing interval')
  web_socket_server.clients.forEach(client => {
    heartbeat(client as WebSocket)
  })
}, HEARTBEAT_INTERVAL)

web_socket_server.on('close', () => {
  clearInterval(interval)
})

export { server, web_socket_server }
