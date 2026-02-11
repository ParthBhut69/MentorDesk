const db = require('../db/db');

// Get user's recent activity (questions and answers)
// Get user's recent activity (questions and answers)
const getUserActivity = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Fetch user's questions
        const questions = await db('questions')
            .select(
                'id',
                'title',
                'created_at',
                db.raw("'question' as type"),
                db.raw('(SELECT COUNT(*) FROM answers WHERE question_id = questions.id) as answer_count')
            )
            .where('user_id', userId)
            .orderBy('created_at', 'desc')
            .limit(10);

        // Fetch user's answers
        const answers = await db('answers')
            .join('questions', 'answers.question_id', 'questions.id')
            .select(
                'answers.id',
                'answers.answer_text as content',
                'answers.created_at',
                db.raw("'answer' as type"),
                'answers.question_id',
                'questions.title as question_title',
                'answers.is_accepted'
            )
            .where('answers.user_id', userId)
            .orderBy('answers.created_at', 'desc')
            .limit(10);

        // Combine and sort by date
        const activities = [...questions, ...answers]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 15); // Get most recent 15 activities

        res.json(activities);
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ message: 'Failed to fetch user activity' });
    }
};

module.exports = {
    getUserActivity
};
