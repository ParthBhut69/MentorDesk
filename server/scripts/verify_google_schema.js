require('dotenv').config();
const db = require('../db/db');

async function checkGoogleAuthSchema() {
    console.log('=== Google Auth Schema Verification ===\n');

    try {
        const hasGoogleId = await db.schema.hasColumn('users', 'google_id');
        const hasProvider = await db.schema.hasColumn('users', 'oauth_provider');
        const hasAvatar = await db.schema.hasColumn('users', 'avatar_url');

        console.log(`[Schema Check] users.google_id exists: ${hasGoogleId ? '✅' : '❌'}`);
        console.log(`[Schema Check] users.oauth_provider exists: ${hasProvider ? '✅' : '❌'}`);
        console.log(`[Schema Check] users.avatar_url exists: ${hasAvatar ? '✅' : '❌'}`);

        if (!hasGoogleId || !hasProvider) {
            console.error('❌ CRITICAL: Missing Google Auth columns! Migration 20251202_add_oauth_2fa_fields.js has not run.');
        } else {
            console.log('✅ Schema looks correct for Google Auth.');
        }

        // Check recent Google users
        const recentGoogleUsers = await db('users')
            .whereNotNull('google_id')
            .orderBy('created_at', 'desc')
            .limit(5);

        console.log(`\n[Data Check] Found ${recentGoogleUsers.length} recent Google users:`);
        recentGoogleUsers.forEach(u => {
            console.log(` - ID: ${u.id}, Email: ${u.email}, GoogleID: ${u.google_id?.substring(0, 10)}...`);
        });

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        process.exit();
    }
}

checkGoogleAuthSchema();
