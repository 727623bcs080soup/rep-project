// backend/models/messageModel.js
// We are REPLACING your old messageModel.js with this.
// Messages now "belong" to a Conversation.
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  body: {
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);