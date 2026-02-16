const db = require('../db/db');

/**
 * Streak Service — Tracks daily login streaks and awards bonuses
 */

/**
 * Record a daily login and calculate streak
 * @param {number} userId
 * @returns {{ streak: number, bestStreak: number, bonusAwarded: boolean, bonusPoints: number }}
 */
async function recordDailyLogin(userId) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if already logged in today
    const existing = await db('daily_activity')
        .where({ user_id: userId, login_date: today })
        .first();

    if (existing) {
        // Already recorded today — just return current streak
        const user = await db('users').where('id', userId).select('login_streak', 'best_streak').first();
        return {
            streak: user?.login_streak || 0,
            bestStreak: user?.best_streak || 0,
            bonusAwarded: false,
            bonusPoints: 0,
            alreadyRecorded: true
        };
    }

    // Insert today's login
    await db('daily_activity').insert({
        user_id: userId,
        login_date: today,
        created_at: new Date()
    });

    // Check if yesterday was recorded (streak continuation)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayLogin = await db('daily_activity')
        .where({ user_id: userId, login_date: yesterdayStr })
        .first();

    const user = await db('users').where('id', userId).select('login_streak', 'best_streak').first();
    let currentStreak = user?.login_streak || 0;
    let bestStreak = user?.best_streak || 0;

    if (yesterdayLogin) {
        // Continue streak
        currentStreak += 1;
    } else {
        // Reset streak
        currentStreak = 1;
    }

    // Update best streak
    if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
    }

    // Update user
    await db('users').where('id', userId).update({
        login_streak: currentStreak,
        best_streak: bestStreak,
        last_login_date: today
    });

    // Award streak bonuses
    let bonusPoints = 0;
    let bonusType = null;

    if (currentStreak === 7) {
        bonusPoints = 5;
        bonusType = 'streak_7_day';
    } else if (currentStreak === 30) {
        bonusPoints = 15;
        bonusType = 'streak_30_day';
    } else if (currentStreak > 0 && currentStreak % 7 === 0) {
        bonusPoints = 5;
        bonusType = 'streak_weekly_bonus';
    }

    // Award daily login point
    const dailyPoints = 1;
    await db('users').where('id', userId).increment('reputation_score', dailyPoints);
    await db('reputation_log').insert({
        user_id: userId,
        action_type: 'daily_login',
        points: dailyPoints,
        created_at: new Date()
    });

    // Award streak bonus if applicable
    if (bonusPoints > 0) {
        await db('users').where('id', userId).increment('reputation_score', bonusPoints);
        await db('reputation_log').insert({
            user_id: userId,
            action_type: bonusType,
            points: bonusPoints,
            created_at: new Date()
        });
    }

    return {
        streak: currentStreak,
        bestStreak,
        bonusAwarded: bonusPoints > 0,
        bonusPoints: dailyPoints + bonusPoints,
        bonusType,
        alreadyRecorded: false
    };
}

/**
 * Get user's streak data
 */
async function getStreakData(userId) {
    const user = await db('users')
        .where('id', userId)
        .select('login_streak', 'best_streak', 'last_login_date')
        .first();

    // Get last 30 days of activity for calendar display
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await db('daily_activity')
        .where('user_id', userId)
        .where('login_date', '>=', thirtyDaysAgo.toISOString().split('T')[0])
        .orderBy('login_date', 'asc')
        .pluck('login_date');

    return {
        currentStreak: user?.login_streak || 0,
        bestStreak: user?.best_streak || 0,
        lastLoginDate: user?.last_login_date,
        recentActivity: recentActivity || []
    };
}

module.exports = {
    recordDailyLogin,
    getStreakData
};
