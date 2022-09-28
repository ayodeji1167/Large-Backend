const { Schema, model } = require('mongoose');
const { DB_COLLECTION } = require('../config/constants');

const ConversationUserReportSchema = new Schema({
  chatId: {
    type: Schema.Types.ObjectId,
  },
  reporterId: {
    type: Schema.Types.ObjectId,
  },
  reportedId: {
    type: Schema.Types.ObjectId,
  },
  reportedMessages: {
    type: Schema.Types.Mixed,
  },
  reason: {
    type: Schema.Types.Mixed,
  },
});

const ConversationUserReport = model(
  DB_COLLECTION.CONVERSATION_USER_REPORT,
  ConversationUserReportSchema,
);

module.exports = ConversationUserReport;
