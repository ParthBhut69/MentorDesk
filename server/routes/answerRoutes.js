const express = require('express');
const router = express.Router();
const { deleteAnswer, voteAnswer, acceptAnswer } = require('../controllers/answerController');
<<<<<<< HEAD
const { toggleAnswerLike, getAnswerLikes, checkAnswerLiked } = require('../controllers/likeController');
=======
>>>>>>> 33adee00930a83695ade63f74cc84e6502792cbb
const { protect } = require('../middleware/authMiddleware');

router.delete('/:id', protect, deleteAnswer);
router.post('/:id/vote', protect, voteAnswer);
router.put('/:id/accept', protect, acceptAnswer);

module.exports = router;
