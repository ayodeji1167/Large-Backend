const { Schema, model } = require('mongoose');
// const User = require('./userModel');
const constants = require('../config/constants');

const jobSchema = new Schema(
  {
    company: {
      type: String,
      trim: true,
    },

    cover_image: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },

    title: {
      type: String,
      trim: true,
    },

    availability: {
      type: String,
      enum: ['Fulltime', 'Part Time', 'Freelance'],
    },

    location: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    voiceRecord: {
      type: String,
    },

    salaryRange: {
      minimum: {
        type: Number,
      },
      maximum: {
        type: Number,
      },
    },

    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'USER',
    },

    orderId: {
      type: String,
    },

    valid: {
      type: Boolean,
      default: false,
    },

  },

  { timestamps: true },
);

module.exports = model(constants.DB_COLLECTION.JOB, jobSchema);
