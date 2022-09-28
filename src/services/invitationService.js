const InvitationModel = require('../models/invitationModel');
const sendEmail = require('../utility/email/sendEmail');
const { encryptData } = require('../utility/dataCrypto');
const { BASE_URL } = require('../config/constants');

class InviteService {
  invite = async (req) => {
    // delete the invitation if exist
    await InvitationModel.deleteMany({ email: { $in: req.body.emails } });

    // add inviterId to each email
    const data = req.body.emails.map((email) => ({ email, inviterId: req.user._id }));

    // store new invitations
    const invites = await InvitationModel.insertMany(data);

    // send invitation mail to each invite
    invites.forEach(async (invite) => {
      const lastUpdatedTime = new Date(invite.updatedAt).getTime();
      const secret = `${invite._id}${lastUpdatedTime}`;

      let token = encryptData(
        { id: invite._id, email: invite.email },
        3600,
        secret,
      );
      token = `${token}__${invite._id}`;
      const link = `${BASE_URL}/invitation/${token}`;
      // send email
      await sendEmail(invite.email, 'BBWE Email Invitation', { link });
    });

    return invites;
  };

  // update invite data after accepting
  acceptInvitation = async (data) => {
    // update the invite in InviteCollection
    const newInvite = await
    InvitationModel.findOneAndUpdate(
      { _id: data.id, email: data.email },
      { ...data, accepted: true },
      { new: true },
    );
    return newInvite;
  };

  // delete invite data after decline
  declineInvitation = async ({ email, id }) => {
    await InvitationModel.findOneAndDelete({ _id: id, email });
    return 'Invite deleted successfully';
  };

  getAllInvites = async () => {
    const invites = await InvitationModel.find();

    return invites;
  };
}

module.exports = new InviteService();
