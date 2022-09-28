const appResponse = require('../../lib/appResponse');
const { MESSAGES } = require('../config/constants');
const personalRateService = require('../services/personalRateService');

const {
  CREATED, DELETED, FETCHED, UPDATED,
} = MESSAGES;

class PersonalRateCtrl {
  createNew = async (req, res) => {
    const result = await personalRateService.createPersonalRate(req);
    res.status(201).send(appResponse(CREATED, result));
  };

  delete = async (req, res) => {
    const response = await personalRateService.delete(req);
    res.status(200).send(appResponse(DELETED, response));
  };

  edit = async (req, res) => {
    const result = await personalRateService.update(req);
    res.status(200).send(appResponse(UPDATED, result));
  };

  getAll = async (req, res) => {
    const result = await personalRateService.getAll(req);
    res.status(200).send(appResponse(FETCHED, result));
  };

  getOne = async (req, res) => {
    const result = await personalRateService.getOne(req);
    res.status(200).send(appResponse(FETCHED, result));
  };
}

module.exports = new PersonalRateCtrl();
