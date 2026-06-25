// frontend/src/components/PostCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css';

const API_URL = 'http://localhost:5000';

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      <Link to={`/post/${post._id}`} className="post-image-link">
        <img 
          src={`${API_URL}${post.imageUrl}`} 
          alt={post.title} 
          className="post-image" 
        />
        <div className="post-overlay">
          <h4 className="post-title">{post.title}</h4>
        </div>
      </Link>
      <div className="post-info">
        <Link to={`/profile/${post.user}`} className="post-author-link">
          {/* --- ADD THIS IMG TAG --- */}
          <img 
            src={post.authorAvatar || `https://api.dicebear.com/8.x/initials/svg?seed=${post.name}`} 
            alt={post.name}
            className="post-author-avatar"
          />
          {post.name}
        </Link>
        <div className="post-stats">
          <span className="post-likes">❤️ {post.likes.length}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;