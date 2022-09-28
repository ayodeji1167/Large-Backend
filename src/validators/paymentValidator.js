const Joi = require('joi');

const GenerateTokenSchema = Joi.object({
  cardNumber: Joi.number().required(),
  expMonth: Joi.number().required(),
  expYeah: Joi.number().required(),
  cvc: Joi.number().required(),
});

const ChargeCardSchema = Joi.object({
  token: Joi.string().required(),
  productId: Joi.string().required(),
});

module.exports = { GenerateTokenSchema, ChargeCardSchema };
