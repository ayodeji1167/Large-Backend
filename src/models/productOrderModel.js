const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
  products: [
    {
      product: {
        type: Object,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  user: {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'USER',
    },
  },
  valid: {
    type: Boolean,
    default: false,
  },
  payment: {
    totalCost: Number,
    paymentMethod: String,
    date: Date,
    status: {
      type: String,
      enum: ['PAID', 'NOT-PAID'],
      default: 'NOT-PAID',
    },
  },
  paymentId: {
    type: String,
  },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = model('PRODUCT_ORDERS', orderSchema);
