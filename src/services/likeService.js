const { BadRequestError } = require('../../lib/errors');
const PodcastModel = require('../models/podcastModel');

class LikeService {
  like = async (req) => {
    const { podcastId } = req.params;
    const { user } = req;

    const podcast = await PodcastModel.findById(podcastId);
    if (podcast.likedBy.includes(user._id)) throw new BadRequestError('You already liked this post');

    const updatedPodcastLikes = await PodcastModel.findByIdAndUpdate(
      podcastId,
      { $inc: { likeCount: 1 }, $push: { likedBy: user._id } },
      { new: true },
    );
    return updatedPodcastLikes;
  };

  getAllLikesPerPost = async (req) => {
    const { podcastId } = req.params;
    const usersWhoLiked = await PodcastModel.findById(podcastId).select('likedBy').populate('likedBy', 'username');
    if (!usersWhoLiked) throw new BadRequestError('Post has no likes');
    return usersWhoLiked;
  };

  disLike = async (req) => {
    const { podcastId } = req.params;
    const { user } = req;

    const podcast = await PodcastModel.findById(podcastId);
    if (!podcast.likedBy.length) throw new BadRequestError('Podcast Has No Like.');

    const updatedPodcastLikes = await PodcastModel.findByIdAndUpdate(
      podcastId,
      { $pull: { likedBy: user._id }, $inc: { likeCount: -1 } },
      { new: true },
    );

    return updatedPodcastLikes;
  };
}

module.exports = new LikeService();
