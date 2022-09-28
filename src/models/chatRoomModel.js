const mongoose = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const { Schema, model } = mongoose;

const ChatRoomSchema = new Schema(
  {

    members: [{
      type: Schema.Types.ObjectId,
      required: true,
    }],

    muteIds: [{
      type: Schema.Types.ObjectId,
    }],

    chatRoomInitiator: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    avatar: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },

    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: ['GENERAL', 'PRIVATE'],
    },

    country: {
      type: String,
      required: true,
    },

  },
  {
    timestamps: true,
  },
);

const ChatRoom = model(DB_COLLECTION.CHAT_ROOM, ChatRoomSchema);

module.exports = ChatRoom;
