const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const initials = name.substring(0, 2).toUpperCase(); 
    const avatarSeed = encodeURIComponent(initials); 
    const avatarUrl = `https://api.dicebear.com/8.x/personas/svg?seed=${avatarSeed}`; 

    user = new User({ name, email, password, avatarUrl });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id, name: user.name, isAdmin: user.isAdmin } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ msg: 'Your account has been suspended.' });
    }

    const payload = { user: { id: user.id, name: user.name, isAdmin: user.isAdmin } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getUser = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password')
        .populate('followers', 'name avatarUrl _id')
        .populate('following', 'name avatarUrl _id')
        .populate('savedPosts', '_id');
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};