const db = require('../db/db');

/**
 * Notification Service
 * Centralized notification creation and management
 */

/**
 * Notification types
 */
const NOTIFICATION_TYPES = {
    NEW_QUESTION: 'new_question',
    NEW_ANSWER: 'new_answer',
    QUESTION_LIKED: 'question_liked',
    ANSWER_LIKED: 'answer_liked',
    ANSWER_ACCEPTED: 'answer_accepted',
    NEW_FOLLOWER: 'new_follower',
    COMMENT_REPLY: 'comment_reply',
    MENTION: 'mention'
};

/**
 * Create a base notification
 * @param {number} userId - Recipient user ID
 * @param {string} type - Notification type
 * @param {string} content - Notification message
 * @param {Object} metadata - Related IDs and data
 */
async function createNotification(userId, type, content, metadata = {}) {
    try {
        await db('notifications').insert({
            user_id: userId,
            type,
            content,
            related_id: metadata.relatedId || null,
            related_type: metadata.relatedType || null,
            read_status: false,
            created_at: db.fn.now()
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

/**
 * Notify followers when a user posts a new question
 * @param {Object} question - Question object with user_id
 * @param {Object} author - Author user object
 */
async function notifyQuestionPosted(question, author) {
    try {
        // Get all followers of the question author
        const followers = await db('followers')
            .where('followed_id', question.user_id)
            .where('is_following', true)
            .pluck('follower_id');

        if (followers.length === 0) return;

        // Create notifications for all followers
        const notifications = followers.map(followerId => ({
            user_id: followerId,
            type: NOTIFICATION_TYPES.NEW_QUESTION,
            content: `${author.name} posted a new question: "${question.title}"`,
            related_id: question.id,
            related_type: 'question',
            read_status: false,
            created_at: db.fn.now()
        }));

        await db('notifications').insert(notifications);
    } catch (error) {
        console.error('Error notifying question posted:', error);
    }
}

/**
 * Notify question author when someone answers their question
 * @param {Object} answer - Answer object
 * @param {Object} question - Question object
 * @param {Object} answerer - User who answered
 */
async function notifyAnswerPosted(answer, question, answerer) {
    try {
        // Don't notify if user answered their own question
        if (answer.user_id === question.user_id) return;

        await createNotification(
            question.user_id,
            NOTIFICATION_TYPES.NEW_ANSWER,
            `${answerer.name} answered your question: "${question.title}"`,
            {
                relatedId: answer.id,
                relatedType: 'answer'
            }
        );
    } catch (error) {
        console.error('Error notifying answer posted:', error);
    }
}

/**
 * Notify question owner when someone likes their question
 * @param {Object} question - Question object
 * @param {Object} liker - User who liked
 */
async function notifyQuestionLiked(question, liker) {
    try {
        // Don't notify if user liked their own question
        if (liker.id === question.user_id) return;

        await createNotification(
            question.user_id,
            NOTIFICATION_TYPES.QUESTION_LIKED,
            `${liker.name} liked your question: "${question.title}"`,
            {
                relatedId: question.id,
                relatedType: 'question'
            }
        );
    } catch (error) {
        console.error('Error notifying question liked:', error);
    }
}

/**
 * Notify answer owner when someone likes their answer
 * @param {Object} answer - Answer object
 * @param {Object} liker - User who liked
 * @param {Object} question - Related question
 */
async function notifyAnswerLiked(answer, liker, question) {
    try {
        // Don't notify if user liked their own answer
        if (liker.id === answer.user_id) return;

        await createNotification(
            answer.user_id,
            NOTIFICATION_TYPES.ANSWER_LIKED,
            `${liker.name} liked your answer on: "${question.title}"`,
            {
                relatedId: answer.id,
                relatedType: 'answer'
            }
        );
    } catch (error) {
        console.error('Error notifying answer liked:', error);
    }
}

/**
 * Notify answer author when their answer is accepted
 * @param {Object} answer - Answer object
 * @param {Object} question - Question object
 */
async function notifyAnswerAccepted(answer, question) {
    try {
        // Don't notify if user accepted their own answer
        if (answer.user_id === question.user_id) return;

        await createNotification(
            answer.user_id,
            NOTIFICATION_TYPES.ANSWER_ACCEPTED,
            `Your answer was accepted on: "${question.title}"`,
            {
                relatedId: answer.id,
                relatedType: 'answer'
            }
        );
    } catch (error) {
        console.error('Error notifying answer accepted:', error);
    }
}

/**
 * Notify user when someone follows them
 * @param {number} followedUserId - User who was followed
 * @param {Object} follower - User who followed
 */
async function notifyNewFollower(followedUserId, follower) {
    try {
        await createNotification(
            followedUserId,
            NOTIFICATION_TYPES.NEW_FOLLOWER,
            `${follower.name} started following you`,
            {
                relatedId: follower.id,
                relatedType: 'user'
            }
        );
    } catch (error) {
        console.error('Error notifying new follower:', error);
    }
}

/**
 * Notify answer owner when someone comments on their answer
 * @param {Object} comment - Comment object
 * @param {Object} answer - Answer object
 * @param {Object} commenter - User who commented
 */
async function notifyCommentReply(comment, answer, commenter) {
    try {
        // Don't notify if user commented on their own answer
        if (commenter.id === answer.user_id) return;

        await createNotification(
            answer.user_id,
            NOTIFICATION_TYPES.COMMENT_REPLY,
            `${commenter.name} commented on your answer`,
            {
                relatedId: comment.id,
                relatedType: 'comment'
            }
        );
    } catch (error) {
        console.error('Error notifying comment reply:', error);
    }
}

/**
 * Batch create notifications (optimized for bulk operations)
 * @param {Array} notifications - Array of notification objects
 */
async function batchCreateNotifications(notifications) {
    try {
        if (notifications.length === 0) return;

        const records = notifications.map(notif => ({
            user_id: notif.userId,
            type: notif.type,
            content: notif.content,
            related_id: notif.relatedId || null,
            related_type: notif.relatedType || null,
            read_status: false,
            created_at: db.fn.now()
        }));

        await db('notifications').insert(records);
    } catch (error) {
        console.error('Error batch creating notifications:', error);
    }
}

/**
 * Get notification count by type for a user
 * @param {number} userId - User ID
 * @returns {Object} Counts by notification type
 */
async function getNotificationStats(userId) {
    try {
        const stats = await db('notifications')
            .where('user_id', userId)
            .select('type', 'read_status')
            .count('* as count')
            .groupBy('type', 'read_status');

        const result = {
            total: 0,
            unread: 0,
            by_type: {}
        };

        stats.forEach(stat => {
            const count = parseInt(stat.count) || 0;
            result.total += count;

            if (!stat.read_status) {
                result.unread += count;
            }

            if (!result.by_type[stat.type]) {
                result.by_type[stat.type] = { total: 0, unread: 0 };
            }

            result.by_type[stat.type].total += count;
            if (!stat.read_status) {
                result.by_type[stat.type].unread += count;
            }
        });

        return result;
    } catch (error) {
        console.error('Error getting notification stats:', error);
        return null;
    }
}

/**
 * Clean old read notifications
 * @param {number} retentionDays - Days to keep read notifications
 * @returns {number} Number deleted
 */
async function cleanOldNotifications(retentionDays = 30) {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const deleted = await db('notifications')
            .where('read_status', true)
            .where('created_at', '<', cutoffDate)
            .del();

        console.log(`Cleaned ${deleted} old notifications`);
        return deleted;
    } catch (error) {
        console.error('Error cleaning old notifications:', error);
        return 0;
    }
}

module.exports = {
    NOTIFICATION_TYPES,
    createNotification,
    notifyQuestionPosted,
    notifyAnswerPosted,
    notifyQuestionLiked,
    notifyAnswerLiked,
    notifyAnswerAccepted,
    notifyNewFollower,
    notifyCommentReply,
    batchCreateNotifications,
    getNotificationStats,
    cleanOldNotifications
};
