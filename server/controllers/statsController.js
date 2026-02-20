const db = require('../db/db');

// Simple in-memory cache (60 seconds TTL)
let cache = { data: null, expiresAt: 0 };
const CACHE_TTL_MS = 60 * 1000;

/**
 * @desc    Get platform stats (users, experts, questions, answers)
 * @route   GET /api/stats
 * @access  Public
 */
const getStats = async (req, res) => {
    try {
        // Serve from cache if fresh
        if (cache.data && Date.now() < cache.expiresAt) {
            return res.json(cache.data);
        }

        const [
            usersResult,
            expertsResult,
            questionsResult,
            answersResult,
        ] = await Promise.all([
            db('users').count('id as count').first(),
            db('users').where('is_verified_expert', true).count('id as count').first(),
            db('questions').whereNull('deleted_at').count('id as count').first(),
            db('answers').whereNull('deleted_at').count('id as count').first(),
        ]);

        const data = {
            totalUsers: parseInt(usersResult.count, 10) || 0,
            totalExperts: parseInt(expertsResult.count, 10) || 0,
            totalQuestions: parseInt(questionsResult.count, 10) || 0,
            totalAnswers: parseInt(answersResult.count, 10) || 0,
        };

        // Update cache
        cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };

        res.json(data);
    } catch (error) {
        console.error('[Stats API] Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};

module.exports = { getStats };
