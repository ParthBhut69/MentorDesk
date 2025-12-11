const db = require('../db/db');

// Check and award badges for a user
const checkAndAwardBadges = async (userId) => {
    try {
        // Get user stats
        const user = await db('users').where('id', userId).first();
        const questionsCount = await db('questions').where('user_id', userId).count('id as count').first();
        const answersCount = await db('answers').where('user_id', userId).count('id as count').first();
        const acceptedAnswersCount = await db('answers').where({ user_id: userId, is_accepted: true }).count('id as count').first();

        const stats = {
            points: user.points || 0,
            questions: parseInt(questionsCount.count || 0),
            answers: parseInt(answersCount.count || 0),
            accepted_answers: parseInt(acceptedAnswersCount.count || 0),
            followers: user.follower_count || 0
        };

        // Get all badges
        const allBadges = await db('badges').select('*');

        // Get already earned badges
        const earnedBadgeIds = await db('user_badges')
            .where('user_id', userId)
            .pluck('badge_id');

        const newBadges = [];

        // Check each badge
        for (const badge of allBadges) {
            // Skip if already earned
            if (earnedBadgeIds.includes(badge.id)) {
                continue;
            }

            // Check if user meets requirement
            const userValue = stats[badge.requirement_type];
            if (userValue >= badge.requirement_value) {
                // Award badge
                await db('user_badges').insert({
                    user_id: userId,
                    badge_id: badge.id
                }).returning('id');
                newBadges.push(badge);
            }
        }

        return newBadges;
    } catch (error) {
        console.error('Error checking badges:', error);
        return [];
    }
};

// Get user's badges
const getUserBadges = async (req, res) => {
    try {
        const { userId } = req.params;

        const badges = await db('user_badges')
            .where('user_badges.user_id', userId)
            .join('badges', 'user_badges.badge_id', 'badges.id')
            .select('badges.*', 'user_badges.earned_at')
            .orderBy('user_badges.earned_at', 'desc');

        res.json(badges);
    } catch (error) {
        console.error('Error getting badges:', error);
        res.status(500).json({ message: 'Failed to get badges' });
    }
};

// Get all available badges
const getAllBadges = async (req, res) => {
    try {
        const badges = await db('badges')
            .select('*')
            .orderBy('requirement_value', 'asc');

        res.json(badges);
    } catch (error) {
        console.error('Error getting all badges:', error);
        res.status(500).json({ message: 'Failed to get badges' });
    }
};

module.exports = {
    checkAndAwardBadges,
    getUserBadges,
    getAllBadges
};
