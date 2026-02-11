const db = require('../db/db');

async function checkSchema() {
    try {
        // Check users table
        const usersInfo = await db('users').columnInfo();
        console.log('\n=== USERS TABLE SCHEMA ===');
        console.log(JSON.stringify(usersInfo, null, 2));

        // Check if points/xp column exists
        console.log('\n=== GAMIFICATION CHECK ===');
        console.log('Has XP column:', 'xp' in usersInfo);
        console.log('Has points column:', 'points' in usersInfo);
        console.log('Has level column:', 'level' in usersInfo);
        console.log('Has role column:', 'role' in usersInfo);
        console.log('Has is_verified_expert column:', 'is_verified_expert' in usersInfo);

        // Check answers table
        const answersInfo = await db('answers').columnInfo();
        console.log('\n=== ANSWERS TABLE SCHEMA ===');
        console.log(JSON.stringify(answersInfo, null, 2));

        // Check if likes table exists
        const hasLikes = await db.schema.hasTable('likes');
        console.log('\n=== LIKES TABLE ===');
        console.log('Likes table exists:', hasLikes);

        if (hasLikes) {
            const likesInfo = await db('likes').columnInfo();
            console.log(JSON.stringify(likesInfo, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
