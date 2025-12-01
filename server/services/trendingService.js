const db = require('../db/db');

/**
 * Trending Topics Service
 * Handles all trending score calculations, growth metrics, and time-decay algorithms
 */

// Configuration
const WEIGHTS = {
    views: 1,
    searches: 2,
    posts: 5,
    likes: 3,
    replies: 4
};

const DECAY_LAMBDA = 0.1; // Decay rate per hour
const TIME_WINDOWS = {
    '24h': 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    '7d': 7 * 24 * 60 * 60 * 1000, // 7 days
    '30d': 30 * 24 * 60 * 60 * 1000 // 30 days
};

/**
 * Get activity metrics for a topic within a time window
 * @param {number} topicId - Tag/topic ID
 * @param {Date} startDate - Start of time window
 * @param {Date} endDate - End of time window
 * @returns {Object} Aggregated activity metrics
 */
async function getActivityMetrics(topicId, startDate, endDate) {
    try {
        const metrics = await db('topic_activity_logs')
            .where('topic_id', topicId)
            .whereBetween('created_at', [startDate, endDate])
            .select('activity_type')
            .count('* as count')
            .groupBy('activity_type');

        // Convert to object for easy access
        const result = {
            views: 0,
            searches: 0,
            posts: 0,
            likes: 0,
            replies: 0
        };

        metrics.forEach(metric => {
            result[metric.activity_type] = parseInt(metric.count) || 0;
        });

        return result;
    } catch (error) {
        console.error('Error getting activity metrics:', error);
        return { views: 0, searches: 0, posts: 0, likes: 0, replies: 0 };
    }
}

/**
 * Calculate time decay factor using exponential decay
 * @param {Date} timestamp - Activity timestamp
 * @returns {number} Decay factor (0-1)
 */
function calculateTimeDecay(timestamp) {
    const now = new Date();
    const hoursOld = (now - timestamp) / (1000 * 60 * 60);
    // Exponential decay: e^(-λt)
    return Math.exp(-DECAY_LAMBDA * hoursOld);
}

/**
 * Calculate average time decay for activities in a period
 * @param {number} topicId - Tag/topic ID
 * @param {Date} startDate - Start of time window
 * @param {Date} endDate - End of time window
 * @returns {number} Average decay factor
 */
async function getAverageTimeDecay(topicId, startDate, endDate) {
    try {
        const activities = await db('topic_activity_logs')
            .where('topic_id', topicId)
            .whereBetween('created_at', [startDate, endDate])
            .select('created_at');

        if (activities.length === 0) return 0;

        const totalDecay = activities.reduce((sum, activity) => {
            return sum + calculateTimeDecay(new Date(activity.created_at));
        }, 0);

        return totalDecay / activities.length;
    } catch (error) {
        console.error('Error calculating average time decay:', error);
        return 0;
    }
}

/**
 * Calculate growth rate compared to previous period (Google Trends style)
 * @param {Object} currentMetrics - Current period metrics
 * @param {Object} previousMetrics - Previous period metrics
 * @returns {number} Growth rate as percentage
 */
