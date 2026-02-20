const db = require('../db/db');

/**
 * @desc    Submit a contact message
 * @route   POST /api/contact
 * @access  Public
 */
const submitMessage = async (req, res) => {
    try {
        const { firstName, lastName, email, subject, message } = req.body;

        if (!firstName || !lastName || !email || !subject || !message) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const [id] = await db('contact_submissions').insert({
            first_name: firstName,
            last_name: lastName,
            email,
            subject,
            message,
            created_at: db.fn.now(),
            updated_at: db.fn.now()
        }).returning('id');

        res.status(201).json({
            success: true,
            message: 'Your message has been received. Our team will contact you soon.',
            id
        });
    } catch (error) {
        console.error('[ContactController] Submission Error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

/**
 * @desc    Get all contact messages (Admin only)
 * @route   GET /api/contact
 * @access  Private/Admin
 */
const getMessages = async (req, res) => {
    try {
        const messages = await db('contact_submissions')
            .orderBy('created_at', 'desc');

        res.json(messages);
    } catch (error) {
        console.error('[ContactController] Fetch Error:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

/**
 * @desc    Mark message as read
 * @route   PATCH /api/contact/:id/read
 * @access  Private/Admin
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db('contact_submissions')
            .where({ id })
            .update({ is_read: true, updated_at: db.fn.now() });

        res.json({ success: true, message: 'Message marked as read' });
    } catch (error) {
        console.error('[ContactController] Update Error:', error);
        res.status(500).json({ message: 'Failed to update message' });
    }
};

module.exports = {
    submitMessage,
    getMessages,
    markAsRead
};
