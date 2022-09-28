const notificationService = require('../services/notificationService');
const appResponse = require('../../lib/appResponse');
const { MESSAGES } = require('../config/constants');

class NotificationCntrl {
  addNotification = async (req, res) => {
    const notification = await notificationService.addNotification(req);
    return res.status(201).send(appResponse('', notification));
  };

  markNotificationRead = async (req, res) => {
    await notificationService.markNotificationRead(req);
    return res.status(201).send(appResponse('Notification marked read'));
  };

  getAllUserNotifications = async (req, res) => {
    const notifications = await notificationService.getAllUserNotifications(req);

    return res.status(200).send(appResponse(MESSAGES.FETCHED, notifications));
  };

  getUnreadUserNotifications = async (req, res) => {
    const unreadNotifications = await notificationService.getUnreadUserNotifications(req);

    return res.status(200).send(appResponse(MESSAGES.FETCHED, unreadNotifications));
  };
}

module.exports = new NotificationCntrl();
