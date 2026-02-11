const express = require('express');
const router = express.Router();
const { search, searchUsers } = require('../controllers/searchController');

// Search questions and answers
router.get('/', search);

// Search users
router.get('/users', searchUsers);

module.exports = router;
