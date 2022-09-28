/* eslint-disable camelcase */
const path = require('path');
const chatRoomService = require('../services/chatRoomService');
const userService = require('../services/userService');
const appResponse = require('../../lib/appResponse');
const { BadRequestError, NotFoundError } = require('../../lib/errors');
const { uploadToCloud, multipleUpload } = require('../config/cloudinary');
const getResourceType = require('../utility/resourceType');
const { RESOURCE_TYPE, UPLOAD_COLLECTIONS, MESSAGES } = require('../config/constants');

const { CHAT_ROOM_MESSAGE_FILES, CHAT_ROOM_AVATARS } = UPLOAD_COLLECTIONS;
const {
  CREATED, NOT_FOUND, FETCHED, USER_EXIST, DELETED, UPDATED,
} = MESSAGES;
const { IMAGE } = RESOURCE_TYPE;

class ChatRoomCntrl {
  getFriends = async (req, res) => {
    const friends = await chatRoomService.getFriends(req);

    return res.status(200).send(appResponse('Fetched', friends));
  };

  initiate = async (req, res) => {
    const imageFormats = ['.jpeg', '.png', '.jpg'];
    let data;
    const { type, name, members } = req.body;
    const { file } = req;
    const { _id: chatRoomInitiator } = req.user;
    if (!file) {
      data = {
        members, type, name, chatRoomInitiator,
      };
    } else if (imageFormats.includes(path.extname(file.originalname))) {
      // eslint-disable-next-line camelcase
      const { secure_url: url, public_id } = await uploadToCloud(
        file.path,
        CHAT_ROOM_AVATARS,
        IMAGE,
      );
      data = {
        // eslint-disable-next-line camelcase
        members, type, name, chatRoomInitiator, avatar: { url, public_id },
      };
    } else {
      throw new BadRequestError('File format not Supported');
    }
    data.country = req.user.location.country;
    const newRoom = await
    chatRoomService.initiateChatRoom(data);
    return res.status(201).send(appResponse(CREATED, newRoom));
  };

  postMessage = async (req, res) => {
    const { chatRoomId } = req.params;
    const { messageText } = req.body;
    const { files } = req;
    const currentLoggedInUser = [req.user._id];

    const room = await chatRoomService.getRoomByRoomId(chatRoomId, currentLoggedInUser);
    if (!room.length) throw new NotFoundError(NOT_FOUND);

    // check if the message is text only, files only or both
    let messagePayload;
    if (messageText && files?.length) {
      const filePaths = files.map((file) => file.path);
      const resourceType = await getResourceType(files[0]);
      const result = await multipleUpload(filePaths, CHAT_ROOM_MESSAGE_FILES, resourceType);
      const filesData = result.map((file) => ({ url: file.secure_url, public_id: file.public_id }));

      messagePayload = { messageText, files: filesData };
    } else if (messageText) {
      messagePayload = { messageText };
    } else if (files?.length) {
      const filePaths = files.map((file) => file.path);
      const resourceType = await getResourceType(files[0]);
      const result = await multipleUpload(filePaths, CHAT_ROOM_MESSAGE_FILES, resourceType);
      const filesData = result.map((file) => ({ url: file.secure_url, public_id: file.public_id }));

      messagePayload = { files: filesData };
    } else {
      throw new BadRequestError('Please send non-empty message');
    }
    const message = await
    chatRoomService.postMessage(chatRoomId, messagePayload, req.user._id);
    // global.io.sockets.in(roomId).emit('new message', { message: post });
    return res.status(201).send(appResponse(CREATED, message));
  };

  findRoomWithName = async (req, res) => {
    const rooms = await chatRoomService.findRoomWithName(req);

    if (!rooms) throw new NotFoundError(NOT_FOUND);

    return res.status(200).send(appResponse(FETCHED, rooms));
  };

  findRoomsWithKeywordInMessage = async (req, res) => {
    const rooms = await chatRoomService.findRoomsWithKeywordInMessage(req);

    if (!rooms.length) throw new NotFoundError(NOT_FOUND);

    return res.status(200).send(appResponse(FETCHED, rooms));
  };

