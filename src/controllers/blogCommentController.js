const blogCommentModel = require('../models/blogCommentModel');
const appResponse = require('../../lib/appResponse');
const { MESSAGES } = require('../config/constants');
// eslint-disable-next-line no-unused-vars
const { BadRequestError, NotFoundError } = require('../../lib/errors');
const blogModel = require('../models/blogModel');
const blogCommentService = require('../services/blogCommentService');

class BlogCommentCntrl {
  createComment = async (req, res) => {
    const { user } = req;
    const { parentId, blogId, comment } = req.body;

    // eslint-disable-next-line new-cap
    let newComment = new blogCommentModel({
      author: user,
      blogId,
      comment,
    });

    if (parentId) {
      const parentComment = await blogModel.findOne({
        _id: blogId,
        comments: parentId,
      });

      if (!parentComment) throw new NotFoundError('parent comment not found');
    }

    newComment.parentId = parentId;
    await blogCommentModel.findByIdAndUpdate(
      parentId,
      { $inc: { repliesCount: 1 }, $push: { replies: newComment._id } },

      { new: true },
    );

    newComment = await newComment.save();

    await blogModel.findByIdAndUpdate(
      blogId,
      {
        $inc: { commentCount: 1 },
        $push: { comments: newComment._id },
      },
      { new: true },
    );

    res.status(201).send(appResponse(MESSAGES.CREATED, newComment));
  };

  getOneComment = async (req, res) => {
    const { commentId } = req.params;

    const comment = await blogCommentService.findById(commentId);

    if (!comment) throw new NotFoundError('comments not found');

    res.status(200).send(appResponse(MESSAGES.FETCHED, comment));
  };

  updateComment = async (req, res) => {
    const { commentId, comment } = req.body;

    const commentObj = { comment, commentId };

    await blogCommentService.findByIdAndUpdate(commentObj);

    res.status(200).send(appResponse(MESSAGES.FETCHED));
  };

  deleteComment = async (req, res) => {
    const { commentId } = req.params;

    const comment = await blogCommentService.findComment(commentId);

    if (!comment) throw new NotFoundError('comment not found');

    const { parentId, blogId } = comment;

    const blog = await blogCommentService.findBlog(blogId);

    const { comments, commentCount } = blog;

    if (!comments.length && commentCount < 1) throw new BadRequestError('no comments');

    if (parentId) {
      const success = await blogCommentService.updateCommentModel({ parentId, comment });
      if (!success) throw BadRequestError('couldn\'t not delete comment');
    }

    await blogCommentService.updateBlogModel({ comment, commentId });

    await blogCommentModel.deleteOne({ _id: commentId });
    res.status(200).send(appResponse(MESSAGES.UPDATED));
  };

  getAllComments = async (req, res) => {
    const { page: tab, sortBy } = req.query;
    const { totalComments, comments } = await blogCommentService.getAllComments(tab, sortBy);

    if (totalComments === 0) throw new BadRequestError('no comments for this blog');

    res.status(200).send(appResponse(MESSAGES.FETCHED, { comments, totalComments }));
  };
}

module.exports = new BlogCommentCntrl();
