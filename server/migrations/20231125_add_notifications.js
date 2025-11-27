/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        // Create notifications table
        .createTable('notifications', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('type').notNullable(); // 'new_answer', 'answer_upvoted', 'comment_reply', 'answer_accepted'
            table.text('content').notNullable();
            table.integer('related_id'); // question_id, answer_id, or comment_id
            table.string('related_type'); // 'question', 'answer', 'comment'
            table.boolean('read_status').defaultTo(false);
            table.timestamps(true, true);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('notifications');
};
