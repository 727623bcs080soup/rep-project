import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API, API_URL } from '../App';
import { AuthContext } from '../context/AuthContext';
import SendMessageModal from '../components/ProjectInquiryModal';
import './PostDetailPage.css';

const PostDetailPage = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate(); 
  
  const { isAuthenticated, user, loadUser } = useContext(AuthContext); 
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isAuthor = post && user && (post.user._id || post.user) === user._id;

  // --- 1. TRACKING & FETCHING LOGIC ---
const fetchPost = useCallback(async () => {
    try {
      const res = await API.get(`/posts/${id}`);
      const postData = res.data;
      setPost(postData);
      
      // --- TRIGGER PERSONALIZATION TRACKING ---
      if (isAuthenticated && postData) {
        API.post('/users/track-interest', { 
          category: postData.category,
          tags: postData.tags || []
        }).catch(err => console.error("Interest tracking failed", err));
      }

      // ... rest of your existing logic (setIsLiked, setIsFollowing, etc.)
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [id, user, isAuthenticated]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      const res = await API.post(`/posts/comment/${id}`, { text: newCommentText });
      setPost({ ...post, comments: res.data }); 
      setNewCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return alert('Login to like');
    try {
      const res = await API.put(`/posts/like/${id}`);
      setPost({ ...post, likes: res.data });
      setIsLiked(res.data.includes(user._id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) return alert('Login to save');
    try {
      const res = await API.put(`/users/save/${id}`);
      setIsSaved(res.data.isSaved);
      loadUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) return alert('Login to follow');
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      const authorId = post.user._id || post.user;
      if (previousState) {
        await API.put(`/users/unfollow/${authorId}`);
      } else {
        await API.put(`/users/follow/${authorId}`);
      }
      await loadUser();
    } catch (err) {
      console.error("Follow failed:", err);
      setIsFollowing(previousState);
      alert(JSON.stringify(err.response?.data) || "Something went wrong");
    }
  };

  // --- 2. SMART INQUIRY HANDLER ---
  const handleInquiryClick = async () => {
    const authorId = post.user._id || post.user;
    try {
      // Check if a conversation already exists
      const res = await API.get(`/messages/check/${authorId}`);
      if (res.data.exists) {
        // If it exists, go straight to the chat
        navigate(`/messages/${res.data.conversationId}`);
      } else {
        // If not, open the modal to start a new inquiry
        setIsModalOpen(true);
      }
    } catch (err) {
      setIsModalOpen(true); // Fallback to modal if check fails
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want delete this?')) return;
    try {
      await API.delete(`/posts/${id}`);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found.</div>;

  const authorId = post.user._id || post.user;

  return (
    <div className="post-detail-page">
      <div className="post-header">
        <div className="post-author-info">
          <Link to={`/profile/${authorId}`}>
            <img 
              src={post.authorAvatar || `https://api.dicebear.com/8.x/personas/svg?seed=${post.name}`}
              alt={post.name}
              className="post-author-avatar-large"
            />
          </Link>
          <div>
            <h3>{post.title}</h3>
            <div className="author-meta">
               <span>by <Link to={`/profile/${authorId}`} className="author-link">{post.name}</Link></span>
               {!isAuthor && isAuthenticated && (
                 <>
                   <span className="separator">•</span>
                   <button 
                     className={`follow-text-btn ${isFollowing ? 'following' : ''}`} 
                     onClick={handleFollow}
                   >
                     {isFollowing ? 'Following' : 'Follow'}
                   </button>
                 </>
               )}
            </div>
          </div>
        </div>
        
        {isAuthor ? (
          <button className="delete-btn" onClick={handleDelete}>Delete Post</button>
        ) : (
          isAuthenticated && (
            <button className="get-in-touch-btn" onClick={handleInquiryClick}>
              Get in touch
            </button>
          )
        )}
      </div>

      <div className="post-content">
        <img src={`${API_URL}${post.imageUrl}`} alt={post.title} />
        <p className="post-description">{post.description}</p>
        <div className="post-tags">
          {post.tags.map((tag, idx) => <span key={idx} className="tag">{tag}</span>)}
        </div>
      </div>

      <div className="post-interactions">
        <div className="interaction-buttons">
            <button 
              className={`like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={!isAuthenticated}
            >
              ❤️ Like ({post.likes.length})
            </button>
            <button 
              className={`save-btn ${isSaved ? 'saved' : ''}`}
              onClick={handleSave}
              disabled={!isAuthenticated}
            >
              {isSaved ? '📂 Saved' : '📁 Save'}
            </button>
        </div>
        
        <div className="comments-section">
          <h4>Comments ({post.comments.length})</h4>
          {isAuthenticated ? (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Add a comment..." />
              <button type="submit">Post Comment</button>
            </form>
          ) : (
            <p>Please <Link to="/login">login</Link> to comment.</p>
          )}

          {post.comments.map(c => (
            <div key={c._id} className="comment">
              <Link to={`/profile/${c.user}`}>
                <img src={c.avatar || `https://api.dicebear.com/8.x/personas/svg?seed=${c.name}`} alt={c.name} className="comment-avatar" />
              </Link>
              <div className="comment-body">
                <strong><Link to={`/profile/${c.user}`}>{c.name}</Link></strong>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <SendMessageModal 
          recipientId={authorId} 
          recipientName={post.name} 
          onClose={(success) => {
            setIsModalOpen(false);
            if (success) navigate('/messages'); 
          }} 
        />
      )}
    </div>
  );
};

export default PostDetailPage;