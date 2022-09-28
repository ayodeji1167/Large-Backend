const { model, Schema } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const NotificationSchema = new Schema({
  firstInteractorName: {
    type: String,
  },

  interactorIds: {
    type: [Schema.Types.ObjectId],
    ref: 'USER',
  },

  interactionType: {
    type: String,
    enum: ['LIKE', 'COMMENT', 'REPLY'],
  },

  notificationItemId: { // ID of the blog post, podcast, comment
    type: Schema.Types.ObjectId,
  },

  notificationItemType: {
    type: String, // podcast, blog etc
  },

  notificationItemOwner: { // ID of the podcast, blog or comment poster
    type: Schema.Types.ObjectId,
    ref: 'USER',
  },

  read: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true });

const Notification = model(DB_COLLECTION.NOTIFICATION, NotificationSchema);

module.exports = Notification;
