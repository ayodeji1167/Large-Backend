/* eslint-disable arrow-body-style */
/* eslint-disable semi */
const { Schema, model } = require('mongoose');
const { encryptData, passwordHash } = require('../utility/dataCrypto');
const constants = require('../config/constants');

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
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
    location: {
      address: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      continent: {
        type: String,
        required: true,
      },
    },
    memberType: {
      type: String,
      enum: ['FREE', 'BUSINESS', 'PAID', 'RECRUITER'],
      default: 'FREE',
    },

    avatar: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    voiceOver: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    company: {
      name: {
        type: String,
      },
      logo: {
        type: String,
      },
      website: {
        type: String,
      },
      information: {
        type: String,
      },
    },
    memberPlan: {
      expireAt: Date,
      startTime: Date,
      price: {
        type: Number,
        default: null,
      },
    },
    orderId: String,

    subscription: {
      id: {
        type: String,
      },
      customerId: {
        type: String,
      },
      status: {
        type: String,
        enum: ['ACTIVE', 'NOT-ACTIVE'],
      },
    },
    cart: {
      items: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: 'PRODUCT',
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    store: {
      type: String,
      default: null,
    },
    onlineStatus: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Busy', 'Do Not Disturb', 'Invisible'],
    },
  },

  { timestamps: true },
);

// eslint-disable-next-line func-names
UserSchema.methods.generateToken = function () {
  // const user = this;
  const dataToEncrypt = {
    id: this._id,
    email: this.email,
  };
  const generatedToken = encryptData(dataToEncrypt, '2h');
  return generatedToken;
};

UserSchema.pre('save', async function hasPassword(next) {
  const user = this;
  if ((this.isModified('password') || this.isNew)) {
    user.password = await passwordHash(user.password);
  }
  next();
});

// for hashing password on reset password
UserSchema.pre('findOneAndUpdate', async function hashResetPassword(next) {
  const { password } = this.getUpdate().$set;
  if (!password) {
    return next();
  }
  try {
    const hash = await passwordHash(password);
    this.getUpdate().$set.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

// eslint-disable-next-line func-names
UserSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString()
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  this.cart = {
    items: updatedCartItems,
  };
  return this.save();
};

// eslint-disable-next-line func-names
UserSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString()
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

// eslint-disable-next-line func-names
UserSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

const UserModel = model(constants.DB_COLLECTION.USER, UserSchema);

module.exports = UserModel;
