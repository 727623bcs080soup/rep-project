// frontend/src/components/SearchBar.js
// Create this new file.
// This holds the search bar logic and makes the dropdown visible.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('Shots');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}&type=${searchType}`);
      setSearchTerm('');
    }
  };

  return (
    <form className="search-form-hero" onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="What type of design are you interested in?"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {/* Dropdown is now visible and styled via CSS */}
      <select 
        value={searchType} 
        onChange={(e) => setSearchType(e.target.value)}
      >
        <option value="Shots">Shots</option>
        <option value="Users">Users</option>
      </select>
      <button type="submit">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.5 17.5L13.87 13.87M15.83 8.33C15.83 12.3 12.3 15.83 8.33 15.83C4.37 15.83 0.83 12.3 0.83 8.33C0.83 4.37 4.37 0.83 8.33 0.83C12.3 0.83 15.83 4.37 15.83 8.33Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;