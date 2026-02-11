const knex = require('knex');
const config = require('../knexfile');

// Use environment-aware configuration
const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

console.log(`[Database] Connected to ${environment} database`);

module.exports = db;
