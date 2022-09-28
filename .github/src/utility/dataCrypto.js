const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const constants = require('../config/constants');

const { JWT_USER_LOGIN_EXPIRATION } = constants;

/**
 *
 * @param dataToEncrypt This is the data that will encryped and used for token generation
 * @param expirationTime The expiration time in hrs
 */

const encryptData = function (
  dataToEncrypt,
  expirationTime,
  secretKey = constants.JWT_PUBLIC_KEY,
) {
  const encryptedData = jwt.sign(dataToEncrypt, secretKey, {
    expiresIn: expirationTime || JWT_USER_LOGIN_EXPIRATION,
  });

  return encryptedData;
};

const decryptData = function (
  tokenToDecrypt,
  secretKey = constants.JWT_PUBLIC_KEY,
) {
  const decryptedData = jwt.verify(tokenToDecrypt, secretKey);
  return decryptedData;
};

const passwordHash = async function (stringToHash) {
  const hashedPassword = await bcrypt.hash(stringToHash, 12);
  return hashedPassword;
};

module.exports = { encryptData, decryptData, passwordHash };
