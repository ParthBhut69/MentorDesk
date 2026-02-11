/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const table = 'users';
    const columns = ['location', 'website', 'linkedin', 'twitter', 'github', 'avatar_url'];

    for (const column of columns) {
        const hasColumn = await knex.schema.hasColumn(table, column);
        if (!hasColumn) {
            await knex.schema.table(table, function (t) {
                if (column === 'avatar_url') {
                    t.text(column).nullable();
                } else {
                    t.string(column).nullable();
                }
            });
        }
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    // We don't want to drop these in down migration easily as it might lose data, 
    // but for strict reversibility we could. 
    // However, since this is a fix migration, we can leave down empty or drop if strictly needed.
    // Let's leave it empty to be safe against accidental rollbacks destroying data.
};
