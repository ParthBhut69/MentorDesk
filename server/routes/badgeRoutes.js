const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserBadges, getAllBadges } = require('../controllers/badgeController');

// Get user's earned badges
router.get('/user/:userId', getUserBadges);

// Get all available badges
router.get('/all', getAllBadges);

module.exports = router;
