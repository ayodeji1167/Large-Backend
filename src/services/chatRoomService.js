const ChatRoomModel = require('../models/chatRoomModel');
const ChatRoomMessageModel = require('../models/chatRoomMessageModel');
const ChatRoomReportModel = require('../models/chatRoomReportModel');
const FriendModel = require('../models/friendModel');
const UserModel = require('../models/userModel');
const ChatRoomUserReportModel = require('../models/chatRoomUserReportModel');
const { BadRequestError, NotFoundError } = require('../../lib/errors');

const { MESSAGES } = require('../config/constants');

const { NOT_FOUND } = MESSAGES;

class ChatRoomService {
  // on create new group fetch friends of current user to add them to the group
  getFriends = async (req) => {
    const friends = await FriendModel.findOne({ userId: req.user._id }, { friendsIds: 1, _id: 0 });
    if (!friends) throw new NotFoundError(NOT_FOUND);
    const friendsProf = await UserModel
      .find({ _id: { $in: friends.friendsIds } })
      .sort({ firstName: 1 });

    return friendsProf;
  };

  getRecentRoomConversation = async (
    roomId,
    currentUserOnlineId,
  ) => {
    const recentRooms = ChatRoomMessageModel.aggregate([
      { $match: { chatRoomId: { $in: roomId } } },

      // get a list of unread messages
      {
        $project: {
          isUnread: {
            $cond: [{ $in: [currentUserOnlineId, '$readByRecipients.readByUserId'] }, 0, 1],
          },
          chatRoomId: 1,
          message: 1,
          sendByUserId: 1,
          readByRecipients: 1,
          createdAt: 1,
        },
      },
      // groups the messages based on chatRoomId then take the last value for each
      {
        $group: {
          _id: '$chatRoomId',
          messageId: { $last: '$_id' },
          chatRoomId: { $last: '$chatRoomId' },
          message: { $last: '$message' },
          sendByUserId: { $last: '$sendByUserId' },
          createdAt: { $last: '$createdAt' },
          readByRecipients: { $last: '$readByRecipients' },
          unreadMessages: { $sum: '$isUnread' },
        },
      },
      { $sort: { createdAt: -1 } },
      // get room details for each room
      {
        $lookup: {
          from: 'chat_rooms',
          localField: '_id',
          foreignField: '_id',
          as: 'chat_roomInfo',
        },
      },
      { $unwind: '$chat_roomInfo' },
      { $unwind: '$chat_roomInfo.members' },
      // get the profile data of users that sent the message
      {
        $lookup: {
          from: 'users',
          localField: 'chat_roomInfo.members',
          foreignField: '_id',
          as: 'chat_roomInfo.membersProfile',
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return recentRooms;
  };

  getRoomsByUserId = async (members) => {
    const chatRooms = await ChatRoomModel.find({ members });
    return chatRooms;
  };

  findRoomsWithKeywordInMessage = async (req) => {
    // get roomIds of user
    const userChatRooms = await this.getRoomsByUserId(req.user._id);
    if (!userChatRooms) throw new NotFoundError(NOT_FOUND);
    const chatRoomIds = userChatRooms.map((room) => room._id);

    // get message with the text, sent user profile, room info
    const result = ChatRoomMessageModel.aggregate([
      // get message of any of these room that has the keyword in it
      {
        $match: {
          chatRoomId: { $in: chatRoomIds },
          'message.messageText': { $regex: req.params.keyword, $options: '$i' },
        },
      },
      // groups the messages based on chatRoomId then take the last message for each room
      {
        $group: {
          _id: '$chatRoomId',
          messageId: { $last: '$_id' },
          chatRoomId: { $last: '$chatRoomId' },
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
          from: 'chat_rooms',
          localField: '_id',
          foreignField: '_id',
          as: 'chat_roomInfo',
        },
      },
      // get the profile data of users that sent the message
      {
        $lookup: {
          from: 'users',
          localField: 'sendByUserId',
          foreignField: '_id',
          as: 'sendByUserProfile',
        },
      },

    ]);

    return result;
  };

  findRoomWithName = async (req) => {
    // get gorups this user is not part of
    const query = {
      $or: [
        {
          type: 'GENERAL',
          name: { $regex: req.params.keyword, $options: '$i' },
          members: { $nin: [req.user._id] },
        },
        {
          type: 'PRIVATE',
          name: { $regex: req.params.keyword, $options: '$i' },
          members: { $nin: [req.user._id] },
          country: req.user.country,
        },
      ],
    };
    // get groups this user is part of
    const query1 = {
      name: { $regex: req.params.keyword, $options: '$i' },
      members: { $in: [req.user._id] },
    };
    const toJoinChatRooms = await ChatRoomModel.find(query);
    const joinedChatRooms = await ChatRoomModel.find(query1);
    const chatRoomIds = joinedChatRooms.map((joinedRoom) => joinedRoom._id);

    const joinedRoomsInfo = await this.getRecentRoomConversation(
      chatRoomIds,
      req.user._id,
    );

    // eslint-disable-next-line max-len, no-nested-ternary
    const result = toJoinChatRooms.length && joinedChatRooms.length ? { toJoinChatRooms, joinedRoomsInfo }
      : toJoinChatRooms.length ? { toJoinChatRooms } : { joinedRoomsInfo };

    return result;
  };

  checkRoomNameExist = async (name) => {
    const availableRoom = await ChatRoomModel.findOne({ name });
    if (availableRoom) throw new BadRequestError('Room name already exist');

    return 'Room name is availabe';
  };

  initiateChatRoom = async (data) => {
    // check if someone is already using this name
    const availableChatRoom = await ChatRoomModel.findOne({ name: data.name, type: data.type });

    if (availableChatRoom) throw new BadRequestError('Chat Room with this name already exist');

    const newChatRoom = await ChatRoomModel.create(data);
    return newChatRoom;
  };

  addMembers = async (members, roomId) => {
    const newRoom = await ChatRoomModel.findByIdAndUpdate(
      roomId,
      { $push: { members: { $each: members } } },
      { new: true },
    );

    return newRoom;
  };

  removeMember = async (roomId, adminId, members) => {
    const room = await ChatRoomModel.findById(roomId);
    if (!room) throw new BadRequestError(NOT_FOUND);
    console.log(room);
    if (String(adminId) !== String(room.chatRoomInitiator)) throw new BadRequestError('Only admin can remove members from group');

    const newRoom = await ChatRoomModel.findByIdAndUpdate(
      roomId,
      { $pull: { members: { $in: members } } },
      { new: true },
    );

    return newRoom;
  };

  membersExistInRoom = async (roomId, members) => {
    const rooms = await ChatRoomModel.findOne({ _id: roomId, members: { $in: members } });
    return rooms;
  };

  getRoomByRoomId = async (chatRoomId, userId) => {
    const room = await
    ChatRoomModel.findOne({ _id: chatRoomId, members: { $in: userId } });
    return room;
  };

  getMessagesByRoomId = async (chatRoomId) => {
    const messages = ChatRoomMessageModel.find({ chatRoomId });
    return messages;
  };

  postMessage = async (chatRoomId, message, sendByUserId) => {
    const post = await ChatRoomMessageModel.create({
      chatRoomId,
      message,
      sendByUserId,
      readByRecipients: { readByUserId: sendByUserId },
    });

    return post;
  };

  markMessageRead = async (chatRoomId, currentUserOnlineId) => ChatRoomMessageModel.updateMany(
    {
      chatRoomId,
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

  muteRoom = async (chatRoomId, currentUserOnlineId) => {
    const result = await ChatRoomModel.updateOne(
      { _id: chatRoomId, members: { $in: [currentUserOnlineId] } },
      { $addToSet: { muteIds: currentUserOnlineId } },
    );

    return result;
  };

  unmuteRoom = async (chatRoomId, currentUserOnlineId) => {
    const result = await ChatRoomModel.findByIdAndUpdate(
      chatRoomId,
      {
        $pull: { muteIds: currentUserOnlineId },
      },
      { new: true },
    );

    return result;
  };

  updateRoom = async (chatRoomId, data) => {
    const result = await ChatRoomModel.findByIdAndUpdate(
      chatRoomId,
      data,
      { new: true },
    );

    return result;
  };

  getreportedRoomMessages = async (data) => {
    const reportedMessages = await ChatRoomMessageModel
      .find(data)
      .sort({ createdAt: 1 })
      .limit(5);

    return reportedMessages;
  };

  reportRoom = async (chatRoomId, reporterId, reportedMessages, reason) => {
    const report = await ChatRoomReportModel.create({
      chatRoomId,
      reporterId,
      reportedMessages,
      reason,
    });

    return report;
  };

  reportUserInRoom = async (chatRoomId, reporterId, reportedUserId, reportedMessages, reason) => {
    const report = await ChatRoomUserReportModel.create({
      chatRoomId,
      reporterId,
      reportedUserId,
      reportedMessages,
      reason,
    });

    return report;
  };

  leaveRoom = async (chatRoomId, userId) => {
    const result = await ChatRoomModel.findByIdAndUpdate(
      chatRoomId,
      { $pull: { members: userId } },
      { new: true },
    );

    return result;
  };

  getMessageByMessageId = async (messageId) => {
    const result = await ChatRoomMessageModel.findOne({ _id: messageId });
    return result;
  };

  deleteMessage = async (messageId) => {
    const result = await ChatRoomMessageModel.deleteOne({ _id: messageId }, { new: true });
    return result;
  };
}

module.exports = new ChatRoomService();
