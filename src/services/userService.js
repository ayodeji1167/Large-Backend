/* eslint-disable no-param-reassign */
const { nanoid } = require('nanoid');
const UserModel = require('../models/userModel');
const sendEmail = require('../utility/email/sendEmail');
const {
  MESSAGES, JWT_USER_LOGIN_EXPIRATION, JWT_PUBLIC_KEY, BASE_URL, EMAIL_USER,
} = require('../config/constants');
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../../lib/errors');
const {
  encryptData, decryptData, comparePassword, passwordHash,
} = require('../utility/dataCrypto');
const { deleteFromCloud } = require('../config/cloudinary');
const { addToRedis, getFromRedis } = require('../../lib/redis');

const { USER_EXIST } = MESSAGES;

class UserService {
  register = async (data) => {
    /**
     * isUser is checking if user already exits,
     * is the user exist then BAdRequestError throws an error for that,
     * checks user memberType and if not free, goes on to implement payments before saving the user,
     * else, then newUser.save registers a new user in the database,
     * if the save method wasn't successful then an error is thrown.
     * At the model, there is a hash method to hash the users password and to generate a newToken,
     * then the token variable reaches for encryptData and creates the new token which is saved,
     * then it returns the newUser created as well as the newToken created.
    */

    const isUser = await UserModel.findOne({ email: data.email });
    if (isUser) throw new BadRequestError(USER_EXIST);

    const existingUsername = await UserModel.findOne({ username: data.username });
    if (existingUsername) throw new BadRequestError('this username has already been taken');

    const newUser = new UserModel(data);
    // eslint-disable-next-line object-curly-newline
    const { firstName, email, memberType, company } = data;
    const { name, information, website } = company;

    if (memberType === 'BUSINESS' || memberType === 'PAID') {
      if (memberType === 'BUSINESS' && !(name && information && website)) { throw new BadRequestError('Company Details must be filled for membership type selected.'); }
      // paymentImplementation() for the both plans;
    }

    const token = await newUser.generateToken();
    const link = `${BASE_URL}/user/verify/${token}`;
    await sendEmail(email, 'Verify Your Account', { firstName, link });
    await newUser.save();

    return newUser;
  };

  createTemUser = async (data) => {
    if (data.memberType !== 'BUSINESS' && data.memberType !== 'PAID') { throw new BadRequestError('Member Type must be either BUISNESS or PAID'); }

    const userExists = await UserModel.findOne({ email: data.email });
    if (userExists) throw new BadRequestError('User already Exist');

    const userName = await UserModel.findOne({ username: data.username });
    if (userName) throw new BadRequestError('Username is already Taken');

    // const temUser = await TemUserModel.create(data)
    const sessionId = nanoid();
    const authToken = encryptData({ email: data.email, username: data.username });

    data.token = authToken;
    const user = JSON.stringify(data);
    await addToRedis(sessionId, user);
    return sessionId;
  };

  login = async (input) => {
    /**
     * user is the user object found  by username or email
     * Throws an error if the user does not exist
     * Check if user is verified, If not throw UnauthenticatedError
     * Check if password is correct with bcrypt , If not throw UnauthenticatedError
     * If password is correct, generates a JWT  token and sends as response
     */

    const { emailOrUsername, password } = input;
    const user = await UserModel.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    const { USER_NOT_EXIST, INVALID_PASSWORD, USER_LOGGED } = MESSAGES;

    if (!user) {
      throw new BadRequestError(USER_NOT_EXIST);
    }

    if (!user.isVerified) {
      throw new UnauthenticatedError('Please Verify Your Account');
    }

    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError(INVALID_PASSWORD);
    }

