const db = require('../db/db');

async function testInsert() {
    try {
        console.log('=== Testing DB Insert Behavior ===');

        await db.transaction(async (trx) => {
            const email = `test_${Date.now()}@example.com`;
            console.log(`Inserting user: ${email}`);

            const result = await trx('users').insert({
                name: 'Test User',
                email: email,
                password: 'password123',
                google_id: `google_${Date.now()}`,
                oauth_provider: 'google'
            }).returning('id');

            console.log('Raw result from insert(...).returning(\'id\'):');
            console.log(JSON.stringify(result, null, 2));
            console.log('Type of result:', typeof result);
            console.log('Is Array?', Array.isArray(result));

            if (Array.isArray(result) && result.length > 0) {
                console.log('Element 0 type:', typeof result[0]);
                console.log('Element 0 value:', result[0]);
            }

            // Simulate the controller logic
            const [id] = result;
            console.log('Destructured id:', id);

            const user = await trx('users').where({ id }).first();
            console.log('Fetched user:', user ? 'FOUND' : 'NOT FOUND');

            if (!user) {
                console.log('❌ FAILURE: Could not find user with destructured ID');
                // Check if id is an object
                if (typeof id === 'object') {
                    console.log('   Reason: ID is an object, but query expected a primitive');
                }
            } else {
                console.log('✅ SUCCESS: User found');
            }

            // Rollback to keep DB clean
            throw new Error('ROLLBACK_TEST');
        });

    } catch (error) {
        if (error.message === 'ROLLBACK_TEST') {
            console.log('Test finished (rolled back)');
        } else {
            console.error('❌ Error during test:', error);
        }
    } finally {
        await db.destroy();
    }
}

testInsert();
