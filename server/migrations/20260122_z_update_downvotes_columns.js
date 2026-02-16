/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Add downvotes column to questions table
    const hasDownvotesQuestions = await knex.schema.hasColumn('questions', 'downvotes');
    if (!hasDownvotesQuestions) {
        await knex.schema.table('questions', function (table) {
            table.integer('downvotes').defaultTo(0);
        });
    }

    // Add vote_type column to question_likes table
    const hasVoteType = await knex.schema.hasColumn('question_likes', 'vote_type');
    if (!hasVoteType) {
        await knex.schema.table('question_likes', function (table) {
            table.string('vote_type').defaultTo('like'); // 'like' or 'dislike'
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    // SQLite doesn't support dropping columns easily in some versions, 
    // but knex usually handles it.
    await knex.schema.table('questions', function (table) {
        table.dropColumn('downvotes');
    });
    await knex.schema.table('answers', function (table) {
        table.dropColumn('downvotes');
    });
    // We keep existing columns in down migration to avoid data loss during development toggles
    // unless strictly required.
};
