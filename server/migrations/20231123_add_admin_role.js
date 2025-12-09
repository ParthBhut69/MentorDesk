/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const hasRole = await knex.schema.hasColumn('users', 'role');
    const hasActive = await knex.schema.hasColumn('users', 'is_active');

    return knex.schema.table('users', function (table) {
        if (!hasRole) {
            table.string('role').defaultTo('user'); // 'user' or 'admin'
        }
        if (!hasActive) {
            table.boolean('is_active').defaultTo(true);
        }
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('users', function (table) {
        table.dropColumn('role');
        table.dropColumn('is_active');
    });
};
