const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');

// GET /api/stats — public endpoint, returns platform-wide counts
router.get('/', getStats);

module.exports = router;
