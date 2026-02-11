const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getUserQuestions,
} = require('../controllers/questionController');
<<<<<<< HEAD
const { toggleQuestionLike, toggleQuestionDislike } = require('../controllers/likeController');
=======
>>>>>>> 33adee00930a83695ade63f74cc84e6502792cbb
const {
    createAnswer,
    getAnswersByQuestionId,
} = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware');

<<<<<<< HEAD
router.post('/:id/like', protect, toggleQuestionLike);
router.post('/:id/dislike', protect, toggleQuestionDislike);

=======
>>>>>>> 33adee00930a83695ade63f74cc84e6502792cbb
router.route('/').get(getAllQuestions).post(protect, createQuestion);
router.route('/user/:userId').get(getUserQuestions);
router.route('/:id').get(getQuestionById).put(protect, updateQuestion).delete(protect, deleteQuestion);

// Re-route into answer router or handle here. Handling here for simplicity.
router.route('/:id/answers').get(getAnswersByQuestionId).post(protect, createAnswer);

module.exports = router;
