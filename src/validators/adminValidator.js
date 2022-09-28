const Joi = require('joi');

const adminSignUpSchema = Joi.object({
  firstName: Joi.string().required().min(2),
  fullName: Joi.string().required().min(2),
  email: Joi.string().email().required(),
});

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  adminSignUpSchema,
  adminLoginSchema,
};
