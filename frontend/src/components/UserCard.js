// frontend/src/components/UserCard.js
import React from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link
import './UserCard.css';

const UserCard = ({ user }) => {
  return (
    // 2. Wrap the whole card in a Link
    <Link to={`/profile/${user._id}`} className="user-card">
      <div className="user-avatar-placeholder"></div>
      <h4>{user.name}</h4>
      <p>{user.email}</p>
    </Link>
  );
};

export default UserCard;