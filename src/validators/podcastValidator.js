const Joi = require('joi');

const PodcastSchema = Joi.object({
  title: Joi.string().min(3),
  content: Joi.string().min(3),
});

module.exports = PodcastSchema;
