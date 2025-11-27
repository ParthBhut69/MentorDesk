const db = require('../db/db');

// Rank thresholds
const RANKS = {
    'Beginner': { min: 0, max: 100 },
    'Contributor': { min: 100, max: 300 },
    'Helper': { min: 300, max: 700 },
    'Mentor': { min: 700, max: 1500 },
    'Expert': { min: 1500, max: 100000 },
    'Admin': { min: 100000, max: Infinity }
};

// Reward points
const REWARDS = {
    ANSWER_POSTED: 10,
    ANSWER_UPVOTED: 5,
    ANSWER_ACCEPTED: 2
};

// Calculate rank based on points
const calculateRank = (points) => {
    for (const [rank, threshold] of Object.entries(RANKS)) {
        if (points >= threshold.min && points < threshold.max) {
            return rank;
        }
    }
    return 'Admin';
};

// Award points to user
const awardPoints = async (userId, actionType, pointsAwarded, relatedId = null) => {
    try {
        // Add points to user
        await db('users')
            .where('id', userId)
            .increment('points', pointsAwarded);

        // Get updated points
        const user = await db('users').where('id', userId).first();

        // Update rank based on new points
        const newRank = calculateRank(user.points);
        if (user.rank !== newRank) {
            await db('users')
                .where('id', userId)
                .update({ rank: newRank });
        }

        // Log the reward
        await db('rewards_log').insert({
            user_id: userId,
            action_type: actionType,
            points_awarded: pointsAwarded,
            related_id: relatedId
        });

        return {
            points: user.points + pointsAwarded,
            rank: newRank,
            pointsAwarded
        };
    } catch (error) {
        console.error('Error awarding points:', error);
        throw error;
    }
};

// Get user's reward history
const getUserRewards = async (req, res) => {
    try {
        const { userId } = req.params;

        const rewards = await db('rewards_log')
            .where('user_id', userId)
            .orderBy('created_at', 'desc')
            .limit(50);

        res.json(rewards);
    } catch (error) {
        console.error('Error getting rewards:', error);
        res.status(500).json({ message: 'Failed to get rewards' });
    }
};

// Get leaderboard (top users by points)
const getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const leaderboard = await db('users')
            .select('id', 'name', 'points', 'rank', 'is_verified_expert')
            .orderBy('points', 'desc')
            .limit(limit);

        res.json(leaderboard);
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ message: 'Failed to get leaderboard' });
    }
};

// Get user profile with points and rank
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await db('users')
            .where('id', userId)
            .select(
                'id',
                'name',
                'email',
                'bio',
                'location',
                'website',
                'linkedin',
                'twitter',
                'github',
                'avatar_url as avatarUrl',
                'points',
                'rank',
                'is_verified_expert',
                'expert_role',
                'follower_count',
                'created_at'
            )
            .first();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's answer count
        const answerCount = await db('answers')
            .where('user_id', userId)
            .count('id as count')
            .first();

        // Get user's question count
        const questionCount = await db('questions')
            .where('user_id', userId)
            .count('id as count')
            .first();

        // Get accepted answers count
        const acceptedCount = await db('answers')
            .where({ user_id: userId, is_accepted: true })
            .count('id as count')
            .first();

        // Get following count
        const followingCount = await db('follows')
            .where('follower_id', userId)
            .count('id as count')
            .first();

        res.json({
            ...user,
            following_count: followingCount.count,
            stats: {
                answers: answerCount.count,
                questions: questionCount.count,
                accepted_answers: acceptedCount.count
            }
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ message: 'Failed to get user profile' });
    }
};

module.exports = {
    awardPoints,
    calculateRank,
    getUserRewards,
    getLeaderboard,
    getUserProfile,
    REWARDS,
    RANKS
};
