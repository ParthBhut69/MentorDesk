const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
} = require('../controllers/notificationController');

// Get user's notifications
router.get('/', protect, getNotifications);

// Get unread count
router.get('/unread-count', protect, getUnreadCount);

// Mark notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all as read
router.put('/mark-all-read', protect, markAllAsRead);

module.exports = router;
