const express = require('express');
const router = express.Router();
const { deleteAnswer } = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware');

router.delete('/:id', protect, deleteAnswer);

module.exports = router;
