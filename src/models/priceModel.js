const { Schema, model } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const PriceSchema = Schema(
  {
    price: {
      type: String,
      required: true,
      default: '0',
    },

    continent: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      enum: [
        'ADVERTISEMENT ON WEBSITE',
        'PODCAST RECORDING ADVERTISEMENT',
        'JOB POSTING ADVERTISEMENT',
        'PROMOTE YOURSELF',
        'JOB POSTING',
        'BUISNESS',
        'PAID',
      ],
    },
  },
  { timestamps: true },
);

const PriceModel = model(DB_COLLECTION.PRICE, PriceSchema);
module.exports = PriceModel;
