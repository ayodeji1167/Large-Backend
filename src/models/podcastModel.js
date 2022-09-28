const { Schema, model } = require('mongoose');
const constants = require('../config/constants');

const PodcastSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'USER',
    },

    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
    },

    uploadType: {
      type: String,
      enum: ['image', 'audio', 'video'],
    },

    image: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },

    audio: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },

    video: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },

    likedBy: [{ type: Schema.Types.ObjectId, ref: 'USER' }],

    likeCount: {
      type: Number,
      default: 0,
    },

    comments: [{ type: Schema.Types.ObjectId, ref: 'COMMENT' }],

    commentCount: {
      type: Number,
      default: 0,
    },

  },

  { timestamps: true },
);

const PodcastModel = model(constants.DB_COLLECTION.PODCAST, PodcastSchema);

module.exports = PodcastModel;
