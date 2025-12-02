/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Add gamification fields to users table
    const hasXp = await knex.schema.hasColumn('users', 'xp');
    if (!hasXp) {
        await knex.schema.table('users', function (table) {
            table.integer('xp').defaultTo(0);
            table.integer('level').defaultTo(1);
            table.integer('login_streak').defaultTo(0);
            table.date('last_login_date');
        });
    }

    // Create badges table
    const hasBadges = await knex.schema.hasTable('badges');
    if (!hasBadges) {
        await knex.schema.createTable('badges', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.text('description');
            table.string('icon').notNullable();
            table.string('requirement_type').notNullable(); // 'points', 'questions', 'answers', 'accepted_answers', 'followers'
            table.integer('requirement_value').notNullable();
            table.string('tier').defaultTo('bronze'); // bronze, silver, gold, platinum
            table.timestamps(true, true);
        });

        // Insert default badges
        await knex('badges').insert([
            { name: 'First Question', description: 'Asked your first question', icon: '❓', requirement_type: 'questions', requirement_value: 1, tier: 'bronze' },
            { name: 'Curious Mind', description: 'Asked 10 questions', icon: '🤔', requirement_type: 'questions', requirement_value: 10, tier: 'silver' },
            { name: 'Question Master', description: 'Asked 50 questions', icon: '🎯', requirement_type: 'questions', requirement_value: 50, tier: 'gold' },

            { name: 'First Answer', description: 'Posted your first answer', icon: '💡', requirement_type: 'answers', requirement_value: 1, tier: 'bronze' },
            { name: 'Helper', description: 'Posted 10 answers', icon: '🤝', requirement_type: 'answers', requirement_value: 10, tier: 'silver' },
            { name: 'Answer Expert', description: 'Posted 50 answers', icon: '⭐', requirement_type: 'answers', requirement_value: 50, tier: 'gold' },

            { name: 'Accepted', description: 'Got your first answer accepted', icon: '✅', requirement_type: 'accepted_answers', requirement_value: 1, tier: 'bronze' },
            { name: 'Trusted Advisor', description: 'Got 10 answers accepted', icon: '🏆', requirement_type: 'accepted_answers', requirement_value: 10, tier: 'silver' },
            { name: 'Guru', description: 'Got 50 answers accepted', icon: '👑', requirement_type: 'accepted_answers', requirement_value: 50, tier: 'gold' },

            { name: 'Rising Star', description: 'Earned 100 points', icon: '🌟', requirement_type: 'points', requirement_value: 100, tier: 'bronze' },
            { name: 'Influencer', description: 'Earned 500 points', icon: '💎', requirement_type: 'points', requirement_value: 500, tier: 'silver' },
            { name: 'Legend', description: 'Earned 1500 points', icon: '🔥', requirement_type: 'points', requirement_value: 1500, tier: 'gold' },

            { name: 'Popular', description: 'Got 10 followers', icon: '👥', requirement_type: 'followers', requirement_value: 10, tier: 'bronze' },
            { name: 'Community Leader', description: 'Got 50 followers', icon: '🎖️', requirement_type: 'followers', requirement_value: 50, tier: 'silver' },
            { name: 'Celebrity', description: 'Got 100 followers', icon: '🌠', requirement_type: 'followers', requirement_value: 100, tier: 'gold' }
        ]);
    }

    // Create user_badges table
    const hasUserBadges = await knex.schema.hasTable('user_badges');
    if (!hasUserBadges) {
        await knex.schema.createTable('user_badges', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.integer('badge_id').unsigned().notNullable().references('id').inTable('badges').onDelete('CASCADE');
            table.timestamp('earned_at').defaultTo(knex.fn.now());
            table.unique(['user_id', 'badge_id']);
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('user_badges');
    await knex.schema.dropTableIfExists('badges');

    await knex.schema.table('users', function (table) {
        table.dropColumn('xp');
        table.dropColumn('level');
        table.dropColumn('login_streak');
        table.dropColumn('last_login_date');
    });
};
