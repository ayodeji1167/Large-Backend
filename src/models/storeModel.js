const { Schema, model } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const StoreSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'USER',
    },
    logo: {
      publicId: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    faxNumber: {
      type: Number,
      default: null,
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    products: [{ type: Schema.Types.ObjectId, ref: DB_COLLECTION.PRODUCT }],
  },
  { timestamps: true },
);

const storeModel = model(DB_COLLECTION.STORE, StoreSchema);
module.exports = storeModel;
