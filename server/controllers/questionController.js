const db = require('../db/db');

// @desc    Create a question
// @route   POST /api/questions
// @access  Private
const createQuestion = async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const [id] = await db('questions').insert({
            user_id: req.user.id,
            title,
            description,
            image_url: req.body.image || null
        });

        const question = await db('questions').where({ id }).first();
        res.status(201).json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
const getAllQuestions = async (req, res) => {
    try {
        const { filter, tag } = req.query;
        let query = db('questions')
            .join('users', 'questions.user_id', 'users.id')
            .select(
                'questions.*',
                'users.name as user_name',
                'users.avatar_url as user_avatar',
                db.raw('(SELECT COUNT(*) FROM answers WHERE answers.question_id = questions.id) as answers_count')
            );

        if (filter === 'unanswered') {
            query = query
                .leftJoin('answers', 'questions.id', 'answers.question_id')
                .whereNull('answers.id');
        } else if (filter === 'trending') {
            // Trending logic is handled in trendingController, but simple sort here
            query = query
                .orderBy('questions.views', 'desc')
                .orderBy('questions.upvotes', 'desc');
        } else {
            query = query.orderBy('questions.created_at', 'desc');
        }

        if (tag) {
            query = query
                .join('question_tags', 'questions.id', 'question_tags.question_id')
                .join('tags', 'question_tags.tag_id', 'tags.id')
                .where('tags.name', tag);
        }

        const questions = await query;
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
const getQuestionById = async (req, res) => {
    try {
        const question = await db('questions')
            .join('users', 'questions.user_id', 'users.id')
            .select(
                'questions.*',
                'users.name as user_name',
                'users.avatar_url as user_avatar',
                db.raw('(SELECT COUNT(*) FROM answers WHERE answers.question_id = questions.id) as answers_count')
            )
            .where('questions.id', req.params.id)
            .first();

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private
const updateQuestion = async (req, res) => {
    try {
        const question = await db('questions').where({ id: req.params.id }).first();

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check user
        if (question.user_id !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const { title, description, image } = req.body;

        await db('questions')
            .where({ id: req.params.id })
            .update({
                title: title || question.title,
                description: description || question.description,
                image_url: image !== undefined ? image : question.image_url,
                updated_at: db.fn.now()
            });

        const updatedQuestion = await db('questions').where({ id: req.params.id }).first();
        res.json(updatedQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = async (req, res) => {
    try {
        const question = await db('questions').where({ id: req.params.id }).first();

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check user
        if (question.user_id !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await db('questions').where({ id: req.params.id }).del();
        res.json({ id: req.params.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get questions by user
// @route   GET /api/questions/user/:userId
// @access  Public
const getUserQuestions = async (req, res) => {
    try {
        const questions = await db('questions')
            .join('users', 'questions.user_id', 'users.id')
            .select(
                'questions.*',
                'users.name as user_name',
                'users.avatar_url as user_avatar',
                db.raw('(SELECT COUNT(*) FROM answers WHERE answers.question_id = questions.id) as answers_count')
            )
            .where('questions.user_id', req.params.userId)
            .orderBy('questions.created_at', 'desc');

        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getUserQuestions,
};
