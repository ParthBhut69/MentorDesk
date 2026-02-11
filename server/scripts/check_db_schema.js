const db = require('../db/db');

async function checkSchema() {
    try {
        console.log('=== Checking Users Table Schema ===\n');

        // Get table info
        const tableInfo = await db.raw("PRAGMA table_info(users)");

        console.log('Users table columns:');
        tableInfo.forEach(col => {
            console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
        });

        console.log('\n=== Checking for Required OAuth Fields ===\n');

        const requiredFields = ['google_id', 'oauth_provider', 'avatar_url'];
        const columnNames = tableInfo.map(col => col.name);

        requiredFields.forEach(field => {
            const exists = columnNames.includes(field);
            console.log(`  ${field}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        });

        console.log('\n=== Checking Indexes ===\n');
        const indexes = await db.raw("PRAGMA index_list(users)");
        console.log('Indexes:', indexes);

        console.log('\n=== Sample User Record ===\n');
        const sampleUser = await db('users').first();
        if (sampleUser) {
            console.log('Sample user structure:', Object.keys(sampleUser));
        } else {
            console.log('No users in database yet');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
