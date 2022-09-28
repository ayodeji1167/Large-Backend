const ConversationModel = require('../models/conversationModel');
const ConvMessageModel = require('../models/convMessageModel');
const ConversationUserReportModel = require('../models/convUserReportModel');
const { BadRequestError, NotFoundError } = require('../../lib/errors');
const UserModel = require('../models/userModel');
const FriendModel = require('../models/friendModel');
const { MESSAGES } = require('../config/constants');

const {
  ALREADY_EXIST,
} = MESSAGES;

class DirectMsgService {
  // get list of users that have not started conversation with the current user
  getUsersNotStartedConv = async (req) => {
    const friends = await FriendModel.findOne({ userId: req.user._id }, { friendsIds: 1, _id: 0 });
    const friendsIds = friends ? [...friends.friendsIds, req.user._id] : [req.user._id];

    const { country } = req.user.location;

    let query;

    if (!req.user.memberType.includes('PAID')) {
      // Unpaid user can only fetch users of thesame country
      query = {
        $or: [
          { username: { $regex: req.params.keyword, $options: '$i' } },
          { email: { $regex: req.params.keyword, $options: '$i' } },
          { firstName: { $regex: req.params.keyword, $options: '$i' } },
          { lastName: { $regex: req.params.keyword, $options: '$i' } },
        ],
        _id: { $nin: friendsIds },
        'location.country': country,
      };
    } else {
      // paid user can fetch users from any country
      query = {
        $or: [
          { username: { $regex: req.params.keyword, $options: '$i' } },
          { email: { $regex: req.params.keyword, $options: '$i' } },
          { firstName: { $regex: req.params.keyword, $options: '$i' } },
          { lastName: { $regex: req.params.keyword, $options: '$i' } },
        ],
        _id: { $nin: friendsIds },
      };
    }

    const users = UserModel.find(query);

    return users;
  };

  initiateConversation = async (req) => {
    /**
    * @param {Array} members - array of strings of members
    * @param {String} convInitiator - user who initiated the chat
    */

    const { members } = req.body;
    const availableConv = await ConversationModel.findOne({
      members: {
        $size: members.length,
        $all: [...members],
      },
    });

    if (availableConv) throw new BadRequestError(ALREADY_EXIST);

    const newConversation = await
    ConversationModel.create({ members, convInitiator: req.user._id });

    const friendId = members.find((member) => String(member) !== String(req.user._id));

    // update other user friend list
    await FriendModel.updateOne(
      { userId: friendId },
      { $addToSet: { friendsIds: [req.user._id] } },
      { new: true, upsert: true },
    );

    // update current user friend list
    await FriendModel.updateOne(
      { userId: req.user._id },
      { $addToSet: { friendsIds: [friendId] } },
      { new: true, upsert: true },
    );

    return { newConversation };
  };

  postMessage = async (conversationId, message, sendByUserId) => {
    const post = await ConvMessageModel.create({
      conversationId,
      message,
      sendByUserId,
      readByRecipients: { readByUserId: sendByUserId },
    });

    return post;
  };

  // get user conversations
  getConversationsByUserId = async (userId) => {
    const conversations = await ConversationModel.find({ members: userId });
    return conversations;
  };

  // get messages of user conversations
  getRecentConversation = async (
    conversationId,
    currentUserOnlineId,
  ) => {
    const recentConversations = ConvMessageModel.aggregate([
      {
        $match: { conversationId: { $in: conversationId } },
      },
      // get unread messages
      {
        $project: {
          isUnread: {
            $cond: [{ $in: [currentUserOnlineId, '$readByRecipients.readByUserId'] }, 0, 1],
          },
          conversationId: 1,
          message: 1,
          sendByUserId: 1,
          readByRecipients: 1,
          createdAt: 1,
        },
      },
      {
        //   // groups the messages based on conversationId then take the last value for each
        $group: {
          _id: '$conversationId',
          messageId: { $last: '$_id' },
          conversationId: { $last: '$conversationId' },
          message: { $last: '$message' },
          sendByUserId: { $last: '$sendByUserId' },
          createdAt: { $last: '$createdAt' },
          readByRecipients: { $last: '$readByRecipients' },
          unreadMessages: { $sum: '$isUnread' },
        },
      },
      { $sort: { createdAt: -1 } },

      {
        // get conversation details for each conversation to
        // get the profile data of users in the conversation
        $lookup: {
          from: 'conversations',
          localField: '_id',
          foreignField: '_id',
          as: 'conversationInfo',
        },
      },
      { $unwind: '$conversationInfo' },
      { $unwind: '$conversationInfo.members' },

      // join users collection and get users profiles
      {
        $lookup: {
          from: 'users',
          localField: 'conversationInfo.members',
          foreignField: '_id',
          as: 'conversationInfo.membersProfile',
        },
      },

      {
        $group: {
          _id: '$conversationInfo._id',
          messageId: { $last: '$messageId' },
          conversationId: { $last: '$conversationId' },
          message: { $last: '$message' },
          sendByUserId: { $last: '$sendByUserId' },
          readByRecipients: { $addToSet: '$readByRecipients' },
          conversationInfo: { $addToSet: '$conversationInfo.membersProfile' },
          createdAt: { $last: '$createdAt' },
          unreadMessages: { $last: '$unreadMessages' },
        },
      },
      { $sort: { createdAt: -1 } },

    ]);

    return recentConversations;
  };

