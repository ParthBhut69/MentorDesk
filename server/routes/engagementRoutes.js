const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    vote,
    getVoteStatus,
    addComment,
    getComments,
    deleteComment,
    bookmarkQuestion,
    getBookmarks,
    checkBookmark,
    acceptAnswer
} = require('../controllers/engagementController');

// Vote routes
router.post('/votes', protect, vote);
router.get('/votes/status', protect, getVoteStatus);

// Comment routes
router.post('/comments', protect, addComment);
router.get('/comments/:answer_id', getComments);
router.delete('/comments/:id', protect, deleteComment);

// Bookmark routes
router.post('/bookmarks', protect, bookmarkQuestion);
router.get('/bookmarks', protect, getBookmarks);
router.get('/bookmarks/check/:question_id', protect, checkBookmark);

// Accept answer route
router.post('/accept-answer', protect, acceptAnswer);

module.exports = router;
