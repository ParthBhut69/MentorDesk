const db = require('./server/db/db');

async function checkSchema() {
    try {
        const columns = await db('rewards_log').columnInfo();
        console.log('REWARDS_LOG COLUMNS:', Object.keys(columns));

        const badges = await db('badges').select('*').limit(1);
        console.log('BADGES TABLE ACCESSIBLE');

        const answers = await db('answers').columnInfo();
        console.log('ANSWERS COLUMNS:', Object.keys(answers));

        process.exit(0);
    } catch (error) {
        console.error('SCHEMA CHECK ERROR:', error.message);
        process.exit(1);
    }
}

checkSchema();
