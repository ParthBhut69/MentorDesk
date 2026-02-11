const db = require('../db/db');

// Check and award badges for a user
<<<<<<< HEAD
const checkAndAwardBadges = async (userId, trx = null) => {
    try {
        const queryBuilder = trx || db;

        // Get user stats
        const user = await queryBuilder('users').where('id', userId).first();
        if (!user) {
            console.warn(`Badge check skipped: User ${userId} not found`);
            return [];
        }

        const questionsCount = await queryBuilder('questions').where('user_id', userId).count('id as count').first();
        const answersCount = await queryBuilder('answers').where('user_id', userId).count('id as count').first();
        const acceptedAnswersCount = await queryBuilder('answers').where({ user_id: userId, is_accepted: true }).count('id as count').first();

        const stats = {
            points: user.points || 0,
            questions: parseInt(questionsCount?.count || 0),
            answers: parseInt(answersCount?.count || 0),
            accepted_answers: parseInt(acceptedAnswersCount?.count || 0),
=======
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
>>>>>>> 33adee00930a83695ade63f74cc84e6502792cbb
            followers: user.follower_count || 0
        };

        // Get all badges
<<<<<<< HEAD
        const allBadges = await queryBuilder('badges').select('*');

        // Get already earned badges
        const earnedBadgeIds = await queryBuilder('user_badges')
=======
        const allBadges = await db('badges').select('*');

        // Get already earned badges
        const earnedBadgeIds = await db('user_badges')
>>>>>>> 33adee00930a83695ade63f74cc84e6502792cbb
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
<<<<<<< HEAD
                await queryBuilder('user_badges').insert({
=======
                await db('user_badges').insert({
>>>>>>> 33adee00930a83695ade63f74cc84e6502792cbb
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
