const db = require('../db/db');
const { awardPoints, POINT_VALUES } = require('../services/pointsService');

/**
 * @desc    Like/Unlike an answer
 * @route   POST /api/answers/:id/like
 * @access  Private
 */
const toggleAnswerLike = async (req, res) => {
    const { id: answerId } = req.params;
    const userId = req.user.id;

    try {
        // Check if answer exists
        const answer = await db('answers')
            .where({ id: answerId })
            .whereNull('deleted_at')
            .first();

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        // Check if user already liked this answer
        const existingLike = await db('answer_likes')
            .where({ answer_id: answerId, user_id: userId })
            .first();

        if (existingLike) {
            // Unlike: Remove the like
            await db('answer_likes')
                .where({ answer_id: answerId, user_id: userId })
                .del();

            // Decrement upvotes count
            await db('answers')
                .where({ id: answerId })
                .decrement('upvotes', 1);

            // Remove points from answer author (reverse the award)
            await awardPoints(
                answer.user_id,
                -POINT_VALUES.RECEIVE_LIKE_ON_ANSWER,
                'unlike_received',
                answerId,
                'answer'
            );

            // Get updated like count
            const likeCount = await db('answer_likes')
                .where({ answer_id: answerId })
                .count('* as count')
                .first();

            return res.json({
                liked: false,
                likeCount: likeCount.count,
                message: 'Answer unliked'
            });
        } else {
            // Like: Add the like
            await db('answer_likes').insert({
                answer_id: answerId,
                user_id: userId,
                created_at: new Date()
            });

            // Increment upvotes count
            await db('answers')
                .where({ id: answerId })
                .increment('upvotes', 1);

            // Award points to answer author (not to the liker)
            if (answer.user_id !== userId) {
                await awardPoints(
                    answer.user_id,
                    POINT_VALUES.RECEIVE_LIKE_ON_ANSWER,
                    'like_received',
                    answerId,
                    'answer'
                );
            }

            // Get updated like count
            const likeCount = await db('answer_likes')
                .where({ answer_id: answerId })
                .count('* as count')
                .first();

            return res.json({
                liked: true,
                likeCount: likeCount.count,
                message: 'Answer liked'
            });
        }
    } catch (error) {
        console.error('Error toggling answer like:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Get likes for an answer
 * @route   GET /api/answers/:id/likes
 * @access  Public
 */
const getAnswerLikes = async (req, res) => {
    const { id: answerId } = req.params;

    try {
        const likes = await db('answer_likes')
            .join('users', 'answer_likes.user_id', 'users.id')
            .where({ answer_id: answerId })
            .select('users.id', 'users.name', 'users.avatar_url', 'answer_likes.created_at')
            .orderBy('answer_likes.created_at', 'desc');

        const likeCount = likes.length;

        res.json({ likes, likeCount });
    } catch (error) {
        console.error('Error getting answer likes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Check if user liked an answer
 * @route   GET /api/answers/:id/liked
 * @access  Private
 */
const checkAnswerLiked = async (req, res) => {
    const { id: answerId } = req.params;
    const userId = req.user.id;

    try {
        const like = await db('answer_likes')
            .where({ answer_id: answerId, user_id: userId })
            .first();

        res.json({ liked: !!like });
    } catch (error) {
        console.error('Error checking answer like:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Like/Unlike a question
 * @route   POST /api/questions/:id/like
 * @access  Private
 */
const toggleQuestionLike = async (req, res) => {
    const { id: questionId } = req.params;
    const userId = req.user.id;

    try {
        // Check if question exists
        const question = await db('questions')
            .where({ id: questionId })
            .whereNull('deleted_at')
            .first();

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check if user already liked this question
        const existingLike = await db('question_likes')
            .where({ question_id: questionId, user_id: userId })
            .first();

        if (existingVote) {
            if (existingVote.vote_type === 'like') {
                // Unlike
                await db('question_likes')
                    .where({ id: existingVote.id })
                    .del();

                await db('questions')
                    .where({ id: questionId })
                    .decrement('upvotes', 1);

                // Remove points from question author
                await awardPoints(
                    question.user_id,
                    -POINT_VALUES.RECEIVE_LIKE_ON_QUESTION,
                    'question_unlike_received',
                    questionId,
                    'question'
                );

                const likeCount = await db('question_likes')
                    .where({ question_id: questionId, vote_type: 'like' })
                    .count('* as count')
                    .first();

                return res.json({
                    liked: false,
                    likeCount: likeCount.count,
                    message: 'Question unliked'
                });
            } else {
                // Change dislike to like
                await db('question_likes')
                    .where({ id: existingVote.id })
                    .update({ vote_type: 'like' });

                await db('questions')
                    .where({ id: questionId })
                    .increment('upvotes', 1);

                await db('questions')
                    .where({ id: questionId })
                    .decrement('downvotes', 1);

                // Award points to question author
                if (question.user_id !== userId) {
                    await awardPoints(
                        question.user_id,
                        POINT_VALUES.RECEIVE_LIKE_ON_QUESTION,
                        'question_like_received',
                        questionId,
                        'question'
                    );
                }

                const likeCount = await db('question_likes')
                    .where({ question_id: questionId, vote_type: 'like' })
                    .count('* as count')
                    .first();

                return res.json({
                    liked: true,
                    likeCount: likeCount.count,
                    message: 'Question liked'
                });
            }
        } else {
            // New Like
            await db('question_likes').insert({
                question_id: questionId,
                user_id: userId,
                created_at: new Date(),
                vote_type: 'like'
            });

            await db('questions')
                .where({ id: questionId })
                .increment('upvotes', 1);

            // Award points to question author
            if (question.user_id !== userId) {
                await awardPoints(
                    question.user_id,
                    POINT_VALUES.RECEIVE_LIKE_ON_QUESTION,
                    'question_like_received',
                    questionId,
                    'question'
                );
            }

            const likeCount = await db('question_likes')
                .where({ question_id: questionId, vote_type: 'like' })
                .count('* as count')
                .first();

            return res.json({
                liked: true,
                likeCount: likeCount.count,
                message: 'Question liked'
            });
        }
    } catch (error) {
        console.error('Error toggling question like:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Dislike/Undislike a question
 * @route   POST /api/questions/:id/dislike
 * @access  Private
 */
const toggleQuestionDislike = async (req, res) => {
    const { id: questionId } = req.params;
    const userId = req.user.id;

    try {
        const question = await db('questions')
            .where({ id: questionId })
            .whereNull('deleted_at')
            .first();

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const existingVote = await db('question_likes')
            .where({ question_id: questionId, user_id: userId })
            .first();

        if (existingVote) {
            if (existingVote.vote_type === 'dislike') {
                // Remove dislike
                await db('question_likes')
                    .where({ id: existingVote.id })
                    .del();

                await db('questions')
                    .where({ id: questionId })
                    .decrement('downvotes', 1);

                return res.json({ disliked: false, message: 'Question dislike removed' });
            } else {
                // Change like to dislike
                await db('question_likes')
                    .where({ id: existingVote.id })
                    .update({ vote_type: 'dislike' });

                await db('questions')
                    .where({ id: questionId })
                    .increment('downvotes', 1);

                await db('questions')
                    .where({ id: questionId })
                    .decrement('upvotes', 1);

                // Remove points previously awarded for like
                await awardPoints(
                    question.user_id,
                    -POINT_VALUES.RECEIVE_LIKE_ON_QUESTION,
                    'question_unlike_received',
                    questionId,
                    'question'
                );

                return res.json({ disliked: true, message: 'Question disliked' });
            }
        } else {
            // New dislike
            await db('question_likes').insert({
                question_id: questionId,
                user_id: userId,
                created_at: new Date(),
                vote_type: 'dislike'
            });

            await db('questions')
                .where({ id: questionId })
                .increment('downvotes', 1);

            return res.json({ disliked: true, message: 'Question disliked' });
        }
    } catch (error) {
        console.error('Error toggling question dislike:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    toggleAnswerLike,
    getAnswerLikes,
    checkAnswerLiked,
    toggleQuestionLike,
    toggleQuestionDislike
};
