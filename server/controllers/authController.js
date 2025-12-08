const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '30d',
    });
};

// Email validation helper
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Sanitize user input
const sanitizeInput = (input, maxLength = 255) => {
    if (!input) return '';
    return input.trim().substring(0, maxLength);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Validate email format
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = email.toLowerCase().trim();

    try {
        // Use transaction for atomicity
        const user = await db.transaction(async (trx) => {
            // Check if user exists (including soft-deleted users)
            const userExists = await trx('users')
                .where({ email: sanitizedEmail })
                .first();

            if (userExists) {
                if (userExists.deleted_at) {
                    throw new Error('This account has been deleted. Please contact support.');
                }
                throw new Error('User already exists');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const [id] = await trx('users').insert({
                name: sanitizedName,
                email: sanitizedEmail,
                password: hashedPassword,
            });

            const newUser = await trx('users').where({ id }).first();
            return newUser;
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                avatarUrl: user.avatar_url,
                token: generateToken(user.id, user.role || 'user'),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (error.message === 'User already exists' || error.message.includes('deleted')) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server Error' });
        }
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Validate email format
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    try {
        // Check for user email (exclude soft-deleted users)
        const user = await db('users')
            .where({ email: sanitizedEmail })
            .whereNull('deleted_at')
            .first();

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if account is active
        if (user.is_active === false) {
            return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                avatarUrl: user.avatar_url,
                token: generateToken(user.id, user.role || 'user'),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Google OAuth callback
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ message: 'Google credential required' });
    }

    try {
        // Verify Google token server-side
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (verifyError) {
            console.error('Google token verification failed:', verifyError);
            return res.status(400).json({ message: 'Invalid Google token' });
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!email || !googleId) {
            return res.status(400).json({ message: 'Invalid Google account data' });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format from Google' });
        }

        // Sanitize inputs
        const sanitizedEmail = email.toLowerCase().trim();
        const sanitizedName = sanitizeInput(name || email.split('@')[0]);
        const sanitizedGoogleId = sanitizeInput(googleId, 255);

        // Use transaction to prevent race conditions
        const user = await db.transaction(async (trx) => {
            // Try to find existing user by email OR google_id
            // We include soft-deleted users so we can restore them
            let existingUser = await trx('users')
                .where(function () {
                    this.where({ email: sanitizedEmail })
                        .orWhere({ google_id: sanitizedGoogleId });
                })
                .first();

            if (!existingUser) {
                // Create new user with Google auth - ATOMIC OPERATION
                console.log('[GoogleAuth] Creating new user for:', sanitizedEmail);

                const [id] = await trx('users').insert({
                    name: sanitizedName,
                    email: sanitizedEmail,
                    google_id: sanitizedGoogleId,
                    oauth_provider: 'google',
                    avatar_url: picture || null,
                    password: await bcrypt.hash(sanitizedGoogleId + Date.now(), 10), // Random password
                });

                existingUser = await trx('users').where({ id }).first();
                console.log('[GoogleAuth] New user created with ID:', id);
            } else {
                // User exists (active or soft-deleted)
                const updateData = {
                    google_id: sanitizedGoogleId,
                    oauth_provider: existingUser.oauth_provider || 'google',
                    avatar_url: picture || existingUser.avatar_url,
                    updated_at: new Date()
                };

                // If user was soft-deleted, RESTORE them
                if (existingUser.deleted_at) {
                    console.log('[GoogleAuth] Restoring soft-deleted user:', existingUser.id);
                    updateData.deleted_at = null;
                    updateData.deleted_by = null;
                    updateData.is_active = true;
                }

                await trx('users')
                    .where({ id: existingUser.id })
                    .update(updateData);

                // Refresh user data after update
                existingUser = await trx('users').where({ id: existingUser.id }).first();
                console.log('[GoogleAuth] User logged in/linked successfully:', existingUser.id);
            }

            // Check if account is active (only if we didn't just restore it)
            // If we just restored it, is_active is true. If it was manually deactivated (not deleted), we still block.
            if (existingUser.is_active === false && !existingUser.deleted_at) {
                throw new Error('Account is deactivated. Please contact support.');
            }

            return existingUser;
        });

        // Return token immediately
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            avatarUrl: user.avatar_url,
            token: generateToken(user.id, user.role || 'user'),
        });
    } catch (error) {
        console.error('Google auth error:', error);

        if (error.message.includes('deactivated')) {
            return res.status(403).json({ message: error.message });
        }

        // Handle unique constraint violations gracefully
        if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
            return res.status(409).json({
                message: 'Account already exists. Please try logging in again.'
            });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Validate current token
// @route   GET /api/auth/validate
// @access  Private (token needs to be sent)
const validateToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ valid: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        const user = await db('users')
            .where({ id: decoded.id })
            .whereNull('deleted_at')
            .first();

        if (!user || user.is_active === false) {
            return res.status(401).json({ valid: false, message: 'User not found or inactive' });
        }

        res.json({
            valid: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                avatarUrl: user.avatar_url
            }
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ valid: false, message: 'Token expired', expired: true });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ valid: false, message: 'Invalid token' });
        }
        console.error('Token validation error:', error);
        res.status(500).json({ valid: false, message: 'Server error' });
    }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public (old token needs to be sent)
const refreshToken = async (req, res) => {
    try {
        const oldToken = req.headers.authorization?.split(' ')[1] || req.body.token;

        if (!oldToken) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token even if expired (we'll allow refresh within 7 days of expiration)
        let decoded;
        try {
            decoded = jwt.verify(oldToken, process.env.JWT_SECRET || 'your-secret-key', {
                ignoreExpiration: false
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                // Allow refresh if token expired less than 7 days ago
                decoded = jwt.decode(oldToken);
                const expiredDate = new Date(error.expiredAt);
                const now = new Date();
                const daysSinceExpired = (now - expiredDate) / (1000 * 60 * 60 * 24);

                if (daysSinceExpired > 7) {
                    return res.status(401).json({
                        message: 'Token expired too long ago. Please login again.',
                        requireLogin: true
                    });
                }
            } else {
                return res.status(401).json({ message: 'Invalid token' });
            }
        }

        // Get user from database
        const user = await db('users')
            .where({ id: decoded.id })
            .whereNull('deleted_at')
            .first();

        if (!user || user.is_active === false) {
            return res.status(401).json({ message: 'User not found or inactive' });
        }

        // Generate new token
        const newToken = generateToken(user.id, user.role || 'user');

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            avatarUrl: user.avatar_url,
            token: newToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleAuth,
    validateToken,
    refreshToken
};
