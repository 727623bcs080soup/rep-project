// backend/controllers/adminController.js
const Post = require('../models/postModel');
const User = require('../models/userModel');
const fs = require('fs').promises;
const path = require('path');

// ... (deletePostFile helper function, same as before)
const deletePostFile = async (imageUrl) => {
    if (!imageUrl) return;
    const filename = path.basename(imageUrl);
    const imagePath = path.join('D:\\', 'rep project', 'uploads', filename);
    try {
        await fs.unlink(imagePath);
        console.log('Admin: Successfully deleted image file:', imagePath);
    } catch (err) {
        console.error('Admin: Error deleting post image file (may be missing):', err.message);
    }
};

exports.deletePostByAdmin = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ msg: 'Post not found.' });
        await deletePostFile(post.imageUrl);
        await Post.findByIdAndDelete(postId);
        res.json({ msg: 'Post deleted successfully by Admin.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteUserByAdmin = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found.' });
        
        const userPosts = await Post.find({ user: userId });
        await Promise.all(userPosts.map(post => deletePostFile(post.imageUrl)));
        await Post.deleteMany({ user: userId });

        await User.findByIdAndDelete(userId);
        res.json({ msg: 'User deleted successfully by Admin.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- NEW: SUSPEND USER ---
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { accountStatus: 'suspended' } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- NEW: ACTIVATE USER ---
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { accountStatus: 'active' } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};