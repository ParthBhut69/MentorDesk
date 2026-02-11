const db = require('../db/db');

async function diagnoseGoogleAuth() {
    console.log('=== Google Auth Diagnostics ===\n');

    try {
        // 1. Check all users
        const allUsers = await db('users').select('id', 'name', 'email', 'google_id', 'deleted_at', 'is_active');
        console.log(`Total users in database: ${allUsers.length}`);
        console.log('Users:', JSON.stringify(allUsers, null, 2));

        // 2. Check for soft-deleted users with Google ID
        const deletedGoogleUsers = await db('users')
            .whereNotNull('deleted_at')
            .whereNotNull('google_id')
            .select('id', 'name', 'email', 'google_id', 'deleted_at');

        console.log(`\nSoft-deleted Google users: ${deletedGoogleUsers.length}`);
        if (deletedGoogleUsers.length > 0) {
            console.log('Deleted Google users:', JSON.stringify(deletedGoogleUsers, null, 2));
        }

        // 3. Check for inactive users
        const inactiveUsers = await db('users')
            .where('is_active', false)
            .select('id', 'name', 'email', 'is_active', 'deleted_at');

        console.log(`\nInactive users: ${inactiveUsers.length}`);
        if (inactiveUsers.length > 0) {
            console.log('Inactive users:', JSON.stringify(inactiveUsers, null, 2));
        }

        // 4. Check for users without passwords (Google-only users)
        const googleOnlyUsers = await db('users')
            .whereNotNull('google_id')
            .whereNull('deleted_at')
            .select('id', 'name', 'email', 'google_id', 'oauth_provider', 'created_at');

        console.log(`\nActive Google users: ${googleOnlyUsers.length}`);
        console.log('Google users:', JSON.stringify(googleOnlyUsers, null, 2));

        console.log('\n=== Diagnostics Complete ===');
    } catch (error) {
        console.error('Error running diagnostics:', error);
    } finally {
        process.exit();
    }
}

diagnoseGoogleAuth();
