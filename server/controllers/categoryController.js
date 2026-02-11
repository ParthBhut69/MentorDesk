const db = require('../db/db');

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = await db('categories')
            .select('*')
            .orderBy('name', 'asc');

        // Add follower count for each category
        for (let category of categories) {
            const followerCount = await db('follows')
                .where({
                    followed_id: category.id,
                    followed_type: 'category'
                })
                .count('id as count')
                .first();

            category.follower_count = followerCount.count;
        }

        res.json(categories);
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({ message: 'Failed to get categories' });
    }
};

// Get single category by slug or id
const getCategory = async (req, res) => {
    try {
        const { id } = req.params;
        let category;

        if (isNaN(id)) {
            // Assume slug
            category = await db('categories').where('slug', id).first();
        } else {
            category = await db('categories').where('id', id).first();
        }

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Get follower count
        const followerCount = await db('follows')
            .where({
                followed_id: category.id,
                followed_type: 'category'
            })
            .count('id as count')
            .first();

        category.follower_count = followerCount.count;

        res.json(category);
    } catch (error) {
        console.error('Error getting category:', error);
        res.status(500).json({ message: 'Failed to get category' });
    }
};

// Create category (admin only - simplified for now)
const createCategory = async (req, res) => {
    try {
        const { name, description, image_url } = req.body;
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const existing = await db('categories').where('slug', slug).first();
        if (existing) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const [id] = await db('categories').insert({
            name,
            slug,
            description,
            image_url
        }).returning('id');

        const newCategory = await db('categories').where('id', id).first();
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Failed to create category' });
    }
};

module.exports = {
    getCategories,
    getCategory,
    createCategory
};
