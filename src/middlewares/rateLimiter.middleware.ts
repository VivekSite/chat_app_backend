import rateLimit from "express-rate-limit";

export const rateLimiter = ({ windowMs = 15 * 60 * 1000, max = 1000 }) =>
	rateLimit({
		windowMs,
		max,
		skipSuccessfulRequests: false
	});
