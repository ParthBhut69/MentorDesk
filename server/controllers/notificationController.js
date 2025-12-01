const db = require('../db/db');
const { getNotificationStats: getStatsFromService } = require('../services/notificationService');

// Create a notification
const createNotification = async (userId, type, content, relatedId = null, relatedType = null) => {
    try {
        await db('notifications').insert({
            user_id: userId,
            type,
            content,
            related_id: relatedId,
            related_type: relatedType,
            read_status: false
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Get user's notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { unread_only } = req.query;

        let query = db('notifications')
            .where('user_id', userId)
            .orderBy('created_at', 'desc')
            .limit(50);

        if (unread_only === 'true') {
            query = query.where('read_status', false);
        }

        const notifications = await query;
        res.json(notifications);
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ message: 'Failed to get notifications' });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await db('notifications')
            .where({ id, user_id: userId })
            .first();

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await db('notifications')
            .where('id', id)
            .update({ read_status: true });

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await db('notifications')
            .where('user_id', userId)
            .update({ read_status: true });

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Failed to mark all as read' });
    }
};

// Get unread count
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db('notifications')
            .where({ user_id: userId, read_status: false })
            .count('id as count')
            .first();

        res.json({ count: result.count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: 'Failed to get unread count' });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await db('notifications')
            .where({ id, user_id: userId })
            .first();

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await db('notifications').where('id', id).del();

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
};

// Delete all read notifications
const deleteAllRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const deleted = await db('notifications')
            .where({ user_id: userId, read_status: true })
            .del();

        res.json({ message: 'Read notifications deleted', count: deleted });
    } catch (error) {
        console.error('Error deleting read notifications:', error);
        res.status(500).json({ message: 'Failed to delete read notifications' });
    }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await getStatsFromService(userId);

        res.json(stats);
    } catch (error) {
        console.error('Error getting notification stats:', error);
        res.status(500).json({ message: 'Failed to get notification stats' });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    deleteAllRead,
    getNotificationStats
};
