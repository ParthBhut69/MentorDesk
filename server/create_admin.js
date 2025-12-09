
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'dev.sqlite3');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

const SALT_ROUNDS = 10;
const EMAIL = 'admin@mentordesk.com';
const PASSWORD = 'admin123';
const NAME = 'Admin';

bcrypt.hash(PASSWORD, SALT_ROUNDS, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }

    const now = new Date().toISOString();

    // Check if user exists
    db.get('SELECT id FROM users WHERE email = ?', [EMAIL], (err, row) => {
        if (err) {
            console.error('Error checking user:', err);
            return;
        }

        if (row) {
            console.log(`User ${EMAIL} already exists (ID: ${row.id}). Updating role to admin and resetting password...`);
            db.run("UPDATE users SET role = 'admin', password = ? WHERE id = ?", [hash, row.id], function (err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`User updated. admin login: ${EMAIL} / ${PASSWORD}`);
            });
        } else {
            console.log(`Creating new admin user ${EMAIL}...`);
            db.run(
                `INSERT INTO users (name, email, password, role, created_at, updated_at, is_active, is_verified_expert) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [NAME, EMAIL, hash, 'admin', now, now, 1, 0],
                function (err) {
                    if (err) {
                        return console.error(err.message);
                    }
                    console.log(`Admin user created successfully.`);
                    console.log(`Login: ${EMAIL}`);
                    console.log(`Password: ${PASSWORD}`);
                }
            );
        }
    });
});
