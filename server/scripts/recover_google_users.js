const db = require('../db/db');

async function recoverGoogleUsers() {
    console.log('Starting Google User Recovery...');

    try {
        // Find users who are soft-deleted AND (have a google_id OR are google auth users)
        const usersToRecover = await db('users')
            .whereNotNull('deleted_at')
            .andWhere(function () {
                this.whereNotNull('google_id')
                    .orWhere('oauth_provider', 'google');
            });

        console.log(`Found ${usersToRecover.length} users to recover.`);

        if (usersToRecover.length === 0) {
            console.log('No users need recovery.');
            process.exit(0);
        }

        let recoveredCount = 0;

        for (const user of usersToRecover) {
            console.log(`Recovering user: ${user.email} (ID: ${user.id})`);

            await db('users')
                .where({ id: user.id })
                .update({
                    deleted_at: null,
                    deleted_by: null,
                    is_active: true,
                    updated_at: new Date()
                });

            recoveredCount++;
        }

        console.log(`Successfully recovered ${recoveredCount} users.`);
    } catch (error) {
        console.error('Recovery failed:', error);
    } finally {
        process.exit();
    }
}

recoverGoogleUsers();
