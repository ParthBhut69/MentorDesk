const db = require('../db/db');

/**
 * Points Service - Handles all point calculations and tracking
 */

const POINT_VALUES = {
    ASK_QUESTION: 5,
    GIVE_ANSWER: 5,
    RECEIVE_LIKE_ON_ANSWER: 2,
    RECEIVE_LIKE_ON_QUESTION: 1,
    ACCEPTED_ANSWER: 15,
    // Negative points for spam/abuse (future use)
    SPAM_PENALTY: -10
};

/**
 * Award points to a user and log the transaction
 * @param {number} userId - User ID to award points to
 * @param {number} points - Number of points (can be negative)
 * @param {string} action - Action that triggered the points
 * @param {number} referenceId - ID of related entity (question/answer/like)
 * @param {string} referenceType - Type of reference ('question', 'answer', 'like')
 */
async function awardPoints(userId, points, action, referenceId = null, referenceType = null, trx = null) {
    try {
        const queryBuilder = trx || db;

        // Update user's total points
        await queryBuilder('users')
            .where({ id: userId })
            .increment('points', points);

        // Log the transaction in points_history
        await queryBuilder('points_history').insert({
            user_id: userId,
            points,
            action,
            reference_id: referenceId,
            reference_type: referenceType,
            created_at: new Date()
        });

        // Get updated user points
        const user = await queryBuilder('users')
            .where({ id: userId })
            .select('points', 'xp', 'level')
            .first();

        // Also update XP (could have different rules)
        await updateUserLevel(userId, user.points, queryBuilder);

        return user;
    } catch (error) {
        console.error('Error awarding points:', error);
        throw error;
    }
}

/**
 * Update user level based on points
 * @param {number} userId 
 * @param {number} currentPoints 
 */
async function updateUserLevel(userId, currentPoints, trx = null) {
    const queryBuilder = trx || db;
    let newLevel = 1;
    let newRank = 'Beginner';

    // Level calculation based on points
    if (currentPoints >= 1500) {
        newLevel = 10;
        newRank = 'Legend';
    } else if (currentPoints >= 1000) {
        newLevel = 9;
        newRank = 'Expert';
    } else if (currentPoints >= 500) {
        newLevel = 7;
        newRank = 'Advanced';
    } else if (currentPoints >= 250) {
        newLevel = 5;
        newRank = 'Intermediate';
    } else if (currentPoints >= 100) {
        newLevel = 3;
        newRank = 'Contributor';
    } else if (currentPoints >= 50) {
        newLevel = 2;
        newRank = 'Beginner';
    }

    await queryBuilder('users')
        .where({ id: userId })
        .update({
            level: newLevel,
            rank: newRank,
            xp: currentPoints // Sync XP with points for now
        });
}

/**
 * Get user's points history
 * @param {number} userId 
 * @param {number} limit 
 */
async function getPointsHistory(userId, limit = 50) {
    return await db('points_history')
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .limit(limit);
}

/**
 * Get leaderboard (top users by points)
 * @param {number} limit 
 */
async function getLeaderboard(limit = 10) {
    return await db('users')
        .select('id', 'name', 'avatar_url', 'points', 'level', 'rank', 'is_verified_expert')
        .whereNull('deleted_at')
        .orderBy('points', 'desc')
        .limit(limit);
}

module.exports = {
    POINT_VALUES,
    awardPoints,
    updateUserLevel,
    getPointsHistory,
    getLeaderboard
};
