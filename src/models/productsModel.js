const { Schema, model } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const productSchema = new Schema(
  {
    name: {
      type: String,
      min: [2, 'name must be longer than two characters'],
      required: true,
    },
    description: {
      type: String,
      min: [5, 'discription must be longer than five characters'],
      max: [100, 'you\'ve reached the max for a description'],
      required: true,
    },
    price: {
      type: String,
      required: [true, 'a price must be provided for your product'],
    },
    image: {
      publicId: String,
      url: {
        type: String,
        required: [true, 'all products must have an image'],
      },
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: DB_COLLECTION.STORE,
    },
  },
  { timestamps: true, toJson: { virtuals: true } },

);

const productModel = model(DB_COLLECTION.PRODUCT, productSchema);

module.exports = productModel;
