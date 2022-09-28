const express = require('express');
const chatRoomCntrl = require('../controllers/chatRoomController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../config/multer');
const {
  changeOnlineStatusSchema, roomNameSchema, editRoomSchema, chatRoomInitSchema,
  addRemoveMembersBodySchema, addRemoveMembersParamsSchema, roomIdParamsSchema,
  reportRoomSchema, reportUserSchema, deleteMessageSchema,
} = require('../validators/chatRoomValidator');
const { Validator } = require('../validators');

const router = express.Router();

// get friends to add on creating new group
router.get('/friends', authenticate, chatRoomCntrl.getFriends);

// check room name exist & initiate chat room routes
router.get(
  '/room-name-exist',
  Validator(roomNameSchema, 'body'),
  authenticate,
  chatRoomCntrl.checkRoomNameExist,
);
router.post(
  '/initiation',
  upload.single('file'),
  Validator(chatRoomInitSchema, 'body'),
  authenticate,
  chatRoomCntrl.initiate,
);

// add message & mark message read by user routes
router.post(
  '/messages/:chatRoomId',
  Validator(roomIdParamsSchema, 'params'),
  authenticate,
  upload.any('file'),
  chatRoomCntrl.postMessage,
);

// get list of user recent rooms conversations & get specific room messages routes
router.get('/', authenticate, chatRoomCntrl.getRecentRoomConversation);
router.get(
  '/messages/:chatRoomId',
  Validator(roomIdParamsSchema, 'params'),
  authenticate,
  chatRoomCntrl.getRoomMessagesByRoomId,
);

router.post(
  '/mark-read/:chatRoomId',
  Validator(roomIdParamsSchema, 'params'),
  authenticate,
  chatRoomCntrl.markRoomReadByUser,
);

// mute and unmute room routes
router.post(
  '/mute-room/:chatRoomId',
  Validator(roomIdParamsSchema, 'params'),
  authenticate,
  chatRoomCntrl.muteRoom,
);
router.post(
  '/unmute-room/:chatRoomId',
  Validator(roomIdParamsSchema, 'params'),
  authenticate,
  chatRoomCntrl.unmuteRoom,
);

// get rooms with name
router.get('/rooms-with-name/:keyword', authenticate, chatRoomCntrl.findRoomWithName);

// get rooms that have like the keyword in message text
router.get('/rooms-with-message/:keyword', authenticate, chatRoomCntrl.findRoomsWithKeywordInMessage);

// change online status route
router.post(
  '/status',
  Validator(changeOnlineStatusSchema, 'body'),
  authenticate,
  chatRoomCntrl.changeUserStatus,
);

// add and remove members routes
router.post(
  '/:roomId/members',
  Validator(addRemoveMembersParamsSchema, 'params'),
  Validator(addRemoveMembersBodySchema, 'body'),
  authenticate,
  chatRoomCntrl.addMembers,
);
router.delete(
  '/:roomId/members',
  Validator(addRemoveMembersParamsSchema, 'params'),
  Validator(addRemoveMembersBodySchema, 'body'),
  authenticate,
  chatRoomCntrl.removeMember,
);

// get list of rooms with name like the name supplied route
router.get(
  '/search',
  Validator(roomNameSchema, 'body'),
  authenticate,
  chatRoomCntrl.getRoomsWithName,
);

// trends for you routes TODO

// report room and report user in room routes
router.post(
  '/report-room/:chatRoomId',
  Validator(roomIdParamsSchema, 'params'),
  Validator(reportRoomSchema, 'body'),
  authenticate,
  chatRoomCntrl.reportRoom,
);
router.post(
  '/report-user/:chatRoomId',
  Validator(roomIdParamsSchema, 'params'),
  Validator(reportUserSchema, 'body'),
  authenticate,
  chatRoomCntrl.reportUserInRoom,
);

// leave room route
router.post(
  '/leave-room/:chatRoomId',
  Validator(roomIdParamsSchema, 'params'),
  authenticate,
  chatRoomCntrl.leaveRoom,
);

// edit room name and edit room avatar routes
router.post(
  '/edit/:chatRoomId',
  upload.single('file'),
  Validator(roomIdParamsSchema, 'params'),
  Validator(editRoomSchema, 'body'),
  authenticate,
  chatRoomCntrl.updateRoom,
);

// delete message & get user profile route
router.delete(
  '/:chatRoomId/messages/:messageId',
  Validator(deleteMessageSchema, 'params'),
  authenticate,
  chatRoomCntrl.deleteMessage,
);

module.exports = router;
