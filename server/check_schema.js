const db = require('./db/db');

async function checkSchema() {
    try {
        const columnInfo = await db('questions').columnInfo();
        console.log('Questions table columns:', Object.keys(columnInfo));
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
