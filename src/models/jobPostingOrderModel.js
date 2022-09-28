const { Schema, model, Types } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const JobOrderSchema = Schema({
  description: {
    type: String,
    default: 'JOB POSTING',
  },
  recruiter: {
    type: Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  orderId: {
    type: String,
    default: null,
  },
  price: {
    type: Number,
    default: 0,
  },

  valid: {
    type: Boolean,
    default: false,
  },

  expiresAt: {
    type: Date,
    default: new Date(),
  },

  expired: {
    type: Boolean,
    default: false,
  },

  payment: {
    totalCost: Number,
    description: String,
    paymentMethod: String,
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['PAID', 'NOT-PAID'],
      default: 'NOT-PAID',
    },
  },
});

const OrderModel = model(DB_COLLECTION.JOB_ORDER, JobOrderSchema);
module.exports = OrderModel;
