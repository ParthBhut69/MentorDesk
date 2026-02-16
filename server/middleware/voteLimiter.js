const rateLimit = require('express-rate-limit');

/**
 * Vote Rate Limiter — Extra protection for voting endpoints
 * Limits to 30 votes per 15 minutes per IP
 */
const voteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: { message: 'Too many votes. Please slow down and try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { voteLimiter };
