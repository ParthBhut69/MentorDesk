/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('categories', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
            table.string('slug').notNullable().unique();
            table.string('description');
            table.string('image_url');
            table.timestamps(true, true);
        })
        .createTable('follows', function (table) {
            table.increments('id').primary();
            table.integer('follower_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.integer('followed_id').unsigned().notNullable();
            table.string('followed_type').notNullable(); // 'user', 'category', 'tag'
            table.timestamps(true, true);
            table.unique(['follower_id', 'followed_id', 'followed_type']);
        })
        .then(async () => {
            // Migrate existing followers
            const hasFollowersTable = await knex.schema.hasTable('followers');
            if (hasFollowersTable) {
                const followers = await knex('followers').select('*');
                const follows = followers.map(f => ({
                    follower_id: f.follower_id,
                    followed_id: f.following_id,
                    followed_type: 'user',
                    created_at: f.created_at || new Date()
                }));
                if (follows.length > 0) {
                    await knex('follows').insert(follows);
                }
            }
        })
        .then(() => {
            return knex.schema.dropTableIfExists('followers');
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .createTable('followers', function (table) {
            table.increments('id').primary();
            table.integer('follower_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.integer('following_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.timestamps(true, true);
            table.unique(['follower_id', 'following_id']);
        })
        .then(async () => {
            // Restore followers from follows table (only user follows)
            const follows = await knex('follows').where('followed_type', 'user').select('*');
            const followers = follows.map(f => ({
                follower_id: f.follower_id,
                following_id: f.followed_id,
                created_at: f.created_at
            }));
            if (followers.length > 0) {
                await knex('followers').insert(followers);
            }
        })
        .dropTableIfExists('follows')
        .dropTableIfExists('categories');
};
