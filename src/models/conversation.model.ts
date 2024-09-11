import { Schema, Types, model } from "mongoose";

const conversationSchema = new Schema({
  name: {
    type: String,
    required: false
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  userIds: [
    {
      type: Types.ObjectId,
      ref: 'users'
    }
  ],
  createdBy: {
    type: Types.ObjectId,
    ref: 'users'
  },
  admins: [
    {
      type: Types.ObjectId,
      ref: 'users'
    }
  ],
  lastMessageAt: {
    type: Number,
    default: () => +Date.now()
  }
}, {
  timestamps: true
})

export const conversationModel = model('conversations', conversationSchema);
