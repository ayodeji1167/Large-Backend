const express = require('express');
const notificationCntrl = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, notificationCntrl.addNotification);
router.post('/mark-read', authenticate, notificationCntrl.markNotificationRead);
router.get('/', authenticate, notificationCntrl.getAllUserNotifications);
router.get('/unread-notification', authenticate, notificationCntrl.getUnreadUserNotifications);

module.exports = router;
