// backend/controllers/postController.js
// REPLACE your entire postController.js file with this.

const Post = require('../models/postModel');
const User = require('../models/userModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Helper function to convert file to base64
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

// Global initialization of Gemini (assuming it was done elsewhere)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Analyze Image Controller
exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    const categoriesList = "Animation, Branding, Illustration, Mobile, Print, Product Design, Typography, Web Design";
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Analyze this image from a design portfolio. Suggest a short, catchy title (max 10 words), a brief description (max 30 words), and 3-5 relevant tags (as a comma-separated string). 
    
    Most importantly, choose exactly ONE category for this post from the following list: ${categoriesList}.
    
    Format the response as a JSON object like: {"title": "...", "description": "...", "tags": "...", "category": "..."}`;
    
    const imagePart = fileToGenerativePart(req.file.path, req.file.mimetype);
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const suggestions = JSON.parse(text);

    res.json({
      suggestions: suggestions,
      imageUrl: `/uploads/${req.file.filename}` 
    });

  } catch (err) {
    console.error('Gemini Error:', err);
    res.status(500).json({
      suggestions: { title: "", description: "", tags: "", category: "Other" },
      imageUrl: `/uploads/${req.file.filename}`,
      error: "AI analysis failed, please fill manually."
    });
  }
};

// 2. Create Post Controller
exports.createPost = async (req, res) => {
  const { title, description, tags, imageUrl, category } = req.body;

  try {
    const user = await User.findById(req.user.id).select('name avatarUrl');
    
    const newPost = new Post({
      title,
      description,
      imageUrl,
      tags: tags.split(',').map(tag => tag.trim()), 
      user: req.user.id,
      name: user.name, 
      authorAvatar: user.avatarUrl,
      category: category,
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// 3. Get All Posts
exports.getPosts = async (req, res) => {
  try {
    // Aggregation to calculate the size of the 'likes' array and sort by it
    const posts = await Post.aggregate([
      {
        $addFields: {
          likesCount: { $size: "$likes" }
        }
      },
      { 
        $sort: { likesCount: -1 } // Most likes first
      }
    ]);
    
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 4. Get Post By ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 5. Like/Unlike Post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.some(like => like.toString() === req.user.id)) {
      post.likes = post.likes.filter(
        like => like.toString() !== req.user.id
      );
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 6. Add Comment
exports.addComment = async (req, res) => {
  const { text } = req.body;
  try {
    const user = await User.findById(req.user.id).select('name avatarUrl');
    const post = await Post.findById(req.params.id);

    const newComment = {
      user: req.user.id,
      name: user.name,
      text: text,
      avatar: user.avatarUrl,
    };

    post.comments.unshift(newComment);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 7. Delete a Post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const filename = path.basename(post.imageUrl);
    const imagePath = path.join('D:\\', 'rep project', 'uploads', filename);

    try {
      await fs.promises.unlink(imagePath);
      console.log('Successfully deleted image file:', imagePath);
    } catch (err) {
      console.error('Error deleting image file (will proceed with post delete):', err.message);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Add this to backend/controllers/userController.js

// Get all posts saved by the logged-in user
exports.getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedPosts');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    // We also want to populate the author info for each saved post
    const populatedPosts = await Post.find({ _id: { $in: user.savedPosts } })
      .sort({ createdAt: -1 });

    res.json(populatedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ADD this function to the end of backend/controllers/postController.js

// 8. Get posts from users the current user is following
exports.getFollowingPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find all posts where the 'user' is in the currentUser's 'following' array
    const feedPosts = await Post.find({
      'user': { $in: currentUser.following }
    }).sort({ createdAt: -1 });

    res.json(feedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getFollowingFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // 1. Fetch posts from users the current user follows
    let posts = await Post.find({
      user: { $in: user.following }
    })
    .populate('user', 'name avatarUrl')
    .lean();

    // 2. PERSONALIZATION ALGORITHM
    const catInterests = user.categoryInterests || new Map();
    const tagInterests = user.tagInterests || new Map();

    posts.sort((a, b) => {
      // Calculate Score for Post A
      const scoreA_Cat = catInterests.get(a.category) || 0;
      const scoreA_Tags = a.tags ? a.tags.reduce((acc, tag) => acc + (tagInterests.get(tag) || 0), 0) : 0;
      const totalScoreA = scoreA_Cat + scoreA_Tags;

      // Calculate Score for Post B
      const scoreB_Cat = catInterests.get(b.category) || 0;
      const scoreB_Tags = b.tags ? b.tags.reduce((acc, tag) => acc + (tagInterests.get(tag) || 0), 0) : 0;
      const totalScoreB = scoreB_Cat + scoreB_Tags;

      // Priority 1: Total Relevance Score (highest first)
      if (totalScoreB !== totalScoreA) {
        return totalScoreB - totalScoreA;
      }
      
      // Priority 2: Recency (newest first if tied)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};