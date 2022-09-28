const { Schema, model, Types } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const OrderSchema = Schema({
  description: {
    type: String,
    enum: [
      'ADVERTISEMENT ON WEBSITE',
      'PODCAST RECORDING ADVERTISEMENT',
      'JOB POSTING ADVERTISEMENT',
      'PROMOTE YOURSELF',
    ],
    required: true,
  },

  advertiser: {
    type: Types.ObjectId,
    ref: 'USER',
    required: true,
  },

  price: {
    type: Number,
    default: 0,
  },

  valid: {
    type: Boolean,
    default: false,
  },

  payment: {
    totalCost: Number,
    description: String,
    paymentMethod: String,
    date: Date,
    status: {
      type: String,
      enum: ['PAID', 'NOT-PAID'],
      default: 'NOT-PAID',
    },
  },
});

const OrderModel = model(DB_COLLECTION.ORDER, OrderSchema);
module.exports = OrderModel;
