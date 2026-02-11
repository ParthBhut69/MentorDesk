const db = require('../db/db');

async function verifyFix() {
    try {
        console.log('=== Verifying Fix for DB Insert ===');

        await db.transaction(async (trx) => {
            const email = `fix_test_${Date.now()}@example.com`;
            console.log(`Inserting user: ${email}`);

            // Simulating the fix
            const [inserted] = await trx('users').insert({
                name: 'Fix Verify User',
                email: email,
                password: 'password123',
                google_id: `google_fix_${Date.now()}`,
                oauth_provider: 'google'
            }).returning('id');

            console.log('Inserted raw:', inserted);

            // proposed fix logic:
            const id = (inserted && typeof inserted === 'object' && inserted.id) ? inserted.id : inserted;

            console.log('Extracted ID:', id);

            const user = await trx('users').where({ id }).first();
            console.log('Fetched user:', user ? '✅ FOUND' : '❌ NOT FOUND');

            if (user && user.email === email) {
                console.log('✅ Fix verified successfully!');
            } else {
                console.log('❌ Fix failed');
            }

            throw new Error('ROLLBACK_VERIFY');
        });

    } catch (error) {
        if (error.message === 'ROLLBACK_VERIFY') {
            console.log('Verification finished (rolled back)');
        } else {
            console.error('❌ Error during verification:', error);
        }
    } finally {
        await db.destroy();
    }
}

verifyFix();