    const token = encryptData(
      {
        id: user._id,
        email: user.email,
      },
      JWT_USER_LOGIN_EXPIRATION,
      JWT_PUBLIC_KEY,
    );
    const successObj = { user, token, message: USER_LOGGED };
    return successObj;
  };

  verifyToken = async (input) => {
    /**
     * Get the  token from the request parameter
     * Decrypt the token and get the userId from the token
     * Find the user from the id in the token
     * If User is not found, throw BadRequestError
     * Verify the user
     */
    if (!input) {
      throw new BadRequestError('Missing token');
    }
    const { id } = decryptData(input);

    const user = await UserModel.findById(id);
    if (!user) {
      throw new BadRequestError('User Not Found');
    }
    await UserModel.findByIdAndUpdate(id, { isVerified: true });
  };

  resendToken = async (userId) => {
    /**
     * Get the user from the id passed in the body
     * Check if the user exist and trow  error if  user doesnt
     * Throw error if user has already been verified
     * Send the token to the user email if all above is valid
     */
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new BadRequestError('User Not Found');
    }
    if (user.isVerified) {
      throw new BadRequestError('User Has Already Been Verified');
    }
    const token = encryptData({ id: user._id, email: user.email });

    const link = `${BASE_URL}/user/verify/${token}`;
    await sendEmail(user.email, 'Verify Your Account', { firstName: user.firstName, link });
  };

  updateUser = async (id, data) => {
    const updatedUser = await
    UserModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return updatedUser;
  };

  getUserById = async (userId) => {
    const user = await UserModel.findById({ _id: userId });
    return user;
  };

  getUserByIds = async (ids) => {
    const users = await UserModel.find({ _id: { $in: ids } });
    return users;
  };

  findOneUser = async (data) => {
    const user = await UserModel.findOne(data);
    return user;
  };

  resetPasswordMail = async (data) => {
    const { USER_NOT_EXIST } = MESSAGES;

    const user = await UserModel.findOne({ email: data.body.email });
    if (!user) throw new NotFoundError(USER_NOT_EXIST);

    const lastUpdatedTime = new Date(user.updatedAt).getTime();
    const secret = `${user._id}${lastUpdatedTime}`;

    let resetToken = encryptData(
      { id: user._id, email: user.email },
      3600,
      secret,
    );

    resetToken = `${resetToken}__${user._id}`;

    const link = `${BASE_URL}/user/reset-token-verification/${resetToken}`;
    await sendEmail(user.email, 'Password Reset Request', { email: user.email, link });

    return user.email;
  };

  resetPassword = async (data) => {
    const { resetToken } = data.params;
    const { password } = data.body;
    const [jwtToken, userId] = resetToken.split('__');

    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError(MESSAGES.USER_NOT_EXIST);

    const lastUpdatedTime = new Date(user.updatedAt).getTime();
    const secret = `${user._id}${lastUpdatedTime}`;

    decryptData(jwtToken, secret);

    const newUser = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: { password } },
      { new: true, useFindAndModify: false },
    );

    // send reset password success mail
    const link = 'login link';
    await sendEmail(user.email, 'Password Reset Confirmation', { firstName: user.firstName, link });

    return newUser;
  };

  editUserProfile = async (data) => {
    let result2;
    const { userId, email, name } = data;

    if (email) {
      result2 = await this.sendVerifyEmailToken(email, userId, name);
    }
    delete data.email;
    const result = await UserModel.findByIdAndUpdate(userId, data);

    return { result, result2 };
  };

  // this method is responsible for sending the token
  sendVerifyEmailToken = async (email, userId, firstName) => {
    /**
     * @param emailExist checks if that email provided already exists,
     * if it does an error is thrown
     * @param token will encrypt the values given and return a token
     * @param emailSave will save to a temp database
     * @param mail will send a mail to the user with the link to access the ModifyEMail method
     */
    const emailExist = await UserModel.findOne({ email });
    if (emailExist) {
      throw new BadRequestError('This email is taken');
    }
    const token = encryptData({ id: userId });

    addToRedis(userId.toString(), email);

    const link = `http://localhost:5000/api/v1/user/edit-profile/${token}`;
    const mail = await sendEmail(email, 'Change Email', { firstName, link });
    return mail;
  };

  // this method will be called if there is an email to be modified
  modifyEMail = async (token) => {
    /**
     * @param emailUser will check if the userId(token) matches that from the param
     */
    const decryptFunc = decryptData(token);
    let user = await this.getUserById(decryptFunc.id);
    if (!user) { throw new NotFoundError('user is not found'); }

    const emailUser = await getFromRedis(user._id.toString());

    user.email = emailUser;
    user = await user.save();
    return user;
  };

  changePassword = async (req) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      throw new BadRequestError('User does not exist');
    }
    const isPasswordCorrect = await comparePassword(req.body.oldPassword, user.password);
    if (!isPasswordCorrect) {
      throw new BadRequestError('Password does not match');
    }
    user.password = await passwordHash(req.body.newPassword);
    user.save();
    return user;
  };

  deleteUsersAvatar = async (req) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      throw new BadRequestError('User does not exist');
    }
    deleteFromCloud(user.avatar.publicId);
    user.avatar.url = '';
    user.avatar.publicId = '';

    const deletedAvatar = await user.save();
    return deletedAvatar;
  };

  deleteVoiceOver = async (req) => {
    const user = await UserModel.findById(req.user._id);
    if (!user || !user.voiceOver.publicId) {
      throw new NotFoundError('please upload voice over');
    }
    deleteFromCloud(user.voiceOver.publicId);
    user.voiceOver.url = '';
    user.voiceOver.publicId = '';

    const deleteVoiceOver = await user.save();
    return deleteVoiceOver;
  };

  contactUs = async (req) => {
    const {
      email, name, message,
    } = req.body;

    const { file } = req;
    let payload;

    if (file) {
      payload = {
        firstName: name, email, message, file,
      };
    } else {
      payload = {
        firstName: name, email, message,
      };
    }
    const result = await sendEmail(
      EMAIL_USER,
      'Customer Support Ticket',
      payload,
    );
    return result;
  };
}

module.exports = new UserService();
