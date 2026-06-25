// frontend/src/components/Navbar.js
// REPLACE your Navbar.js file with this.
// The search bar logic and JSX have been removed.
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  const authLinks = (
    <>
      <li><Link to="/messages">Messages</Link></li>
      <li><Link to="/upload" className="nav-button-upload">Upload</Link></li>
      <li>
        <Link to={`/profile/${user?._id}`} className="nav-profile-link">
          <img 
            src={user?.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`} 
            alt={user?.name}
            className="nav-avatar"
          />
          <span>Hi, {user?.name}</span>
        </Link>
      </li>
      <li><a href="#!" onClick={onLogout}>Logout</a></li>
    </>
  );

  const guestLinks = (
    <>
      <li><Link to="/login" className="nav-button-login">Login</Link></li>
      <li><Link to="/signup" className="nav-button-signup">Sign Up</Link></li>
    </>
  );

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo">dribbble</Link>
        <ul className="nav-links">
          <li><Link to="/">Shots</Link></li>
          <li><Link to="/">Explore</Link></li>
        </ul>
      </div>
      
      {/* Search bar is REMOVED from the Navbar */}

      <div className="nav-right">
        <ul className="nav-auth">
          {isAuthenticated ? authLinks : guestLinks}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;