const db = require('../db/db');
const { awardPoints, REWARDS } = require('./rewardController');
const { createNotification } = require('./notificationController');

// @desc    Create an answer
// @route   POST /api/questions/:id/answers
// @access  Private
const createAnswer = async (req, res) => {
    const { answer_text } = req.body;
    const question_id = req.params.id;

    if (!answer_text) {
        return res.status(400).json({ message: 'Please add answer text' });
    }

    try {
        const question = await db('questions').where({ id: question_id }).first();
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const [id] = await db('answers').insert({
            question_id,
            user_id: req.user.id,
            answer_text,
        });

        const answer = await db('answers').where({ id }).first();

        // Award points for posting answer
        const rewardResult = await awardPoints(
            req.user.id,
            'answer_posted',
            REWARDS.ANSWER_POSTED,
            id
        );

        // Create notification for question author
        if (question.user_id !== req.user.id) {
            await createNotification(
                question.user_id,
                'new_answer',
                `${req.user.name} answered your question: "${question.title}"`,
                id,
                'answer'
            );
        }

        res.status(201).json({
            ...answer,
            reward: rewardResult
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get answers for a question
// @route   GET /api/questions/:id/answers
// @access  Public
const getAnswersByQuestionId = async (req, res) => {
    try {
        const answers = await db('answers')
            .join('users', 'answers.user_id', 'users.id')
            .select('answers.*', 'users.name as user_name', 'users.avatar_url as user_avatar')
            .where({ question_id: req.params.id })
            .orderBy('answers.created_at', 'asc');
        res.json(answers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete answer
// @route   DELETE /api/answers/:id
// @access  Private
const deleteAnswer = async (req, res) => {
    try {
        const answer = await db('answers').where({ id: req.params.id }).first();

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        // Check user
        if (answer.user_id !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await db('answers').where({ id: req.params.id }).del();
        res.json({ id: req.params.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createAnswer,
    getAnswersByQuestionId,
    deleteAnswer,
};
