const { Schema, model } = require('mongoose');
const constants = require('../config/constants');

const advertSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'USER',
      // required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'ORDER',
      // required: true,
    },

    // Advert On Website

    websiteAd: {
      title: {
        type: String,
      },

      content: {
        type: String,
      },

      image: {
        url: {
          type: String,
        },
        cloudinaryId: {
          type: String,
        },
      },

      video: {
        url: {
          type: String,
        },
        cloudinaryId: {
          type: String,
        },
      },
    },

    // Promote Yourself Advert

    promoteYourself: {
      profession: {
        type: String,
      },
      professionDescription: {
        type: String,
      },

      skills: {
        type: [String],
      },
      portfolio: {
        url: {
          type: [String],
        },
        cloudinaryId: {
          type: [String],
        },
      },
      image: {
        url: {
          type: String,
        },
        cloudinaryId: {
          type: String,
        },
      },
      video: {
        url: {
          type: String,
        },
        cloudinaryId: {
          type: String,
        },
      },
    },

    // Business Advert
    businessAd: {
      image: {
        url: {
          type: String,
        },
        cloudinaryId: {
          type: String,
        },
      },
      video: {
        url: {
          type: String,
        },
        cloudinaryId: {
          type: String,
        },
      },
      portfolio: {
        url: {
          type: [String],
        },
        cloudinaryId: {
          type: [String],
        },
      },
      profession: {
        type: String,
      },
      problemStatement: {
        type: String,
      },
      diffFactor: {
        type: String,
      },
      reasonToBuy: {
        type: String,
      },
    },

    // Podcast Advert

    podcastAd: {
      websiteLink: {
        type: String,
      },
      audio: {
        url: {
          type: String,
        },
        cloudinaryId: {
          type: String,
        },
      },
      image: {
        url: {
          type: String,
        },
        cloudinaryId: {
          type: String,
        },
      },
    },
  },
  { timestamps: true },
);

const AdvertModel = model(constants.DB_COLLECTION.ADVERT, advertSchema);
module.exports = AdvertModel;
