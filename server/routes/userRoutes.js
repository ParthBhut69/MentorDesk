const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateProfile, getProfile } = require('../controllers/userController');

// Get user profile
router.get('/profile/:id', getProfile);

// Update user profile
router.put('/profile', protect, updateProfile);

module.exports = router;
