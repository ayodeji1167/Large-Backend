const { BadRequestError } = require('../../lib/errors');
const PriceModel = require('../models/priceModel');
const priceModel = require('../models/priceModel');

class PriceService {
  create = async (req) => {
    const { description, continent } = req.body;
    const isExist = await PriceModel.findOne({ description, continent });

    if (isExist) throw new BadRequestError('Price of this form already exist');

    const priceCreated = await priceModel.create(req.body);
    return priceCreated;
  };

  getAll = async (req) => {
    const {
      pageSize, pageNo, description, continent, price,
    } = req.query;
    const queryObject = {};

    if (description) {
      queryObject.description = description;
    }
    if (continent) {
      queryObject.continent = continent;
    }
    if (price) {
      queryObject.price = price;
    }

    const noToSkip = Number(pageNo) - 1;

    const pricesFetched = await PriceModel.find(queryObject)
      .sort({ createdAt: 1 }).skip(noToSkip).limit(Number(pageSize));

    const noOfPricesFetched = await PriceModel.countDocuments(pricesFetched);

    return {
      pricesFetched,
      noOfPricesFetched,
      pageNo: pageNo || 1,
      pageSize: pageSize || 20,
    };
  };

  edit = async (req) => {
    const { id } = req.params;
    if (!req.body) {
      throw new BadRequestError('You can\'t update with an empty data');
    }
    const editedPrice = await PriceModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!editedPrice) {
      throw new BadRequestError('Price Not Found');
    }
    return editedPrice;
  };

  delete = async (req) => {
    const { id } = req.params;
    const priceToDelete = await PriceModel.findByIdAndDelete(id);
    if (!priceToDelete) {
      throw new BadRequestError('Price Not Foumd');
    }
  };
}

module.exports = new PriceService();
