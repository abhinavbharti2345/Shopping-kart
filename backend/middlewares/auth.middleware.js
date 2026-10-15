const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

/**
 * Authentication Middleware to protect routes.
 * Verifies JWT token from HttpOnly cookie and attaches customer to req.user.
 */
const protectRoute = async (req, res, next) => {
  try {
    // 1. Read the JWT from the cookie or Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Check whether the token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    // 3. Verify the JWT using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4 & 5. Extract customer ID and find the customer (excluding password)
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found'
      });
    }

    // 6. Attach the customer to req.user
    req.user = customer;

    // 7. Call next() if authentication succeeds
    next();
  } catch (error) {
    // 8. Return 401 Unauthorized if verification fails
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token'
    });
  }
};

module.exports = protectRoute;
