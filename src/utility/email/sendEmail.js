/* eslint-disable quotes */
const nodemailer = require('nodemailer');
// const fs = require('fs');
const { BadRequestError } = require('../../../lib/errors');
const {
  verifyEmailTemplate,
  passwordChangedTemplate,
  passwordChangeReqTempl,
  changeEmailTemplate,
  invitationTemplate,
  paymentFailedTemplate,
  contactUsTemplate,
  orderSuccessTemplate,
} = require('../../views/email/convert-to-html');

const mailer = async (to, subject, payload) => {
  /**
   * You need to set the keys in .env file to get this function working
   * the first part generate html template for the email body using handlebars view engine
   * in the createTransport method the options clientId, clientSecret and refreshToken
   * are required for gmail to work efficiently
   * follow this https://www.freecodecamp.org/news/use-nodemailer-to-send-emails-from-your-node-js-server/
   * To know how to get the above credentials
   *
   *  I used @filepath @filename and @text for when the contact us has a file it in ...
   * I used @text cos html isnt working
   * */
  const {
    firstName, link, message, email, status, totalCost, date, products, file,
  } = payload;
  let html;
  // let filename;
  // let filePath;
  if (subject === 'Verify Your Account') {
    html = verifyEmailTemplate({ firstName, link });
  } else if (subject === 'Password Reset Request') {
    html = passwordChangeReqTempl({ email: payload.email, link });
  } else if (subject === 'Password Reset Confirmation') {
    html = passwordChangedTemplate({ name: firstName, link });
  } else if (subject === 'Change Email') {
    html = changeEmailTemplate({ firstName, link });
  } else if (subject === 'BBWE Email Invitation') {
    html = invitationTemplate({ link });
  } else if (subject === 'BBWE Payment Failed') {
    html = paymentFailedTemplate({ link });
  } else if (subject === 'Customer Support Ticket') {
    if (file) {
      // filename = file.originalname;
      // filePath = file.path;
    } else {
      html = contactUsTemplate({ message, email, name: firstName });
    }
  } else if (subject === 'Purchase Successful') {
    html = orderSuccessTemplate({
      status, totalCost, date, products,
    });
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.OAUTH_CLIENT_ID,
        accessToken: process.env.OAUTH_ACCESS_TOKEN,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      },
    });

    const info = {
      from: process.env.MAIL_USERNAME,
      to,
      subject,
      html,
      // attachments: [
      //   {
      //     // stream as an attachment
      //     filename,
      //     content: fs.createReadStream(filePath),
      //   },
      // ],
    };

    const mail = await transporter.sendMail(info);
    return mail;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

module.exports = mailer;
