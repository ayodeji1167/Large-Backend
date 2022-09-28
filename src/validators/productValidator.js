const Joi = require('joi');
const { QueryParamsSchema } = require('./utilValidator');

const ProductSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().required(),
});

const EditProductSchema = Joi.object({
  name: Joi.string().min(2),
  description: Joi.string().min(10),
  price: Joi.number(),
});

const FetchProductSchema = QueryParamsSchema.append({
  name: Joi.string().min(2),
  store: Joi.string(),
});
const ProductIdSchema = Joi.object({
  productId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({ 'string.pattern.base': 'ProductId is invalid' })
    .required(),
});

module.exports = {
  ProductSchema,
  FetchProductSchema,
  EditProductSchema,
  ProductIdSchema,
};
