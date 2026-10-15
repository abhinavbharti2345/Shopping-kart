import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, isWishlisted = false, onWishlistChange }) => {
  const navigate = useNavigate();
  const { addToCart, itemLoadingMap } = useCart();

  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!product) return null;

  const { _id, name, price, category, image, stock } = product;
  const isAddingToCart = Boolean(itemLoadingMap[_id]);

  // Format price into Indian Rupees (INR)
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleCardClick = () => {
    navigate(`/products/${_id}`);
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (wishlistSaving) return;

    setWishlistSaving(true);
    setFeedbackMsg('');

    try {
      const res = await toggleWishlist(_id);
      if (res.success) {
        setWishlisted(res.saved);
        if (onWishlistChange) {
          onWishlistChange(_id, res.saved);
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setFeedbackMsg('Please login to save products');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setFeedbackMsg('Unable to save product');
        setTimeout(() => setFeedbackMsg(''), 2500);
      }
    } finally {
      setWishlistSaving(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isOutOfStock || isAddingToCart) return;

    try {
      await addToCart(_id, 1);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2000);
    } catch (err) {
      if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized') || err.message.toLowerCase().includes('login')) {
        navigate('/login');
      } else {
        setFeedbackMsg(err.message);
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    }
  };

  return (
    <div className="product-card" onClick={handleCardClick} role="button" tabIndex={0}>
      {/* Product Image Container */}
      <div className="product-card-image-wrapper">
        <img
          src={image}
          alt={name}
          className="product-card-image"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&auto=format&fit=crop&q=60';
          }}
        />
        <span className="product-category-pill">{category}</span>
        {isOutOfStock ? (
          <span className="product-stock-tag out-of-stock">Out of Stock</span>
        ) : isLowStock ? (
          <span className="product-stock-tag low-stock">Only {stock} left!</span>
        ) : null}

        {/* Floating Heart Button */}
        <button
          type="button"
          className={`card-heart-btn ${wishlisted ? 'active' : ''} ${wishlistSaving ? 'saving' : ''}`}
          onClick={handleWishlistToggle}
          disabled={wishlistSaving}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      {/* Product Body */}
      <div className="product-card-content">
        <h3 className="product-card-title" title={name}>
          {name}
        </h3>

        <div className="product-card-meta">
          <div className="product-price-box">
            <span className="product-price-value">{formattedPrice}</span>
          </div>
          <div className="product-stock-status">
            {isOutOfStock ? (
              <span className="stock-text-out">Out of stock</span>
            ) : (
              <span className="stock-text-in">
                <span className="stock-dot"></span> {stock} in stock
              </span>
            )}
          </div>
        </div>

        {/* Inline Feedback Toast */}
        {feedbackMsg && (
          <div className="card-inline-feedback">
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Card Actions Row */}
        <div className="product-card-actions-row">
          <button
            type="button"
            className="btn-view-details"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${_id}`);
            }}
          >
            <span>View</span>
          </button>

          <button
            id={`add-cart-btn-${_id}`}
            type="button"
            className={`btn-card-add-cart ${addedToast ? 'added-success' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <span>Adding...</span>
            ) : addedToast ? (
              <span>Added</span>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
