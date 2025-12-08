/**
 * Add soft delete columns to questions and answers
 * Update foreign key constraints to SET NULL instead of CASCADE
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    console.log('[Migration] Starting soft delete and foreign key update...');

    const isPostgres = knex.client.config.client === 'postgresql';

    // Update foreign key constraints
    if (isPostgres) {
        console.log('[Migration] PostgreSQL: Updating foreign key constraints...');

        // Questions table
        await knex.raw(`
            ALTER TABLE questions 
            DROP CONSTRAINT IF EXISTS questions_user_id_foreign
        `);

        await knex.raw(`
            ALTER TABLE questions
            ADD CONSTRAINT questions_user_id_foreign
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE SET NULL
        `);

        // Answers table
        await knex.raw(`
            ALTER TABLE answers 
            DROP CONSTRAINT IF EXISTS answers_user_id_foreign
        `);

        await knex.raw(`
            ALTER TABLE answers
            ADD CONSTRAINT answers_user_id_foreign
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE SET NULL
        `);

        console.log('[Migration] PostgreSQL: Foreign key constraints updated');
    }

    // Add soft delete columns to questions
    const hasQuestionDeletedAt = await knex.schema.hasColumn('questions', 'deleted_at');
    if (!hasQuestionDeletedAt) {
        await knex.schema.table('questions', (table) => {
            table.timestamp('deleted_at').nullable();
            table.integer('deleted_by').unsigned().nullable();
        });

        await knex.raw('CREATE INDEX IF NOT EXISTS idx_questions_deleted_at ON questions(deleted_at)');
        console.log('[Migration] Added soft delete columns to questions');
    }

    // Add soft delete columns to answers
    const hasAnswerDeletedAt = await knex.schema.hasColumn('answers', 'deleted_at');
    if (!hasAnswerDeletedAt) {
        await knex.schema.table('answers', (table) => {
            table.timestamp('deleted_at').nullable();
            table.integer('deleted_by').unsigned().nullable();
        });

        await knex.raw('CREATE INDEX IF NOT EXISTS idx_answers_deleted_at ON answers(deleted_at)');
        console.log('[Migration] Added soft delete columns to answers');
    }

    console.log('[Migration] Soft delete and foreign key update completed!');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    console.log('[Migration] Rolling back soft delete...');

    const isPostgres = knex.client.config.client === 'postgresql';

    if (isPostgres) {
        // Revert to CASCADE
        await knex.raw(`
            ALTER TABLE questions 
            DROP CONSTRAINT IF EXISTS questions_user_id_foreign
        `);

        await knex.raw(`
            ALTER TABLE questions
            ADD CONSTRAINT questions_user_id_foreign
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE CASCADE
        `);

        await knex.raw(`
            ALTER TABLE answers 
            DROP CONSTRAINT IF EXISTS answers_user_id_foreign
        `);

        await knex.raw(`
            ALTER TABLE answers
            ADD CONSTRAINT answers_user_id_foreign
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE CASCADE
        `);
    }

    // Remove soft delete columns
    const hasQuestionDeletedAt = await knex.schema.hasColumn('questions', 'deleted_at');
    if (hasQuestionDeletedAt) {
        await knex.schema.table('questions', (table) => {
            table.dropColumn('deleted_at');
            table.dropColumn('deleted_by');
        });
    }

    const hasAnswerDeletedAt = await knex.schema.hasColumn('answers', 'deleted_at');
    if (hasAnswerDeletedAt) {
        await knex.schema.table('answers', (table) => {
            table.dropColumn('deleted_at');
            table.dropColumn('deleted_by');
        });
    }

    console.log('[Migration] Rollback completed');
};
