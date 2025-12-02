const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('../db/db');
const crypto = require('crypto');

// Generate backup codes
const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
        codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
};

// @desc    Setup 2FA - Generate secret and QR code
// @route   POST /api/auth/2fa/setup
// @access  Private
const setup2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await db('users').where('id', userId).first();

        if (user.two_fa_enabled) {
            return res.status(400).json({ message: '2FA is already enabled' });
        }

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `MentorDesk (${user.email})`,
            length: 32
        });

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        // Store secret temporarily (not enabled yet)
        await db('users')
            .where('id', userId)
            .update({ two_fa_secret: secret.base32 });

        res.json({
            secret: secret.base32,
            qrCode: qrCodeUrl,
            manualEntry: secret.otpauth_url
        });
    } catch (error) {
        console.error('Error setting up 2FA:', error);
        res.status(500).json({ message: 'Failed to setup 2FA' });
    }
};

// @desc    Verify and enable 2FA
// @route   POST /api/auth/2fa/enable
// @access  Private
const enable2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Verification code required' });
        }

        const user = await db('users').where('id', userId).first();

        if (!user.two_fa_secret) {
            return res.status(400).json({ message: 'Please setup 2FA first' });
        }

        // Verify the code
        const verified = speakeasy.totp.verify({
            secret: user.two_fa_secret,
            encoding: 'base32',
            token: code,
            window: 2 // Allow 2 time steps before/after
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Generate backup codes
        const backupCodes = generateBackupCodes();

        // Enable 2FA
        await db('users')
            .where('id', userId)
            .update({
                two_fa_enabled: true,
                backup_codes: JSON.stringify(backupCodes)
            });

        res.json({
            message: '2FA enabled successfully',
            backupCodes
        });
    } catch (error) {
        console.error('Error enabling 2FA:', error);
        res.status(500).json({ message: 'Failed to enable 2FA' });
    }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
const disable2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password required to disable 2FA' });
        }

        const user = await db('users').where('id', userId).first();
        const bcrypt = require('bcrypt');

        // Verify password
        if (user.password && !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Disable 2FA
        await db('users')
            .where('id', userId)
            .update({
                two_fa_enabled: false,
                two_fa_secret: null,
                backup_codes: null
            });

        res.json({ message: '2FA disabled successfully' });
    } catch (error) {
        console.error('Error disabling 2FA:', error);
        res.status(500).json({ message: 'Failed to disable 2FA' });
    }
};

// @desc    Verify 2FA code during login
// @route   POST /api/auth/2fa/verify
// @access  Public (but requires temp token)
const verify2FACode = async (req, res) => {
    try {
        const { userId, code, isBackupCode } = req.body;

        if (!userId || !code) {
            return res.status(400).json({ message: 'User ID and code required' });
        }

        const user = await db('users').where('id', userId).first();

        if (!user || !user.two_fa_enabled) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        let verified = false;

        if (isBackupCode) {
            // Check backup codes
            const backupCodes = JSON.parse(user.backup_codes || '[]');
            const codeIndex = backupCodes.indexOf(code.toUpperCase());

            if (codeIndex !== -1) {
                // Remove used backup code
                backupCodes.splice(codeIndex, 1);
                await db('users')
                    .where('id', userId)
                    .update({ backup_codes: JSON.stringify(backupCodes) });
                verified = true;
            }
        } else {
            // Verify TOTP code
            verified = speakeasy.totp.verify({
                secret: user.two_fa_secret,
                encoding: 'base32',
                token: code,
                window: 2
            });
        }

        if (!verified) {
            return res.status(400).json({ message: 'Invalid code' });
        }

        // Generate full JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: user.id, role: user.role || 'user', twoFaVerified: true },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            avatarUrl: user.avatar_url,
            token
        });
    } catch (error) {
        console.error('Error verifying 2FA code:', error);
        res.status(500).json({ message: 'Failed to verify code' });
    }
};

// @desc    Get 2FA status
// @route   GET /api/auth/2fa/status
// @access  Private
const get2FAStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await db('users').where('id', userId).first();

        res.json({
            enabled: user.two_fa_enabled || false,
            backupCodesRemaining: user.backup_codes ? JSON.parse(user.backup_codes).length : 0
        });
    } catch (error) {
        console.error('Error getting 2FA status:', error);
        res.status(500).json({ message: 'Failed to get 2FA status' });
    }
};

module.exports = {
    setup2FA,
    enable2FA,
    disable2FA,
    verify2FACode,
    get2FAStatus
};
