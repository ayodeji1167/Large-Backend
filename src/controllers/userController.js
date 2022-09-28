const _ = require('lodash');
const userService = require('../services/userService');
const { verifyToken } = require('../services/verifyTokenService');
const appResponse = require('../../lib/appResponse');
const { MESSAGES } = require('../config/constants');
const { uploadToCloud } = require('../config/cloudinary');
const { BadRequestError } = require('../../lib/errors');
const paymentService = require('../services/paymentService');

class UserCtrl {
  register = async (req, res) => {
    const response = await userService.register(req.body);

    return res.status(201).send(appResponse(MESSAGES.USER_CREATED, response));
  };

  temUser = async (req, res) => {
    const response = await userService.createTemUser(req.body);
    res.set('token-id-key', response);
    return res.status(201).send(appResponse(MESSAGES.USER_CREATED));
  };

  createCustomer = async (req, res) => {
    const stripeCustomer = await paymentService.createCustomer(req);
    return res.status(201).send(appResponse(MESSAGES.CREATED, stripeCustomer));
  };

  subscribeCustomer = async (req, res) => {
    const { user } = req;
    user.customerId = req.body.customerId;
    const subscribe = await paymentService.subscribeCustomer(user);
    return res.status(201).send(appResponse(MESSAGES.CREATED, subscribe));
  };

  login = async (req, res) => {
    const { user, token, message } = await userService.login(req.body);
    res
      .status(200)
      .send(appResponse(message, {
        token,
        user: _.omit(user._doc, ['password']),
      }, true));
  };

  verifyToken = async (req, res) => {
    const { token } = req.params;
    await userService.verifyToken(token);
    res.status(200).send(appResponse('User Verified', null));
  };

  resendToken = async (req, res) => {
    const { userId } = req.body;
    await userService.resendToken(userId);
    res.status(200).send(appResponse('Check Your Email For The Resent Token', null));
  };

  uploadAvatar = async (req, res) => {
    const { user } = req;
    const { file } = req;
    if (!file) throw new BadRequestError('Please Upload an image');

    const { url, public_id: publicId } = await uploadToCloud(file.path);

    const updatedUser = await userService.updateUser(user, { avatar: { url, publicId } });
    res.status(200).send(appResponse(MESSAGES.USER_IS_UPDATED, updatedUser));
  };

  deleteAvatar = async (req, res) => {
    const response = await userService.deleteUsersAvatar(req);

    return res.status(201).send(appResponse('deleted successfully', response));
  };

  resetPasswordMail = async (req, res) => {
    const email = await userService.resetPasswordMail(req);

    return res.status(200).send(appResponse(MESSAGES.PASSWORD_RESET_EMAIL_SENT, email));
  };

  verifyResetToken = async (req, res) => {
    const user = await verifyToken('UserModel', req.params.resetToken, MESSAGES.USER_NOT_EXIST);

    return res.status(200).send(appResponse(MESSAGES.TOKEN_VERIFIED, user));
  };

  resetPassword = async (req, res) => {
    const response = await userService.resetPassword(req);

    return res.status(201).send(appResponse(MESSAGES.PASSWORD_RESET_SUCCESS, response));
  };

  editProfile = async (req, res) => {
    const { _id: userId, firstName: name } = req.user;
    const data = { ...req.body, userId, name };
    const response = await userService.editUserProfile(data);

    return res.status(201).send(appResponse(MESSAGES.CREATED, response));
  };

  modifyEmail = async (req, res) => {
    const response = await userService.modifyEMail(req.params.token);
    return res.status(201).send(appResponse(MESSAGES.CREATED, response));
  };

  changePassword = async (req, res) => {
    const response = await userService.changePassword(req);

    return res.status(200).send(appResponse(MESSAGES.PASSWORD_CHANGE_SUCCESS, response));
  };

  uploadVoiceOver = async (req, res) => {
    const { user } = req;
    const { file } = req;
    if (!file) {
      throw new BadRequestError('Please upload your voice over');
    }
    const { url, public_id: publicId } = await uploadToCloud(file.path);

    const updatedUser = await userService.updateUser(user._id, { voiceOver: { url, publicId } });
    res.status(200).send(appResponse(MESSAGES.USER_IS_UPDATED, updatedUser));
  };

  deleteVoiceOver = async (req, res) => {
    const response = await userService.deleteVoiceOver(req);

    return res.status(201).send(appResponse('deleted successfully', response));
  };

  contactUs = async (req, res) => {
    await userService.contactUs(req);

    return res.status(200).send('Thank you for contacing us');
  };
}
module.exports = new UserCtrl();
