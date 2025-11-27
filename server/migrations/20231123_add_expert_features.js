/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        // Add expert columns to users
        .table('users', function (table) {
            table.boolean('is_verified_expert').defaultTo(false);
            table.text('expertise_areas'); // JSON array
            table.text('bio');
            table.integer('follower_count').defaultTo(0);
            table.integer('answer_count').defaultTo(0);
            table.integer('best_answer_count').defaultTo(0);
        })
        // Create followers table
        .createTable('followers', function (table) {
            table.increments('id').primary();
            table.integer('follower_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.integer('following_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.timestamps(true, true);
            table.unique(['follower_id', 'following_id']);
        })
        // Create expert_applications table
        .createTable('expert_applications', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.text('expertise_areas').notNullable();
            table.text('credentials');
            table.string('linkedin_url');
            table.string('portfolio_url');
            table.string('status').defaultTo('pending'); // pending, approved, rejected
            table.timestamps(true, true);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('expert_applications')
        .dropTableIfExists('followers')
        .table('users', function (table) {
            table.dropColumn('is_verified_expert');
            table.dropColumn('expertise_areas');
            table.dropColumn('bio');
            table.dropColumn('follower_count');
            table.dropColumn('answer_count');
            table.dropColumn('best_answer_count');
        });
};
