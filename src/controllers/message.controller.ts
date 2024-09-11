import { catchAsync } from "../utils";
import { messageModel } from "../models";
import httpStatus from "http-status";

export const createMessageHandler = catchAsync(async (req, res) => {
  const auth = req.auth;
  const { message } = req.body;
  const { conversationId } = req.params;

  const newMessage = await messageModel.create({
    body: message,
    conversationId,
    senderId: auth.id
  })

  return res.status(httpStatus.CREATED).send({
    success: true,
    message: newMessage
  })
})