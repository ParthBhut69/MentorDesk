const db = require('../db/db');
const { checkAndAwardBadges } = require('../controllers/badgeController');

/**
 * Gamification Service — Unified reputation engine for MentorDesk
 * Replaces fragmented logic in pointsService.js and rewardController.js
 */

// ── Tier Definitions ──
const TIERS = {
    'Contributor': { min: 0, max: 200, level: 1, discount: 0 },
    'Senior Contributor': { min: 200, max: 600, level: 2, discount: 0 },
    'Top Expert': { min: 600, max: 1200, level: 3, discount: 5 },
    'Elite Mentor': { min: 1200, max: 2500, level: 4, discount: 10 },
    'MentorDesk Authority': { min: 2500, max: Infinity, level: 5, discount: 20 },
};

// ── Reputation Point Values (weighted scoring) ──
const REPUTATION_ACTIONS = {
    ANSWER_UPVOTE: 10,
    ANSWER_ACCEPTED: 25,
    QUESTION_HIGH_ENGAGEMENT: 5,
    FAST_RESPONSE: 15,   // Response < 1 hour
    HIGH_QUALITY_RATING: 20,   // Quality rating >= 4
    DOWNVOTE_RECEIVED: -5,
    ASK_QUESTION: 5,
    POST_ANSWER: 10,
    FOLLOWER_GAINED: 3,
    DAILY_LOGIN: 1,
    STREAK_7_DAY: 5,
    STREAK_30_DAY: 15,
};

// ── Founder-specific point values ──
const FOUNDER_ACTIONS = {
    QUALITY_QUESTION: 15,
    ACCEPT_ANSWER: 5,
    WEEKLY_ACTIVITY: 10,
    HIGH_ENGAGEMENT_QUESTION: 20,
};

/**
 * Core function: Update a user's reputation and log the change
 * @param {number} userId
 * @param {string} actionType - Key describing what happened
 * @param {number} points - Reputation points (can be negative)
 * @param {number|null} relatedId - ID of related entity
 * @param {string|null} relatedType - Type of related entity ('question', 'answer', etc.)
 * @param {object|null} trx - Knex transaction object
 */
async function updateReputation(userId, actionType, points, relatedId = null, relatedType = null, trx = null) {
    const qb = trx || db;

    try {
        // Prevent duplicate reputation for the same action+entity
        if (relatedId && relatedType) {
            const existing = await qb('reputation_log')
                .where({
                    user_id: userId,
                    action_type: actionType,
                    related_object_id: relatedId,
                    related_object_type: relatedType
                })
                .first();

            if (existing) {
                return { duplicate: true, points: 0 };
            }
        }

        // Update reputation_score on user
        await qb('users')
            .where('id', userId)
            .increment('reputation_score', points);

        // Ensure reputation_score doesn't go below 0
        await qb('users')
            .where('id', userId)
            .where('reputation_score', '<', 0)
            .update({ reputation_score: 0 });

        // Log the reputation change
        await qb('reputation_log').insert({
            user_id: userId,
            action_type: actionType,
            points,
            related_object_type: relatedType,
            related_object_id: relatedId,
            created_at: new Date()
        });

        // Recalculate tier
        const tierResult = await updateTier(userId, qb);

        // Check for new badges
        let newBadges = [];
        try {
            newBadges = await checkAndAwardBadges(userId, trx);
        } catch (e) {
            console.error('[Gamification] Badge check error:', e.message);
        }

        return {
            duplicate: false,
            pointsAwarded: points,
            tier: tierResult.tier,
            tierChanged: tierResult.changed,
            newBadges
        };
    } catch (error) {
        console.error('[Gamification] updateReputation error:', error);
        throw error;
    }
}

/**
 * Recalculate and update user tier based on reputation_score
 */
async function updateTier(userId, qb = null) {
    const queryBuilder = qb || db;

    const user = await queryBuilder('users')
        .where('id', userId)
        .select('reputation_score', 'tier', 'booking_discount_percentage')
        .first();

    if (!user) return { tier: 'Contributor', changed: false };

    const score = user.reputation_score || 0;
    let newTier = 'Contributor';

    for (const [tierName, thresholds] of Object.entries(TIERS)) {
        if (score >= thresholds.min && score < thresholds.max) {
            newTier = tierName;
            break;
        }
    }

    const changed = user.tier !== newTier;
    if (changed) {
        const discount = TIERS[newTier]?.discount || 0;
        await queryBuilder('users')
            .where('id', userId)
            .update({
                tier: newTier,
                booking_discount_percentage: discount
            });

        console.log(`[Gamification] User ${userId} tier upgraded: ${user.tier} → ${newTier}`);
    }

    return { tier: newTier, changed, discount: TIERS[newTier]?.discount || 0 };
}

/**
 * Get progress to next tier
 */
