/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Check and add columns if they don't exist
    const hasGoogleId = await knex.schema.hasColumn('users', 'google_id');
    const hasTwoFaSecret = await knex.schema.hasColumn('users', 'two_fa_secret');
    const hasTwoFaEnabled = await knex.schema.hasColumn('users', 'two_fa_enabled');
    const hasOauthProvider = await knex.schema.hasColumn('users', 'oauth_provider');
    const hasBackupCodes = await knex.schema.hasColumn('users', 'backup_codes');

    await knex.schema.table('users', function (table) {
        if (!hasGoogleId) {
            table.string('google_id').unique();
        }
        if (!hasTwoFaSecret) {
            table.string('two_fa_secret');
        }
        if (!hasTwoFaEnabled) {
            table.boolean('two_fa_enabled').defaultTo(false);
        }
        if (!hasOauthProvider) {
            table.string('oauth_provider'); // 'google', 'local', etc.
        }
        if (!hasBackupCodes) {
            table.text('backup_codes'); // JSON array of backup codes
        }
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.table('users', function (table) {
        table.dropColumn('google_id');
        table.dropColumn('two_fa_secret');
        table.dropColumn('two_fa_enabled');
        table.dropColumn('oauth_provider');
        table.dropColumn('backup_codes');
    });
};
