/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Add soft delete columns to users table
    const hasDeletedAt = await knex.schema.hasColumn('users', 'deleted_at');
    const hasDeletedBy = await knex.schema.hasColumn('users', 'deleted_by');

    await knex.schema.table('users', function (table) {
        if (!hasDeletedAt) {
            table.timestamp('deleted_at').nullable();
        }
        if (!hasDeletedBy) {
            table.integer('deleted_by').unsigned().nullable()
                .references('id').inTable('users');
        }
    });

    // Add index for performance on soft delete queries
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at)');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.table('users', function (table) {
        table.dropColumn('deleted_at');
        table.dropColumn('deleted_by');
    });

    await knex.raw('DROP INDEX IF EXISTS idx_users_deleted_at');
};
