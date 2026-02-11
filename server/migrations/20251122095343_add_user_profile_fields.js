/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const hasBio = await knex.schema.hasColumn('users', 'bio');
    if (!hasBio) {
        return knex.schema.table('users', function (table) {
            table.text('bio').nullable();
            table.string('location').nullable();
            table.string('website').nullable();
            table.string('linkedin').nullable();
            table.string('twitter').nullable();
            table.string('github').nullable();
            table.text('avatar_url').nullable();
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('users', function (table) {
        table.dropColumn('bio');
        table.dropColumn('location');
        table.dropColumn('website');
        table.dropColumn('linkedin');
        table.dropColumn('twitter');
        table.dropColumn('github');
        table.dropColumn('avatar_url');
    });
};
