const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Make sure this is the ONLY time we import from postController!
const { 
  getPosts, 
  getPostById, 
  createPost, 
  deletePost, 
  getFollowingFeed,
  likePost,
  unlikePost,
  addComment,
  analyzeImage // Make sure this is exported in postController.js if using AI
} = require('../controllers/postController');

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'D:/rep project/uploads'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});
// --- ROUTES ---
router.get('/', getPosts);
router.get('/feed', auth, getFollowingFeed); 
// router.post('/analyze', auth, upload.single('image'), analyzeImage); // Commented out
router.post('/create', auth, createPost);
router.get('/:id', getPostById);
router.delete('/:id', auth, deletePost);
//router.post('/track-interest', auth, trackInterest);
// Comment these out until you write the functions in postController.js!
// router.put('/like/:id', auth, likePost);
// router.put('/unlike/:id', auth, unlikePost);
// router.post('/comment/:id', auth, addComment);

module.exports = router;