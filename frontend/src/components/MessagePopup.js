// src/components/MessagePopup.js
import React from 'react';
import './MessagePopup.css'; // Create this file

// This component shows unread messages based on the screenshot
const MessagePopup = ({ messages }) => {
  return (
    <div className="message-popup">
      <h4>New Messages</h4>
      {messages.map(msg => (
        <div key={msg._id} className="message-item">
          <strong>From: {msg.senderName}</strong>
          <p>{msg.message.substring(0, 50)}...</p>
        </div>
      ))}
    </div>
  );
};

export default MessagePopup;