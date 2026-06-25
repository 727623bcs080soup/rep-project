// frontend/src/components/HomeNavbar.js
import React from 'react';
import './HomeNavbar.css';

const categories = [
  "Discover", 
  "Animation", 
  "Branding", 
  "Illustration", 
  "Mobile", 
  "Print", 
  "Product Design", 
  "Typography", 
  "Web Design"
];

const HomeNavbar = ({ onFilterClick, activeFilter }) => {
  return (
    <div className="home-navbar">
      <nav className="home-nav-links">
        {categories.map(category => (
          // --- THIS IS THE FIX ---
          // Changed from <a> to <button>
          <button
            key={category}
            type="button" // Good practice for buttons in a nav
            className={activeFilter === category ? 'active' : ''}
            onClick={() => onFilterClick(category)} // Simplified onClick
          >
            {category}
          </button>
          // --- END FIX ---
        ))}
      </nav>
      <button type="button" className="filters-btn">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false">
          <path d="M1.5 4h13M4 8h8M6.5 12h3" stroke="#0d0c22" strokeLinecap="round"></path>
        </svg>
        Filters
      </button>
    </div>
  );
};

export default HomeNavbar;