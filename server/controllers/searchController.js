const db = require('../db/db');

// Search questions and answers
const search = async (req, res) => {
    try {
        const { q, type = 'all' } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const searchTerm = `%${q}%`;
        const results = { questions: [], answers: [] };

        // Search questions
        if (type === 'all' || type === 'questions') {
            results.questions = await db('questions')
                .join('users', 'questions.user_id', 'users.id')
                .where('questions.title', 'like', searchTerm)
                .orWhere('questions.description', 'like', searchTerm)
                .select(
                    'questions.*',
                    'users.name as author_name',
                    'users.rank as author_rank'
                )
                .orderBy('questions.created_at', 'desc')
                .limit(20);
        }

        // Search answers
        if (type === 'all' || type === 'answers') {
            results.answers = await db('answers')
                .join('users', 'answers.user_id', 'users.id')
                .join('questions', 'answers.question_id', 'questions.id')
                .where('answers.answer_text', 'like', searchTerm)
                .select(
                    'answers.*',
                    'users.name as author_name',
                    'users.rank as author_rank',
                    'questions.title as question_title',
                    'questions.id as question_id'
                )
                .orderBy('answers.created_at', 'desc')
                .limit(20);
        }

        res.json(results);
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ message: 'Search failed' });
    }
};

// Search users
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const searchTerm = `%${q}%`;

        const users = await db('users')
            .where('name', 'like', searchTerm)
            .orWhere('email', 'like', searchTerm)
            .orWhere('bio', 'like', searchTerm)
            .select('id', 'name', 'email', 'bio', 'points', 'rank', 'is_verified_expert')
            .limit(10);

        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'User search failed' });
    }
};

module.exports = {
    search,
    searchUsers
};
