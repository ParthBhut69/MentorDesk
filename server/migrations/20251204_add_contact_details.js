/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const hasPhone = await knex.schema.hasColumn('users', 'phone');
    const hasAddress = await knex.schema.hasColumn('users', 'address');
    const hasCity = await knex.schema.hasColumn('users', 'city');
    const hasCountry = await knex.schema.hasColumn('users', 'country');
    const hasPostalCode = await knex.schema.hasColumn('users', 'postal_code');

    await knex.schema.table('users', function (table) {
        if (!hasPhone) {
            table.string('phone', 20).nullable();
        }
        if (!hasAddress) {
            table.string('address', 255).nullable();
        }
        if (!hasCity) {
            table.string('city', 100).nullable();
        }
        if (!hasCountry) {
            table.string('country', 100).nullable();
        }
        if (!hasPostalCode) {
            table.string('postal_code', 20).nullable();
        }
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('users', function (table) {
        table.dropColumn('phone');
        table.dropColumn('address');
        table.dropColumn('city');
        table.dropColumn('country');
        table.dropColumn('postal_code');
    });
};
