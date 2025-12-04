const jwt = require('jsonwebtoken');
const db = require('../db/db');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            console.log('[AuthMiddleware] Decoded token:', decoded);

            // Get user from the token - EXCLUDE SOFT-DELETED USERS
            req.user = await db('users')
                .where({ id: decoded.id })
                .whereNull('deleted_at')  // ← CRITICAL: Exclude soft-deleted users
                .first();

            console.log('[AuthMiddleware] User found:', req.user ? req.user.id : 'None');

            if (!req.user) {
                console.log('[AuthMiddleware] User not found or deleted for ID:', decoded.id);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check if user account is active
            if (req.user.is_active === false) {
                console.log('[AuthMiddleware] User account is deactivated:', decoded.id);
                return res.status(403).json({ message: 'Account is deactivated' });
            }

            // Remove password from user object
            delete req.user.password;

            next();
        } catch (error) {
            console.error('[AuthMiddleware] Token verification error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
