const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/unread', protect, notificationController.getUnread);
router.get('/unread-count', protect, notificationController.getUnreadCount);
router.patch('/:id/read', protect, notificationController.markRead);
router.post('/read-all', protect, notificationController.markAllRead);

module.exports = router;