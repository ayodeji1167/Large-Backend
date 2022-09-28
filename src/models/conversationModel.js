const mongoose = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const { Schema, model } = mongoose;

const ConversationSchema = new Schema(
  {

    members: [{
      type: Schema.Types.ObjectId,
    }],

    convInitiator: {
      type: Schema.Types.ObjectId,
    },

    blocked: {
      type: Boolean,
      default: false,
    },

    blockedByIds: [{
      type: Schema.Types.ObjectId,
    }],

  },
  {
    timestamps: true,
  },
);

const Conversation = model(DB_COLLECTION.CONVERSATION, ConversationSchema);

module.exports = Conversation;
