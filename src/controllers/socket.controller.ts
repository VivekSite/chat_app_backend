/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import WebSocket from "ws";

import { CreateNewMessageSchema } from "../validations/socket.validation";
import { addMessageToQueue } from "../services/bullMq.service";
import { Logger } from "../config/logger.config";

export const createNewMessageHandler = async (
	data: unknown,
	auth: JwtPayload,
	socket: WebSocket
) => {
	try {
		const { user, message } = CreateNewMessageSchema.parse(data);

		// Add message to queue
		const queueResponse = await addMessageToQueue({
			user,
			message,
			sender: auth
		});

		// send aknowledgement that message has been received
		socket.send(
			JSON.stringify({
				event: "conversation:received",
				data: {
					success: true,
					statusCode: httpStatus.OK,
					newMessage: {
						senderId: auth.id,
						message,
						created_at: queueResponse.timestamp
					}
				}
			})
		);
		return;
	} catch (error: any) {
		Logger.error(`Error generated while socket transmission: ${error.message}`);
	}
};
