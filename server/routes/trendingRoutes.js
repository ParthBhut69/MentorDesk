const express = require('express');
const router = express.Router();
const {
    getTrendingQuestions,
    getTopExperts,
    getPopularTags
} = require('../controllers/trendingController');

router.get('/questions', getTrendingQuestions);
router.get('/experts', getTopExperts);
router.get('/tags', getPopularTags);

module.exports = router;
