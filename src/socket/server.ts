/* eslint-disable @typescript-eslint/no-explicit-any */
import { WebSocketServer, WebSocket, RawData } from "ws";
import { createServer, IncomingMessage } from "node:http";
import { Request } from "express";

import { MessageHandler, CloseHandler } from "./event.handler";
import { verifyAccessToken } from "../utils/token.util";
import { heartbeat } from "../utils/socket.util";
import { clients } from "./../socket/clients";
import app from "../app";
import { Logger } from "../config/logger.config";

const HEARTBEAT_INTERVAL = 1000 * 15; // heartbeat interval

const server = createServer(app); // create http server
const web_socket_server = new WebSocketServer({ noServer: true }); // create web socket server

// Upgrade the server
server.on("upgrade", async (req, socket, head) => {
	socket.on("error", err => {
		Logger.error(`Error before upgrading: ${err.message}`);
	});

	// perform auth
	let access_token;
	const cookie_string = (req as Request).headers.cookie;
	if (!cookie_string) {
		const url = new URL(req.url as string, `ws://${req.headers.host}`);
		access_token = url.searchParams.get("access_token");
	} else {
		const cookies = cookie_string.split(";");
		access_token = cookies
			.find((cookie: string) => cookie.trim().startsWith("accessToken="))
			?.split("=")[1];
	}

	if (!access_token) {
		socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
		socket.destroy();
		return;
	}

	try {
		const payload = await verifyAccessToken(access_token);
		req.auth = payload;

		web_socket_server.handleUpgrade(req, socket, head, (ws, req) => {
			web_socket_server.emit("connection", ws, req);
		});
	} catch (error: any) {
		Logger.error(`Error while verifying access token: ${error.message}`);
		socket.write("HTTP/1.1 400 Invalid access token\r\n\r\n");
		socket.destroy();
		return;
	}
});

// Listen for connections
web_socket_server.on("connection", (ws: WebSocket, req: IncomingMessage) => {
	// Handle errors
	ws.on("error", err => {
		Logger.error(`Error after connection: ${err.message}`);
	});

	ws.isAlive = true;
	Logger.info(`New client connected: ${req.auth.email}`);

	// Add the client to the list of connected clients
	const clientData = {
		id: req.auth.id,
		email: req.auth.email,
		name: req.auth.name,
		ws
	};
	clients.set(req.auth.id, clientData);

	// Handle pong message
	ws.on("pong", () => {
		ws.isAlive = true;
	});

	// Handle message event
	ws.on("message", (message: RawData) => {
		MessageHandler(message, req.auth, ws).catch((error: any) => {
			Logger.error(`Error while processing message: ${error.message}`);
		});
	});

	// Handle close events
	ws.on("close", () => {
		CloseHandler(req.auth).catch((error: any) => {
			Logger.error(`Error while closing connection: ${error.message}`);
		});
	});
});

// set heartbeat interval
const interval = setInterval(() => {
	web_socket_server.clients.forEach(client => {
		heartbeat(client as WebSocket, 1);
	});
}, HEARTBEAT_INTERVAL);

// clear heartbeat interval on server close
web_socket_server.on("close", () => {
	clearInterval(interval);
});

export { server, web_socket_server };
