const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
    // Delete in dependency order to avoid FK constraint violations.
    // Tables with FK references to users/questions/answers must be cleared first.
    const tablesToClear = [
        'points_history',
        'badges_awarded',
        'leaderboard',
        'notifications',
        'answer_likes',
        'question_likes',
        'votes',
        'bookmarks',
        'comments',
        'question_tags',
        'answers',
        'questions',
        'users',
    ];

    for (const table of tablesToClear) {
        const exists = await knex.schema.hasTable(table);
        if (exists) {
            await knex(table).del();
        }
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await knex('users').insert([
        {
            name: 'Admin User',
            email: 'admin@mentordesk.com',
            password: hashedPassword,
            role: 'admin',
            is_active: true,
            points: 1000,
            rank: 'Admin',
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            name: 'Expert User',
            email: 'expert@mentordesk.com',
            password: hashedPassword,
            role: 'user',
            is_active: true,
            is_verified_expert: true,
            expert_role: 'IT',
            points: 500,
            rank: 'Expert',
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            name: 'Regular User',
            email: 'user@mentordesk.com',
            password: hashedPassword,
            role: 'user',
            is_active: true,
            points: 50,
            rank: 'Beginner',
            created_at: new Date(),
            updated_at: new Date()
        }
    ]);
};
