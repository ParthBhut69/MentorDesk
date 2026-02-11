const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getStats,
    verifyExpert,
    removeExpertStatus
} = require('../controllers/adminController');

// All routes require admin authentication
router.use(protect, isAdmin);

// Get all users with statistics
router.get('/users', getAllUsers);

// Get platform statistics
router.get('/stats', getStats);

// Get specific user details
router.get('/users/:id', getUserById);

// Update user
router.put('/users/:id', updateUser);

// Delete user
// Delete user
router.delete('/users/:id', deleteUser);

// Restore user
router.put('/users/:id/restore', require('../controllers/adminController').restoreUser);

// Verify user as expert with role
router.post('/users/:id/verify-expert', verifyExpert);

// Remove expert status
router.delete('/users/:id/expert-status', removeExpertStatus);

module.exports = router;
