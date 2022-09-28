const { Schema, model } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const ChatRoomUserReportSchema = new Schema({
  chatRoomId: {
    type: Schema.Types.ObjectId,
  },
  reporterId: {
    type: Schema.Types.ObjectId,
  },
  reportedUserId: {
    type: Schema.Types.ObjectId,
  },
  reportedMessages: {
    type: Schema.Types.Mixed,
  },
  reason: {
    type: Schema.Types.Mixed,
  },
});

const ChatRoomUserReport = model(DB_COLLECTION.CHAT_ROOM_USER_REPORT, ChatRoomUserReportSchema);

module.exports = ChatRoomUserReport;
