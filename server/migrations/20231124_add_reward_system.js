/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        // Add points and rank to users table
        .table('users', function (table) {
            table.integer('points').defaultTo(0);
            table.string('rank').defaultTo('Beginner'); // Beginner, Contributor, Helper, Mentor, Expert
        })
        // Create rewards_log table
        .createTable('rewards_log', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('action_type').notNullable(); // 'answer_posted', 'answer_upvoted', 'answer_accepted'
            table.integer('points_awarded').notNullable();
            table.integer('related_id'); // question_id or answer_id
            table.timestamps(true, true);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('rewards_log')
        .table('users', function (table) {
            table.dropColumn('points');
            table.dropColumn('rank');
        });
};
