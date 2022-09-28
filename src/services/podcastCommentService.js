/* eslint-disable max-len */
/* eslint-disable object-curly-spacing */
const CommentModel = require('../models/podcastCommentModel');
const PodcastModel = require('../models/podcastModel');
const { BadRequestError } = require('../../lib/errors');

class CommentService {
  // Create New Comment

  createComment = async (req) => {
    const { user } = req;
    const { comment, parentId, podcastId } = req.body;

    const newComment = new CommentModel({
      author: user._id,
      podcast: podcastId,
      comment,
    });

    if (parentId) {
      const parentCommentFound = await PodcastModel.findOne({_id: podcastId, comments: parentId});
      if (!parentCommentFound) throw new BadRequestError('Such Parent Comment Does not exist in this Podcast.');

      newComment.parentId = parentId;
      await CommentModel.findByIdAndUpdate(parentId, { $inc: {repliesCount: 1}, $push: {replies: newComment._id}}, {new: true});
    }

    await newComment.save();

    const podcastObj = await PodcastModel.findByIdAndUpdate(
      podcastId,
      { $inc: {commentCount: 1}, $push: {comments: newComment._id} },
      {new: true},
    );

    if (!podcastObj) throw new BadRequestError('Podcast Does Not Exist');

    return newComment;
  };

  // Get a Particular Comment

  getOneComment = async (req) => {
    const { id } = req.params;
    const comment = await CommentModel.findById(id)
      .populate('author', 'username')
      .populate('replies', 'author comment parentId');

    if (!comment) throw new BadRequestError('Comment Does Not exist');

    return comment;
  };

  // Get All existing Comments for One Podcast

  getAllCommentsPerPost = async (req) => {
    const { podcastId } = req.params;

    const podcast = await PodcastModel.findById(podcastId)
      .lean()
      .populate({
        path: 'comments',
        select: 'author comment replies',
      });

    if (!podcast) throw new BadRequestError('Podcast Does Not Exist.');

    const allComments = podcast.comments;

    return allComments;
  };

  // Delete a particular Comment

  deleteComment = async (req) => {
    const { id } = req.params;
    // const { user } = req;
    const comment = await CommentModel.findById(id);

    if (!comment) throw new BadRequestError('Comment no longer exists.');

    const { parentId } = comment;

    const podcast = await PodcastModel.findById(comment.podcast);
    const { comments, commentCount } = podcast;

    if ((!comments.length) && (commentCount < 1)) {
      throw new BadRequestError('Podcast Has No comments.');
    }

    // You can only delete if you are the author of the comment or the owner of the podcast post.
    // if (comment.author._id !== user._id || podcast.user._id !== user._id) {
    //   throw new BadRequestError('You are not allowed to delete.');
    // }

    if (parentId) {
      await CommentModel.findByIdAndUpdate(parentId, { $pull: {replies: comment._id}, $inc: {repliesCount: -1} }, {new: true});
    }

    const updatedPodcast = await PodcastModel.findByIdAndUpdate(
      { _id: comment.podcast },
      { $pull: { comments: id }, $inc: {commentCount: -1} },
      { new: true },
    );

    await CommentModel.deleteOne({_id: id});

    return updatedPodcast;
  };
}

module.exports = new CommentService();
