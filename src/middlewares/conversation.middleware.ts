import httpStatus from "http-status";
import { catchAsync } from "../utils";
import { Types } from "mongoose";

export const ValidateCreateConversation = catchAsync(async (req, res, next) => {
  const { userId, isGroup, name, userIds } = req.body;
  const auth = req.auth;

  if (!isGroup) { 
    if (!userId) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "UserId is required!"
      })
    }
    
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Invalid UserId!"
      })
    }

    if (userId === auth.id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Both user can't be same"
      })
    }
  } else {
    if (!name) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Group name is required!"
      })
    }

    if (!Array.isArray(userIds)) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "UserIds must be an array!"
      })
    }

    if (userIds.length < 2) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Please select more than one user!"
      })
    }

    let isUseridsValid = true;
    for (let id of userIds) {
      if (!Types.ObjectId.isValid(id)) {
        isUseridsValid = false;
        break;
      }
    }

    if (!isUseridsValid) { 
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "All the userIds must be valid!"
      })
    }
  }
  
  next();
})