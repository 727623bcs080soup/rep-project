const Post = require('../models/postModel');
const User = require('../models/userModel');

exports.search = async (req, res) => {
  try {
    const query = req.query.q;
    const type = req.query.type;

    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }

    const regex = new RegExp(query, 'i'); // Case-insensitive
    
    let posts = [];
    let users = [];

    if (type === 'Shots') {
      // --- THIS IS THE UPDATE ---
      // Use $or to search both title and the tags array
      posts = await Post.find({
        $or: [
          { title: regex },
          { tags: regex } // This checks if any tag in the array matches the regex
        ]
      }).sort({ createdAt: -1 });
      // --- END UPDATE ---

    } else if (type === 'Users') {
      // This logic remains the same
      users = await User.find({ name: regex }).select('-password');
    }

    res.json({ posts, users });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};