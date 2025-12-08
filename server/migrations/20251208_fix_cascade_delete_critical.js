/**
 * Critical Fix: Remove CASCADE delete from user_id foreign keys
 * 
 * PROBLEM: When a user is deleted, all their questions and answers are automatically
 * deleted due to CASCADE constraint. This is wrong for a Q&A platform where content
 * should persist as community knowledge.
 * 
 * SOLUTION: Change foreign keys to SET NULL and create anonymized "Deleted User" account
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    console.log('[Migration] Starting CASCADE delete fix...');

    // Create a system "Deleted User" account for anonymization
    const existingDeletedUser = await knex('users')
        .where({ email: 'deleted@system.local' })
        .first();

    let deletedUserId;
    if (!existingDeletedUser) {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('SYSTEM_DELETED_USER_NO_LOGIN', 10);

        [deletedUserId] = await knex('users').insert({
            name: '[Deleted User]',
            email: 'deleted@system.local',
            password: hashedPassword,
            role: 'user',
            is_active: false
        });

        console.log(`[Migration] Created deleted user account with ID: ${deletedUserId}`);
    } else {
        deletedUserId = existingDeletedUser.id;
        console.log(`[Migration] Deleted user account already exists with ID: ${deletedUserId}`);
    }

    const isPostgres = knex.client.config.client === 'postgresql';

    if (isPostgres) {
        console.log('[Migration] PostgreSQL detected - updating constraints...');

        await knex.raw(`
            ALTER TABLE questions 
            DROP CONSTRAINT IF EXISTS questions_user_id_foreign
        `);

        await knex.schema.alterTable('questions', (table) => {
            table.integer('user_id').unsigned().nullable().alter();
        });

        await knex.raw(`
            ALTER TABLE questions
            ADD CONSTRAINT questions_user_id_foreign
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE SET NULL
        `);

        await knex.raw(`
            ALTER TABLE answers 
            DROP CONSTRAINT IF EXISTS answers_user_id_foreign
        `);

        await knex.schema.alterTable('answers', (table) => {
            table.integer('user_id').unsigned().nullable().alter();
        });

        await knex.raw(`
            ALTER TABLE answers
            ADD CONSTRAINT answers_user_id_foreign
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE SET NULL
        `);

        console.log('[Migration] PostgreSQL: Updated foreign key constraints to SET NULL');
    } else {
        console.log('[Migration] SQLite detected - creating triggers...');

        try {
            await knex.raw('DROP TRIGGER IF EXISTS anonymize_questions_on_user_delete');
            await knex.raw('DROP TRIGGER IF EXISTS anonymize_answers_on_user_delete');
            await knex.raw('DROP TRIGGER IF EXISTS anonymize_votes_on_user_delete');
            await knex.raw('DROP TRIGGER IF EXISTS anonymize_comments_on_user_delete');
        } catch (error) {
            console.log('[Migration] Note: Some triggers did not exist (this is OK)');
        }

        const questionsExists = await knex.schema.hasTable('questions');
        const answersExists = await knex.schema.hasTable('answers');
        const votesExists = await knex.schema.hasTable('votes');
        const commentsExists = await knex.schema.hasTable('comments');

        if (questionsExists) {
            await knex.raw(`
                CREATE TRIGGER anonymize_questions_on_user_delete
                BEFORE DELETE ON users
                FOR EACH ROW
                BEGIN
                    UPDATE questions 
                    SET user_id = ${deletedUserId}
                    WHERE user_id = OLD.id;
                END;
            `);
            console.log('[Migration] Created trigger for questions');
        }

        if (answersExists) {
            await knex.raw(`
                CREATE TRIGGER anonymize_answers_on_user_delete
                BEFORE DELETE ON users
                FOR EACH ROW
                BEGIN
                    UPDATE answers 
                    SET user_id = ${deletedUserId}
                    WHERE user_id = OLD.id;
                END;
            `);
            console.log('[Migration] Created trigger for answers');
        }

        if (votesExists) {
            await knex.raw(`
                CREATE TRIGGER anonymize_votes_on_user_delete
                BEFORE DELETE ON users
                FOR EACH ROW
                BEGIN
                    UPDATE votes 
                    SET user_id = ${deletedUserId}
                    WHERE user_id = OLD.id;
                END;
            `);
            console.log('[Migration] Created trigger for votes');
        }

        if (commentsExists) {
            await knex.raw(`
                CREATE TRIGGER anonymize_comments_on_user_delete
                BEFORE DELETE ON users
                FOR EACH ROW
                BEGIN
                    UPDATE comments 
                    SET user_id = ${deletedUserId}
                    WHERE user_id = OLD.id;
                END;
            `);
            console.log('[Migration] Created trigger for comments');
        }

        console.log('[Migration] SQLite: Created triggers to anonymize content on user deletion');
    }

    const hasQuestionDeletedAt = await knex.schema.hasColumn('questions', 'deleted_at');
    if (!hasQuestionDeletedAt) {
        await knex.schema.table('questions', (table) => {
            table.timestamp('deleted_at').nullable();
            table.integer('deleted_by').unsigned().nullable();
        });

        await knex.raw('CREATE INDEX IF NOT EXISTS idx_questions_deleted_at ON questions(deleted_at)');
        console.log('[Migration] Added soft delete columns to questions table');
    } else {
        console.log('[Migration] Questions table already has soft delete columns');
    }

    const hasAnswerDeletedAt = await knex.schema.hasColumn('answers', 'deleted_at');
    if (!hasAnswerDeletedAt) {
        await knex.schema.table('answers', (table) => {
            table.timestamp('deleted_at').nullable();
            table.integer('deleted_by').unsigned().nullable();
        });

        await knex.raw('CREATE INDEX IF NOT EXISTS idx_answers_deleted_at ON answers(deleted_at)');
        console.log('[Migration] Added soft delete columns to answers table');
    } else {
        console.log('[Migration] Answers table already has soft delete columns');
    }

    console.log('[Migration] CASCADE delete fix completed successfully!');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    console.log('[Migration] Rolling back CASCADE delete fix...');

    const isPostgres = knex.client.config.client === 'postgresql';

    if (isPostgres) {
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
        console.log('[Migration] PostgreSQL: Reverted foreign key constraints to CASCADE');
    } else {
        await knex.raw('DROP TRIGGER IF EXISTS anonymize_questions_on_user_delete');
        await knex.raw('DROP TRIGGER IF EXISTS anonymize_answers_on_user_delete');
        await knex.raw('DROP TRIGGER IF EXISTS anonymize_votes_on_user_delete');
        await knex.raw('DROP TRIGGER IF EXISTS anonymize_comments_on_user_delete');
        console.log('[Migration] SQLite: Dropped anonymization triggers');
    }

    const hasQuestionDeletedAt = await knex.schema.hasColumn('questions', 'deleted_at');
    if (hasQuestionDeletedAt) {
        await knex.schema.table('questions', (table) => {
            table.dropColumn('deleted_at');
            table.dropColumn('deleted_by');
        });
        console.log('[Migration] Removed soft delete columns from questions table');
    }

    const hasAnswerDeletedAt = await knex.schema.hasColumn('answers', 'deleted_at');
    if (hasAnswerDeletedAt) {
        await knex.schema.table('answers', (table) => {
            table.dropColumn('deleted_at');
            table.dropColumn('deleted_by');
        });
        console.log('[Migration] Removed soft delete columns from answers table');
    }

    await knex('users').where({ email: 'deleted@system.local' }).del();
    console.log('[Migration] Deleted system "Deleted User" account');

    console.log('[Migration] Rollback completed');
};
