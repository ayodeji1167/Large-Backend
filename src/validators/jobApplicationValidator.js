const Joi = require('joi');
const { QueryParamsSchema } = require('./utilValidator');

const JobApplicationSchema = Joi.object({
  applicant: Joi.string(),
  job: Joi.string(),
  coverLetter: Joi.string().required(),
  cv: Joi.object({
    url: Joi.string().required(),
    publicId: Joi.string().required(),
  }),
  country: Joi.string().required(),
  countryCode: Joi.string().required(),
  phone: Joi.string().required(),
});

const GetAllJobsSchema = QueryParamsSchema.append({
  user: Joi.string(),
  company: Joi.string(),
  availability: Joi.string(),
  location: Joi.string(),
  createdAt: Joi.string(),
});

module.exports = { JobApplicationSchema, GetAllJobsSchema };
