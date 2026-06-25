// src/pages/ProfilePage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { API } from '../App';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';
import ProjectInquiryModal from '../components/ProjectInquiryModal';
import UserListModal from '../components/UserListModal';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('shots');
  const [isEditing, setIsEditing] = useState(false);
  const [activeList, setActiveList] = useState(null);
  
  const [editBio, setEditBio] = useState('');
  const [editHireable, setEditHireable] = useState(false);

  const { userId } = useParams();
  const { user: currentUser, loadUser } = useContext(AuthContext);
  const navigate = useNavigate(); // Added navigate

  const isOwnProfile = profile && currentUser && currentUser._id === profile.user._id;

  // --- THIS IS THE FIX ---
  // 1. fetchProfile should ONLY depend on userId.
  const fetchProfile = useCallback(async () => {
    setLoading(true); // Always set loading to true when we fetch
    try {
      const res = await API.get(`/users/${userId}`);
      setProfile(res.data);
      setEditBio(res.data.user.bio || '');
      setEditHireable(res.data.user.isHireable || false);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    setLoading(false);
  }, [userId]); // 2. Removed 'profile' from this array

  // -----------------------

  const fetchSavedPosts = useCallback(async () => {
    try {
      const res = await API.get('/users/me/saved');
      setSavedPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // 3. This effect now only runs when fetchProfile changes (i.e., when userId changes)
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); 

  useEffect(() => {
    if (activeTab === 'saved' && isOwnProfile) {
      fetchSavedPosts();
    }
  }, [activeTab, isOwnProfile, fetchSavedPosts]);

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (!profile) return <div className="profile-error">User not found.</div>;

  const { user, posts } = profile;
  const isFollowing = currentUser && user.followers && user.followers.some(f => (f._id || f).toString() === currentUser._id.toString());

  const handleFollow = async () => {
    if (!currentUser) return alert('Login to follow');
    const previousProfile = profile;
    const newFollowers = isFollowing
      ? user.followers.filter(f => (f._id || f).toString() !== currentUser._id.toString())
      : [...user.followers, { _id: currentUser._id, name: currentUser.name, avatarUrl: currentUser.avatarUrl }];
    setProfile({ ...profile, user: { ...user, followers: newFollowers } });
    try {
      const endpoint = isFollowing ? `/users/unfollow/${userId}` : `/users/follow/${userId}`;
      await API.put(endpoint);
      loadUser(); 
    } catch (err) {
      console.error(err);
      setProfile(previousProfile);
      alert('Action failed. Please try again.');
    }
  };
  
  const handleGetInTouch = async () => {
    try {
      const res = await API.get(`/messages/check/${userId}`);
      if (res.data.exists) {
        navigate(`/messages/${res.data.conversationId}`);
      } else {
        setIsMsgModalOpen(true);
      }
    } catch (err) {
      console.error("Error checking conversation:", err);
      alert("Could not start conversation. Please try again.");
    }
  };

  const handleModalClose = (success) => {
    setIsMsgModalOpen(false);
    if (success) {
      navigate('/messages');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await API.put('/users/update', { bio: editBio, isHireable: editHireable });
      setIsEditing(false);
      const res = await API.get(`/users/${userId}`); // Re-fetch data
      setProfile(res.data); // Set profile with new data
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  const handleToggleSuspension = async () => {
    const isSuspended = user.accountStatus === 'suspended';
    const action = isSuspended ? 'activate' : 'suspend';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await API.put(`/admin/users/${user._id}/${action}`);
        const res = await API.get(`/users/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        alert('Admin action failed.');
      }
    }
  };

  const handleAdminDeleteUser = async () => {
     if (window.confirm(`DANGER: PERMANENTLY delete ${user.name}?`)) {
      try {
        await API.delete(`/admin/users/${user._id}`);
        navigate('/'); // Use navigate instead of window.location
      } catch (err) {
        console.error(err);
        alert('Failed to delete user.');
      }
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header-card">
        <img src={user.avatarUrl || `https://api.dicebear.com/8.x/personas/svg?seed=${user.name}`} alt={user.name} className="profile-avatar-lg" />
        <h1 className="profile-name">{user.name}</h1>

        {user.accountStatus === 'suspended' && <span className="suspend-badge">ACCOUNT SUSPENDED</span>}
        {user.isHireable && !isEditing && <span className="hire-badge">Available for work</span>}

        {!isEditing ? (
           <p className="profile-bio">{user.bio || "This designer hasn't added a bio yet."}</p>
        ) : (
          <div className="profile-edit-form">
             <textarea 
               className="edit-bio-input"
               value={editBio} 
               onChange={(e) => setEditBio(e.target.value)} 
               placeholder="Tell us about yourself..." 
               maxLength={160}
             />
             <label className="edit-hireable-label">
               <input 
                 type="checkbox" 
                 checked={editHireable} 
                 onChange={(e) => setEditHireable(e.target.checked)} 
               />
               <span>I am available for freelance work</span>
             </label>
             <div className="edit-actions">
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="save-btn-primary" onClick={handleSaveProfile}>Save Profile</button>
             </div>
          </div>
        )}

        <div className="profile-stats">
           <div className="stat clickable" onClick={() => setActiveList('followers')}>
             <span className="stat-count">{user.followers ? user.followers.length : 0}</span>
             <span className="stat-label">Followers</span>
           </div>
           <div className="stat clickable" onClick={() => setActiveList('following')}>
             <span className="stat-count">{user.following ? user.following.length : 0}</span>
             <span className="stat-label">Following</span>
           </div>
           <div className="stat">
             <span className="stat-count">{user.likesReceived || 0}</span>
             <span className="stat-label">Likes</span>
           </div>
        </div>

        <div className="profile-actions-row">
          {currentUser && currentUser.isAdmin && !isOwnProfile ? (
            <div className="admin-actions">
              <button 
                className={`btn-admin ${user.accountStatus === 'suspended' ? 'activate' : 'suspend'}`}
                onClick={handleToggleSuspension}
              >
                {user.accountStatus === 'suspended' ? 'Activate User' : 'Suspend User'}
              </button>
              <button className="btn-admin delete" onClick={handleAdminDeleteUser}>Delete User</button>
            </div>
          ) : isOwnProfile ? (
            !isEditing && <button className="btn-secondary" onClick={() => setIsEditing(true)}>Edit Profile</button>
          ) : (
            <>
              {currentUser && (
                 <button className={`btn-follow ${isFollowing ? 'following' : ''}`} onClick={handleFollow}>
                   {isFollowing ? 'Following' : 'Follow'}
                 </button>
              )}
              {!isOwnProfile && currentUser && (
                 <button className="btn-primary" onClick={handleGetInTouch}>
                   {user.isHireable ? 'Hire Me' : 'Get in Touch'}
                 </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="profile-tabs">
         <button className={`tab-btn ${activeTab === 'shots' ? 'active' : ''}`} onClick={() => setActiveTab('shots')}>
           Shots <span className="tab-count">{posts.length}</span>
         </button>
         {isOwnProfile && (
            <button className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
              Saved <span className="tab-count">{currentUser.savedPosts ? currentUser.savedPosts.length : 0}</span>
            </button>
         )}
      </div>

      <div className="profile-content">
        <div className="post-grid">
          {activeTab === 'shots' && (posts.length > 0 ? posts.map(post => <PostCard key={post._id} post={post} />) : <div className="empty-state">No shots uploaded yet.</div>)}
          {activeTab === 'saved' && (savedPosts.length > 0 ? savedPosts.map(post => <PostCard key={post._id} post={post} />) : <div className="empty-state">You haven't saved any shots yet.</div>)}
        </div>
      </div>

      {isMsgModalOpen && <ProjectInquiryModal recipientId={user._id} recipientName={user.name} onClose={handleModalClose} />}
      {activeList && <UserListModal title={activeList === 'followers' ? 'Followers' : 'Following'} users={activeList === 'followers' ? user.followers : user.following} onClose={() => setActiveList(null)} />}
    </div>
  );
};

export default ProfilePage;