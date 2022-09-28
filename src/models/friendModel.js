const { Schema, model } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const FriendSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
  },

  friendsIds: {
    type: [Schema.Types.ObjectId],
    required: true,
  },
}, { timestamps: true });

const Friend = model(DB_COLLECTION.FRIEND, FriendSchema);

module.exports = Friend;
