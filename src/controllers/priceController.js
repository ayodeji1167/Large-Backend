const priceService = require('../services/priceService');
const appResponse = require('../../lib/appResponse');
const { MESSAGES } = require('../config/constants');

const {
  CREATED, FETCHED, UPDATED, DELETED,
} = MESSAGES;

class PriceController {
  create = async (req, res) => {
    const price = await priceService.create(req);
    res.status(200).send(appResponse(CREATED, price));
  };

  getAll = async (req, res) => {
    const prices = await priceService.getAll(req);
    res.status(200).send(appResponse(FETCHED, prices));
  };

  edit = async (req, res) => {
    const editedPrice = await priceService.edit(req);
    res.status(200).send(appResponse(UPDATED, editedPrice));
  };

  delete = async (req, res) => {
    await priceService.delete(req);
    res.status(200).send(appResponse(DELETED));
  };
}

module.exports = new PriceController();
