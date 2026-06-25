// frontend/src/components/UserListModal.js
import React from 'react';
import { Link } from 'react-router-dom';
import './UserListModal.css';

const UserListModal = ({ title, users, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-list-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="user-list-content">
          {users && users.length > 0 ? (
            users.map(user => {
              // Robust check
              if (!user || !user._id) return null;
              
              return (
                <Link 
                  to={`/profile/${user._id}`} 
                  key={user._id} 
                  className="user-list-item"
                  onClick={onClose} // Close modal when navigating
                >
                  <img 
                    src={user.avatarUrl || `https://api.dicebear.com/8.x/personas/svg?seed=${user.name}`} 
                    alt={user.name || 'User'} 
                    className="user-list-avatar"
                  />
                  <span className="user-list-name">{user.name || 'Unknown User'}</span>
                </Link>
              );
            })
          ) : (
            // This message will now be visible
            <p className="empty-list-msg">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;