const db = require('../db/db');

// Get user's recent activity (questions and answers)
const getUserActivity = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Fetch user's questions
        const questions = await db.all(`
            SELECT 
                q.id,
                q.title,
                q.created_at,
                'question' as type,
                (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count
            FROM questions q
            WHERE q.user_id = ?
            ORDER BY q.created_at DESC
            LIMIT 10
        `, [userId]);

        // Fetch user's answers
        const answers = await db.all(`
            SELECT 
                a.id,
                a.content,
                a.created_at,
                'answer' as type,
                a.question_id,
                q.title as question_title,
                a.is_accepted
            FROM answers a
            JOIN questions q ON a.question_id = q.id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
            LIMIT 10
        `, [userId]);

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
