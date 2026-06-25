// backend/controllers/userController.js
const User = require('../models/userModel');
const Post = require('../models/postModel');

// Get user profile
// backend/controllers/userController.js

exports.getUserProfile = async (req, res) => {
  try {
    // 1. Find the user AND populate their follower/following lists with specific fields
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name avatarUrl _id') // Ensure _id is also populated
      .populate('following', 'name avatarUrl _id');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // 2. Find their posts and calculate likes
    const posts = await Post.find({ user: req.params.id }).sort({ createdAt: -1 });
    const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);

    // 3. Convert to a plain object and add the new field
    const userObj = user.toObject(); 
    userObj.likesReceived = totalLikes; 
    
    // 4. Send the complete user object
    res.json({ user: userObj, posts });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Follow a user (UPDATED FOR ROBUSTNESS)
exports.followUser = async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ msg: 'You cannot follow yourself' });
  }
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    // Robust check: Convert both to strings before comparing
    const isAlreadyFollowing = userToFollow.followers.some(
      followerId => followerId.toString() === req.user.id
    );

    if (!isAlreadyFollowing) {
      await userToFollow.updateOne({ $push: { followers: req.user.id } });
      await currentUser.updateOne({ $push: { following: req.params.id } });
      res.json({ msg: 'User followed' });
    } else {
      res.status(400).json({ msg: 'You already follow this user' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Unfollow a user (UPDATED FOR ROBUSTNESS)
exports.unfollowUser = async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ msg: 'You cannot unfollow yourself' });
  }
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    // Robust check: Convert both to strings before comparing
    const isFollowing = userToUnfollow.followers.some(
       followerId => followerId.toString() === req.user.id
    );

    if (isFollowing) {
      await userToUnfollow.updateOne({ $pull: { followers: req.user.id } });
      await currentUser.updateOne({ $pull: { following: req.params.id } });
      res.json({ msg: 'User unfollowed' });
    } else {
      res.status(400).json({ msg: 'You do not follow this user' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Toggle Save Post
exports.toggleSavePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.postId;

    if (user.savedPosts.includes(postId)) {
      await user.updateOne({ $pull: { savedPosts: postId } });
      res.json({ msg: 'Post unsaved', isSaved: false });
    } else {
      await user.updateOne({ $push: { savedPosts: postId } });
      res.json({ msg: 'Post saved', isSaved: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { isHireable, bio, location } = req.body;
    const updateFields = {};
    if (typeof isHireable !== 'undefined') updateFields.isHireable = isHireable;
    if (bio) updateFields.bio = bio;
    if (location) updateFields.location = location;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get saved posts
exports.getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const savedPosts = await Post.find({
      '_id': { $in: user.savedPosts }
    }).sort({ createdAt: -1 });

    res.json(savedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
// Add this if it is missing from userController.js
exports.trackInterest = async (req, res) => {
  try {
    const { category, tags } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (category) {
      const currentCatScore = user.categoryInterests.get(category) || 0;
      user.categoryInterests.set(category, currentCatScore + 1);
    }

    if (tags && Array.isArray(tags)) {
      tags.forEach(tag => {
        const currentTagScore = user.tagInterests.get(tag) || 0;
        user.tagInterests.set(tag, currentTagScore + 1);
      });
    }

    await user.save();
    res.json({ msg: 'Interests updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};