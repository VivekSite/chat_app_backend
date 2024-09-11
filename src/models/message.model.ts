import { Schema, model, Types } from 'mongoose'

const messageSchema = new Schema({
  body: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  seenIds: [
    {
      type: Types.ObjectId,
      ref: 'users'
    }
  ],
  conversationId: {
    type: Types.ObjectId,
    ref: 'conversations'
  },
  senderId: {
    type: Types.ObjectId,
    ref: 'users'
  }
}, {
  timestamps: true,
})

messageSchema.index({
  conversationId: 1
})

messageSchema.index({
  senderId: 1
})

export const messageModel = model('messages', messageSchema);