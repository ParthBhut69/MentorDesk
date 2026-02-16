const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getLeaderboardHandler,
    getProgressHandler,
    getStreaksHandler,
    recordLoginHandler,
    getReputationHistoryHandler
} = require('../controllers/gamificationController');

// Public endpoints
router.get('/leaderboard', getLeaderboardHandler);
router.get('/progress/:userId', getProgressHandler);
router.get('/streaks/:userId', getStreaksHandler);
router.get('/reputation-history/:userId', getReputationHistoryHandler);

// Protected endpoints
router.post('/record-login', protect, recordLoginHandler);

module.exports = router;
