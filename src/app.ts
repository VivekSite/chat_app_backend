import ExpressMongoSanitize from "express-mongo-sanitize";
import httpStatus from "http-status";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import appRoutes from "./routes/index";
import { ApiError } from "./utils/error.util";
import { errorConverter, errorHandler } from "./middlewares/error.middleware";
import morganConfig from "./config/morgan.config";

const app = express();

// configure morgan for Request logging
app.use(morganConfig.errorHandler);
app.use(morganConfig.successHandler);

// parse json request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

// enable cors
app.use(
	cors({
		credentials: true
	})
);
app.options("*", cors());

// sanitize request data
app.use(ExpressMongoSanitize());

// Enable trust proxy
app.set("trust proxy", 1);

// v1 api routes
app.use("/api/v1", appRoutes);

// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
	next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// set security HTTP headers
app.use(helmet());

export default app;
