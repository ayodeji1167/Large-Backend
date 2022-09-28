/* eslint-disable no-unused-vars */
const appResponse = require('../../lib/appResponse');
const { MESSAGES } = require('../config/constants');

const {
  createPost, deleteResource, edit, getAll, getOne,
} = require('../services/blogServices');

const {
  CREATED, DELETED, FETCHED, UPDATED,
} = MESSAGES;
class BlogCtrl {
  createNew = async (req, res) => {
    const result = await createPost(req);
    res.status(201).send(appResponse(CREATED, result));
  };

  deleteResource = async (req, res) => {
    const result = await deleteResource(req.params.id);
    res.status(200).send(appResponse(DELETED, result));
  };

  edit = async (req, res) => {
    const body = { ...req.body };
    const result = await edit(req.params.id, body);
    res.status(200).send(appResponse(UPDATED, result));
  };

  getOne = async (req, res) => {
    const result = await getOne(req.params.id);
    res.status(200).send(appResponse(FETCHED, result));
  };

  getAll = async (req, res) => {
    const result = await getAll(req.params.id);
    res.status(200).send(appResponse(FETCHED, result));
  };
}

module.exports = new BlogCtrl();
