const db = require('./db/db');

async function checkAvatarFormat() {
    try {
        const user = await db('users').whereNotNull('avatar_url').first();
        if (user) {
            console.log('Avatar URL start:', user.avatar_url.substring(0, 50));
            console.log('Is valid data URI:', user.avatar_url.startsWith('data:image'));
        } else {
            console.log('No user with avatar found');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAvatarFormat();
