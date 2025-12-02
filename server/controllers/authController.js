const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        // Check if user exists
        const userExists = await db('users').where({ email }).first();

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const [id] = await db('users').insert({
            name,
            email,
            password: hashedPassword,
        });

        const user = await db('users').where({ id }).first();

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
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user email
        const user = await db('users').where({ email }).first();

        if (user && (await bcrypt.compare(password, user.password))) {
            // Check if 2FA is enabled
            if (user.two_fa_enabled) {
                // Return temporary token for 2FA verification
                const tempToken = jwt.sign(
                    { id: user.id, temp: true },
                    process.env.JWT_SECRET || 'your-secret-key',
                    { expiresIn: '10m' }
                );

                return res.json({
                    requiresTwoFactor: true,
                    userId: user.id,
                    tempToken
                });
            }

            // No 2FA - return full token
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
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Google OAuth callback
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    const { email, name, googleId, picture } = req.body;

    if (!email || !googleId) {
        return res.status(400).json({ message: 'Email and Google ID required' });
    }

    try {
        // Check if user exists
        let user = await db('users').where({ email }).first();

        if (!user) {
            // Create new user with Google auth
            const [id] = await db('users').insert({
                name: name || email.split('@')[0],
                email,
                google_id: googleId,
                oauth_provider: 'google',
                avatar_url: picture || null,
                password: await bcrypt.hash(googleId + Date.now(), 10), // Random password
            });

            user = await db('users').where({ id }).first();
        } else if (!user.google_id) {
            // Link Google account to existing user
            await db('users')
                .where({ id: user.id })
                .update({
                    google_id: googleId,
                    oauth_provider: 'google',
                    avatar_url: picture || user.avatar_url
                });
        }

        // Check if 2FA is enabled (even for Google login)
        if (user.two_fa_enabled) {
            const tempToken = jwt.sign(
                { id: user.id, temp: true },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '10m' }
            );

            return res.json({
                requiresTwoFactor: true,
                userId: user.id,
                tempToken
            });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            avatarUrl: user.avatar_url,
            token: generateToken(user.id, user.role || 'user'),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleAuth,
};
