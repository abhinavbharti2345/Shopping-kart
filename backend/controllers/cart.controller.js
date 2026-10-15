const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * Add a product to the authenticated user's cart (or increment quantity if already present)
 * POST /cart/:productId
 */
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const addQuantity = Number(req.body.quantity) || 1;
    const userId = req.user._id;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // 2. Validate requested addition quantity
    if (addQuantity < 1 || !Number.isInteger(addQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer'
      });
    }

    // 3. Find product in catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock availability
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }

    // 4. Find current user
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.cart) {
      user.cart = [];
    }

    // 5. Check if product already exists in cart
    const existingItemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQuantity = user.cart[existingItemIndex].quantity + addQuantity;

      // Validate that new quantity does not exceed product stock
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Total requested quantity (${newQuantity}) exceeds available stock (${product.stock})`
        });
      }

      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Validate requested initial quantity against stock
      if (addQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity (${addQuantity}) exceeds available stock (${product.stock})`
        });
      }

      user.cart.push({
        product: productId,
        quantity: addQuantity
      });
    }

    await user.save();

    // Populate and return updated cart
    const populatedUser = await Customer.findById(userId).populate({
      path: 'cart.product',
      select: 'name price image category stock description'
    });

    const populatedCart = (populatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart: populatedCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while adding to cart'
    });
  }
};

/**
 * Get current authenticated user's cart populated with product details
 * GET /cart
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await Customer.findById(userId).populate({
      path: 'cart.product',
      select: 'name price image category stock description'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out null/deleted products gracefully
    const populatedCart = (user.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      count: populatedCart.length,
      cart: populatedCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cart'
    });
  }
};

/**
 * Update quantity for a specific product in the cart
 * PATCH /cart/:productId
 */
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // 2. Validate quantity value
    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty < 1 || !Number.isInteger(numQty)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be an integer of at least 1'
      });
    }

    // 3. Find product to check stock limits
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (numQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${numQty}) exceeds available stock (${product.stock})`
      });
    }

    // 4. Find user and target cart item
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }

    user.cart[itemIndex].quantity = numQty;
    await user.save();

    // Populate and return updated cart
    const populatedUser = await Customer.findById(userId).populate({
      path: 'cart.product',
      select: 'name price image category stock description'
    });

    const populatedCart = (populatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: populatedCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating cart quantity'
    });
  }
};

/**
 * Remove a product from the authenticated user's cart
 * DELETE /cart/:productId
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }

    user.cart.splice(itemIndex, 1);
    await user.save();

    // Populate and return updated cart
    const populatedUser = await Customer.findById(userId).populate({
      path: 'cart.product',
      select: 'name price image category stock description'
    });

    const populatedCart = (populatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: populatedCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while removing from cart'
    });
  }
};

/**
 * Clear all items from current user's cart
 * DELETE /cart
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.cart = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while clearing cart'
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
};
