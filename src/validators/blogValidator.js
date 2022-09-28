const Joi = require('joi');
// const { Schema } = require('mongoose');

const blogValidator = Joi.object(
  {
    title: Joi.string().min(1).required(),
    content: Joi.string().min(1).required(),
    tags: Joi.array(),
  },
);

const blogEditValidator = Joi.object(
  {
    title: Joi.string().min(1),
    content: Joi.string().min(1),
  },
);

const blogCommentValidator = Joi.object(
  {
    comment: Joi.string().required(),
    parentId: Joi.string(),
    blogId: Joi.string(),
  },
);

const blogQueryValidator = Joi.object(
  {
    sortBy: Joi.string(),
    page: Joi.string(),
  },
);

module.exports = {
  blogValidator, blogEditValidator, blogCommentValidator, blogQueryValidator,
};
