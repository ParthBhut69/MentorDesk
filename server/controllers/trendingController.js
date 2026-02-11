const db = require('../db/db');
const trendingService = require('../services/trendingService');
const { getTopicActivityStats: getActivityStatsFromService } = require('../services/activityLogger');

// Get trending questions (most views and upvotes in last 7 days)
const getTrendingQuestions = async (req, res) => {
    try {
        const { timeWindow = '7d', limit = 10 } = req.query;

        const windowMs = trendingService.TIME_WINDOWS[timeWindow] || trendingService.TIME_WINDOWS['7d'];
        const startDate = new Date(Date.now() - windowMs);

        const questions = await db('questions')
            .where('questions.created_at', '>=', startDate)
            .join('users', 'questions.user_id', 'users.id')
            .leftJoin('answers', 'questions.id', 'answers.question_id')
            .select(
                'questions.*',
                'users.name as author_name',
                'users.avatar_url as author_avatar',
                db.raw('COUNT(DISTINCT answers.id) as answer_count')
            )
            .groupBy('questions.id')
            .orderBy('questions.upvotes', 'desc')
            .orderBy('questions.views', 'desc')
            .limit(parseInt(limit));

        res.json(questions);
    } catch (error) {
        console.error('Error getting trending questions:', error);
        res.status(500).json({ message: 'Failed to get trending questions' });
    }
};

// Get top experts (most upvotes on answers this week)
const getTopExperts = async (req, res) => {
    try {
        const { timeWindow = '7d', limit = 10 } = req.query;

        const windowMs = trendingService.TIME_WINDOWS[timeWindow] || trendingService.TIME_WINDOWS['7d'];
        const startDate = new Date(Date.now() - windowMs);

        const experts = await db('users')
            .leftJoin('answers', 'users.id', 'answers.user_id')
            .where('answers.created_at', '>=', startDate)
            .select(
                'users.id',
                'users.name',
                'users.avatar_url',
                'users.is_verified_expert',
                'users.expertise_areas',
                db.raw('SUM(answers.upvotes) as total_upvotes'),
                db.raw('COUNT(answers.id) as answer_count')
            )
            .groupBy('users.id')
            .orderBy('total_upvotes', 'desc')
            .limit(parseInt(limit));

        res.json(experts);
    } catch (error) {
        console.error('Error getting top experts:', error);
        res.status(500).json({ message: 'Failed to get top experts' });
    }
};

// Get popular tags
const getPopularTags = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const tags = await db('tags')
            .leftJoin('question_tags', 'tags.id', 'question_tags.tag_id')
            .select(
                'tags.*',
                db.raw('COUNT(question_tags.question_id) as question_count')
            )
            .groupBy('tags.id')
            .orderBy('question_count', 'desc')
            .limit(parseInt(limit));

        res.json(tags);
    } catch (error) {
        console.error('Error getting popular tags:', error);
        res.status(500).json({ message: 'Failed to get popular tags' });
    }
};

// Get trending topics with scores and metrics
const getTrendingTopics = async (req, res) => {
    try {
        const { limit = 10, timeWindow = '7d' } = req.query;

        const topics = await trendingService.getTrendingTopics(
            parseInt(limit),
            timeWindow
        );

        res.json(topics);
    } catch (error) {
        console.error('Error getting trending topics:', error);
        res.status(500).json({ message: 'Failed to get trending topics' });
    }
};

// Get trending topic details
const getTrendingTopicDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const topic = await trendingService.getTrendingTopicDetails(parseInt(id));

        if (!topic) {
            return res.status(404).json({ message: 'Trending topic not found' });
        }

        res.json(topic);
    } catch (error) {
        console.error('Error getting trending topic details:', error);
        res.status(500).json({ message: 'Failed to get trending topic details' });
    }
};

// Get topic activity statistics
const getTopicActivityStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { days = 7 } = req.query;

        const stats = await getActivityStatsFromService(parseInt(id), parseInt(days));

        if (!stats) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        res.json(stats);
    } catch (error) {
        console.error('Error getting topic activity stats:', error);
        res.status(500).json({ message: 'Failed to get topic activity stats' });
    }
};

module.exports = {
    getTrendingQuestions,
    getTopExperts,
    getPopularTags,
    getTrendingTopics,
    getTrendingTopicDetails,
    getTopicActivityStats
};
