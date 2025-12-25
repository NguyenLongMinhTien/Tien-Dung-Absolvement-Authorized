const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrLeaderByClubParam, adminOrLeaderByMembershipId } = require('../middleware/clubAccess');

// User
router.post('/apply', protect, [body('clubId').isString().notEmpty().withMessage('clubId is required')], membershipController.apply);
router.get('/me', protect, membershipController.getMyMemberships);
router.delete('/:id', protect, membershipController.leave);

// Admin or Club Leader
router.get('/club/:clubId', protect, adminOrLeaderByClubParam('clubId'), membershipController.getClubMembers);
router.patch('/:id/approve', protect, adminOrLeaderByMembershipId, membershipController.approve);
router.patch('/:id/reject', protect, adminOrLeaderByMembershipId, membershipController.reject);
router.patch('/:id/role', protect, adminOrLeaderByMembershipId, [body('role').isIn(['member', 'leader']).withMessage('Invalid role')], membershipController.setRole);

module.exports = router;