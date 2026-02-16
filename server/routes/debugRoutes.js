const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/schema', async (req, res) => {
    try {
        // Get all tables
        const tablesQuery = await db.raw("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tables = tablesQuery.rows.map(t => t.table_name);

        // Get users table columns
        const userColumns = await db('users').columnInfo();

        // Get question_likes columns (checking for vote_type)
        const likeColumns = await db('question_likes').columnInfo();

        res.json({
            message: 'Database Schema Debug',
            env: process.env.NODE_ENV,
            tables,
            users_columns: Object.keys(userColumns),
            question_likes_columns: Object.keys(likeColumns),
            migrations_check: 'Requesting this endpoint verifies DB connection'
        });
    } catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({
            message: 'Debug check failed',
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
