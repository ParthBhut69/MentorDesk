const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