  changeUserStatus = async (req, res) => {
    const { onlineStatus } = req.body;
    const newUser = await userService.updateUser(req.user._id, { onlineStatus });
    return res.status(201).send(appResponse(UPDATED, newUser));
  };

  checkRoomNameExist = async (req, res) => {
    const result = await chatRoomService.checkRoomNameExist(req.body.roomName);

    return res.status(200).send(appResponse(result));
  };

  addMembers = async (req, res) => {
    const { members } = req.body;
    const { roomId } = req.params;
    const membersExistInRoom = await chatRoomService.membersExistInRoom(roomId, members);

    if (membersExistInRoom) throw new BadRequestError(USER_EXIST);
    const newRoom = await chatRoomService.addMembers(members, roomId, req.user._id);
    return res.status(201).send(appResponse(CREATED, newRoom));
  };

  removeMember = async (req, res) => {
    const { members } = req.body;
    const { roomId } = req.params;
    const newRoom = await chatRoomService.removeMember(roomId, req.user._id, members);
    return res.send(newRoom);
  };

  getRoomsWithName = async (req, res) => {
    const { roomName } = req.body;
    const newRoom = await chatRoomService.getRoomsWithName(roomName);

    return res.status(201).send(appResponse('Members removed successfully', newRoom));
  };

  getRecentRoomConversation = async (req, res) => {
    const currentLoggedUser = req.user._id;
    const rooms = await chatRoomService.getRoomsByUserId(currentLoggedUser);
    if (!rooms.length) throw new NotFoundError(NOT_FOUND);

    const roomIds = rooms.map((room) => room._id);
    const recentRoom = await
    chatRoomService.getRecentRoomConversation(roomIds, currentLoggedUser);

    const result = recentRoom.map((conv) => {
      const membersProfile = conv.chat_roomInfo.membersProfile.flat();
      const readByRecipients = conv.readByRecipients.flat();

      return {
        _id: conv._id,
        messageId: conv.messageId,
        chatRoomId: conv.chatRoomId,
        message: conv.message,
        sendByUserId: conv.sendByUserId,
        readByRecipients,
        membersProfile,
        unreadMessages: conv.unreadMessages,
      };
    });
    // console.log(result);
    return res.status(201).send(appResponse(FETCHED, result));
  };

  getRoomMessagesByRoomId = async (req, res) => {
    const { chatRoomId } = req.params;
    const currentLoggedUser = [req.user._id];
    const room = await
    chatRoomService.getRoomByRoomId(chatRoomId, currentLoggedUser);
    if (!room) throw new NotFoundError(NOT_FOUND);
    const members = await userService.getUserByIds(room.members);

    const messages = await chatRoomService.getMessagesByRoomId(chatRoomId);
    if (!messages.length) throw new NotFoundError(NOT_FOUND);

    return res.status(200).send(appResponse(FETCHED, {
      messages,
      members,
    }));
  };

  markRoomReadByUser = async (req, res) => {
    const { chatRoomId } = req.params;
    const currentLoggedUser = [req.user._id];
    const room = await chatRoomService.getRoomByRoomId(chatRoomId, currentLoggedUser);

    if (!room) throw new NotFoundError(NOT_FOUND);

    await chatRoomService.markMessageRead(chatRoomId, req.user._id);
    return res.status(201).send(appResponse('Messages marked read by user'));
  };

  muteRoom = async (req, res) => {
    const { chatRoomId } = req.params;
    const currentLoggedUser = [req.user._id];
    const room = await
    chatRoomService.getRoomByRoomId(chatRoomId, currentLoggedUser);

    if (!room) throw new NotFoundError(NOT_FOUND);

    await chatRoomService.muteRoom(chatRoomId, req.user._id);
    return res.status(201).send(appResponse('Room muted successfully'));
  };

  unmuteRoom = async (req, res) => {
    const { chatRoomId } = req.params;
    const currentLoggedUser = [req.user._id];
    const room = await
    chatRoomService.getRoomByRoomId(chatRoomId, currentLoggedUser);

    if (!room) throw new NotFoundError(NOT_FOUND);

    await chatRoomService.unmuteRoom(chatRoomId, req.user._id);
    return res.status(201).send(appResponse('Room unmuted successfully'));
  };

