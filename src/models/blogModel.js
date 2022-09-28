const { Schema, model } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const blogSchema = new Schema({
  image: {
    url: {
      type: String,
      required: true,
    },
  },
  title: {
    type: String,
    required: [true, 'post cannot be without a title'],
  },
  content: {
    type: String,
    required: [true, 'post cannot be without a content'],
  },
  tags: {
    type: Array,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'USER',
  },
  comments: [{ type: Schema.Types.ObjectId, ref: 'BLOG_COMMENT' }],
  commentCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = model(DB_COLLECTION.BLOG, blogSchema);
