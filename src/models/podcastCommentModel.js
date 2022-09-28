const { Schema, model } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const commentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'USER',
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'COMMENT',
      default: null,
    },

    replies: [{ type: Schema.Types.ObjectId, ref: 'COMMENT' }],

    repliesCount: {
      type: Number,
      default: 0,
    },

    podcast: {
      type: Schema.Types.ObjectId,
      ref: 'PODCAST',
    },
  },

  { timestamps: true },
);

module.exports = model(DB_COLLECTION.COMMENT, commentSchema);
