const bcrypt = require('bcryptjs');
const Customer = require('../models/customer.model');
const generateTokenAndSetCookie = require('../utils/generateToken');

/**
 * Register a new customer
 * POST /customers/register
 */
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Validate mandatory fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new customer
    const newCustomer = new Customer({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone
    });

    await newCustomer.save();

    // Return success response (never return password)
    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

/**
 * Login customer
 * POST /customers/login
 */
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input presence
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare supplied password with bcrypt hash
    const isPasswordCorrect = await bcrypt.compare(password, customer.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT and store in HttpOnly cookie
    generateTokenAndSetCookie(customer._id, res);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * Get authenticated customer profile
 * GET /customers/me
 */
const getCustomerProfile = async (req, res) => {
  try {
    // req.user is set by auth.middleware
    const customer = req.user;

    return res.status(200).json({
      success: true,
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    });
  }
};

/**
 * Logout customer
 * POST /customers/logout
 */
const logoutCustomer = async (req, res) => {
  try {
    // Clear the authentication cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: new Date(0)
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  logoutCustomer
};
