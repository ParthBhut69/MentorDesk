const db = require('../db/db');

// Get trending questions (most views and upvotes in last 7 days)
const getTrendingQuestions = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const questions = await db('questions')
            .where('questions.created_at', '>=', sevenDaysAgo)
            .join('users', 'questions.user_id', 'users.id')
            .leftJoin('answers', 'questions.id', 'answers.question_id')
            .select(
                'questions.*',
                'users.name as author_name',
                db.raw('COUNT(DISTINCT answers.id) as answer_count')
            )
            .groupBy('questions.id')
            .orderBy('questions.upvotes', 'desc')
            .orderBy('questions.views', 'desc')
            .limit(10);

        res.json(questions);
    } catch (error) {
        console.error('Error getting trending questions:', error);
        res.status(500).json({ message: 'Failed to get trending questions' });
    }
};

// Get top experts (most upvotes on answers this week)
const getTopExperts = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const experts = await db('users')
            .leftJoin('answers', 'users.id', 'answers.user_id')
            .where('answers.created_at', '>=', sevenDaysAgo)
            .select(
                'users.id',
                'users.name',
                'users.is_verified_expert',
                'users.expertise_areas',
                db.raw('SUM(answers.upvotes) as total_upvotes'),
                db.raw('COUNT(answers.id) as answer_count')
            )
            .groupBy('users.id')
            .orderBy('total_upvotes', 'desc')
            .limit(10);

        res.json(experts);
    } catch (error) {
        console.error('Error getting top experts:', error);
        res.status(500).json({ message: 'Failed to get top experts' });
    }
};

// Get popular tags
const getPopularTags = async (req, res) => {
    try {
        const tags = await db('tags')
            .leftJoin('question_tags', 'tags.id', 'question_tags.tag_id')
            .select(
                'tags.*',
                db.raw('COUNT(question_tags.question_id) as question_count')
            )
            .groupBy('tags.id')
            .orderBy('question_count', 'desc')
            .limit(20);

        res.json(tags);
    } catch (error) {
        console.error('Error getting popular tags:', error);
        res.status(500).json({ message: 'Failed to get popular tags' });
    }
};

module.exports = {
    getTrendingQuestions,
    getTopExperts,
    getPopularTags
};
