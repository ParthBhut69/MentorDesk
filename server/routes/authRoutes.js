const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, validateToken, refreshToken } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordController');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

// Authentication routes with rate limiting
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/google', authLimiter, googleAuth);

// Token Management Routes
router.get('/validate', validateToken);
router.post('/refresh', refreshToken);

// Password Reset Routes with stricter rate limiting
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, resetPassword);

module.exports = router;
