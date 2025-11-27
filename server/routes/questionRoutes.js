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
const {
    createAnswer,
    getAnswersByQuestionId,
} = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getAllQuestions).post(protect, createQuestion);
router.route('/user/:userId').get(getUserQuestions);
router.route('/:id').get(getQuestionById).put(protect, updateQuestion).delete(protect, deleteQuestion);

// Re-route into answer router or handle here. Handling here for simplicity.
router.route('/:id/answers').get(getAnswersByQuestionId).post(protect, createAnswer);

module.exports = router;
