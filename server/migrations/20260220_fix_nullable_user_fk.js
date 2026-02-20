/**
 * Make user_id nullable on answers and questions so that ON DELETE SET NULL
 * can function correctly. A prior migration changed the FK to SET NULL but
 * forgot to drop the NOT NULL constraint on the columns themselves.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const isPostgres = knex.client.config.client === 'postgresql';

    if (isPostgres) {
        // Make answers.user_id nullable
        await knex.raw('ALTER TABLE answers ALTER COLUMN user_id DROP NOT NULL');

        // Make questions.user_id nullable
        await knex.raw('ALTER TABLE questions ALTER COLUMN user_id DROP NOT NULL');

        console.log('[Migration] Made user_id nullable on answers and questions');
    }
    // SQLite does not enforce NOT NULL the same way and doesn't need altering
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    const isPostgres = knex.client.config.client === 'postgresql';

    if (isPostgres) {
        // Revert: set NOT NULL back (only safe if no NULLs exist)
        await knex.raw('ALTER TABLE answers ALTER COLUMN user_id SET NOT NULL');
        await knex.raw('ALTER TABLE questions ALTER COLUMN user_id SET NOT NULL');

        console.log('[Migration] Reverted: SET NOT NULL on answers.user_id and questions.user_id');
    }
};
