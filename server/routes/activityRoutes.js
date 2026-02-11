const express = require('express');
const router = express.Router();
const { getUserActivity } = require('../controllers/activityController');

// Get user activity
router.get('/user/:userId', getUserActivity);

module.exports = router;
