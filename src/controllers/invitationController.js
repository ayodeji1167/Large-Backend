const appResponse = require('../../lib/appResponse');
const inviteService = require('../services/invitationService');
const { verifyToken } = require('../services/verifyTokenService');
const { MESSAGES } = require('../config/constants');

class InviteCntrl {
  invite = async (req, res) => {
    const newInvites = await inviteService.invite(req);

    return res.status(201).send(appResponse('Invitation mail sent', newInvites));
  };

  verifyToken = async (req, res) => {
    const invite = await verifyToken('InvitationModel', req.params.token, MESSAGES.USER_NOT_EXIST);
    res.status(200).send(appResponse(MESSAGES.TOKEN_VERIFIED, invite));
  };

  acceptInvitation = async (req, res) => {
    const newInvite = await inviteService.acceptInvitation(req.body);

    return res.status(201).send(appResponse('Invite accepted', newInvite));
  };

  declineInvitation = async (req, res) => {
    const response = await inviteService.declineInvitation(req.body);

    return res.status(201).send(appResponse(response));
  };

  getAllInvites = async (req, res) => {
    const invites = await inviteService.getAllInvites();

    return res.status(200).send(appResponse('invites', invites));
  };
}

module.exports = new InviteCntrl();
