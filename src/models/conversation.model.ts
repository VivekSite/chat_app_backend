import { Schema, Types, model } from "mongoose";

const conversationSchema = new Schema({
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
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
  messages: [
    {
      type: Types.ObjectId,
      ref: 'messages'
    }
  ],
  lastMessage: {
    type: Types.ObjectId,
    ref: 'messages'
  },
  updated_at: {
    type: Number,
    default: () => +new Date()
  },
  created_at: {
    type: Number,
    default: () => +new Date()
  }
}, {
  timestamps: true
})

export const conversationModel = model('conversations', conversationSchema);
