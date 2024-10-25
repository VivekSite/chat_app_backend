import WebSocket, { RawData } from "ws";

import { SocketMessageSchema } from "../validations/socket.validation";
import { JwtPayload } from "jsonwebtoken";
import { createNewMessageHandler } from "../controllers/socket.controller";
import { Logger } from "../config/logger.config";
import { clients } from "./clients";

export const MessageHandler = async (message: RawData, auth: JwtPayload, socket: WebSocket) => {
	const jsonMessage = JSON.parse(message.toString());
	const messageData = SocketMessageSchema.parse(jsonMessage);

	switch (messageData.event) {
		case "conversation:newMessage":
			createNewMessageHandler(messageData.data, auth, socket);
			break;
		default:
			break;
	}
};

export const CloseHandler = async (auth: JwtPayload) => {
	// Remove the client from the active list
	clients.delete(auth.id);
	Logger.info(`Client ${auth.email} disconnected`);
};
