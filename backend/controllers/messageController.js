const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');

// 1. Send a Message
exports.sendMessage = async (req, res) => {
  const { recipientId, message } = req.body;
  const senderId = req.user.id;

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId]
      });
      await conversation.save();
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      body: message,
    });
    
    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 2. Get all of a user's conversations (their "Inbox")
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name avatarUrl') 
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 3. Get all messages for a single conversation
exports.getMessagesForConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: 1 }); 

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 4. Check if a conversation exists
exports.checkConversation = async (req, res) => {
  const senderId = req.user.id;
  const recipientId = req.params.recipientId;

  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (conversation) {
      res.json({ exists: true, conversationId: conversation._id });
    } else {
      res.json({ exists: false, conversationId: null });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};