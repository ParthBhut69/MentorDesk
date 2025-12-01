const express = require('express');
const router = express.Router();
const { deleteAnswer, voteAnswer, acceptAnswer } = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware');

router.delete('/:id', protect, deleteAnswer);
router.post('/:id/vote', protect, voteAnswer);
router.put('/:id/accept', protect, acceptAnswer);

module.exports = router;
