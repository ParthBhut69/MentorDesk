/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Create likes table for answer likes
    const hasLikes = await knex.schema.hasTable('answer_likes');
    if (!hasLikes) {
        await knex.schema.createTable('answer_likes', function (table) {
            table.increments('id').primary();
            table.integer('answer_id').unsigned().notNullable()
                .references('id').inTable('answers').onDelete('CASCADE');
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE');
            table.timestamp('created_at').defaultTo(knex.fn.now());

            // Ensure a user can only like an answer once
            table.unique(['answer_id', 'user_id']);

            // Index for faster queries
            table.index(['answer_id']);
            table.index(['user_id']);
        });
    }

    // Create question_likes table for question upvotes
    const hasQuestionLikes = await knex.schema.hasTable('question_likes');
    if (!hasQuestionLikes) {
        await knex.schema.createTable('question_likes', function (table) {
            table.increments('id').primary();
            table.integer('question_id').unsigned().notNullable()
                .references('id').inTable('questions').onDelete('CASCADE');
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE');
            table.timestamp('created_at').defaultTo(knex.fn.now());

            // Ensure a user can only like a question once
            table.unique(['question_id', 'user_id']);

            // Index for faster queries
            table.index(['question_id']);
            table.index(['user_id']);
        });
    }

    // Create points_history table to track all point changes
    const hasPointsHistory = await knex.schema.hasTable('points_history');
    if (!hasPointsHistory) {
        await knex.schema.createTable('points_history', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE');
            table.integer('points').notNullable(); // Can be positive or negative
            table.string('action').notNullable(); // 'ask_question', 'give_answer', 'receive_like', etc.
            table.integer('reference_id').unsigned(); // ID of the question/answer/like that triggered this
            table.string('reference_type'); // 'question', 'answer', 'like'
            table.timestamp('created_at').defaultTo(knex.fn.now());

            // Index for user queries
            table.index(['user_id', 'created_at']);
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('points_history');
    await knex.schema.dropTableIfExists('question_likes');
    await knex.schema.dropTableIfExists('answer_likes');
};
