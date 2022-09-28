const Joi = require('joi');

const changeOnlineStatusSchema = Joi.object({
  onlineStatus: Joi.string().required(),
});

const roomNameSchema = Joi.object({
  roomName: Joi.string().required(),
});

const editRoomSchema = Joi.object({
  roomName: Joi.string(),
});

const chatRoomInitSchema = Joi.object({
  type: Joi.string().required(),
  name: Joi.string().required(),
  members: Joi.array().required(),
});

const addRemoveMembersBodySchema = Joi.object({
  members: Joi.array().required(),
});

const addRemoveMembersParamsSchema = Joi.object({
  roomId: Joi.string().required(),
});

const roomIdParamsSchema = Joi.object({
  chatRoomId: Joi.string().required(),
});

const reportRoomSchema = Joi.object({
  reason: [
    Joi.array().required(),
    Joi.string().required(),
  ],
});

const reportUserSchema = Joi.object({
  reason: [
    Joi.array().required(),
    Joi.string().required(),
  ],
  reportedUserId: Joi.string().required(),
});

const deleteMessageSchema = Joi.object({
  chatRoomId: Joi.string().required(),
  messageId: Joi.string().required(),
});

module.exports = {
  changeOnlineStatusSchema,
  roomNameSchema,
  editRoomSchema,
  chatRoomInitSchema,
  addRemoveMembersBodySchema,
  addRemoveMembersParamsSchema,
  roomIdParamsSchema,
  reportRoomSchema,
  reportUserSchema,
  deleteMessageSchema,
};
