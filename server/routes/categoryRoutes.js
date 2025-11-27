const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getCategories,
    getCategory,
    createCategory
} = require('../controllers/categoryController');

// Get all categories
router.get('/', getCategories);

// Get single category
router.get('/:id', getCategory);

// Create category (protected)
router.post('/', protect, createCategory);

module.exports = router;
