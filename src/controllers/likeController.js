const likeService = require('../services/likeService');
const appResponse = require('../../lib/appResponse');

class LikeCtrl {
  like = async (req, res) => {
    const response = await likeService.like(req);
    res.status(201).send(appResponse('like added', response));
  };

  getAllLikesPerPost = async (req, res) => {
    const response = await likeService.getAllLikesPerPost(req);
    res.status(201).send(appResponse('Fetched', response));
  };

  disLike = async (req, res) => {
    const response = await likeService.disLike(req);
    res.status(201).send(appResponse('like removed', response));
  };
}
module.exports = new LikeCtrl();
