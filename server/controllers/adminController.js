const db = require('../db/db');

// Get all users with their post counts
const getAllUsers = async (req, res) => {
    try {
        const users = await db('users')
            .leftJoin('questions', 'users.id', 'questions.user_id')
            .select(
                'users.id',
                'users.name',
                'users.email',
                'users.role',
                'users.is_active',
                'users.rank',
                'users.points',
                'users.created_at',
                db.raw('COUNT(DISTINCT questions.id) as post_count')
            )
            .groupBy('users.id')
            .orderBy('users.created_at', 'desc');

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

// Get specific user details with all their posts
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get user info
        const user = await db('users')
            .where('users.id', id)
            .first();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's questions
        const questions = await db('questions')
            .where('user_id', id)
            .orderBy('created_at', 'desc');

        // Get user's answers
        const answers = await db('answers')
            .where('answers.user_id', id)
            .join('questions', 'answers.question_id', 'questions.id')
            .select('answers.*', 'questions.title as question_title')
            .orderBy('answers.created_at', 'desc');

        // Remove password from response
        delete user.password;

        res.json({
            ...user,
            questions,
            answers,
            stats: {
                total_questions: questions.length,
                total_answers: answers.length
            }
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Failed to fetch user details' });
    }
};

// Update user (role, status, rank)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, is_active, rank } = req.body;

        const updateData = {};
        if (role !== undefined) updateData.role = role;
        if (is_active !== undefined) updateData.is_active = is_active;

        // Handle rank update
        if (rank) {
            updateData.rank = rank;
            // Update points to minimum required for the rank to prevent auto-downgrade
            switch (rank) {
                case 'Beginner':
                    updateData.points = 0;
                    break;
                case 'Contributor':
                    updateData.points = 100;
                    break;
                case 'Helper':
                    updateData.points = 300;
                    break;
                case 'Mentor':
                    updateData.points = 700;
                    break;
                case 'Expert':
                    updateData.points = 1500;
                    break;
                case 'Admin':
                    updateData.points = 100000;
                    break;
            }
        }

        await db('users')
            .where('id', id)
            .update(updateData);

        const updatedUser = await db('users')
            .where('id', id)
            .first();

        delete updatedUser.password;

        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await db('users').where('id', id).first();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user (cascade will handle related records)
        await db('users').where('id', id).del();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

// Get platform statistics
const getStats = async (req, res) => {
    try {
        const totalUsers = await db('users').count('id as count').first();
        const activeUsers = await db('users').where('is_active', true).count('id as count').first();
        const totalQuestions = await db('questions').count('id as count').first();
        const totalAnswers = await db('answers').count('id as count').first();

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentUsers = await db('users')
            .where('created_at', '>=', sevenDaysAgo)
            .count('id as count')
            .first();

        const recentQuestions = await db('questions')
            .where('created_at', '>=', sevenDaysAgo)
            .count('id as count')
            .first();

        res.json({
            total_users: totalUsers.count,
            active_users: activeUsers.count,
            total_questions: totalQuestions.count,
            total_answers: totalAnswers.count,
            recent_users: recentUsers.count,
            recent_questions: recentQuestions.count
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Failed to fetch statistics' });
    }
};

// Verify user as expert with specific role
const verifyExpert = async (req, res) => {
    try {
        const { id } = req.params;
        const { expert_role } = req.body;

        // Validate expert role
        const validRoles = [
            'CA', 'Lawyer', 'HR', 'Marketing', 'Finance', 'Tax',
            'Business', 'IT', 'Sales', 'Operations', 'Compliance', 'Strategy'
        ];
        if (!expert_role || !validRoles.includes(expert_role)) {
            return res.status(400).json({
                message: 'Invalid expert role. Please select a valid expert category.'
            });
        }

        // Check if user exists
        const user = await db('users').where('id', id).first();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user with expert status
        await db('users')
            .where('id', id)
            .update({
                is_verified_expert: true,
                expert_role: expert_role
            });

        const updatedUser = await db('users')
            .where('id', id)
            .first();

        delete updatedUser.password;

        res.json({
            message: `User verified as ${expert_role} expert successfully`,
            user: updatedUser
        });
    } catch (error) {
        console.error('Error verifying expert:', error);
        res.status(500).json({ message: 'Failed to verify expert' });
    }
};

// Remove expert status from user
const removeExpertStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await db('users').where('id', id).first();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove expert status
        await db('users')
            .where('id', id)
            .update({
                is_verified_expert: false,
                expert_role: null
            });

        const updatedUser = await db('users')
            .where('id', id)
            .first();

        delete updatedUser.password;

        res.json({
            message: 'Expert status removed successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error removing expert status:', error);
        res.status(500).json({ message: 'Failed to remove expert status' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getStats,
    verifyExpert,
    removeExpertStatus
};
