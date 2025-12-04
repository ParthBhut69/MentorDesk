const bcrypt = require('bcrypt');
const db = require('../db/db');

// @desc    Change user password
// @route   POST /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    try {
        // Get user from database
        const user = await db('users')
            .where({ id: req.user.id })
            .whereNull('deleted_at')
            .first();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await db('users')
            .where({ id: req.user.id })
            .update({
                password: hashedPassword,
                updated_at: new Date()
            });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
};

// @desc    Update contact details
// @route   PUT /api/users/contact-details
// @access  Private
const updateContactDetails = async (req, res) => {
    const { phone, address, city, country, postal_code } = req.body;

    try {
        const updateData = {
            updated_at: new Date()
        };

        if (phone !== undefined) updateData.phone = phone?.trim() || null;
        if (address !== undefined) updateData.address = address?.trim() || null;
        if (city !== undefined) updateData.city = city?.trim() || null;
        if (country !== undefined) updateData.country = country?.trim() || null;
        if (postal_code !== undefined) updateData.postal_code = postal_code?.trim() || null;

        await db('users')
            .where({ id: req.user.id })
            .update(updateData);

        const updatedUser = await db('users')
            .where({ id: req.user.id })
            .select('phone', 'address', 'city', 'country', 'postal_code')
            .first();

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating contact details:', error);
        res.status(500).json({ message: 'Failed to update contact details' });
    }
};

module.exports = {
    changePassword,
    updateContactDetails
};
