const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
    setup2FA,
    enable2FA,
    disable2FA,
    verify2FACode,
    get2FAStatus
} = require('../controllers/twoFactorController');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);

// 2FA routes
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/enable', protect, enable2FA);
router.post('/2fa/disable', protect, disable2FA);
router.post('/2fa/verify', verify2FACode);
router.get('/2fa/status', protect, get2FAStatus);

module.exports = router;
