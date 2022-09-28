const { decryptData } = require('../utility/dataCrypto');
const userService = require('../services/userService');
const UnAuthorizedError = require('../../lib/errors/unauthenticated');
const BadRequestError = require('../../lib/errors/bad-request');
const { getFromRedis } = require('../../lib/redis');
const adminService = require('../services/adminService');

const getToken = (req) => req.headers['x-auth-token'];

const authenticate = async (req, res, next) => {
  /*
   Logic for authentication goes in here
   getToken is a function that gets the token from req header using x-auth-token
  */
  const token = getToken(req);

  if (!token) throw new UnAuthorizedError('No Authentication token');
  if (typeof token !== 'string') { throw new UnAuthorizedError('Supply with a token'); }
  try {
    const decoded = decryptData(token);

    const user = await userService.getUserById(decoded.id);

    if (!user) {
      throw new UnAuthorizedError('User is not authorized');
    }

    // add the decrypted user's object to the req object
    req.user = user;
    next();
  } catch (error) {
    const errors = ['TokenExpiredError', 'NotBeforeError', 'JsonWebTokenError'];
    if (errors.includes(error?.name)) {
      throw new UnAuthorizedError('Please authenticate');
    }
    next(error);
  }
};

/*
   Logic for validating user's membership goes here
  */
const hasRole = (memberTypes) => async (req, res, next) => {
  if (!memberTypes.length) throw new UnAuthorizedError('Access denied');

  if (!memberTypes.includes(req.user?.memberType)) throw new BadRequestError('Access Denied');

  next();
};

const authenticateAdmin = async function (req, res, next) {
  const token = req.headers['x-auth-token'];

  if (!token) throw new UnAuthorizedError('No Authentication Token Provided');

  try {
    const decodedAdmin = decryptData(token);
    const admin = await adminService.findByEmail(decodedAdmin.email);
    if (!admin) throw new UnAuthorizedError('Admin is not authorized');
    req.admin = admin;

    next();
  } catch (error) {
    const errors = ['TokenExpiredError', 'NotBeforeError', 'JsonWebTokenError'];
    if (errors.includes(error?.name)) {
      throw new UnAuthorizedError('Please Authenticate');
    }
    next(error);
  }
};

const subscriptionAuth = async (req, res, next) => {
  const tokenKey = req.headers['token-id-key'];

  if (!tokenKey) throw new UnAuthorizedError('Authentication token was not provided');
  try {
    let details = await getFromRedis(tokenKey);

    if (!details) throw new UnAuthorizedError('Entry with this session id was not found');

    details = JSON.parse(details);
    const dataToDecrypt = details.token;

    const user = decryptData(dataToDecrypt);

    if (!user) throw new BadRequestError('Invalid Authentication detected');

    req.user = details;
    next();
  } catch (error) {
    const errors = ['TokenExpiredError', 'NotBeforeError', 'JsonWebTokenError'];
    if (errors.includes(error?.name)) {
      throw new UnAuthorizedError('Please authenticate');
    }
    next(error);
  }
};

module.exports = {
  authenticate,
  hasRole,
  subscriptionAuth,
  authenticateAdmin,
};
