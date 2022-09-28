const Joi = require('joi');

const StoreSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().lowercase().email().required(),
  phoneNumber: Joi.string().required(),
  faxNumber: Joi.string(),
  address: Joi.string().required(),
  city: Joi.string().required(),
});

const EditStoreSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().lowercase().email(),
  logo: Joi.string(),
  phonenumber: Joi.string(),
  faxNumber: Joi.string(),
});

const FetchStoreSchema = Joi.object({
  name: Joi.string(),
  user: Joi.string(),
});

module.exports = {
  StoreSchema,
  EditStoreSchema,
  FetchStoreSchema,
};
