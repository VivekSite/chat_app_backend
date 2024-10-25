// import { Redis } from "ioredis";
// import { AppConfig } from "../config/env.config";
// import { Logger } from "../config/logger.config";

// const client = new Redis(AppConfig.REDIS_URL);

// client.on("connect", () => {
// 	Logger.info("Connected to redis server...");
// });

// client.on("ready", () => {
// 	Logger.info("Connected to redis server and ready to use...");
// });

// client.on("error", (error: Error) => {
// 	Logger.info(`Error with redis: ${error.message}`);
// });

// client.on("end", () => {
// 	Logger.info("Client disconnected from redis!");
// });

// export default client;
