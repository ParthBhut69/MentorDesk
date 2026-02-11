const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../db/db');
const emailService = require('../services/emailService');

// @desc    Forgot Password - Send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await db('users')
            .where({ email })
            .whereNull('deleted_at')
            .first();

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({ message: 'If an account exists with that email, a reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token to DB
        await db('users')
            .where({ id: user.id })
            .update({
                reset_password_token: resetTokenHash,
                reset_password_expires: resetExpires
            });

        // Create reset URL
        // Assuming frontend runs on port 5173 or whatever VITE_API_URL points to, but typically reset link is frontend URL
        // We'll use a hardcoded localhost for now or try to infer. Ideally should be env var.
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        // Send email
        const message = `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Please click the link below to reset your password:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `;

        await emailService.sendEmail(user.email, 'Password Reset Request', message, `Reset link: ${resetUrl}`);

        res.status(200).json({ message: 'If an account exists with that email, a reset link has been sent.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'New password is required' });
    }

    try {
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await db('users')
            .where('reset_password_token', resetTokenHash)
            .where('reset_password_expires', '>', new Date())
            .whereNull('deleted_at')
            .first();

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user
        await db('users')
            .where({ id: user.id })
            .update({
                password: hashedPassword,
                reset_password_token: null,
                reset_password_expires: null
            });

        res.status(200).json({ message: 'Password reset successful. You can now login.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    forgotPassword,
    resetPassword
};
