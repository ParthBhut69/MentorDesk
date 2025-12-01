/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        // Create trending_topics table for caching calculated trending scores
        .createTable('trending_topics', function (table) {
            table.increments('id').primary();
            table.integer('topic_id').unsigned().notNullable().references('id').inTable('tags').onDelete('CASCADE');
            table.float('trending_score').defaultTo(0);
            table.integer('views_count').defaultTo(0);
            table.integer('posts_count').defaultTo(0);
            table.integer('likes_count').defaultTo(0);
            table.integer('replies_count').defaultTo(0);
            table.integer('searches_count').defaultTo(0);
            table.float('growth_rate').defaultTo(0); // Percentage growth vs previous period
            table.integer('rank').defaultTo(0);
            table.timestamp('calculated_at').defaultTo(knex.fn.now());
            table.timestamps(true, true);

            // Indexes for performance
            table.index('topic_id');
            table.index(['trending_score'], 'trending_score_idx', {
                indexType: 'BTREE',
                storageEngineIndexType: 'btree'
            });
            table.index('calculated_at');
        })
        // Create topic_activity_logs table for tracking all user interactions
        .createTable('topic_activity_logs', function (table) {
            table.increments('id').primary();
            table.integer('topic_id').unsigned().notNullable().references('id').inTable('tags').onDelete('CASCADE');
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
            table.enum('activity_type', ['view', 'search', 'post', 'like', 'reply']).notNullable();
            table.integer('question_id').unsigned().references('id').inTable('questions').onDelete('CASCADE');
            table.integer('answer_id').unsigned().references('id').inTable('answers').onDelete('CASCADE');
            table.timestamp('created_at').defaultTo(knex.fn.now());

            // Composite index for efficient aggregation queries
            table.index(['topic_id', 'activity_type', 'created_at'], 'topic_activity_composite_idx');
            table.index('created_at');
            table.index('activity_type');
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('topic_activity_logs')
        .dropTableIfExists('trending_topics');
};
