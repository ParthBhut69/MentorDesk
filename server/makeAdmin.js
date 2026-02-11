const db = require('./db/db');

async function makeAdmin() {
    try {
        // Get all users
        const users = await db('users').select('id', 'name', 'email', 'role');

        console.log('\n=== Current Users ===');
        users.forEach(user => {
            console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role || 'user'}`);
        });

        if (users.length === 0) {
            console.log('\nNo users found. Please register a user first.');
            process.exit(0);
        }

        // Make the first user an admin
        const firstUser = users[0];
        await db('users')
            .where('id', firstUser.id)
            .update({ role: 'admin' });

        console.log(`\n✅ User "${firstUser.name}" (${firstUser.email}) is now an admin!`);
        console.log('\nYou can now:');
        console.log('1. Login with this user');
        console.log('2. Click "Admin Panel" in the navbar');
        console.log('3. Access the admin dashboard\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

makeAdmin();
