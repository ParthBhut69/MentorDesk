const { getLeaderboard, getProgressToNextTier, getReputationHistory } = require('../services/gamificationService');
const { getStreakData, recordDailyLogin } = require('../services/streakService');

/**
 * Gamification Controller — Endpoints for leaderboard, progress, streaks, reputation
 */

// GET /api/gamification/leaderboard?tab=alltime|weekly|monthly|fastest|rising&limit=10
const getLeaderboardHandler = async (req, res) => {
    try {
        const tab = req.query.tab || 'alltime';
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        const validTabs = ['alltime', 'weekly', 'monthly', 'fastest', 'rising'];
        if (!validTabs.includes(tab)) {
            return res.status(400).json({ message: `Invalid tab. Valid: ${validTabs.join(', ')}` });
        }

        const leaderboard = await getLeaderboard(tab, limit);
        res.json({ tab, leaderboard, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('[Gamification] Leaderboard error:', error);
        res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
};

// GET /api/gamification/progress/:userId
const getProgressHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const progress = await getProgressToNextTier(parseInt(userId));

        if (!progress) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(progress);
    } catch (error) {
        console.error('[Gamification] Progress error:', error);
        res.status(500).json({ message: 'Failed to fetch progress' });
    }
};

// GET /api/gamification/streaks/:userId
const getStreaksHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const streakData = await getStreakData(parseInt(userId));
        res.json(streakData);
    } catch (error) {
        console.error('[Gamification] Streaks error:', error);
        res.status(500).json({ message: 'Failed to fetch streak data' });
    }
};

// POST /api/gamification/record-login (protected)
const recordLoginHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await recordDailyLogin(userId);
        res.json(result);
    } catch (error) {
        console.error('[Gamification] Record login error:', error);
        res.status(500).json({ message: 'Failed to record login' });
    }
};

// GET /api/gamification/reputation-history/:userId
const getReputationHistoryHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        const result = await getReputationHistory(parseInt(userId), page, limit);
        res.json(result);
    } catch (error) {
        console.error('[Gamification] Reputation history error:', error);
        res.status(500).json({ message: 'Failed to fetch reputation history' });
    }
};

module.exports = {
    getLeaderboardHandler,
    getProgressHandler,
    getStreaksHandler,
    recordLoginHandler,
    getReputationHistoryHandler
};
