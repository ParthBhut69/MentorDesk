const db = require('./db/db');

async function checkSchema() {
    try {
        const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('TABLES:', tables.map(t => t.name));

        const rewardsCols = await db('rewards_log').columnInfo();
        console.log('REWARDS_LOG COLUMNS:', Object.keys(rewardsCols));

        const pointsCols = await db('points_history').columnInfo();
        console.log('POINTS_HISTORY COLUMNS:', Object.keys(pointsCols));

        process.exit(0);
    } catch (error) {
        console.error('SCHEMA CHECK ERROR:', error.message);
        process.exit(1);
    }
}

checkSchema();
