const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, wishlistController.getMyWishlist);
router.post('/add', protect, wishlistController.addToWishlist);
router.post('/remove', protect, wishlistController.removeFromWishlist);

module.exports = router;