const Joi = require('joi');

const convInitiationSchema = Joi.object({
  members: Joi.array().required(),
});

const convParamsSchema = Joi.object({
  conversationId: Joi.string().required(),
});

const reportUserSchema = Joi.object({
  reportedId: Joi.string().required(),
  conversationId: Joi.string().required(),
  reason: [
    Joi.array().required(),
    Joi.string().required(),
  ],
});

const userProfileParamsSchema = Joi.object({
  userId: Joi.string().required(),
});

module.exports = {
  convInitiationSchema,
  convParamsSchema,
  reportUserSchema,
  userProfileParamsSchema,
};
