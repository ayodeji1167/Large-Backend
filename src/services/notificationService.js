const NotificationModel = require('../models/notificationModel');

class NotificationService {
  addNotification = async (req) => {
    // check if notification exist
    const notification = await NotificationModel.findOne(
      {
        notificationItemOwner: req.body.notificationItemOwner,
        notificationItemId: req.body.notificationItemId,
        interactionType: req.body.interactionType,
        notificationItemType: req.body.notificationItemType,
      },
    );

    // if true push the interactionId
    if (notification) {
      const newNotification = await NotificationModel.findByIdAndUpdate(
        notification._id,
        {
          $addToSet: { interactorIds: [req.user._id] },
        },
        { new: true },
      );

      return newNotification;
    }

    // create new notification & return notification
    const newNotification = await
    NotificationModel.create({
      ...req.body,
      firstInteractorName: req.user.firstName,
      interactorIds: [req.user._id],
    });

    return newNotification;
  };

  markNotificationRead = async (req) => {
    const notifications = await NotificationModel.updateMany(
      { notificationItemOwner: req.user._id },
      { read: true },
    );
    return notifications;
  };

  getAllUserNotifications = async (req) => {
    const notifications = await NotificationModel.find(
      { notificationItemOwner: req.user._id },
    );
    return notifications;
  };

  getUnreadUserNotifications = async (req) => {
    const unreadNotifications = await NotificationModel.find(
      {
        notificationItemOwner: req.user._id,
        read: false,
      },
    );

    return unreadNotifications;
  };
}

module.exports = new NotificationService();
