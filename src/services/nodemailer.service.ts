import { createTransport, SentMessageInfo } from "nodemailer";
import { AppConfig } from "../config/env.config.js";
import { Logger } from "../config/logger.config.js";

const user = AppConfig.EMAIL.SENDER;
const pass = AppConfig.EMAIL.PASS_KEY;

const transporter = createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user,
		pass
	}
});

const sendGmail = async (to: string, subject: string, text: string) => {
	const mailOptions = {
		from: user,
		to,
		subject,
		text
	};

	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (err: Error | null, info: SentMessageInfo) => {
			if (err) {
				Logger.error(`${err.message}`);
				reject(err);
			}
			resolve(info);
		});
	});
};

export { transporter, sendGmail };
