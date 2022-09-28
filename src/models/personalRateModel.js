const { Schema, model } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const PersonalRateSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users',
    },
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['BASIC', 'STANDARD', 'DELUX'],
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
);

const PersonalRate = model(DB_COLLECTION.PERSONAL_RATE, PersonalRateSchema);
module.exports = PersonalRate;
