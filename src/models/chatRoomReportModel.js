const { Schema, model } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const ChatRoomReportSchema = new Schema({
  chatRoomId: {
    type: Schema.Types.ObjectId,
  },
  reporterId: {
    type: Schema.Types.ObjectId,
  },
  reportedMessages: {
    type: Schema.Types.Mixed,
  },
  reason: {
    type: Schema.Types.Mixed,
  },
});

const ChatRoomReport = model(DB_COLLECTION.CHAT_ROOM_REPORT, ChatRoomReportSchema);

module.exports = ChatRoomReport;
