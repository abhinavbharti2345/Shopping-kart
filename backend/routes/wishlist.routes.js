const express = require('express');
const router = express.Router();
const protectRoute = require('../middlewares/auth.middleware');

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
} = require('../controllers/wishlist.controller');

// All Wishlist endpoints are protected with auth middleware
router.post('/:productId', protectRoute, addToWishlist);
router.get('/', protectRoute, getWishlist);
router.delete('/:productId', protectRoute, removeFromWishlist);
router.patch('/:productId/toggle', protectRoute, toggleWishlist);

module.exports = router;
