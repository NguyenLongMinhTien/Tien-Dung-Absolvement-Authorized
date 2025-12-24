const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public
router.get('/', clubController.getClubs);
router.get('/:id', clubController.getClubById);

// Admin
router.post(
  '/',
  protect,
  authorize('admin'),
  [body('name').isString().trim().notEmpty().withMessage('name is required'), body('description').optional().isString()],
  clubController.createClub
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  [body('name').optional().isString().trim().notEmpty(), body('description').optional().isString()],
  clubController.updateClub
);

router.delete('/:id', protect, authorize('admin'), clubController.deleteClub);

module.exports = router;