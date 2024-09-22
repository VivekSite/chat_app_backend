import httpStatus from 'http-status'
import { userModel } from '../models'
import { catchAsync } from '../utils'

export const getAllUserHandler = catchAsync(async (req, res) => {
  const users = await userModel
    .find()
    .select(['-password', '-isDeleted', '-createdAt', '-updatedAt'])
    .lean()

  return res.status(httpStatus.OK).send({
    success: true,
    users
  })
})
