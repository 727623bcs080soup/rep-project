// src/pages/ConversationPage.js
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../App';
import { AuthContext } from '../context/AuthContext';
import './ConversationPage.css';

const ConversationPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const { conversationId } = useParams();
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await API.get(`/messages/${conversationId}`);
      setMessages(res.data);
      if (user && !otherUser) {
          const convoRes = await API.get('/messages/conversations');
          const currentConvo = convoRes.data.find(c => c._id === conversationId);
          if (currentConvo) {
            setOtherUser(currentConvo.participants.find(p => p._id !== user._id));
          }
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [conversationId, user, otherUser]);

  useEffect(() => {
    if (user) fetchMessages();
    const interval = setInterval(() => { if (user) fetchMessages(); }, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages, user]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUser) return;
    try {
      const res = await API.post('/messages', { recipientId: otherUser._id, message: newMessage });
      setMessages([...messages, { ...res.data, sender: { _id: user._id, name: user.name, avatarUrl: user.avatarUrl } }]);
      setNewMessage('');
    } catch (err) { console.error(err); }
  };

  const formatMessage = (text) => {
    if (!text) return null;
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => 
      part.startsWith('**') && part.endsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part
    );
  };

  if (loading) return <div>Loading chat...</div>;

  // BLOCKING LOGIC: True if only 1 message exists and YOU sent it.
  const isBlocked = messages.length === 1 && messages[0].sender._id === user._id;

  return (
    <div className="conversation-page">
      {otherUser && (
        <div className="chat-header">
          <Link to={`/profile/${otherUser._id}`}>
            <img src={otherUser.avatarUrl || `https://api.dicebear.com/8.x/personas/svg?seed=${otherUser.name}`} alt={otherUser.name} />
            <strong>{otherUser.name}</strong>
          </Link>
        </div>
      )}
      <div className="chat-window">
        {messages.map((msg) => (
          <div key={msg._id} className={`chat-message ${msg.sender._id === user._id ? 'sent' : 'received'}`}>
             {msg.sender._id !== user._id && <img src={msg.sender.avatarUrl || `https://api.dicebear.com/8.x/personas/svg?seed=${msg.sender.name}`} alt={msg.sender.name} className="chat-avatar" />}
            <div className="message-bubble">{formatMessage(msg.body)}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="reply-form" onSubmit={handleReply}>
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} 
               placeholder={isBlocked ? "Waiting for reply..." : "Type your reply..."} 
               disabled={isBlocked} />
        <button type="submit" disabled={isBlocked}>Send</button> 
      </form>
    </div>
  );
};

export default ConversationPage;