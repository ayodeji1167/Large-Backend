/* eslint-disable linebreak-style */
const { BadRequestError } = require('../../lib/errors');
// const { uploadToCloud } = require('../config/cloudinary');

const PersonalRateModel = require('../models/personalRateModel');

class PersonalRateService {
  createPersonalRate = async (req) => {
    const id = req.user._id;

    const result = await PersonalRateModel.create({
      ...req.body,
      userId: id,
    });
    return result;
  };

  delete = async (req) => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Provide an id');
    }
    const PersonalRate = await PersonalRateModel.findByIdAndDelete(id);
    return PersonalRate;
  };

  update = async (req) => {
    const { id } = req.params;
    if (!req.body) {
      throw new BadRequestError('Cannot update empty data');
    }
    const { body } = req;

    // eslint-disable-next-line max-len
    const updatedPersonalRate = await PersonalRateModel.findByIdAndUpdate(id, body, { new: true });
    if (!updatedPersonalRate) {
      throw new BadRequestError('Personal Rate not found');
    }
    return updatedPersonalRate;
  };

  getAll = async (req) => {
    const rates = await PersonalRateModel.find({ userId: req.user._id });
    return rates;
  };

  getOne = async (req) => {
    const rate = await PersonalRateModel.findOne({
      name: req.params.id,
      userId: req.user._id,
    });
    return rate;
  };
}

module.exports = new PersonalRateService();