  updateRoom = async (req, res) => {
    const { chatRoomId } = req.params;
    const { file } = req;
    const { roomName: name } = req.body;
    const currentLoggedUser = [req.user._id];
    let data;

    if (name && file) {
      const { secure_url: url, public_id } = await uploadToCloud(
        file.path,
        CHAT_ROOM_AVATARS,
        IMAGE,
      );
      data = { name, avatar: { url, public_id } };
    } else if (name) {
      data = { name };
    } else if (file) {
      const { secure_url: url, public_id } = await uploadToCloud(
        file.path,
        CHAT_ROOM_AVATARS,
        IMAGE,
      );
      data = { avatar: { url, public_id } };
    } else {
      throw new BadRequestError('Please upload image or change name');
    }

    const room = await
    chatRoomService.getRoomByRoomId(chatRoomId, currentLoggedUser);
    if (!room) throw new NotFoundError(NOT_FOUND);
    if (String(room.chatRoomInitiator) !== String(currentLoggedUser)) throw new NotFoundError('Only admin can change avatar or name');

    const result = await chatRoomService.updateRoom(chatRoomId, data);
    return res.status(201).send(appResponse('Chat room edited successfully', result));
  };

  leaveRoom = async (req, res) => {
    const { chatRoomId } = req.params;
    const currentLoggedUser = [req.user._id];
    const room = await
    chatRoomService.getRoomByRoomId(chatRoomId, currentLoggedUser);

    if (!room) throw new NotFoundError(NOT_FOUND);

    const result = await chatRoomService.leaveRoom(chatRoomId, req.user._id);
    return res.status(201).send(appResponse('User exit Chat room successfully', result));
  };

  reportRoom = async (req, res) => {
    const { chatRoomId } = req.params;
    const { reason } = req.body;
    const ids = [req.user._id];
    const currentLoggedUser = req.user._id;
    const room = await chatRoomService.getRoomByRoomId(chatRoomId, ids);

    // check if room exist
    if (!room) throw new NotFoundError(NOT_FOUND);

    const reportedMessages = await chatRoomService.getreportedRoomMessages({ chatRoomId });
    await chatRoomService.reportRoom(chatRoomId, currentLoggedUser, reportedMessages, reason);

    return res.status(201).send(appResponse('Chat Room reported success'));
  };

  reportUserInRoom = async (req, res) => {
    const { chatRoomId } = req.params;
    const { reason, reportedUserId } = req.body;
    const ids = [req.user._id, reportedUserId];
    const reporterId = req.user._id;
    const room = await chatRoomService.getRoomByRoomId(chatRoomId, ids);

    if (!room) throw new NotFoundError(NOT_FOUND);

    const reportedMessages = await
    chatRoomService.getreportedRoomMessages({ chatRoomId, sendByUserId: reportedUserId });

    await
    chatRoomService
      .reportUserInRoom(chatRoomId, reporterId, reportedUserId, reportedMessages, reason);

    return res.status(201).send(appResponse('User in chat room reported success'));
  };

  deleteMessage = async (req, res) => {
    const { chatRoomId, messageId } = req.params;
    const ids = [req.user._id];
    const currentLoggedUser = req.user._id;
    const room = await chatRoomService.getRoomByRoomId(chatRoomId, ids);
    const message = await chatRoomService.getMessageByMessageId(messageId);
    if (!room || !message) throw new NotFoundError(NOT_FOUND);
    if (String(currentLoggedUser) !== String(message.sendByUserId)
      && String(currentLoggedUser) !== String(room.chatRoomInitiator)) throw new BadRequestError('This is not your message or you are not Admin');

    await chatRoomService.deleteMessage(messageId);
    return res.status(201).send(appResponse(DELETED));
  };

  getUserProfile = async (req, res) => {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);

    return res.status(200).send(appResponse('User profile fetched', user));
  };
}

module.exports = new ChatRoomCntrl();
