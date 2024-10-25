import httpStatus from "http-status";
import { conversationModel } from "../models";
import { catchAsync } from "../utils/catchAsync.util";

// Create conversation handler
export const createConversationHandler = catchAsync(async (req, res) => {
	const auth = req.auth;
	const { userId, isGroup, groupName, userIds } = req.body;

	if (isGroup) {
		const existingGroup = await conversationModel.findOne({
			createdBy: auth.id,
			groupName
		});

		if (existingGroup) {
			return res.status(httpStatus.CONFLICT).send({
				success: false,
				message: `The Group ${name} is already exists!`,
				group: existingGroup
			});
		}

		const newGroup = await conversationModel.create({
			createdBy: auth.id,
			userIds,
			admins: [auth.id],
			groupName
		});

		return res.status(httpStatus.CREATED).send({
			success: true,
			message: `Group ${name} created successfully`,
			group: newGroup
		});
	}

	const existingConversation = await conversationModel.findOne({
		userIds: { $all: [userId, auth.id] }
	});

	if (existingConversation) {
		return res.status(httpStatus.OK).send({
			success: true,
			message: "This conversation already exists",
			conversation: existingConversation
		});
	}

	const newConversation = await conversationModel.create({
		createdBy: auth.id,
		userIds: [userId, auth.id]
	});

	return res.status(httpStatus.CREATED).send({
		success: true,
		conversation: newConversation
	});
});

// Get conversation handler
export const getConversationHandler = catchAsync(async (req, res) => {
	const { userId } = req.params;

	if (!userId) {
		return res.status(httpStatus.BAD_REQUEST).send({
			success: false,
			message: "UserId is required!"
		});
	}

	const conversations = await conversationModel
		.find({
			userIds: userId
		})
		.populate("userIds");

	return res.status(httpStatus.OK).send({
		success: true,
		conversations
	});
});
