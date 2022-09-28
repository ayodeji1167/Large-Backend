const commentService = require('../services/podcastCommentService');
const appResponse = require('../../lib/appResponse');

class CommentCtrl {
  createComment = async (req, res) => {
    const response = await commentService.createComment(req);
    res.status(201).send(appResponse('comment added', response));
  };

  getOneComment = async (req, res) => {
    const response = await commentService.getOneComment(req);
    res.status(201).send(appResponse('FETCHED', response));
  };

  getAllCommentsPerPost = async (req, res) => {
    const response = await commentService.getAllCommentsPerPost(req);
    res.status(200).send(appResponse('FETCHED', response));
  };

  deleteComment = async (req, res) => {
    const response = await commentService.deleteComment(req);
    res.status(200).send(appResponse('Deleted', response));
  };
}

module.exports = new CommentCtrl();
