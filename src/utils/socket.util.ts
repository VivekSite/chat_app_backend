import { WebSocket } from "ws"

function heartbeat(ws: WebSocket, HEARTBEAT_VALUE = 1) {
  if (!ws.isAlive) return ws.terminate()

  ws.isAlive = false
  ws.ping(HEARTBEAT_VALUE)
}

export {
  heartbeat
}