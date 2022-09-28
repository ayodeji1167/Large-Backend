const { Schema, model } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const InvitationSchema = new Schema(
  {
    firstName: {
      type: String,
    },

    lastName: {
      type: String,
    },

    email: {
      type: String,
      unique: true,
      required: true,
    },

    inviterId: {
      type: Schema.Types.ObjectId,

    },

    country: {
      type: String,
    },

    accepted: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

const Invitation = model(DB_COLLECTION.INVITATION, InvitationSchema);

module.exports = Invitation;
