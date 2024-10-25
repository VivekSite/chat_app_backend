/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";
import { AppConfig } from "../config/env.config";
import { ApiError } from "./error.util.js";
import httpStatus from "http-status";
import { generateMD5Hash } from "./hash.util";
import { Logger } from "../config/logger.config";
import { accessTokenCache, refreshTokenCache } from "./cache.util";

export const signAccessToken = (userId: string, payload = {}) => {
	return new Promise((resolve, reject) => {
		const secret = AppConfig.AUTH.ACCESS_TOKEN_SECRET;
		const options = {
			expiresIn: "1h",
			issuer: "auth service",
			audience: userId
		};

		jwt.sign(payload, secret, options, (err, token) => {
			if (err) {
				Logger.error(`Error while signing access token: ${err.message}`);
				reject(
					new ApiError(
						httpStatus.INTERNAL_SERVER_ERROR,
						httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
					)
				);
			}

			const cacheKey = generateMD5Hash(`${userId}_access_token`);
			accessTokenCache.putSync(cacheKey, token as string);
			resolve(token);
		});
	});
};

export const signRefreshToken = (userId: string, payload = {}) => {
	return new Promise((resolve, reject) => {
		const secret = AppConfig.AUTH.REFRESH_TOKEN_SECRET;
		const options = {
			expiresIn: "1y",
			issuer: "auth service",
			audience: userId
		};
		jwt.sign(payload, secret, options, async (err, token) => {
			if (err) {
				Logger.error(`Error while signing refresh token: ${err.message}`);
				reject(
					new ApiError(
						httpStatus.INTERNAL_SERVER_ERROR,
						httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
					)
				);
			}

			const cacheKey = generateMD5Hash(`${userId}_refresh_token`);
			refreshTokenCache.putSync(cacheKey, token as string);
			resolve(token);
		});
	});
};

export const verifyAccessToken = (accessToken: string): Promise<jwt.JwtPayload> => {
	return new Promise((resolve, reject) => {
		jwt.verify(accessToken, AppConfig.AUTH.ACCESS_TOKEN_SECRET, (err, payload: any) => {
			if (err) {
				Logger.error(`Error while verifying access token: ${err.message}`);
				if (err instanceof jwt.TokenExpiredError) {
					reject(new ApiError(httpStatus.UNAUTHORIZED, "Expired signature"));
				}
				reject(
					new ApiError(
						httpStatus.INTERNAL_SERVER_ERROR,
						httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
					)
				);
			}

			const { email } = payload;
			const cacheKey = generateMD5Hash(`${email}_access_token`);
			const cachedToken = accessTokenCache.getSync(cacheKey);

			if (cachedToken === accessToken) return resolve(payload);
			reject(new ApiError(httpStatus.UNAUTHORIZED, "Invalid access token!"));
		});
	});
};

export const verifyRefreshToken = (refreshToken: string): Promise<jwt.JwtPayload> => {
	return new Promise((resolve, reject) => {
		jwt.verify(refreshToken, AppConfig.AUTH.REFRESH_TOKEN_SECRET, (err, payload: any) => {
			if (err) {
				Logger.error(`Error while verifying refresh token: ${err.message}`);
				reject(
					new ApiError(
						httpStatus.INTERNAL_SERVER_ERROR,
						httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
					)
				);
			}

			const { email } = payload;
			const cacheKey = generateMD5Hash(`${email}_refresh_token`);
			const cachedToken = refreshTokenCache.getSync(cacheKey);

			if (refreshToken === cachedToken) return resolve(payload);
			reject(new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token!"));
		});
	});
};
