// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

    development: {
        client: 'sqlite3',
        connection: {
            filename: './dev.sqlite3'
        },
        useNullAsDefault: true,
        migrations: {
            directory: './migrations'
        },
        // Seeds are ONLY configured for local development.
        // Never run knex seed:run in production.
        seeds: {
            directory: './seeds'
        }
    },

    production: {
        client: 'postgresql',
        connection: {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './migrations'
        }
        // NOTE: No seeds config in production.
        // Seeding in production would DELETE all user data.
    }

};
