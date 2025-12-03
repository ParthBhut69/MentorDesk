/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const hasResetToken = await knex.schema.hasColumn('users', 'reset_password_token');
    const hasResetExpires = await knex.schema.hasColumn('users', 'reset_password_expires');

    await knex.schema.table('users', function (table) {
        if (!hasResetToken) {
            table.string('reset_password_token');
        }
        if (!hasResetExpires) {
            table.timestamp('reset_password_expires');
        }
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.table('users', function (table) {
        table.dropColumn('reset_password_token');
        table.dropColumn('reset_password_expires');
    });
};
