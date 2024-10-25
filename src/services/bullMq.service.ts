/* eslint-disable @typescript-eslint/no-explicit-any */
import { Job, Queue, Worker } from "bullmq";
import httpStatus from "http-status";

import { conversationModel, messageModel } from "../models";
import { clients } from "../socket/clients";
import { Logger } from "../config/logger.config";

const messageQueue = new Queue("messageQueue");
const failedMessageQueue = new Queue("failedMessageQueue");

export async function addMessageToQueue(message: any): Promise<Job<any, any, string>> {
	return await messageQueue.add("chatMessage", message);
}

const messageProcessor = new Worker(
	"messageQueue",
	async (job: Job) => {
		const { user, message, sender } = job.data;

		// Find the associated conversation
		const existingConversation = await conversationModel.findOne({
			userIds: { $all: [user.id, sender.id] }
		});

		// Process the message
		if (existingConversation) {
			// create a new message
			const newMessage = await messageModel.create({
				body: message,
				seenIds: [sender.id],
				conversationId: existingConversation._id,
				senderId: sender.id,
				created_at: job.timestamp,
				updated_at: job.timestamp
			});

			// Add the message into conversation list
			await conversationModel.findByIdAndUpdate(existingConversation._id, {
				$push: { messages: newMessage._id },
				lastMessage: newMessage._id
			});

			// get socket data of connected clients
			const recipient = clients.get(user.id.toString());
			const messageSender = clients.get(sender.id.toString());

			// send the message to the client if they are connected to the server
			if (recipient && recipient.ws.OPEN) {
				recipient.ws.send(
					JSON.stringify({
						event: "conversation:newMessage",
						data: {
							success: true,
							statusCode: httpStatus.OK,
							newMessage: {
								senderId: sender.id,
								message,
								created_at: job.timestamp
							}
						}
					})
				);
			}

			// send aknowledgement that message has been sent
			if (messageSender && messageSender.ws.OPEN) {
				messageSender.ws.send(
					JSON.stringify({
						event: "conversation:sent",
						data: {
							success: true,
							statusCode: httpStatus.OK
						}
					})
				);
			}
		}
	},
	{
		connection: {
			host: "localhost",
			port: 6379
		},
		concurrency: 1000
	}
);

// Process the message
messageProcessor.on("completed", async (job: Job) => {
	Logger.info(`${job.id} has completed!`);
});

messageProcessor.on("failed", async (job: Job<any, any, string> | undefined, err: Error) => {
	await failedMessageQueue.add("failedChatmessage", job?.data);
	Logger.error(`${job?.id} has failed with ${err.message}`);
});
