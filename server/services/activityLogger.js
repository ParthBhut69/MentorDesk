const db = require('../db/db');

/**
 * Activity Logger Service
 * Tracks all topic-related user interactions for trending calculations
 */

/**
 * Log a generic activity
 * @param {number} topicId - Tag/topic ID
 * @param {number} userId - User ID (nullable)
 * @param {string} activityType - Type: 'view', 'search', 'post', 'like', 'reply'
 * @param {Object} metadata - Additional data (questionId, answerId)
 */
async function logActivity(topicId, userId, activityType, metadata = {}) {
    try {
        await db('topic_activity_logs').insert({
            topic_id: topicId,
            user_id: userId || null,
            activity_type: activityType,
            question_id: metadata.questionId || null,
            answer_id: metadata.answerId || null,
            created_at: db.fn.now()
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

/**
 * Log topic view activity
 * @param {number} topicId - Tag/topic ID
 * @param {number} userId - User ID
 * @param {number} questionId - Question being viewed
 */
async function logTopicView(topicId, userId, questionId) {
    await logActivity(topicId, userId, 'view', { questionId });
}

/**
 * Log new post activity
 * @param {number} topicId - Tag/topic ID
 * @param {number} userId - User who posted
 * @param {number} questionId - New question ID
 */
async function logTopicPost(topicId, userId, questionId) {
    await logActivity(topicId, userId, 'post', { questionId });
}

/**
 * Log like activity
 * @param {number} topicId - Tag/topic ID
 * @param {number} userId - User who liked
 * @param {number} targetId - Question or answer ID
 * @param {string} targetType - 'question' or 'answer'
 */
async function logTopicLike(topicId, userId, targetId, targetType) {
    const metadata = targetType === 'question'
        ? { questionId: targetId }
        : { answerId: targetId };

    await logActivity(topicId, userId, 'like', metadata);
}

/**
 * Log reply activity
 * @param {number} topicId - Tag/topic ID
 * @param {number} userId - User who replied
 * @param {number} answerId - Answer ID
 * @param {number} questionId - Question ID
 */
async function logTopicReply(topicId, userId, answerId, questionId) {
    await logActivity(topicId, userId, 'reply', { answerId, questionId });
}

/**
 * Log search activity for a topic
 * @param {number} topicId - Tag/topic ID
 * @param {number} userId - User who searched (nullable)
 */
async function logTopicSearch(topicId, userId) {
    await logActivity(topicId, userId, 'search');
}

/**
 * Extract topic IDs from a question's tags
 * @param {number} questionId - Question ID
 * @returns {Array} Array of topic IDs
 */
async function extractTopicsFromQuestion(questionId) {
    try {
        const topics = await db('question_tags')
            .where('question_id', questionId)
            .pluck('tag_id');

        return topics;
    } catch (error) {
        console.error('Error extracting topics from question:', error);
        return [];
    }
}

/**
 * Log activity for all topics associated with a question
 * @param {number} questionId - Question ID
 * @param {number} userId - User ID
 * @param {string} activityType - Activity type
 * @param {Object} metadata - Additional metadata
 */
async function logActivityForQuestionTopics(questionId, userId, activityType, metadata = {}) {
    try {
        const topicIds = await extractTopicsFromQuestion(questionId);

        for (const topicId of topicIds) {
            await logActivity(topicId, userId, activityType, {
                questionId,
                ...metadata
            });
        }
    } catch (error) {
        console.error('Error logging activity for question topics:', error);
    }
}

/**
 * Bulk log activities
 * @param {Array} activities - Array of activity objects
 */
async function bulkLogActivities(activities) {
    try {
        if (activities.length === 0) return;

        const records = activities.map(activity => ({
            topic_id: activity.topicId,
            user_id: activity.userId || null,
            activity_type: activity.activityType,
            question_id: activity.questionId || null,
            answer_id: activity.answerId || null,
            created_at: db.fn.now()
        }));

        await db('topic_activity_logs').insert(records);
    } catch (error) {
        console.error('Error bulk logging activities:', error);
    }
}

/**
 * Get activity stats for a topic
 * @param {number} topicId - Tag/topic ID
 * @param {number} days - Number of days back
 * @returns {Object} Activity statistics
 */
async function getTopicActivityStats(topicId, days = 7) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const stats = await db('topic_activity_logs')
            .where('topic_id', topicId)
            .where('created_at', '>=', startDate)
            .select('activity_type')
            .count('* as count')
            .groupBy('activity_type');

        const result = {
            total: 0,
            views: 0,
            searches: 0,
            posts: 0,
            likes: 0,
            replies: 0
        };

        stats.forEach(stat => {
            const count = parseInt(stat.count) || 0;
            result[stat.activity_type] = count;
            result.total += count;
        });

        return result;
    } catch (error) {
        console.error('Error getting topic activity stats:', error);
        return null;
    }
}

module.exports = {
    logActivity,
    logTopicView,
    logTopicPost,
    logTopicLike,
    logTopicReply,
    logTopicSearch,
    extractTopicsFromQuestion,
    logActivityForQuestionTopics,
    bulkLogActivities,
    getTopicActivityStats
};
