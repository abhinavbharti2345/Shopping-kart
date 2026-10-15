const express = require('express');
const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  logoutCustomer
} = require('../controllers/customer.controller');

const protectRoute = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Protected routes
router.get('/me', protectRoute, getCustomerProfile);
router.post('/logout', protectRoute, logoutCustomer);

module.exports = router;
