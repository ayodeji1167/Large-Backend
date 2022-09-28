const express = require('express');
const directMsgCntrl = require('../controllers/directMsgController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../config/multer');
const {
  convInitiationSchema, convParamsSchema, reportUserSchema,
} = require('../validators/directMsgValidator');
const { Validator } = require('../validators');

const router = express.Router();

router.get('/', authenticate, directMsgCntrl.getRecentConversation);
router.get('/users-not-conversed-with/:keyword', authenticate, directMsgCntrl.getUsersNotStartedConv);
router.post('/initiation', Validator(convInitiationSchema, 'body'), authenticate, directMsgCntrl.initiate);
router.post('/messages/:conversationId', authenticate, upload.any('file'), directMsgCntrl.postMessage);
router.get('/conversations/:conversationId', Validator(convParamsSchema, 'params'), authenticate, directMsgCntrl.getMessagesByConversationId);
router.get('/users-conversed-with/:keyword', authenticate, directMsgCntrl.findConversationWithFriend);
router.get('/conversations-with-keyword-in-message/:keyword', authenticate, directMsgCntrl.findConvWithKeywordInMessage);
router.post('/block/:conversationId', Validator(convParamsSchema, 'params'), authenticate, directMsgCntrl.blockConversation);
router.post('/unblock/:conversationId', Validator(convParamsSchema, 'params'), authenticate, directMsgCntrl.unBlockConversation);
router.post('/user-reports', Validator(reportUserSchema, 'body'), authenticate, directMsgCntrl.reportUser);
router.post('/mark-message-read/:conversationId', Validator(convParamsSchema, 'params'), authenticate, directMsgCntrl.markConversationRead);

module.exports = router;
