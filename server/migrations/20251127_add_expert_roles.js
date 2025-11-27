/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .table('users', function (table) {
            table.string('expert_role'); // 'CA', 'HR', 'Marketing', 'Lawyer', null
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .table('users', function (table) {
            table.dropColumn('expert_role');
        });
};
