const mongoose = require('mongoose');
const Product = require('../models/product.model');

/**
 * Create a new product
 * POST /products
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validate required fields
    if (
      name === undefined || name === null || name === '' ||
      description === undefined || description === null || description === '' ||
      price === undefined || price === null ||
      category === undefined || category === null || category === '' ||
      image === undefined || image === null || image === '' ||
      stock === undefined || stock === null
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category, image, stock) are required'
      });
    }

    const numPrice = Number(price);
    const numStock = Number(stock);

    // Validate price > 0
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid number greater than 0'
      });
    }

    // Validate stock >= 0
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative integer'
      });
    }

    // Create and save new product
    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numStock
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

/**
 * Get all products with dynamic search, category filter, and sorting
 * GET /products
 */
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build dynamic query filter
    const filter = {};

    // Search filter: case-insensitive match on product name
    if (search && search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    // Category filter: match category (skip if 'all')
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      filter.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    // Sorting logic
    let sortOptions = { createdAt: -1 }; // default: newest first
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    }

    const products = await Product.find(filter).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message
    });
  }
};

/**
 * Get single product by ID
 * GET /products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById
};
