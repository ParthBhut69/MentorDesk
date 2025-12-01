const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    deleteAllRead,
    getNotificationStats
} = require('../controllers/notificationController');

// Get user's notifications
router.get('/', protect, getNotifications);

// Get unread count
router.get('/unread-count', protect, getUnreadCount);

// Get notification stats
router.get('/stats', protect, getNotificationStats);

// Mark notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all as read
router.put('/mark-all-read', protect, markAllAsRead);

// Delete notification
router.delete('/:id', protect, deleteNotification);

// Delete all read notifications
router.delete('/read/all', protect, deleteAllRead);

module.exports = router;
