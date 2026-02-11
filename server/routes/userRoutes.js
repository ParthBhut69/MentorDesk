const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateProfile, getProfile } = require('../controllers/userController');
const { changePassword, updateContactDetails } = require('../controllers/preferencesController');

// Get user profile
router.get('/profile/:id', getProfile);

// Update user profile
router.put('/profile', protect, updateProfile);

// Change password
router.post('/change-password', protect, changePassword);

// Update contact details
router.put('/contact-details', protect, updateContactDetails);

module.exports = router;
