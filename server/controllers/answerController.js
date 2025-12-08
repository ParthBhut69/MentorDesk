const db = require('../db/db');
const { awardPoints, REWARDS } = require('./rewardController');
const { createNotification } = require('./notificationController');
const { notifyAnswerPosted, notifyAnswerLiked, notifyAnswerAccepted } = require('../services/notificationService');
const { logActivityForQuestionTopics } = require('../services/activityLogger');

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
        const result = await db.transaction(async (trx) => {
            const question = await trx('questions').where({ id: question_id }).first();
            if (!question) {
                throw new Error('Question not found');
            }

            const [id] = await trx('answers').insert({
                question_id,
                user_id: req.user.id,
                answer_text,
            });

            const answer = await trx('answers').where({ id }).first();

            // Award points for posting answer
            const rewardResult = await awardPoints(
                req.user.id,
                'answer_posted',
                REWARDS.ANSWER_POSTED,
                id,
                trx
            );

            // Log reply activity for all question topics
            // Note: logActivityForQuestionTopics might need update to support trx, but it's less critical if it fails independently.
            // For now, we keep it outside or assume it handles itself.
            // Ideally, we should pass trx to it too.

            return { answer, rewardResult };
        });

        // Perform non-critical side effects AFTER transaction commits
        await logActivityForQuestionTopics(question_id, req.user.id, 'reply', { answerId: result.answer.id });

        // Create notification for question author using enhanced service
        const author = await db('users').where({ id: req.user.id }).first();
        const question = await db('questions').where({ id: question_id }).first();
        await notifyAnswerPosted(result.answer, question, author);

        res.status(201).json({
            ...result.answer,
            reward: result.rewardResult
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'Question not found') {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get answers for a question
// @route   GET /api/questions/:id/answers
// @access  Public
const getAnswersByQuestionId = async (req, res) => {
    try {
        const answers = await db('answers')
            .leftJoin('users', 'answers.user_id', 'users.id')
            .select(
                'answers.*',
                db.raw('COALESCE(users.name, \'[Deleted User]\') as user_name'),
                db.raw('COALESCE(users.avatar_url, null) as user_avatar'),
                db.raw('COALESCE(users.is_verified_expert, false) as is_verified_expert'),
                db.raw('COALESCE(users.expert_role, null) as expert_role')
            )
            .where({ question_id: req.params.id })
            .whereNull('answers.deleted_at')  // Exclude soft-deleted answers
            .orderBy('answers.created_at', 'asc');
        res.json(answers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete answer (SOFT DELETE)
// @route   DELETE /api/answers/:id
// @access  Private
const deleteAnswer = async (req, res) => {
    try {
        const answer = await db('answers')
            .where({ id: req.params.id })
            .whereNull('deleted_at')  // Already deleted check
            .first();

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        // Check user or admin
        if (answer.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // SOFT DELETE instead of hard delete
        await db('answers')
            .where({ id: req.params.id })
            .update({
                deleted_at: db.fn.now(),
                deleted_by: req.user.id
            });

        console.log(`Answer ${req.params.id} soft-deleted by user ${req.user.id}`);
        res.json({ id: req.params.id, message: 'Answer deleted successfully' });
    } catch (error) {
        console.error('Error deleting answer:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Vote on an answer (upvote/downvote)
// @route   POST /api/answers/:id/vote
// @access  Private
const voteAnswer = async (req, res) => {
    try {
        const { vote_type } = req.body; // 'upvote' or 'downvote'
        const answerId = req.params.id;

        const answer = await db('answers')
            .where({ id: answerId })
            .whereNull('deleted_at')  // Don't allow voting on deleted answers
            .first();
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        // Check if user already voted
        const existingVote = await db('votes')
            .where({
                user_id: req.user.id,
                votable_type: 'answer',
                votable_id: answerId
            })
            .first();

        if (existingVote) {
            if (existingVote.vote_type === vote_type) {
                // Remove vote
                await db('votes').where({ id: existingVote.id }).del();
                const change = vote_type === 'upvote' ? -1 : 1;
                await db('answers').where({ id: answerId }).increment('upvotes', change);
            } else {
                // Change vote
                await db('votes').where({ id: existingVote.id }).update({ vote_type });
                const change = vote_type === 'upvote' ? 2 : -2;
                await db('answers').where({ id: answerId }).increment('upvotes', change);
            }
        } else {
            // New vote
            await db('votes').insert({
                user_id: req.user.id,
                votable_type: 'answer',
                votable_id: answerId,
                vote_type
            });
            const change = vote_type === 'upvote' ? 1 : -1;
            await db('answers').where({ id: answerId }).increment('upvotes', change);

            // Notify answer author if upvoted
            if (vote_type === 'upvote' && answer.user_id !== req.user.id) {
                const question = await db('questions').where({ id: answer.question_id }).first();
                const liker = await db('users').where({ id: req.user.id }).first();
                await notifyAnswerLiked(answer, liker, question);

                // Log like activity for question topics
                await logActivityForQuestionTopics(answer.question_id, req.user.id, 'like', { answerId });
            }
        }

        const updatedAnswer = await db('answers').where({ id: answerId }).first();
        res.json(updatedAnswer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Accept an answer
// @route   PUT /api/answers/:id/accept
// @access  Private
const acceptAnswer = async (req, res) => {
    try {
        const answerId = req.params.id;
        const answer = await db('answers').where({ id: answerId }).first();

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        const question = await db('questions').where({ id: answer.question_id }).first();

        // Only question author can accept
        if (question.user_id !== req.user.id) {
            return res.status(401).json({ message: 'Only question author can accept answers' });
        }

        // Unaccept other answers for this question
        await db('answers')
            .where({ question_id: question.id })
            .update({ is_accepted: false });

        // Accept this answer
        await db('answers')
            .where({ id: answerId })
            .update({ is_accepted: true });

        // Award points for accepted answer
        await awardPoints(answer.user_id, 'answer_accepted', REWARDS.ANSWER_ACCEPTED, answerId);

        // Notify answer author
        await notifyAnswerAccepted(answer, question);

        const updatedAnswer = await db('answers').where({ id: answerId }).first();
        res.json(updatedAnswer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createAnswer,
    getAnswersByQuestionId,
    deleteAnswer,
    voteAnswer,
    acceptAnswer
};
