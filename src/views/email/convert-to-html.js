const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const verifyEmailMjml = fs.readFileSync(path.resolve(__dirname, '../mjml/verify-email.mjml')).toString();
const passwordChangedMjml = fs.readFileSync(path.resolve(__dirname, '../mjml/reset-password.mjml')).toString();
const passwordChangeRequest = fs.readFileSync(path.resolve(__dirname, '../mjml/reset-password-request.mjml')).toString();
const changeEmailMjml = fs.readFileSync(path.resolve(__dirname, '../mjml/change-email.mjml')).toString();
const invitationMjml = fs.readFileSync(path.resolve(__dirname, '../mjml/invitation.mjml')).toString();
const paymentFailedMjml = fs.readFileSync(path.resolve(__dirname, '../mjml/payment-failed.mjml')).toString();
const ContactUsMjml = fs.readFileSync(path.resolve(__dirname, '../mjml/contact-us.mjml')).toString();

const verifyEmailTemplate = Handlebars.compile(mjml2html(verifyEmailMjml).html);
const passwordChangedTemplate = Handlebars.compile(mjml2html(passwordChangedMjml).html);
const passwordChangeReqTempl = Handlebars.compile(mjml2html(passwordChangeRequest).html);
const changeEmailTemplate = Handlebars.compile(mjml2html(changeEmailMjml).html);
const invitationTemplate = Handlebars.compile(mjml2html(invitationMjml).html);
const paymentFailedTemplate = Handlebars.compile(mjml2html(paymentFailedMjml).html);
const contactUsTemplate = Handlebars.compile(mjml2html(ContactUsMjml).html);

module.exports = {
  verifyEmailTemplate,
  passwordChangedTemplate,
  passwordChangeReqTempl,
  changeEmailTemplate,
  invitationTemplate,
  paymentFailedTemplate,
  contactUsTemplate,
};
