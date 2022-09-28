const Joi = require('joi');

const CreatePriceSchema = Joi.object({
  description: Joi.string().valid(
    'ADVERTISEMENT ON WEBSITE',
    'PODCAST RECORDING ADVERTISEMENT',
    'JOB POSTING ADVERTISEMENT',
    'PROMOTE YOURSELF',
    'JOB POSTING',
    'PAID',
    'BUISNESS',
  ).required(),
  price: Joi.required(),
  continent: Joi.string(),

});

module.exports = { CreatePriceSchema };
