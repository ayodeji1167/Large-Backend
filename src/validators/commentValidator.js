const Joi = require('joi');

const CommentSchema = Joi.object({
  comment: Joi.string(),
  parentId: Joi.string(),
});

module.exports = CommentSchema;
