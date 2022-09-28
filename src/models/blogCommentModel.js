const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
  blogId: {
    type: Schema.Types.ObjectId,
    ref: 'BLOG',
    required: true,
  },

  comment: {
    type: String,
    required: true,
  },

  parentId: {
    type: Schema.Types.ObjectId,
    required: false,
    default: null,
    ref: 'BLOG_COMMENT',
  },

  replies: [{ type: Schema.Types.ObjectId, ref: 'BLOG_COMMENT' }],

  repliesCount: {
    type: Number,
    default: 0,
  },

  reaction: [{ reactor: Schema.Types.ObjectId, reaction: String }],

  reactionCount: {
    type: Number,
    default: 0,
  },

}, { timestamps: true, toJson: { virtuals: true } });

const blogCommentModel = model('BLOG_COMMENT', commentSchema);
module.exports = blogCommentModel;
