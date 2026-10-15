const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * Add a product to the authenticated user's wishlist
 * POST /wishlist/:productId
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // 2. Verify that the product actually exists in the catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // 3. Find current user
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 4. Check for duplicates in wishlist
    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // 5. Add product reference to user's wishlist array
    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist'
    });
  }
};

/**
 * Get the authenticated user's populated wishlist
 * GET /wishlist
 */
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user and populate the wishlist references with product details
    const user = await Customer.findById(userId).populate({
      path: 'wishlist',
      select: 'name description price category image stock'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out null/deleted product references gracefully
    const populatedWishlist = (user.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: populatedWishlist.length,
      wishlist: populatedWishlist
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist'
    });
  }
};

/**
 * Remove a product from the authenticated user's wishlist
 * DELETE /wishlist/:productId
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // 2. Find user
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 3. Check if the product is in the user's wishlist
    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }

    // 4. Remove the product reference
    user.wishlist.splice(itemIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist'
    });
  }
};

/**
 * Toggle product in authenticated user's wishlist (Bonus Challenge +10 Marks)
 * PATCH /wishlist/:productId/toggle
 */
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex > -1) {
      // Remove from wishlist
      user.wishlist.splice(itemIndex, 1);
      await user.save();
      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Product removed from wishlist'
      });
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({
        success: true,
        saved: true,
        message: 'Product added to wishlist'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while toggling wishlist'
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
};
