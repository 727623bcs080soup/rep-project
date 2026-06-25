const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const { deletePostByAdmin, deleteUserByAdmin, suspendUser, activateUser } = require('../controllers/adminController');

router.delete('/posts/:id', auth, admin, deletePostByAdmin);
router.delete('/users/:id', auth, admin, deleteUserByAdmin);
router.put('/users/:id/suspend', auth, admin, suspendUser);
router.put('/users/:id/activate', auth, admin, activateUser);

module.exports = router;