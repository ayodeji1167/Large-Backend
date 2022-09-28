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

const ConversationMessageSchema = new Schema(
  {

    conversationId: {
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

const ConversationMessage = model(DB_COLLECTION.CONVERSATION_MESSAGE, ConversationMessageSchema);

module.exports = ConversationMessage;
