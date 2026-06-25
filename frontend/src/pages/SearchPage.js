// frontend/src/pages/SearchPage.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API } from '../App';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard'; // We will create this
import './SearchPage.css'; // We will create this

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('q');
  const type = searchParams.get('type');

  useEffect(() => {
    const fetchSearch = async () => {
      if (!query) return;

      setLoading(true);
      try {
        const res = await API.get(`/search?q=${query}&type=${type}`);
        setResults(res.data);
      } catch (err) {
        console.error('Error fetching search results:', err);
      }
      setLoading(false);
    };

    fetchSearch();
  }, [query, type]); // Re-run search if query or type changes

  if (loading) return <div>Loading...</div>;

  return (
    <div className="search-page">
      <h2>Results for "{query}" in {type}</h2>

      {type === 'Shots' && (
        <div className="post-grid">
          {results.posts.length > 0 ? (
            results.posts.map(post => <PostCard key={post._id} post={post} />)
          ) : (
            <p>No shots found.</p>
          )}
        </div>
      )}

      {type === 'Users' && (
        <div className="user-grid">
          {results.users.length > 0 ? (
            results.users.map(user => <UserCard key={user._id} user={user} />)
          ) : (
            <p>No users found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;