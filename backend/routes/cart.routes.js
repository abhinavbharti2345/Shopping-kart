const express = require('express');
const router = express.Router();
const protectRoute = require('../middlewares/auth.middleware');

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} = require('../controllers/cart.controller');

// All Cart routes are protected
router.post('/:productId', protectRoute, addToCart);
router.get('/', protectRoute, getCart);
router.patch('/:productId', protectRoute, updateCartQuantity);
router.delete('/:productId', protectRoute, removeFromCart);
router.delete('/', protectRoute, clearCart);

module.exports = router;
