const { BadRequestError, NotFoundError } = require('../../lib/errors');
const directMsgService = require('../services/directMsgService');
const userService = require('../services/userService');
const { multipleUpload } = require('../config/cloudinary');
const appResponse = require('../../lib/appResponse');
const getResourceType = require('../utility/resourceType');
const { MESSAGES, UPLOAD_COLLECTIONS } = require('../config/constants');

const { DIRECT_MESSAGE_FILES } = UPLOAD_COLLECTIONS;
const { CREATED, NOT_FOUND, FETCHED } = MESSAGES;

class DirectMsgCntrl {
  getRecentConversation = async (req, res) => {
    const currentLoggedUser = req.user._id;

    // get user conversations
    const conversations = await directMsgService.getConversationsByUserId(currentLoggedUser);
    if (!conversations.length) throw new NotFoundError(NOT_FOUND);

    // get conversation messages and user profiles
    const conversationIds = conversations.map((conversation) => conversation._id);
    const recentConversations = await directMsgService.getRecentConversation(
      conversationIds,
      currentLoggedUser,
    );

    const flatRecentConversation = recentConversations.map((conv) => {
      const userProfile = conv.conversationInfo.flat();
      const readByRecipients = conv.readByRecipients.flat();

      return {
        _id: conv._id,
        messageId: conv.messageId,
        coversationId: conv.conversationId,
        message: conv.message,
        sendByUserId: conv.sendByUserId,
        readByRecipients,
        userProfile,
        createdAt: conv.createdAt,
        unreadMessages: conv.unreadMessages,
      };
    });

    return res.status(200).send(appResponse(FETCHED, flatRecentConversation));
  };

  getUsersNotStartedConv = async (req, res) => {
    const users = await directMsgService.getUsersNotStartedConv(req);
    if (!users.length) throw new BadRequestError(NOT_FOUND);

    return res.status(200).send(appResponse(FETCHED, users));
  };

  initiate = async (req, res) => {
    const conversation = await directMsgService.initiateConversation(req);
    return res.status(201).send(appResponse(CREATED, conversation));
  };

  postMessage = async (req, res) => {
    const { conversationId } = req.params;
    const { messageText } = req.body;
    const { files } = req;
    const currentLoggedInUser = [req.user._id];

    const conversation = await
    directMsgService.getUserConversationByConversationId(conversationId, currentLoggedInUser);
    if (!conversation || conversation.blocked) throw new NotFoundError(NOT_FOUND);

    // check if the message is text only, files only or both
    let messagePayload;
    if (messageText && files?.length) {
      const filePaths = files.map((file) => file.path);
      const resourceType = await getResourceType(files[0]);
      const result = await multipleUpload(filePaths, DIRECT_MESSAGE_FILES, resourceType);
      const filesData = result.map((file) => ({ url: file.secure_url, public_id: file.public_id }));

      messagePayload = { messageText, files: filesData };
    } else if (messageText) {
      messagePayload = { messageText };
    } else if (files?.length) {
      const filePaths = files.map((file) => file.path);
      const resourceType = await getResourceType(files[0]);
      const result = await multipleUpload(filePaths, DIRECT_MESSAGE_FILES, resourceType);
      const filesData = result.map((file) => ({ url: file.secure_url, public_id: file.public_id }));

      messagePayload = { files: filesData };
    } else {
      throw new BadRequestError('Please send non-empty message');
    }

    const message = await directMsgService.postMessage(
      conversationId,
      messagePayload,
      req.user._id,
    );

    return res.status(201).send(appResponse(CREATED, message));
  };

  getMessagesByConversationId = async (req, res) => {
    const { conversationId } = req.params;
    const currentLoggedUser = [req.user._id];
    const conversation = await
    directMsgService.getUserConversationByConversationId(conversationId, currentLoggedUser);
    if (!conversation) throw new NotFoundError(NOT_FOUND);

    const members = await userService.getUserByIds(conversation.members);

    const messages = await directMsgService.getMessagesByConversationId(conversationId);
    if (!messages.length) throw new NotFoundError(NOT_FOUND);

    return res.status(200).send(appResponse(FETCHED, { members, messages }));
  };

  findConversationWithFriend = async (req, res) => {
    const friends = await directMsgService.findConversationWithFriend(req);

    if (!friends.length) throw new NotFoundError(NOT_FOUND);

    return res.status(200).send(appResponse(FETCHED, friends));
  };

  findConvWithKeywordInMessage = async (req, res) => {
    const conversations = await directMsgService.findConvWithKeywordInMessage(req);

    if (!conversations.length) throw new NotFoundError(NOT_FOUND);

    return res.status(200).send(appResponse(FETCHED, conversations));
  };

  blockConversation = async (req, res) => {
    const { conversationId } = req.params;
    const conversation = await
    directMsgService.getUserConversationByConversationId(conversationId, req.user._id);
    if (!conversation) throw new NotFoundError(NOT_FOUND);
    const newConversation = await directMsgService.blockConversation(conversationId, req.user._id);
    return res.status(201).send(appResponse('Conversation blocked successfully', newConversation));
  };

  unBlockConversation = async (req, res) => {
    const { conversationId } = req.params;
    const currentLoggedInUser = [req.user._id];
    const conversation = await
    directMsgService.getUserConversationByConversationId(conversationId, currentLoggedInUser);
    if (!conversation) throw new NotFoundError(NOT_FOUND);
    const newConversation = await
    directMsgService.unBlockConversation(conversationId, req.user._id);
    return res.status(201).send(appResponse('conversation unblocked successfully', newConversation));
  };

  reportUser = async (req, res) => {
    const { reportedId, conversationId, reason } = req.body;
    const ids = [reportedId, req.user._id];
    const currentLoggedUser = req.user._id;
    const conversation = await
    directMsgService.getUserConversationByConversationId(conversationId, ids);
    if (!conversation) throw new NotFoundError(NOT_FOUND);

    const reportedMessages = await
    directMsgService.getreportedUserMessages(conversationId, reportedId);
    if (!reportedMessages.length) throw new NotFoundError(NOT_FOUND);
    const report = await
    directMsgService
      .reportUser(conversationId, reportedId, currentLoggedUser, reportedMessages, reason);

    return res.status(201).send(appResponse('User reported successfully', report));
  };

  markConversationRead = async (req, res) => {
    const { conversationId } = req.params;
    const currentLoggedUser = [req.user._id];
    const conversation = await
    directMsgService.getUserConversationByConversationId(conversationId, currentLoggedUser);
    if (!conversation) throw new NotFoundError(NOT_FOUND);

    await directMsgService.markMessageRead(conversationId, req.user._id);
    return res.status(201).send(appResponse('conversation messages marked read'));
  };
}

module.exports = new DirectMsgCntrl();
