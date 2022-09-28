const Joi = require('joi');
const { QueryParamsSchema } = require('./utilValidator');

const JobSchema = Joi.object({
  company: Joi.string().required(),
  imageCover: Joi.string(),
  title: Joi.string().required(),
  availability: Joi.string().valid('Fulltime', 'Part Time', 'Freelance'),
  location: Joi.string().required(),
  description: Joi.string().min(10).required(),
  voiceRecord: Joi.string(),
  salaryRange: Joi.object({
    minimum: Joi.number(),
    maximum: Joi.number(),
  }),
  recruiter: Joi.string(),
  orderId: Joi.string().required(),
});

const ChargeTokenShema = Joi.object({
  jobOrderId: Joi.string().required(),
  token: Joi.string().required(),
});
/*
getAllJobsSchema function gets QueryParamsSchema from the utilValidator and
appends new fields for seaches specific to Job posting

*/

const GetAllJobsSchema = QueryParamsSchema.append({
  title: Joi.string(),
  description: Joi.string(),
  company: Joi.string(),
  availability: Joi.string(),
  location: Joi.string(),
  createdAt: Joi.string(),
  recruiter: Joi.string(),
});

module.exports = { JobSchema, GetAllJobsSchema, ChargeTokenShema };
