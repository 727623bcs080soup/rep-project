// backend/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const { search } = require('../controllers/searchController');

// @route   GET /api/search
// @desc    Search for posts or users
// @access  Public
router.get('/', search);

module.exports = router;