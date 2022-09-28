const express = require('express');
const inviteCntrl = require('../controllers/invitationController');
const { authenticate } = require('../middleware/auth');
const { inviteSchema, acceptDeclineSchema } = require('../validators/inviteValidator');
const { Validator } = require('../validators');

const router = express.Router();

router.post('/', Validator(inviteSchema, 'body'), authenticate, inviteCntrl.invite);
router.get('/verify/:token', inviteCntrl.verifyToken);
router.patch('/accept', Validator(acceptDeclineSchema, 'body'), inviteCntrl.acceptInvitation);
router.delete('/decline', Validator(acceptDeclineSchema, 'body'), inviteCntrl.declineInvitation);
router.get('/', inviteCntrl.getAllInvites);

module.exports = router;
