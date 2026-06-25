// backend/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getConversations, 
  getMessagesForConversation,
  checkConversation // <-- THIS IS THE CRITICAL FIX
} = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/messages
// @desc    Send a message (starts or continues a conversation)
// @access  Private
router.post('/', auth, sendMessage);

// @route   GET /api/messages/conversations
// @desc    Get all of a user's conversations (Inbox)
// @access  Private
router.get('/conversations', auth, getConversations);

// @route   GET /api/messages/check/:recipientId
// @desc    Check if a conversation exists
// @access  Private
router.get('/check/:recipientId', auth, checkConversation);

// @route   GET /api/messages/:conversationId
// @desc    Get all messages for one conversation
// @access  Private
router.get('/:conversationId', auth, getMessagesForConversation);

module.exports = router;