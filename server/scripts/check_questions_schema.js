const db = require('../db/db');

async function checkQuestionSchema() {
    try {
        // Check questions table schema
        const questionsInfo = await db('questions').columnInfo();
        console.log('\n=== QUESTIONS TABLE SCHEMA ===');
        console.log(JSON.stringify(questionsInfo, null, 2));

        // Check if proper indexes exist
        console.log('\n=== CHECKING INDEXES ===');
        const indexes = await db.raw(`
            SELECT name, sql 
            FROM sqlite_master 
            WHERE type = 'index' 
            AND tbl_name = 'questions'
        `);
        console.log('Indexes on questions table:');
        console.log(JSON.stringify(indexes, null, 2));

        // Check sample questions
        const sampleQuestions = await db('questions')
            .select('id', 'title', 'user_id', 'created_at', 'updated_at', 'deleted_at')
            .orderBy('created_at', 'desc')
            .limit(5);

        console.log('\n=== SAMPLE QUESTIONS (Latest 5) ===');
        console.log(JSON.stringify(sampleQuestions, null, 2));

        // Count total questions
        const total = await db('questions').count('* as count').first();
        const active = await db('questions').whereNull('deleted_at').count('* as count').first();

        console.log('\n=== STATISTICS ===');
        console.log(`Total questions: ${total.count}`);
        console.log(`Active questions: ${active.count}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkQuestionSchema();
