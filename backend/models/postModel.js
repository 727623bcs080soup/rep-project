// models/postModel.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true }, // Store name for easy display
  text: { type: String, required: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  authorAvatar: { type: String }, // Uploader's name
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true }, // URL path (e.g., /uploads/image.png)
  tags: [{ type: String }],
  category: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);