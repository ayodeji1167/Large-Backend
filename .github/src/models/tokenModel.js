const { Schema, model } = require('mongoose');
const constants = require('../config/constants');

const TokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    token: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const TokenModel = model(
  constants.DB_COLLECTION.TOKEN,
  TokenSchema,
);

module.exports = TokenModel;