async function getProgressToNextTier(userId) {
    const user = await db('users')
        .where('id', userId)
        .select('reputation_score', 'tier')
        .first();

    if (!user) return null;

    const score = user.reputation_score || 0;
    const currentTier = user.tier || 'Contributor';
    const tierEntries = Object.entries(TIERS);
    const currentIndex = tierEntries.findIndex(([name]) => name === currentTier);

    if (currentIndex === tierEntries.length - 1) {
        // Already at max tier
        return {
            currentTier,
            currentScore: score,
            nextTier: null,
            pointsNeeded: 0,
            percentage: 100,
            isMaxTier: true
        };
    }

    const [, currentThresholds] = tierEntries[currentIndex] || [, { min: 0, max: 200 }];
    const [nextTierName, nextThresholds] = tierEntries[currentIndex + 1] || ['Senior Contributor', { min: 200 }];

    const pointsInCurrentTier = score - currentThresholds.min;
    const tierRange = nextThresholds.min - currentThresholds.min;
    const percentage = Math.min(100, Math.round((pointsInCurrentTier / tierRange) * 100));

    return {
        currentTier,
        currentScore: score,
        nextTier: nextTierName,
        pointsNeeded: Math.max(0, nextThresholds.min - score),
        pointsInTier: pointsInCurrentTier,
        tierRange,
        percentage,
        isMaxTier: false
    };
}

/**
 * Calculate weekly score from reputation_log (last 7 days)
 */
async function calculateWeeklyScore(userId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await db('reputation_log')
        .where('user_id', userId)
        .where('created_at', '>=', sevenDaysAgo)
        .sum('points as total')
        .first();

    const weeklyScore = result?.total || 0;

    // Update user's cached weekly_score
    await db('users')
        .where('id', userId)
        .update({ weekly_score: weeklyScore });

    return weeklyScore;
}

/**
 * Update founder score (does NOT interfere with expert scoring)
 */
async function updateFounderScore(userId, actionType, points, trx = null) {
    const qb = trx || db;

    await qb('users')
        .where('id', userId)
        .increment('founder_score', points);

    // Also log in reputation_log for tracking
    await qb('reputation_log').insert({
        user_id: userId,
        action_type: `founder_${actionType}`,
        points,
        related_object_type: 'founder',
        created_at: new Date()
    });

    return { pointsAwarded: points, type: 'founder' };
}

/**
 * Get multi-tab leaderboard data
 */
async function getLeaderboard(tab = 'alltime', limit = 10) {
    switch (tab) {
        case 'weekly': {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            return await db('reputation_log')
                .select('users.id', 'users.name', 'users.avatar_url', 'users.tier',
                    'users.is_verified_expert', 'users.reputation_score')
                .sum('reputation_log.points as weekly_points')
                .join('users', 'reputation_log.user_id', 'users.id')
                .where('reputation_log.created_at', '>=', sevenDaysAgo)
                .groupBy('users.id', 'users.name', 'users.avatar_url', 'users.tier',
                    'users.is_verified_expert', 'users.reputation_score')
                .orderBy('weekly_points', 'desc')
                .limit(limit);
        }

        case 'monthly': {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            return await db('reputation_log')
                .select('users.id', 'users.name', 'users.avatar_url', 'users.tier',
                    'users.is_verified_expert', 'users.reputation_score')
                .sum('reputation_log.points as monthly_points')
                .join('users', 'reputation_log.user_id', 'users.id')
                .where('reputation_log.created_at', '>=', thirtyDaysAgo)
                .groupBy('users.id', 'users.name', 'users.avatar_url', 'users.tier',
                    'users.is_verified_expert', 'users.reputation_score')
                .orderBy('monthly_points', 'desc')
                .limit(limit);
        }

        case 'fastest': {
            return await db('users')
                .select('id', 'name', 'avatar_url', 'tier', 'is_verified_expert',
                    'reputation_score', 'response_speed_avg')
                .where('response_speed_avg', '>', 0)
                .orderBy('response_speed_avg', 'asc')
                .limit(limit);
        }

        case 'rising': {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            return await db('reputation_log')
                .select('users.id', 'users.name', 'users.avatar_url', 'users.tier',
                    'users.is_verified_expert', 'users.reputation_score')
                .sum('reputation_log.points as growth')
                .join('users', 'reputation_log.user_id', 'users.id')
                .where('reputation_log.created_at', '>=', thirtyDaysAgo)
                .groupBy('users.id', 'users.name', 'users.avatar_url', 'users.tier',
                    'users.is_verified_expert', 'users.reputation_score')
                .orderBy('growth', 'desc')
                .limit(limit);
        }

        case 'alltime':
        default: {
            return await db('users')
                .select('id', 'name', 'avatar_url', 'tier', 'is_verified_expert',
                    'reputation_score', 'points')
                .orderBy('reputation_score', 'desc')
                .limit(limit);
        }
    }
}

/**
 * Get user reputation history (paginated)
 */
async function getReputationHistory(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [history, countResult] = await Promise.all([
        db('reputation_log')
            .where('user_id', userId)
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset),
        db('reputation_log')
            .where('user_id', userId)
            .count('id as total')
            .first()
    ]);

    return {
        history,
        total: countResult?.total || 0,
        page,
        totalPages: Math.ceil((countResult?.total || 0) / limit)
    };
}

module.exports = {
    TIERS,
    REPUTATION_ACTIONS,
    FOUNDER_ACTIONS,
    updateReputation,
    updateTier,
    getProgressToNextTier,
    calculateWeeklyScore,
    updateFounderScore,
    getLeaderboard,
    getReputationHistory
};
