const express = require('express');
const router = express.Router();
const {
    getTrendingQuestions,
    getTopExperts,
    getPopularTags,
    getTrendingTopics,
    getTrendingTopicDetails,
    getTopicActivityStats
} = require('../controllers/trendingController');

router.get('/questions', getTrendingQuestions);
router.get('/experts', getTopExperts);
router.get('/tags', getPopularTags);

// New trending topics endpoints
router.get('/topics', getTrendingTopics);
router.get('/topics/:id', getTrendingTopicDetails);
router.get('/topics/:id/activity', getTopicActivityStats);

module.exports = router;
