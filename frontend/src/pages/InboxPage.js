// frontend/src/pages/InboxPage.js
// Create this new file. This is your "Inbox".
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';
import { AuthContext } from '../context/AuthContext';
import './InboxPage.css';

const InboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await API.get('/messages/conversations');
        setConversations(res.data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
      setLoading(false);
    };

    fetchConversations();
  }, []);

  if (loading) return <div>Loading messages...</div>;
  if (!user) return <div>Please log in.</div>;

  return (
    <div className="inbox-page">
      <h2>Your Conversations</h2>
      <div className="conversation-list">
        {conversations.length > 0 ? (
          conversations.map(convo => {
            const otherParticipant = convo.participants.find(p => p._id !== user._id);
            if (!otherParticipant) return null;

            return (
              <Link to={`/messages/${convo._id}`} key={convo._id} className="conversation-item">
                <img 
                  src={otherParticipant.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${otherParticipant.name}`}
                  alt={otherParticipant.name}
                  className="convo-avatar"
                />
                <div className="convo-details">
                  <strong>{otherParticipant.name}</strong>
                  <p>Click to view conversation</p>
                </div>
              </Link>
            );
          })
        ) : (
          <p>You have no messages.</p>
        )}
      </div>
    </div>
  );
};

export default InboxPage;