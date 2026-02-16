const db = require('./db/db');

async function checkSchema() {
    try {
        console.log('Checking users table schema...');
        const userColumns = await db('users').columnInfo();
        console.log('Users columns:', Object.keys(userColumns));

        console.log('Checking reputation_score column...');
        if (userColumns.reputation_score) {
            console.log('✅ reputation_score exists');
        } else {
            console.log('❌ reputation_score MISSING');
        }

        console.log('Checking reputation_log table...');
        const hasRepLog = await db.schema.hasTable('reputation_log');
        console.log(hasRepLog ? '✅ reputation_log table exists' : '❌ reputation_log table MISSING');

        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
