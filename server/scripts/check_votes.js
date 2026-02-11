const db = require('../db/db');

async function checkVotesSchema() {
    try {
        const hasVotes = await db.schema.hasTable('votes');
        console.log('Has votes table:', hasVotes);

        if (hasVotes) {
            const votesInfo = await db('votes').columnInfo();
            console.log(JSON.stringify(votesInfo, null, 2));
        }

        const questionsInfo = await db('questions').columnInfo();
        console.log('Questions columns:', Object.keys(questionsInfo));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkVotesSchema();
