const Handlebars = require('handlebars');
const fs = require('fs');

const resetPassword = fs.readFileSync('./src/views/resetPasswordMail.html', { encoding: 'utf8', flag: 'r' });
const confirmEmail = fs.readFileSync('./src/views/confirmEmail.html', { encoding: 'utf8', flag: 'r' });
const resetPasswordConf = fs.readFileSync('./src/views/resetPasswordConf.html', { encoding: 'utf8', flag: 'r' });
const changeEmail = fs.readFileSync('./src/views/changeEmail.html', { encoding: 'utf8', flag: 'r' });
const paymentFailed = fs.readFileSync('./src/views/changeEmail.html', { encoding: 'utf8', flag: 'r' });
const invitationMail = fs.readFileSync('./src/views/invitationEmail.html', { encoding: 'utf8', flag: 'r' });
const adminPassword = fs.readFileSync('./src/views/invitationEmail.html', { encoding: 'utf8', flag: 'r' });
const contactUs = fs.readFileSync('./src/views/contactUs.html', { encoding: 'utf8', flag: 'r' });

const confirmEmailMail = Handlebars.compile(confirmEmail);
const resetPasswordMail = Handlebars.compile(resetPassword);
const resetPasswordConfMail = Handlebars.compile(resetPasswordConf);
const changeEmailMail = Handlebars.compile(changeEmail);
const paymentFailedMail = Handlebars.compile(paymentFailed);
const invitationEmailMail = Handlebars.compile(invitationMail);
const adminPasswordMail = Handlebars.compile(adminPassword);
const contactUsMail = Handlebars.compile(contactUs);

module.exports = {
  resetPasswordMail,
  confirmEmailMail,
  resetPasswordConfMail,
  changeEmailMail,
  paymentFailedMail,
  invitationEmailMail,
  adminPasswordMail,
  contactUsMail,
};
