const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/me', protect, userController.getMe);
router.put('/me', protect, userController.updateMe);

// Admin analytics
router.get('/stats', protect, authorize('admin'), userController.getUserStats);

// Admin
router.get('/', protect, authorize('admin'), userController.getUsers);
router.get('/:id', protect, authorize('admin'), userController.getUserById);
router.put('/:id', protect, authorize('admin'), userController.updateUserById);
router.delete('/:id', protect, authorize('admin'), userController.deleteUserById);

module.exports = router;