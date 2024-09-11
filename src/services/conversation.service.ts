import { Types } from "mongoose";
import { conversationModel } from "../models";

export async function getConversationById(id: Types.ObjectId | undefined): Promise<typeof conversationModel | null>  {
  if (!id) return null;

  return await conversationModel.findById(id);
}