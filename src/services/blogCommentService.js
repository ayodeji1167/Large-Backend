const blogCommentModel = require('../models/blogCommentModel');
const blogModel = require('../models/blogModel');

class BlogComService {
  findById = async (commentId) => {
    const comment = await blogCommentModel.findById(commentId)
      .populate('author', 'username')
      .populate('replies', 'author comment parentId')
      .lean();
    return comment;
  };

  findByIdAndUpdate = async (data) => {
    const { comment, commentId } = data;
    const newComment = await blogCommentModel
      .findByIdAndUpdate(commentId, { comment }, { new: true })
      .lean();

    return newComment;
  };

  findComment = async (commentId) => {
    const comment = await blogCommentModel.findById(commentId);
    return comment;
  };

  findBlog = async (blogId) => {
    const blog = await blogModel.findById(blogId);
    return blog;
  };

  updateCommentModel = async (data) => {
    const { parentId, comment } = data;
    await blogCommentModel.findByIdAndUpdate(
      parentId,
      {
        $pull: { replies: comment._id },
        $inc: { repliesCount: -1 },
      },
      { new: true },
    );
    return true;
  };

  updateBlogModel = async (data) => {
    const { comment, commentId } = data;
    const updatedBlog = await blogModel.findByIdAndUpdate(
      { _id: comment.blogId },
      {
        $pull: { comments: commentId },
        $inc: { commentCount: -1 },
      },
      { new: true },
    );
    return updatedBlog;
  };

  // tab here is used to represent the current comments tab or page for desktop
  getAllComments = async (tab, sortBy) => {
    const currentTab = tab || 1;
    const perTab = 20;
    let totalComments = 0;
    const count = await blogCommentModel.find().countDocuments();
    totalComments = count;
    let sort;

    if (sortBy === 'latest' || '') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sort = { createdAt: 1 };
    }

    // remember to make comments to query only for a specific blog
    const comments = await blogCommentModel.find().skip((+currentTab - 1) * perTab)
      .limit(perTab)
      .sort(sort)
      .lean();
    return { totalComments, comments };
  };
}

module.exports = new BlogComService();
