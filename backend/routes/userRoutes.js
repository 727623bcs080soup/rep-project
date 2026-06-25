const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  followUser, 
  unfollowUser, 
  toggleSavePost,
  updateProfile,
  getSavedPosts,
  trackInterest
} = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/:id', getUserProfile);

// Protected routes
router.put('/follow/:id', auth, followUser);
router.put('/unfollow/:id', auth, unfollowUser);
router.put('/save/:postId', auth, toggleSavePost);
router.put('/update', auth, updateProfile);
router.get('/me/saved', auth, getSavedPosts); 
router.post('/track-interest', auth, trackInterest);

module.exports = router;