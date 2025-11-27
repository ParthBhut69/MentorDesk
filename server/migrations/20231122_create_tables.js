/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('users', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('email').notNullable().unique();
            table.string('password').notNullable();
            table.timestamps(true, true); // created_at, updated_at
        })
        .createTable('questions', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('title').notNullable();
            table.text('description').notNullable();
            table.timestamps(true, true);
        })
        .createTable('answers', function (table) {
            table.increments('id').primary();
            table.integer('question_id').unsigned().notNullable().references('id').inTable('questions').onDelete('CASCADE');
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.text('answer_text').notNullable();
            table.timestamps(true, true);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('answers')
        .dropTableIfExists('questions')
        .dropTableIfExists('users');
};
