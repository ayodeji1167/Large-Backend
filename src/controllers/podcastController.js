/* eslint-disable object-curly-newline */
const appResponse = require('../../lib/appResponse');
const podcastService = require('../services/podcastservice');
const { MESSAGES } = require('../config/constants');

const { PODCAST_CREATED, FETCHED, PODCAST_UPDATED } = MESSAGES;

class PodcastController {
  createPodcast = async (req, res) => {
    const response = await podcastService.createPodcast(req);
    res.status(201).send(appResponse(PODCAST_CREATED, response));
  };

  editPodcast = async (req, res) => {
    const podcast = await podcastService.editPodcast(req);
    res.status(200).send(appResponse(PODCAST_UPDATED, podcast));
  };

  getOnePodcast = async (req, res) => {
    const podcast = await podcastService.getOnePodcast(req);
    res.status(200).send(appResponse(FETCHED, podcast));
  };

  getPodcastsPerUser = async (req, res) => {
    const podcasts = await podcastService.getPodcastPerUser(req);
    res.status(200).send(appResponse(FETCHED, podcasts));
  };

  getAllPodcasts = async (req, res) => {
    const podcasts = await podcastService.getAllPodcasts(req.query);
    res.status(200).send(appResponse(FETCHED, podcasts));
  };

  deletePodcast = async (req, res) => {
    const response = await podcastService.deletePodcast(req);
    res.status(200).send(appResponse(response));
  };
}

module.exports = new PodcastController();
