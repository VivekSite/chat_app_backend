import { createServer } from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'
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

server.on('upgrade', (req, socket, head) => {
  socket.on('error', err => {
    console.error('Error before upgrading:', err)
  })

  web_socket_server.handleUpgrade(req, socket, head, (ws, req) => {
    web_socket_server.emit('connection', ws, req)
  })
})

web_socket_server.on('connection', (ws: WebSocket, req) => {
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
