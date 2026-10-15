const express = require('express');
const router = express.Router();
const protectRoute = require('../middlewares/auth.middleware');
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/order.controller');

// All Order routes are protected with JWT auth middleware
router.post('/create-payment-order', protectRoute, createPaymentOrder);
router.post('/', protectRoute, createPaymentOrder);
router.post('/verify-payment', protectRoute, verifyPayment);
router.get('/', protectRoute, getMyOrders);
router.get('/:id', protectRoute, getOrderById);
router.patch('/:id/status', protectRoute, updateOrderStatus);

module.exports = router;
