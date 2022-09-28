const Joi = require('joi');

const QueryParamsSchema = Joi.object({
  search: Joi.string(),
  pageNo: Joi.string(),
  pageSize: Joi.string(),
});

const IdSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({ 'string.pattern.base': 'Id is invalid' })
    .required(),
});

const GenerateTokenSchema = Joi.object({
  cardNumber: Joi.number().required(),
  expMonth: Joi.number().required(),
  expYear: Joi.number().required(),
  cvc: Joi.number().required(),
});

module.exports = { QueryParamsSchema, IdSchema, GenerateTokenSchema };
