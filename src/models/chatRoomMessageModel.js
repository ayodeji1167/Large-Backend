const { Schema, model } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const ReadByRecipientSchema = new Schema(
  {
    _id: false,
    readByUserId: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true, // will use createdAt in place of readAt
  },
);

const ChatRoomMessageSchema = new Schema(
  {

    chatRoomId: {
      type: Schema.Types.ObjectId,
    },
    message: {
      type: Schema.Types.Mixed,
    },
    sendByUserId: {
      type: Schema.Types.ObjectId,
    },
    readByRecipients: [ReadByRecipientSchema],
  },
  {
    timestamps: true,
  },
);

const ChatRoomMessage = model(DB_COLLECTION.CHAT_ROOM_MESSAGE, ChatRoomMessageSchema);

module.exports = ChatRoomMessage;
