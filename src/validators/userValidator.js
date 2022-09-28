const Joi = require('joi');
const { GenerateTokenSchema } = require('./utilValidator');

const RegisterSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  email: Joi.string().lowercase().email().required(),
  username: Joi.string().required(),
  password: Joi.string().min(6).required(),
  profession: Joi.string(),
  sector: Joi.string().required(),
  location: Joi.object({
    address: Joi.string().min(3).required(),
    country: Joi.string().min(3).required(),
    continent: Joi.string().uppercase().min(3).required(),
  }).required(),

  memberPlan: Joi.object({
    duration: Joi.number().required(),
    price: Joi.number().required(),
  }),
  company: Joi.object({
    name: Joi.string().required(),
    logo: Joi.string(),
    information: Joi.string().required(),
    website: Joi.string().required(),
  }),
  memberType: Joi.string().valid('FREE', 'BUSINESS', 'PAID', 'RECRUITER'),
});

const LoginSchema = Joi.object({

});

const ForgotPasswordSchema = Joi.object({
  email: Joi.string().lowercase().email().required(),
});

const ResetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
});

const CreateCustomerSchema = GenerateTokenSchema.append({
  // email: Joi.string().lowercase().email().required(),
});

const SubscribeUserSchema = Joi.object({
  customerId: Joi.string().required(),
});

const EditProfileSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  username: Joi.string(),
  profession: Joi.string(),
  country: Joi.string(),
  email: Joi.string().lowercase().email(),
  sector: Joi.string(),
  aboutMe: Joi.string(),

});

const ContactUsSchema = Joi.object({
  message: Joi.string(),
  file: Joi.string(),
  email: Joi.string().required(),
  name: Joi.string().required(),

});

module.exports = {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  EditProfileSchema,
  CreateCustomerSchema,
  SubscribeUserSchema,
  ContactUsSchema,
};
