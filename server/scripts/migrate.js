#!/usr/bin/env node
/**
 * Safe Production Migration Script
 * 
 * Runs database migrations without touching any existing data.
 * NEVER drops tables, NEVER seeds, NEVER rolls back.
 *
 * Usage: node scripts/migrate.js
 */

require('dotenv').config({ path: '../.env' });

const knex = require('knex');
const knexConfig = require('../knexfile');

const env = process.env.NODE_ENV || 'development';
const config = knexConfig[env];

if (!config) {
    console.error(`[migrate] No knex config found for environment: ${env}`);
    process.exit(1);
}

console.log(`[migrate] Running migrations for environment: ${env}`);

const db = knex(config);

db.migrate.latest()
    .then(([batchNo, migrations]) => {
        if (migrations.length === 0) {
            console.log('[migrate] ✅ Already up to date — no new migrations.');
        } else {
            console.log(`[migrate] ✅ Batch ${batchNo} applied:`);
            migrations.forEach(m => console.log(`  → ${m}`));
        }
    })
    .catch(err => {
        console.error('[migrate] ❌ Migration failed:', err.message);
        process.exit(1);
    })
    .finally(() => db.destroy());
