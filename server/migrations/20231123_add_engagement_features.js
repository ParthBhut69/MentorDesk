/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        // Add engagement columns to questions
        .table('questions', function (table) {
            table.integer('views').defaultTo(0);
            table.integer('upvotes').defaultTo(0);
        })
        // Add engagement columns to answers
        .table('answers', function (table) {
            table.integer('upvotes').defaultTo(0);
            table.boolean('is_accepted').defaultTo(false);
        })
        // Create votes table
        .createTable('votes', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('votable_type').notNullable(); // 'question' or 'answer'
            table.integer('votable_id').notNullable();
            table.string('vote_type').notNullable(); // 'upvote' or 'downvote'
            table.timestamps(true, true);
            table.unique(['user_id', 'votable_type', 'votable_id']);
        })
        // Create comments table
        .createTable('comments', function (table) {
            table.increments('id').primary();
            table.integer('answer_id').unsigned().notNullable().references('id').inTable('answers').onDelete('CASCADE');
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.text('comment_text').notNullable();
            table.timestamps(true, true);
        })
        // Create bookmarks table
        .createTable('bookmarks', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.integer('question_id').unsigned().notNullable().references('id').inTable('questions').onDelete('CASCADE');
            table.timestamps(true, true);
            table.unique(['user_id', 'question_id']);
        })
        // Create tags table
        .createTable('tags', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
            table.string('description');
            table.timestamps(true, true);
        })
        // Create question_tags junction table
        .createTable('question_tags', function (table) {
            table.integer('question_id').unsigned().notNullable().references('id').inTable('questions').onDelete('CASCADE');
            table.integer('tag_id').unsigned().notNullable().references('id').inTable('tags').onDelete('CASCADE');
            table.primary(['question_id', 'tag_id']);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('question_tags')
        .dropTableIfExists('tags')
        .dropTableIfExists('bookmarks')
        .dropTableIfExists('comments')
        .dropTableIfExists('votes')
        .table('answers', function (table) {
            table.dropColumn('upvotes');
            table.dropColumn('is_accepted');
        })
        .table('questions', function (table) {
            table.dropColumn('views');
            table.dropColumn('upvotes');
        });
};
