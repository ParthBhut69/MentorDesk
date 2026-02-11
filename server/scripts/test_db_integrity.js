require('dotenv').config();
const db = require('../db/db');
const bcrypt = require('bcrypt');

async function testDatabaseIntegrity() {
    console.log('=== Database Integrity Test ===\n');

    try {
        // 1. Clean up test data
        const testEmail = 'integrity_test_' + Date.now() + '@example.com';

        // 2. Test User Creation & Password Hashing
        console.log('[Test 1] Creating new user...');
        const [id] = await db('users').insert({
            name: 'Integrity Tester',
            email: testEmail,
            password: await bcrypt.hash('password123', 10),
            role: 'user',
            is_active: true
        }).returning('id'); // using returning for array result consistency check

        const user = await db('users').where({ id: id.id || id }).first(); // Handle object or value return

        if (!user) throw new Error('User not saved to DB!');
        if (user.password === 'password123') throw new Error('Password NOT hashed!');
        if (!user.password.startsWith('$2b$')) throw new Error('Password format incorrect!');
        console.log('✅ User created and password hashed successfully.');

        // 3. Test Duplicate Prevention
        console.log('\n[Test 2] Attempting to create duplicate user...');
        try {
            await db('users').insert({
                name: 'Duplicate Tester',
                email: testEmail,
                password: 'password123'
            });
            console.error('❌ Failed: DB allowed duplicate email!');
        } catch (err) {
            if (err.message.includes('unique') || err.message.includes('constraint')) {
                console.log('✅ Duplicate email prevented (Unique Constraint working).');
            } else {
                console.log('❓ Duplicate failed with unexpected error:', err.message);
            }
        }

        // 4. Test Google User Persistence
        console.log('\n[Test 3] Testing Google User fields...');
        const googleId = 'goog_' + Date.now();
        const [gId] = await db('users').insert({
            name: 'Google User',
            email: 'google_' + testEmail,
            google_id: googleId,
            oauth_provider: 'google',
            password: 'n/a'
        }).returning('id');

        const googleUser = await db('users').where({ google_id: googleId }).first();
        if (!googleUser) throw new Error('Google user not found by google_id');
        if (googleUser.oauth_provider !== 'google') throw new Error('oauth_provider field missing/wrong');
        console.log('✅ Google user saved with correct specific fields.');

        // 5. Test "Missing Fields" Check
        // We'll check if the user object has keys we expect
        const expectedFields = ['id', 'name', 'email', 'created_at', 'updated_at'];
        const missing = expectedFields.filter(f => !Object.keys(googleUser).includes(f));
        if (missing.length > 0) {
            console.error('❌ Missing expected fields:', missing);
        } else {
            console.log('✅ All expected standard fields present.');
        }

    } catch (err) {
        console.error('❌ Integrity Verification Failed:', err);
    } finally {
        // Cleanup
        // await db('users').where('email', 'like', '%integrity_test%').del();
        console.log('\n=== Test Complete ===');
        process.exit();
    }
}

testDatabaseIntegrity();