function calculateGrowthRate(currentMetrics, previousMetrics) {
    const currentTotal = Object.values(currentMetrics).reduce((a, b) => a + b, 0);
    const previousTotal = Object.values(previousMetrics).reduce((a, b) => a + b, 0);

    if (previousTotal === 0) {
        return currentTotal > 0 ? 100 : 0;
    }

    const growth = ((currentTotal - previousTotal) / previousTotal) * 100;
    return Math.round(growth * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate base score from weighted metrics
 * @param {Object} metrics - Activity metrics
 * @returns {number} Weighted base score
 */
function calculateBaseScore(metrics) {
    return (
        metrics.views * WEIGHTS.views +
        metrics.searches * WEIGHTS.searches +
        metrics.posts * WEIGHTS.posts +
        metrics.likes * WEIGHTS.likes +
        metrics.replies * WEIGHTS.replies
    );
}

/**
 * Calculate trending score for a topic
 * Formula: BaseScore × TimeDecayFactor × (1 + GrowthRate/100)
 * @param {number} topicId - Tag/topic ID
 * @param {string} timeWindow - '24h', '7d', or '30d'
 * @returns {Object} Trending score and metadata
 */
async function calculateTrendingScore(topicId, timeWindow = '7d') {
    try {
        const windowMs = TIME_WINDOWS[timeWindow] || TIME_WINDOWS['7d'];
        const now = new Date();
        const startDate = new Date(now.getTime() - windowMs);
        const previousStartDate = new Date(now.getTime() - (windowMs * 2));

        // Get current period metrics
        const currentMetrics = await getActivityMetrics(topicId, startDate, now);

        // Get previous period metrics for growth calculation
        const previousMetrics = await getActivityMetrics(topicId, previousStartDate, startDate);

        // Calculate base score
        const baseScore = calculateBaseScore(currentMetrics);

        // Calculate time decay
        const timeDecayFactor = await getAverageTimeDecay(topicId, startDate, now);

        // Calculate growth rate
        const growthRate = calculateGrowthRate(currentMetrics, previousMetrics);

        // Calculate final trending score
        const decayedScore = baseScore * (timeDecayFactor || 0.5); // Default to 0.5 if no activities
        const growthMultiplier = 1 + (growthRate / 100);
        const finalScore = decayedScore * growthMultiplier;

        return {
            trending_score: Math.round(finalScore * 100) / 100,
            views_count: currentMetrics.views,
            searches_count: currentMetrics.searches,
            posts_count: currentMetrics.posts,
            likes_count: currentMetrics.likes,
            replies_count: currentMetrics.replies,
            growth_rate: growthRate,
            base_score: baseScore,
            decay_factor: timeDecayFactor
        };
    } catch (error) {
        console.error('Error calculating trending score:', error);
        return null;
    }
}

/**
 * Update trending scores for all topics
 * Called by cron job every 15 minutes
 * @param {string} timeWindow - Time window for calculation
 * @returns {number} Number of topics updated
 */
async function updateAllTrendingScores(timeWindow = '7d') {
    try {
        // Get all tags/topics that have activity
        const activeTopics = await db('topic_activity_logs')
            .distinct('topic_id')
            .pluck('topic_id');

        console.log(`Updating trending scores for ${activeTopics.length} topics...`);

        let updatedCount = 0;

        for (const topicId of activeTopics) {
            const scoreData = await calculateTrendingScore(topicId, timeWindow);

            if (scoreData) {
                // Upsert trending score
                const existing = await db('trending_topics')
                    .where('topic_id', topicId)
                    .first();

                if (existing) {
                    await db('trending_topics')
                        .where('topic_id', topicId)
                        .update({
                            ...scoreData,
                            calculated_at: db.fn.now(),
                            updated_at: db.fn.now()
                        });
                } else {
                    await db('trending_topics').insert({
                        topic_id: topicId,
                        ...scoreData,
                        calculated_at: db.fn.now()
                    });
                }

                updatedCount++;
            }
        }

        // Update rankings
        await updateTrendingRanks();

        console.log(`Successfully updated ${updatedCount} trending topics`);
        return updatedCount;
    } catch (error) {
        console.error('Error updating all trending scores:', error);
        throw error;
    }
}

/**
 * Update rank order based on trending scores
 */
async function updateTrendingRanks() {
    try {
        const topics = await db('trending_topics')
            .orderBy('trending_score', 'desc')
            .select('id');

        for (let i = 0; i < topics.length; i++) {
            await db('trending_topics')
                .where('id', topics[i].id)
                .update({ rank: i + 1 });
        }
    } catch (error) {
        console.error('Error updating trending ranks:', error);
    }
}

/**
 * Get trending topics
 * @param {number} limit - Number of topics to return
 * @param {string} timeWindow - Time window for trending calculation
 * @returns {Array} List of trending topics with details
 */
async function getTrendingTopics(limit = 10, timeWindow = '7d') {
    try {
        const topics = await db('trending_topics')
            .join('tags', 'trending_topics.topic_id', 'tags.id')
            .select(
                'trending_topics.*',
                'tags.name as topic_name',
                'tags.description as topic_description'
            )
            .orderBy('trending_topics.trending_score', 'desc')
            .limit(limit);

        return topics;
    } catch (error) {
        console.error('Error getting trending topics:', error);
        return [];
    }
}

/**
 * Get trending topic details
 * @param {number} topicId - Tag/topic ID
 * @returns {Object} Topic details with trending data
 */
async function getTrendingTopicDetails(topicId) {
    try {
        const topic = await db('trending_topics')
            .join('tags', 'trending_topics.topic_id', 'tags.id')
            .where('trending_topics.topic_id', topicId)
            .select(
                'trending_topics.*',
                'tags.name as topic_name',
                'tags.description as topic_description'
            )
            .first();

        if (!topic) {
            return null;
        }

        // Get recent activity breakdown
        const recentActivity = await db('topic_activity_logs')
            .where('topic_id', topicId)
            .where('created_at', '>=', db.raw("datetime('now', '-7 days')"))
            .select('activity_type')
            .count('* as count')
            .groupBy('activity_type');

        topic.recent_activity = recentActivity;

        return topic;
    } catch (error) {
        console.error('Error getting trending topic details:', error);
        return null;
    }
}

/**
 * Clean old activity logs (older than retention days)
 * @param {number} retentionDays - Number of days to keep
 * @returns {number} Number of records deleted
 */
async function cleanOldActivityLogs(retentionDays = 90) {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const deleted = await db('topic_activity_logs')
            .where('created_at', '<', cutoffDate)
            .del();

        console.log(`Cleaned ${deleted} old activity logs`);
        return deleted;
    } catch (error) {
        console.error('Error cleaning old activity logs:', error);
        return 0;
    }
}

module.exports = {
    calculateTrendingScore,
    updateAllTrendingScores,
    getTrendingTopics,
    getTrendingTopicDetails,
    getActivityMetrics,
    calculateGrowthRate,
    cleanOldActivityLogs,
    WEIGHTS,
    TIME_WINDOWS
};
