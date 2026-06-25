// src/pages/HomePage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { API, API_URL } from '../App';
import PostCard from '../components/PostCard';
import HomeNavbar from '../components/HomeNavbar';
import SearchBar from '../components/SearchBar';
import { AuthContext } from '../context/AuthContext';
import './HomePage.css'; 

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' or 'following'
  const [activeFilter, setActiveFilter] = useState('Discover'); // For categories
  
  const { isAuthenticated } = useContext(AuthContext);

  // Find the top post for the hero section
  const topPost = posts.length > 0 ? posts[0] : null;

const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '/posts';
      
      // Automatically uses the personalized feed endpoint
      if (activeTab === 'following' && isAuthenticated) {
        endpoint = '/posts/feed';
      }

      const res = await API.get(endpoint);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // If user logs out while on 'following' tab, switch back to 'discover'
  useEffect(() => {
    if (!isAuthenticated && activeTab === 'following') {
      setActiveTab('discover');
    }
  }, [isAuthenticated, activeTab]);

  const handleFilterClick = (category) => {
    // Filtering only works on 'discover' tab for now
    if (activeTab !== 'discover') setActiveTab('discover');

    setActiveFilter(category);
    // (In a real app, you might fetch filtered posts from the backend here)
    // For now, we'll just reload all posts and let the frontend filter if needed,
    // but typically you'd want backend filtering for scale.
    if (category === 'Discover') {
        fetchPosts();
    } else {
        // Simple frontend filter for demo purposes if you want it immediate:
        // const filtered = allPosts.filter(p => p.category === category);
        // setPosts(filtered);
        // Better: fetch from backend with ?category=Animation
    }
  };

  // Helper to filter posts based on the active category (frontend filtering)
  const getDisplayedPosts = () => {
    if (activeFilter === 'Discover') return posts;
    return posts.filter(post => post.category === activeFilter);
  };

  const displayedPosts = getDisplayedPosts();

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading...</div>;

  return (
    <div className="home-page">
      
      {/* HERO SECTION (Only show on Discover tab) */}
      {activeTab === 'discover' && (
        <div className="home-hero">
          <div className="hero-left">
            <h1>Discover the World's Top Designers</h1>
            <p>Explore work from the most talented and accomplished designers ready to take on your next project.</p>
            <SearchBar />
          </div>
          <div className="hero-right">
            {topPost ? (
              <img 
                src={`${API_URL}${topPost.imageUrl}`} 
                alt={topPost.title} 
                onError={(e) => { e.target.src = 'https://placehold.co/600x450/1a1a2e/f0f0f0?text=Top+Post'; }}
              />
            ) : (
              <div className="hero-placeholder">No posts yet. Be the first!</div>
            )}
          </div>
        </div>
      )}

      {/* FEED TABS (Discover / Following) */}
      <div className="feed-tabs">
        <button 
           className={`feed-tab ${activeTab === 'discover' ? 'active' : ''}`}
           onClick={() => setActiveTab('discover')}
        >
          Discover
        </button>
        {isAuthenticated && (
          <button 
             className={`feed-tab ${activeTab === 'following' ? 'active' : ''}`}
             onClick={() => setActiveTab('following')}
          >
            Following
          </button>
        )}
      </div>

      {/* CATEGORY FILTER (Only show on Discover tab) */}
      {activeTab === 'discover' && (
        <HomeNavbar 
          onFilterClick={handleFilterClick}
          activeFilter={activeFilter}
        /> 
      )}

      {/* POST GRID */}
      <div className="post-grid">
        {displayedPosts.length > 0 ? (
          displayedPosts.map(post => (
            <PostCard key={post._id} post={post} />
          ))
        ) : (
          <div className="empty-feed">
            {activeTab === 'following' 
              ? "You aren't following anyone yet. Explore and find designers you like!" 
              : "No posts found."}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;