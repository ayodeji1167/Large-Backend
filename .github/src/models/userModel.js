const { Schema, model } = require('mongoose');
const { encryptData, passwordHash } = require('../utility/dataCrypto');
const constants = require('../config/constants');

const UserSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    profession: {
      type: String,
      required: true,
    },
    sector: {
      type: String,
    },
    country: {
      type: String,
      required: true,
    },
    memberType: {
      type: String,
      enum: ['FREE', 'BUISNESS', 'PAID'],
      default: 'FREE',
    },
    avatar: {
      type: String,
    },
    voiceOver: {
      type: String,
    },
    memberPlan: {
      duration: {
        type: Number,
      },
      price: {
        type: Number,
      },
    },
    Payment: {
      reference: {
        type: String,
      },
      status: {
        type: String,
        enum: ['PAID', 'NOT-PAID'],
      },

    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true },
);

UserSchema.methods.generateToken = async function () {
  const user = this;
  const dataToEncrypt = {
    id: user._id,
    email: user.email,
  };

  const generatedToken = encryptData(dataToEncrypt, 2);

  return generatedToken;
};

UserSchema.pre('save', async function (next) {
  const user = this;
  if ((user.isModified('password') || this.isNew)) {
    user.password = await passwordHash(user.password);
  }
  next();
});

const UserModel = model(constants.DB_COLLECTION.USER, UserSchema);

module.exports = UserModel;
