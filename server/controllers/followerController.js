const db = require('../db/db');

// Follow an entity (user, category, tag)
const followUser = async (req, res) => {
    try {
        const { user_id, type = 'user' } = req.body;
        const follower_id = req.user.id;
        const followed_id = user_id; // For backward compatibility, or generic usage

        // Can't follow yourself
        if (type === 'user' && parseInt(followed_id) === follower_id) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        // Check if already following
        const existing = await db('follows')
            .where({
                follower_id,
                followed_id,
                followed_type: type
            })
            .first();

        if (existing) {
            return res.status(400).json({ message: `Already following this ${type}` });
        }

        // Create follow relationship
        await db('follows').insert({
            follower_id,
            followed_id,
            followed_type: type
        }).returning('id');

        // Increment follower count if it's a user
        if (type === 'user') {
            await db('users').where('id', followed_id).increment('follower_count', 1);
        }

        res.json({ message: `Followed ${type} successfully` });
    } catch (error) {
        console.error('Error following:', error);
        res.status(500).json({ message: 'Failed to follow' });
    }
};

// Unfollow an entity
const unfollowUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { type = 'user' } = req.query; // Pass type as query param for delete
        const follower_id = req.user.id;
        const followed_id = user_id;

        const result = await db('follows')
            .where({
                follower_id,
                followed_id,
                followed_type: type
            })
            .del();

        if (result === 0) {
            return res.status(404).json({ message: `Not following this ${type}` });
        }

        // Decrement follower count if it's a user
        if (type === 'user') {
            await db('users').where('id', followed_id).decrement('follower_count', 1);
        }

        res.json({ message: `Unfollowed ${type} successfully` });
    } catch (error) {
        console.error('Error unfollowing:', error);
        res.status(500).json({ message: 'Failed to unfollow' });
    }
};

// Get user's followers (only for users for now)
const getFollowers = async (req, res) => {
    try {
        const { user_id } = req.params;

        const followers = await db('follows')
            .where({
                followed_id: user_id,
                followed_type: 'user'
            })
            .join('users', 'follows.follower_id', 'users.id')
            .select('users.id', 'users.name', 'users.email', 'users.points', 'users.rank', 'users.is_verified_expert')
            .orderBy('follows.created_at', 'desc');

        res.json(followers);
    } catch (error) {
        console.error('Error getting followers:', error);
        res.status(500).json({ message: 'Failed to get followers' });
    }
};

// Get users/entities that a user is following
const getFollowing = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { type } = req.query; // Optional filter by type

        let query = db('follows')
            .where('follower_id', user_id);

        if (type) {
            query = query.where('followed_type', type);
        }

        const following = await query.orderBy('created_at', 'desc');

        // Enrich data based on type (this might be complex if mixed types are returned)
        // For now, if type is specified, we can join. If not, we just return the raw follows.
        // Or we can fetch details for each.

        if (type === 'user') {
            const users = await db('follows')
                .where({ follower_id: user_id, followed_type: 'user' })
                .join('users', 'follows.followed_id', 'users.id')
                .select('users.id', 'users.name', 'users.email', 'users.points', 'users.rank', 'users.is_verified_expert');
            return res.json(users);
        } else if (type === 'category') {
            const categories = await db('follows')
                .where({ follower_id: user_id, followed_type: 'category' })
                .join('categories', 'follows.followed_id', 'categories.id')
                .select('categories.*');
            return res.json(categories);
        } else if (type === 'tag') {
            // Assuming tags table exists
            const tags = await db('follows')
                .where({ follower_id: user_id, followed_type: 'tag' })
                .join('tags', 'follows.followed_id', 'tags.id')
                .select('tags.*');
            return res.json(tags);
        }

        res.json(following);
    } catch (error) {
        console.error('Error getting following:', error);
        res.status(500).json({ message: 'Failed to get following' });
    }
};

// Get feed (questions from followed users, categories, tags)
const getFeed = async (req, res) => {
    try {
        const user_id = req.user.id;

        // Get all follows
        const follows = await db('follows').where('follower_id', user_id);

        const followedUserIds = follows.filter(f => f.followed_type === 'user').map(f => f.followed_id);
        const followedTagIds = follows.filter(f => f.followed_type === 'tag').map(f => f.followed_id);
        // Categories might map to tags or be separate. Assuming questions have tags.

        const query = db('questions')
            .join('users', 'questions.user_id', 'users.id')
            .leftJoin('question_tags', 'questions.id', 'question_tags.question_id')
            .select(
                'questions.*',
                'users.name as author_name',
                'users.rank as author_rank'
            )
            .distinct('questions.id');

        query.where(builder => {
            // Questions from followed users
            if (followedUserIds.length > 0) {
                builder.orWhereIn('questions.user_id', followedUserIds);
            }
            // Questions with followed tags
            if (followedTagIds.length > 0) {
                builder.orWhereIn('question_tags.tag_id', followedTagIds);
            }
        });

        const feed = await query
            .orderBy('questions.created_at', 'desc')
            .limit(20);

        res.json(feed);
    } catch (error) {
        console.error('Error getting feed:', error);
        res.status(500).json({ message: 'Failed to get feed' });
    }
};

// Check if following a user/entity
const checkFollowing = async (req, res) => {
    try {
        const { user_id } = req.params; // This is the entity ID
        const { type = 'user' } = req.query;
        const follower_id = req.user.id;

        const following = await db('follows')
            .where({
                follower_id,
                followed_id: user_id,
                followed_type: type
            })
            .first();

        res.json({ following: !!following });
    } catch (error) {
        console.error('Error checking following:', error);
        res.status(500).json({ message: 'Failed to check following status' });
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFeed,
    checkFollowing
};

