const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFeed,
    checkFollowing
} = require('../controllers/followerController');

// Follow a user
router.post('/follow', protect, followUser);

// Unfollow a user
router.delete('/unfollow/:user_id', protect, unfollowUser);

// Get user's followers
router.get('/:user_id/followers', getFollowers);

// Get users that a user is following
router.get('/:user_id/following', getFollowing);

// Get feed (questions from followed users)
router.get('/feed', protect, getFeed);

// Check if following a user
router.get('/check/:user_id', protect, checkFollowing);

module.exports = router;
