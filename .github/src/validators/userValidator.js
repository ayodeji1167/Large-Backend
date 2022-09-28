const Joi = require('joi');

const RegisterSchema = Joi.object({
  firstname: Joi.string().min(3).required(),
  lastname: Joi.string().min(3).required(),
  username: Joi.string().min(3).required(),
  email: Joi.string().lowercase().email().required(),
  password: Joi.string().min(6).required(),
  profession: Joi.string().min(6).required(),
  memberPlan: Joi.object({
    duration: Joi.number(),
    price: Joi.number(),
  }),
  memberType: Joi.string().valid('FREE', 'BUISNESS', 'PAID'),
});

const LoginSchema = Joi.object({

});

module.exports = { RegisterSchema, LoginSchema };
