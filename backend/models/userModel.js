const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String },
  isAdmin: { type: Boolean, default: false },
  accountStatus: { 
    type: String, 
    enum: ['active', 'suspended'], 
    default: 'active' 
  },
  isHireable: { type: Boolean, default: false },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  categoryInterests: {
    type: Map,
    of: Number,
    default: {}
  },
  tagInterests: {
    type: Map,
    of: Number,
    default: {}
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);