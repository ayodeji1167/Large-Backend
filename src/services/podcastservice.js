/* eslint-disable camelcase */
const path = require('path');
const { BadRequestError } = require('../../lib/errors');
const PodcastModel = require('../models/podcastModel');
const { UPLOAD_COLLECTIONS, MESSAGES } = require('../config/constants');
const { uploadToCloud, deleteFromCloud } = require('../config/cloudinary');

const { PODCASTS } = UPLOAD_COLLECTIONS;
class PodcastService {
  // create a new podcast for a user
  createPodcast = async (req) => {
    const imageFormats = ['.jpeg', '.png', '.jpg'];
    const audioFormats = ['.mp3', '.mp4', '.mpeg'];
    const videoFormats = ['.mp4', '.mov', '.webm', '.wmv', '.mkv', '.flv', '.mpeg'];
    const { file, user } = req;
    if (!file) throw new BadRequestError('Please Upload a file');

    let key;
    let saveFile;

    if (imageFormats.includes(path.extname(file.originalname).toLowerCase())) {
      saveFile = await uploadToCloud(file.path, PODCASTS);
      key = 'image';
    } else if (audioFormats.includes(path.extname(file.originalname).toLowerCase())) {
      saveFile = await uploadToCloud(file.path, PODCASTS);
      key = 'audio';
    } else if (videoFormats.includes(path.extname(file.originalname).toLowerCase())) {
      saveFile = await uploadToCloud(file.path, PODCASTS);
      key = 'video';
    } else throw new BadRequestError('File format not Supported');

    const { secure_url, public_id } = saveFile;

    const podcast = await PodcastModel.create({
      ...req.body,
      user: user._id,
      uploadType: key,
      [key]: {
        url: secure_url,
        publicId: public_id,
      },
    });

    return podcast;
  };

  // to edit a podcast
  editPodcast = async (req) => {
    const { id } = req.params;
    const podcast = await PodcastModel.findByIdAndUpdate(id, req.body, { new: true });
    return podcast;
  };

  // get a particular podcast
  getOnePodcast = async (req) => {
    const { id } = req.params;
    const podcast = await PodcastModel.findById(id).populate('comments', 'author comment parentId');
    if (!podcast) throw new BadRequestError('Podcast Does Not Exist');
    return podcast;
  };

  // get podcast for a user
  getPodcastPerUser = async (req) => {
    const { id } = req.params;
    const podcast = await PodcastModel.find({ user: id });
    if (!podcast) throw new BadRequestError('User has no podcasts yet...');
    return podcast;
  };

  // search for podcasts
  getAllPodcasts = async (query) => {
    const pageSize = Number(query.pageSize) || 20;
    const pageNo = Number(query.pageNo) || 1;

    const queryObject = {};
    /*
    If there is query by search,
    match the podcast where the “title” contains or matches the search query
    */
    if (query.search) {
      const theSearchRegex = new RegExp(query.search, 'ig');
      queryObject.title = theSearchRegex;
    }

    // If there is a query by user
    if (query.user) queryObject.user = query.user;

    // If there is a query by uploadType (if video or audio)
    if (query.uploadType) queryObject.uploadType = query.uploadType;

    // If there is a query by createdAt
    if (query.createdAt) queryObject.createdAt = query.createdAt;

    const noToSkip = (pageNo - 1) * pageSize;

    const fetched = await PodcastModel
      .find(queryObject)
      .sort({ createdAt: 1 })
      .skip(noToSkip)
      .limit(pageSize)
      .lean();

    if (!fetched) throw new BadRequestError('No Podcasts found');

    const totalCount = await PodcastModel.countDocuments(queryObject);

    const noOfPages = Math.ceil(totalCount / pageSize);

    return {
      fetchedData: fetched,
      noOfPages,
      totalCount,
      pageNo,
      pageSize,
    };
  };

  // delete podcast
  deletePodcast = async (req) => {
    const { id } = req.params;
    const podcast = await PodcastModel.findById(id);

    if (!podcast) throw new BadRequestError('Podcast Not Found');

    const key = podcast.uploadType;
    const { publicId } = podcast[key];

    await deleteFromCloud(publicId, key);
    await PodcastModel.findByIdAndDelete(id);

    return MESSAGES.DELETED;
  };
}
module.exports = new PodcastService();
