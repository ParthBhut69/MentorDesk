/**
 * Gamification System Upgrade Migration
 * Adds reputation scoring, anti-gaming, streaks, founder gamification, and expanded badges
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {

    // ── 1. Add gamification fields to users table ──
    const hasReputation = await knex.schema.hasColumn('users', 'reputation_score');
    if (!hasReputation) {
        await knex.schema.table('users', function (table) {
            table.integer('reputation_score').defaultTo(0);
            table.integer('expert_score').defaultTo(0);
            table.float('response_speed_avg').defaultTo(0);
            table.float('quality_rating_avg').defaultTo(0);
            table.string('tier').defaultTo('Contributor');
            table.integer('weekly_score').defaultTo(0);
            table.integer('booking_discount_percentage').defaultTo(0);
            table.integer('founder_score').defaultTo(0);
            table.integer('best_streak').defaultTo(0);
        });
    }

    // ── 2. Create reputation_log table ──
    const hasReputationLog = await knex.schema.hasTable('reputation_log');
    if (!hasReputationLog) {
        await knex.schema.createTable('reputation_log', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE');
            table.string('action_type').notNullable();
            table.integer('points').notNullable();
            table.string('related_object_type');
            table.integer('related_object_id').unsigned();
            table.timestamp('created_at').defaultTo(knex.fn.now());

            // Indexes for performant queries
            table.index(['user_id', 'created_at']);
            table.index(['created_at']);
            table.index(['action_type']);
        });
    }

    // ── 3. Create daily_activity table (streaks) ──
    const hasDailyActivity = await knex.schema.hasTable('daily_activity');
    if (!hasDailyActivity) {
        await knex.schema.createTable('daily_activity', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE');
            table.date('login_date').notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());

            table.unique(['user_id', 'login_date']);
            table.index(['user_id']);
        });
    }

    // ── 4. Create vote_limits table (anti-gaming) ──
    const hasVoteLimits = await knex.schema.hasTable('vote_limits');
    if (!hasVoteLimits) {
        await knex.schema.createTable('vote_limits', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE');
            table.integer('target_user_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE');
            table.date('vote_date').notNullable();
            table.integer('vote_count').defaultTo(1);

            table.unique(['user_id', 'target_user_id', 'vote_date']);
            table.index(['user_id', 'vote_date']);
        });
    }

    // ── 5. Create suspicious_activity_log table ──
    const hasSuspicious = await knex.schema.hasTable('suspicious_activity_log');
    if (!hasSuspicious) {
        await knex.schema.createTable('suspicious_activity_log', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE');
            table.string('activity_type').notNullable();
            table.text('details');
            table.string('severity').defaultTo('low'); // low, medium, high
            table.timestamp('created_at').defaultTo(knex.fn.now());

            table.index(['user_id']);
            table.index(['created_at']);
        });
    }

    // ── 6. Add vote_type to question_likes if missing ──
    const hasVoteType = await knex.schema.hasColumn('question_likes', 'vote_type');
    if (!hasVoteType) {
        await knex.schema.table('question_likes', function (table) {
            table.string('vote_type').defaultTo('like'); // 'like' or 'dislike'
        });
    }

    // ── 7. Add benefit columns to badges if missing ──
    const hasBenefitType = await knex.schema.hasColumn('badges', 'benefit_type');
    if (!hasBenefitType) {
        await knex.schema.table('badges', function (table) {
            table.string('benefit_type'); // 'profile_boost', 'booking_discount', 'answer_priority', null
            table.string('benefit_value'); // e.g. '10', 'featured', 'priority'
            table.string('category').defaultTo('activity'); // 'activity', 'tier', 'streak', 'founder'
        });
    }

    // ── 8. Insert new badges ──
    const existingBadges = await knex('badges').select('name');
    const existingNames = existingBadges.map(b => b.name);

    const newBadges = [
        // Streak badges
        { name: 'Streak Starter', description: 'Maintained a 7-day login streak', icon: '🔥', requirement_type: 'streak', requirement_value: 7, tier: 'bronze', category: 'streak' },
        { name: 'Consistency King', description: 'Maintained a 30-day login streak', icon: '👑', requirement_type: 'streak', requirement_value: 30, tier: 'gold', category: 'streak', benefit_type: 'profile_boost', benefit_value: 'featured' },

        // Speed badge
        { name: 'Speed Demon', description: 'Average response time under 60 minutes', icon: '⚡', requirement_type: 'response_speed', requirement_value: 60, tier: 'gold', category: 'activity', benefit_type: 'answer_priority', benefit_value: 'priority' },

        // Tier badges
        { name: 'Top Expert', description: 'Reached Top Expert tier', icon: '🎯', requirement_type: 'tier', requirement_value: 600, tier: 'gold', category: 'tier' },
        { name: 'Elite Mentor', description: 'Reached Elite Mentor tier', icon: '💎', requirement_type: 'tier', requirement_value: 1200, tier: 'platinum', category: 'tier', benefit_type: 'booking_discount', benefit_value: '10' },
        { name: 'MentorDesk Authority', description: 'Reached MentorDesk Authority tier', icon: '🏛️', requirement_type: 'tier', requirement_value: 2500, tier: 'platinum', category: 'tier', benefit_type: 'booking_discount', benefit_value: '20' },

        // Founder badges
        { name: 'Active Founder', description: 'Earned 50+ founder score', icon: '🚀', requirement_type: 'founder_score', requirement_value: 50, tier: 'silver', category: 'founder' },
        { name: 'Thoughtful Questioner', description: 'Earned 150+ founder score', icon: '🧠', requirement_type: 'founder_score', requirement_value: 150, tier: 'gold', category: 'founder' },
        { name: 'Problem Solver', description: 'Got 25+ answers accepted', icon: '🔧', requirement_type: 'accepted_answers', requirement_value: 25, tier: 'silver', category: 'activity' },
        { name: 'Consistent Member', description: 'Earned 300+ founder score', icon: '🌟', requirement_type: 'founder_score', requirement_value: 300, tier: 'gold', category: 'founder', benefit_type: 'profile_boost', benefit_value: 'featured' },
    ];

    const toInsert = newBadges.filter(b => !existingNames.includes(b.name));
    if (toInsert.length > 0) {
        await knex('badges').insert(toInsert);
    }

    // ── 9. Migrate existing users: seed reputation_score from points ──
    await knex.raw(`
        UPDATE users SET reputation_score = COALESCE(points, 0) WHERE reputation_score = 0 OR reputation_score IS NULL
    `);

    // ── 10. Migrate existing user tiers ──
    await knex.raw(`UPDATE users SET tier = 'Contributor' WHERE COALESCE(reputation_score, 0) < 200`);
    await knex.raw(`UPDATE users SET tier = 'Senior Contributor' WHERE reputation_score >= 200 AND reputation_score < 600`);
    await knex.raw(`UPDATE users SET tier = 'Top Expert' WHERE reputation_score >= 600 AND reputation_score < 1200`);
    await knex.raw(`UPDATE users SET tier = 'Elite Mentor' WHERE reputation_score >= 1200 AND reputation_score < 2500`);
    await knex.raw(`UPDATE users SET tier = 'MentorDesk Authority' WHERE reputation_score >= 2500`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('suspicious_activity_log');
    await knex.schema.dropTableIfExists('vote_limits');
    await knex.schema.dropTableIfExists('daily_activity');
    await knex.schema.dropTableIfExists('reputation_log');

    const hasReputation = await knex.schema.hasColumn('users', 'reputation_score');
    if (hasReputation) {
        await knex.schema.table('users', function (table) {
            table.dropColumn('reputation_score');
            table.dropColumn('expert_score');
            table.dropColumn('response_speed_avg');
            table.dropColumn('quality_rating_avg');
            table.dropColumn('tier');
            table.dropColumn('weekly_score');
            table.dropColumn('booking_discount_percentage');
            table.dropColumn('founder_score');
            table.dropColumn('best_streak');
        });
    }

    const hasBenefitType = await knex.schema.hasColumn('badges', 'benefit_type');
    if (hasBenefitType) {
        await knex.schema.table('badges', function (table) {
            table.dropColumn('benefit_type');
            table.dropColumn('benefit_value');
            table.dropColumn('category');
        });
    }

    // Remove new badges
    await knex('badges').whereIn('name', [
        'Streak Starter', 'Consistency King', 'Speed Demon',
        'Top Expert', 'Elite Mentor', 'MentorDesk Authority',
        'Active Founder', 'Thoughtful Questioner', 'Problem Solver', 'Consistent Member'
    ]).del();
};
