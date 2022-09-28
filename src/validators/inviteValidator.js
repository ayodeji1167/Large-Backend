const Joi = require('joi');

const inviteSchema = Joi.object({
  emails: Joi.array().items(Joi.string().lowercase().email().required()).required(),
});

const acceptDeclineSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  email: Joi.string().lowercase().email().required(),
  country: Joi.string().min(3).required(),
  id: Joi.string().required(),
});

module.exports = {
  inviteSchema,
  acceptDeclineSchema,
};
