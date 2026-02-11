const db = require('../db/db');

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name,
            bio,
            location,
            website,
            linkedin,
            twitter,
            github,
            avatarUrl
        } = req.body;

        console.log('Updating profile for user:', userId);
        console.log('Update data:', { name, bio, location, website, linkedin, twitter, github, avatarUrl: avatarUrl ? 'base64 image' : null });

        const updateData = {
            updated_at: db.fn.now()
        };

        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (website !== undefined) updateData.website = website;
        if (linkedin !== undefined) updateData.linkedin = linkedin;
        if (twitter !== undefined) updateData.twitter = twitter;
        if (github !== undefined) updateData.github = github;
        if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

        // Update user profile
        await db('users')
            .where('id', userId)
            .update(updateData);

        // Fetch complete updated user with all fields
        const updatedUser = await db('users')
            .where('id', userId)
            .select(
                'id', 'name', 'email', 'bio', 'location', 'website',
                'linkedin', 'twitter', 'github', 'avatar_url as avatarUrl',
                'points', 'rank', 'is_verified_expert', 'expert_role', 'follower_count'
            )
            .first();

        // Calculate following count
        const following = await db('follows')
            .where('follower_id', userId)
            .count('id as count')
            .first();
        updatedUser.following_count = following.count;

        // Calculate stats
        const questionsCount = await db('questions').where('user_id', userId).count('id as count').first();
        const answersCount = await db('answers').where('user_id', userId).count('id as count').first();
        const acceptedAnswersCount = await db('answers').where('user_id', userId).andWhere('is_accepted', true).count('id as count').first();

        updatedUser.stats = {
            questions: parseInt(questionsCount.count || 0),
            answers: parseInt(answersCount.count || 0),
            accepted_answers: parseInt(acceptedAnswersCount.count || 0)
        };

        console.log('Profile updated successfully');
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;

        const user = await db('users')
            .where('users.id', userId)
            .select(
                'users.id', 'users.name', 'users.email', 'users.bio', 'users.location',
                'users.website', 'users.linkedin', 'users.twitter', 'users.github',
                'users.avatar_url as avatarUrl', 'users.points', 'users.rank',
                'users.is_verified_expert', 'users.expert_role', 'users.follower_count'
            )
            .first();

        if (user) {
            const following = await db('follows')
                .where('follower_id', userId)
                .count('id as count')
                .first();
            user.following_count = following.count;

            // Calculate stats
            const questionsCount = await db('questions').where('user_id', userId).count('id as count').first();
            const answersCount = await db('answers').where('user_id', userId).count('id as count').first();
            const acceptedAnswersCount = await db('answers').where('user_id', userId).andWhere('is_accepted', true).count('id as count').first();

            user.stats = {
                questions: parseInt(questionsCount.count || 0),
                answers: parseInt(answersCount.count || 0),
                accepted_answers: parseInt(acceptedAnswersCount.count || 0)
            };
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ message: 'Failed to get profile' });
    }
};

module.exports = {
    updateProfile,
    getProfile
};
