// backend/models/conversationModel.js
// This new model just tracks who is in the chat.
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);