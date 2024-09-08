import { WebSocket } from "ws";

export interface SocketClient {
  id: string;
  email: string;
  name: string;
  ws: WebSocket;
}
