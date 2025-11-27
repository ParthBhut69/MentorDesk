const db = require('../db/db');
const { awardPoints, REWARDS } = require('./rewardController');
const { createNotification } = require('./notificationController');

// Upvote or downvote a question or answer
const vote = async (req, res) => {
    try {
        const { votable_type, votable_id, vote_type } = req.body;
        const user_id = req.user.id;

        // Check if user already voted
        const existingVote = await db('votes')
            .where({ user_id, votable_type, votable_id })
            .first();

        if (existingVote) {
            // If same vote type, remove vote (toggle)
            if (existingVote.vote_type === vote_type) {
                await db('votes').where('id', existingVote.id).del();

                // Decrement vote count
                const table = votable_type === 'question' ? 'questions' : 'answers';
                await db(table).where('id', votable_id).decrement('upvotes', 1);

                return res.json({ message: 'Vote removed', action: 'removed' });
            } else {
                // Change vote type
                await db('votes').where('id', existingVote.id).update({ vote_type });

                // Update vote count (decrement old, increment new)
                const table = votable_type === 'question' ? 'questions' : 'answers';
                const change = vote_type === 'upvote' ? 2 : -2;
                await db(table).where('id', votable_id).increment('upvotes', change);

                return res.json({ message: 'Vote updated', action: 'updated' });
            }
        }

        // Create new vote
        await db('votes').insert({
            user_id,
            votable_type,
            votable_id,
            vote_type
        });

        // Increment vote count
        const table = votable_type === 'question' ? 'questions' : 'answers';
        const change = vote_type === 'upvote' ? 1 : -1;
        await db(table).where('id', votable_id).increment('upvotes', change);

        // Award points if upvoting an answer
        let rewardResult = null;
        if (votable_type === 'answer' && vote_type === 'upvote') {
            const answer = await db('answers').where('id', votable_id).first();
            if (answer) {
                rewardResult = await awardPoints(
                    answer.user_id,
                    'answer_upvoted',
                    REWARDS.ANSWER_UPVOTED,
                    votable_id
                );

                // Create notification
                await createNotification(
                    answer.user_id,
                    'answer_upvoted',
                    'Your answer received an upvote!',
                    votable_id,
                    'answer'
                );
            }
        }

        res.json({
            message: 'Vote added',
            action: 'added',
            reward: rewardResult
        });
    } catch (error) {
        console.error('Error voting:', error);
        res.status(500).json({ message: 'Failed to vote' });
    }
};

// Get user's vote status for an item
const getVoteStatus = async (req, res) => {
    try {
        const { votable_type, votable_id } = req.query;
        const user_id = req.user.id;

        const vote = await db('votes')
            .where({ user_id, votable_type, votable_id })
            .first();

        res.json({ vote: vote ? vote.vote_type : null });
    } catch (error) {
        console.error('Error getting vote status:', error);
        res.status(500).json({ message: 'Failed to get vote status' });
    }
};

// Add comment to answer
const addComment = async (req, res) => {
    try {
        const { answer_id, comment_text } = req.body;
        const user_id = req.user.id;

        const [id] = await db('comments').insert({
            answer_id,
            user_id,
            comment_text
        });

        const comment = await db('comments')
            .where('comments.id', id)
            .join('users', 'comments.user_id', 'users.id')
            .select('comments.*', 'users.name as user_name')
            .first();

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Failed to add comment' });
    }
};

// Get comments for an answer
const getComments = async (req, res) => {
    try {
        const { answer_id } = req.params;

        const comments = await db('comments')
            .where('answer_id', answer_id)
            .join('users', 'comments.user_id', 'users.id')
            .select('comments.*', 'users.name as user_name')
            .orderBy('comments.created_at', 'asc');

        res.json(comments);
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ message: 'Failed to get comments' });
    }
};

// Delete comment
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const comment = await db('comments').where('id', id).first();

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user_id !== user_id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await db('comments').where('id', id).del();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
};

// Bookmark a question
const bookmarkQuestion = async (req, res) => {
    try {
        const { question_id } = req.body;
        const user_id = req.user.id;

        // Check if already bookmarked
        const existing = await db('bookmarks')
            .where({ user_id, question_id })
            .first();

        if (existing) {
            // Remove bookmark (toggle)
            await db('bookmarks').where('id', existing.id).del();
            return res.json({ message: 'Bookmark removed', bookmarked: false });
        }

        // Add bookmark
        await db('bookmarks').insert({ user_id, question_id });
        res.json({ message: 'Question bookmarked', bookmarked: true });
    } catch (error) {
        console.error('Error bookmarking:', error);
        res.status(500).json({ message: 'Failed to bookmark question' });
    }
};

// Get user's bookmarks
const getBookmarks = async (req, res) => {
    try {
        const user_id = req.user.id;

        const bookmarks = await db('bookmarks')
            .where('bookmarks.user_id', user_id)
            .join('questions', 'bookmarks.question_id', 'questions.id')
            .join('users', 'questions.user_id', 'users.id')
            .select(
                'questions.*',
                'users.name as author_name',
                'bookmarks.created_at as bookmarked_at'
            )
            .orderBy('bookmarks.created_at', 'desc');

        res.json(bookmarks);
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        res.status(500).json({ message: 'Failed to get bookmarks' });
    }
};

// Check if question is bookmarked
const checkBookmark = async (req, res) => {
    try {
        const { question_id } = req.params;
        const user_id = req.user.id;

        const bookmark = await db('bookmarks')
            .where({ user_id, question_id })
            .first();

        res.json({ bookmarked: !!bookmark });
    } catch (error) {
        console.error('Error checking bookmark:', error);
        res.status(500).json({ message: 'Failed to check bookmark' });
    }
};

// Mark answer as accepted
const acceptAnswer = async (req, res) => {
    try {
        const { answer_id } = req.body;
        const user_id = req.user.id;

        // Get the answer and its question
        const answer = await db('answers')
            .where('answers.id', answer_id)
            .join('questions', 'answers.question_id', 'questions.id')
            .select('answers.*', 'questions.user_id as question_owner_id')
            .first();

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        // Only question owner can accept answers
        if (answer.question_owner_id !== user_id) {
            return res.status(403).json({ message: 'Only question owner can accept answers' });
        }

        // Unmark any previously accepted answer for this question
        await db('answers')
            .where('question_id', answer.question_id)
            .update({ is_accepted: false });

        // Mark this answer as accepted
        await db('answers')
            .where('id', answer_id)
            .update({ is_accepted: true });

        // Award points to answer author
        const rewardResult = await awardPoints(
            answer.user_id,
            'answer_accepted',
            REWARDS.ANSWER_ACCEPTED,
            answer_id
        );

        // Create notification
        await createNotification(
            answer.user_id,
            'answer_accepted',
            'Your answer was accepted!',
            answer_id,
            'answer'
        );

        res.json({
            message: 'Answer marked as accepted',
            reward: rewardResult
        });
    } catch (error) {
        console.error('Error accepting answer:', error);
        res.status(500).json({ message: 'Failed to accept answer' });
    }
};

module.exports = {
    vote,
    getVoteStatus,
    addComment,
    getComments,
    deleteComment,
    bookmarkQuestion,
    getBookmarks,
    checkBookmark,
    acceptAnswer
};
