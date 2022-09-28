const { Schema, model } = require('mongoose');
const constants = require('../config/constants');

const jobApplicationSchema = new Schema(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'USER',
      required: true,
    },

    job: {
      type: Schema.Types.ObjectId,
      ref: 'JOB',
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    cv: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },

    coverLetter: {
      type: String,
      required: true,
      trim: true,
    },

    countryCode: {
      type: String,
      trim: true,
      required: true,
    },

    phone: {
      type: String,
      trim: true,
      required: true,
    },
  },

  { timestamps: true },
);

module.exports = model(constants.DB_COLLECTION.JOB_APPLICATION, jobApplicationSchema);
