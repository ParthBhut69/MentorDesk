const express = require('express');
const router = express.Router();
const {
    submitMessage,
    getMessages,
    markAsRead
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

// Public route to submit contact form
router.post('/', submitMessage);

// Admin only routes
// Note: In a real production app, you'd add an admin check middleware here
// For now, protecting with basic auth middleware
router.get('/', protect, getMessages);
router.patch('/:id/read', protect, markAsRead);

module.exports = router;
