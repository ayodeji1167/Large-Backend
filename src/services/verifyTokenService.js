const InvitationModel = require('../models/invitationModel');
const UserModel = require('../models/userModel');
const { NotFoundError } = require('../../lib/errors');
const { decryptData } = require('../utility/dataCrypto');

const models = { InvitationModel, UserModel };

const verifyToken = async (Model, token, errorMessage) => {
  const [jwtToken, userId] = token.split('__');

  const user = await models[Model]?.findById(userId);
  if (!user) throw new NotFoundError(errorMessage);

  const lastUpdatedTime = new Date(user.updatedAt).getTime();
  const secret = `${user._id}${lastUpdatedTime}`;

  await decryptData(jwtToken, secret);

  return user;
};

module.exports = {
  verifyToken,
};
