const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getUserRewards,
    getLeaderboard,
    getUserProfile
} = require('../controllers/rewardController');

// Get user's reward history
router.get('/rewards/:userId', protect, getUserRewards);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// Get user profile with points and rank
router.get('/profile/:userId', getUserProfile);

module.exports = router;
