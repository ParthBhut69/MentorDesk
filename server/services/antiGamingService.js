const db = require('../db/db');

/**
 * Anti-Gaming Service — Protects against vote manipulation
 * 
 * Rules:
 * 1. Max 5 upvotes per user per day
 * 2. Cannot upvote same user repeatedly within 24h
 * 3. Detect mutual upvote patterns (A↔B)
 * 4. Prevent self-voting
 * 5. Log suspicious activity
 */

const DAILY_VOTE_LIMIT = 5;
const MAX_VOTES_SAME_USER_PER_DAY = 2;

/**
 * Validate whether a vote is allowed
 * @param {number} voterId - User casting the vote
 * @param {number} targetUserId - User who authored the content being voted on
 * @param {string} votableType - 'question' or 'answer'
 * @returns {{ allowed: boolean, reason: string|null }}
 */
async function validateVote(voterId, targetUserId, votableType) {
    try {
        // Rule 1: Self-voting prevention
        if (voterId === targetUserId) {
            await logSuspicious(voterId, 'self_vote_attempt',
                `Attempted to vote on own ${votableType}`, 'low');
            return { allowed: false, reason: 'You cannot vote on your own content.' };
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Rule 2: Daily vote limit
        const dailyVotes = await db('vote_limits')
            .where('user_id', voterId)
            .where('vote_date', today)
            .sum('vote_count as total')
            .first();

        if ((dailyVotes?.total || 0) >= DAILY_VOTE_LIMIT) {
            return {
                allowed: false,
                reason: `Daily vote limit reached (${DAILY_VOTE_LIMIT} votes/day). Try again tomorrow.`
            };
        }

        // Rule 3: Same-user vote limit per day
        const sameUserVotes = await db('vote_limits')
            .where({
                user_id: voterId,
                target_user_id: targetUserId,
                vote_date: today
            })
            .first();

        if (sameUserVotes && sameUserVotes.vote_count >= MAX_VOTES_SAME_USER_PER_DAY) {
            await logSuspicious(voterId, 'repeated_voting',
                `Exceeded daily vote limit for user ${targetUserId}`, 'medium');
            return {
                allowed: false,
                reason: 'You have reached the limit for voting on this user\'s content today.'
            };
        }

        // Rule 4: Mutual upvote pattern detection (A↔B)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const todayStr = today;

        const mutualVotes = await db('vote_limits')
            .where({
                user_id: targetUserId,
                target_user_id: voterId
            })
            .where('vote_date', '>=', sevenDaysAgo.toISOString().split('T')[0])
            .sum('vote_count as total')
            .first();

        if ((mutualVotes?.total || 0) >= 5) {
            await logSuspicious(voterId, 'mutual_voting_pattern',
                `Mutual voting pattern detected between users ${voterId} and ${targetUserId}`, 'high');
            return {
                allowed: false,
                reason: 'Unusual voting pattern detected. Please diversify your voting.'
            };
        }

        // All checks passed — record the vote
        await recordVoteLimit(voterId, targetUserId, today);

        return { allowed: true, reason: null };
    } catch (error) {
        console.error('[AntiGaming] validateVote error:', error);
        // Fail open — don't block voting due to anti-gaming check errors
        return { allowed: true, reason: null };
    }
}

/**
 * Record a vote in the limits table
 */
async function recordVoteLimit(voterId, targetUserId, today) {
    const existing = await db('vote_limits')
        .where({
            user_id: voterId,
            target_user_id: targetUserId,
            vote_date: today
        })
        .first();

    if (existing) {
        await db('vote_limits')
            .where('id', existing.id)
            .increment('vote_count', 1);
    } else {
        await db('vote_limits').insert({
            user_id: voterId,
            target_user_id: targetUserId,
            vote_date: today,
            vote_count: 1
        });
    }
}

/**
 * Log suspicious activity
 */
async function logSuspicious(userId, activityType, details, severity = 'low') {
    try {
        await db('suspicious_activity_log').insert({
            user_id: userId,
            activity_type: activityType,
            details,
            severity,
            created_at: new Date()
        });
        console.warn(`[AntiGaming] Suspicious activity: ${activityType} by user ${userId} (${severity})`);
    } catch (error) {
        console.error('[AntiGaming] Failed to log suspicious activity:', error);
    }
}

/**
 * Get suspicious activity for admin review
 */
async function getSuspiciousActivity(limit = 50) {
    return await db('suspicious_activity_log')
        .join('users', 'suspicious_activity_log.user_id', 'users.id')
        .select('suspicious_activity_log.*', 'users.name as user_name')
        .orderBy('suspicious_activity_log.created_at', 'desc')
        .limit(limit);
}

module.exports = {
    validateVote,
    logSuspicious,
    getSuspiciousActivity,
    DAILY_VOTE_LIMIT,
    MAX_VOTES_SAME_USER_PER_DAY
};
