const db = require('./db/db');

async function checkImages() {
    try {
        const user = await db('users').whereNotNull('avatar_url').first();
        console.log('User with avatar:', user ? { id: user.id, avatarLength: user.avatar_url.length, avatarStart: user.avatar_url.substring(0, 50) } : 'None');

        const question = await db('questions').whereNotNull('image_url').first();
        console.log('Question with image:', question ? { id: question.id, imageLength: question.image_url.length, imageStart: question.image_url.substring(0, 50) } : 'None');

        process.exit(0);
    } catch (error) {
        console.error('Error checking images:', error);
        process.exit(1);
    }
}

checkImages();