  // get user friends with their last messages
  findConversationWithFriend = async (req) => {
    // get friends
    const friends = await FriendModel.findOne({ userId: req.user._id }, { friendsIds: 1, _id: 0 });
    if (!friends) throw new BadRequestError('This user has not started conversation with anyone');
    const { friendsIds } = friends;

    // get profile of friends with like keyword sent by user
    const users = await UserModel.find({
      $or: [
        { username: { $regex: req.params.keyword, $options: '$i' } },
        { email: { $regex: req.params.keyword, $options: '$i' } },
        { firstName: { $regex: req.params.keyword, $options: '$i' } },
        { lastName: { $regex: req.params.keyword, $options: '$i' } },
      ],
      _id: { $in: friendsIds },
    });

    // get conversations with these friends
    const conversations = await Promise.all(users.map(async (user) => {
      const conv = await ConversationModel.findOne({ members: { $all: [user._id, req.user._id] } });
      return { conv, user };
    }));

    // get the messages for each conv
    const result = await Promise.all(conversations.map(async (conv) => {
      const
        lastMessage = await ConvMessageModel.findOne(
          { conversationId: conv.conv._id },
        ).sort({ createdAt: 1 });
      return { convInfo: conv, lastMessage };
    }));

    return result;
  };

  findConvWithKeywordInMessage = async (req) => {
    // get convIds of user
    const userConversations = await this.getConversationsByUserId(req.user._id);
    if (!userConversations.length) throw new NotFoundError('No conversation exist for this user');
    const conversationIds = userConversations.map((conversation) => conversation._id);

    // get message with the text, sent user profile, conversation info
    const result = ConvMessageModel.aggregate([
      // get message of any of these conversation that has the keyword in it
      {
        $match: {
          conversationId: { $in: conversationIds },
          'message.messageText': { $regex: req.params.keyword, $options: '$i' },
        },
      },
      // groups the messages based on conversationId then take the last value for each
      {
        $group: {
          _id: '$conversationId',
          messageId: { $last: '$_id' },
          conversationId: { $last: '$conversationId' },
          message: { $last: '$message' },
          sendByUserId: { $last: '$sendByUserId' },
          createdAt: { $last: '$createdAt' },
          readByRecipients: { $last: '$readByRecipients' },
        },
      },
      { $sort: { createdAt: -1 } },
      // get conversation details for each conversation to
      {
        $lookup: {
          from: 'conversations',
          localField: '_id',
          foreignField: '_id',
          as: 'conversationInfo',
        },
      },
      // get the profile data of users that sent the message
      {
        $lookup: {
          from: 'users',
          localField: 'conversationInfo.members',
          foreignField: '_id',
          as: 'membersProfile',
        },
      },

    ]);

    return result;
  };

  // user $in to make sure user is requesting the conv he is part of
  getUserConversationByConversationId = async (conversationId, userId) => {
    const conversation = await
    ConversationModel.findOne({ _id: conversationId, members: { $in: userId } });
    return conversation;
  };

  blockConversation = async (conversationId, currentLoggedInUser) => {
    const newConversation = await ConversationModel.findByIdAndUpdate(conversationId, {
      blocked: true, $addToSet: { blockedByIds: currentLoggedInUser },
    }, { new: true });
    return newConversation;
  };

  unBlockConversation = async (conversationId, currentLoggedInUser) => {
    const newConversation = await ConversationModel.findByIdAndUpdate(conversationId, {
      $pull: { blockedByIds: currentLoggedInUser },
    }, { new: true });
    if (!newConversation.blockedByIds.length) {
      const newConversation1 = await
      ConversationModel.findByIdAndUpdate(conversationId, { blocked: false }, { new: true });
      return newConversation1;
    }
    return newConversation;
  };

  getreportedUserMessages = async (conversationId, reportedId) => {
    const reportedMessages = await ConvMessageModel.find({
      conversationId, sendByUserId: { $eq: reportedId },
    }).sort({ createdAt: -1 }).limit(5);

    return reportedMessages;
  };

  reportUser = async (conversationId, reportedId, reporterId, reportedMessages, reason) => {
    const report = await ConversationUserReportModel.create({
      conversationId,
      reportedId,
      reporterId,
      reportedMessages,
      reason,
    });

    return report;
  };

  getMessagesByConversationId = async (conversationId) => {
    const messages = ConvMessageModel.find({ conversationId });
    return messages;
  };

  markMessageRead = async (conversationId, currentUserOnlineId) => ConvMessageModel.updateMany(
    {
      conversationId,
      'readByRecipients.readByUserId': { $ne: currentUserOnlineId },
    },
    {
      $addToSet: {
        readByRecipients: { readByUserId: currentUserOnlineId },
      },
    },
    {
      multi: true,
    },
  );
}

module.exports = new DirectMsgService();
