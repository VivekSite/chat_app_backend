import { Server } from "http";

import { AppConfig } from "./config/env.config.js";
import { server, web_socket_server } from "./socket/server.js";
import { ConnectDB } from "./utils/db.util";
import { Logger } from "./config/logger.config";

let httpServer: Server;
const port = AppConfig.PORT;

ConnectDB(AppConfig.MONGO_URI).then(() => {
	httpServer = server.listen(port, () => {
		Logger.info(`Listening on port ${port}`);
	});
});

const exitHandler = () => {
	Logger.info("Terminating All Services...");
	web_socket_server.close();
	Logger.info("Terminated WebSocket Server");

	if (httpServer) {
		httpServer.close();
		Logger.info("Terminated Node Server");
	}
	process.exit(1);
};

const unexpectedErrorHandler = (error: Error) => {
	Logger.error(error);
	exitHandler();
};

process.on("SIGINT", () => {
	exitHandler();
});
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
