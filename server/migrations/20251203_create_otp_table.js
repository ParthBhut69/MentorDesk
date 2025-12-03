/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Create OTP codes table
    await knex.schema.createTable('otp_codes', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.string('otp_hash').notNullable(); // Hashed OTP for security
        table.timestamp('expires_at').notNullable();
        table.integer('attempts').defaultTo(0); // Track verification attempts
        table.boolean('verified').defaultTo(false);
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Foreign key
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

        // Indexes for performance
        table.index('user_id');
        table.index('expires_at');
    });

    // Add OTP enabled flag to users table if it doesn't exist
    const hasOtpEnabled = await knex.schema.hasColumn('users', 'otp_enabled');
    if (!hasOtpEnabled) {
        await knex.schema.table('users', function (table) {
            table.boolean('otp_enabled').defaultTo(false);
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('otp_codes');

    const hasOtpEnabled = await knex.schema.hasColumn('users', 'otp_enabled');
    if (hasOtpEnabled) {
        await knex.schema.table('users', function (table) {
            table.dropColumn('otp_enabled');
        });
    }
};
