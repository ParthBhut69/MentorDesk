const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    toggleAnswerLike,
    getAnswerLikes,
    checkAnswerLiked,
    toggleQuestionLike
} = require('../controllers/likeController');

// Answer like routes
router.post('/:id/like', protect, toggleAnswerLike);
router.get('/:id/likes', getAnswerLikes);
router.get('/:id/liked', protect, checkAnswerLiked);

// Question like routes (mounted on /api/questions)
// These will be used from questionRoutes

module.exports = router;
