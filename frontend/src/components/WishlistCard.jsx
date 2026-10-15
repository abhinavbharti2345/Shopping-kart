import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WishlistCard = ({ product, onRemove }) => {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);

  if (!product) return null;

  const { _id, name, price, category, image, stock } = product;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (removing) return;
    setRemoving(true);
    try {
      await onRemove(_id);
    } catch (err) {
      setRemoving(false);
    }
  };

  return (
    <div
      className="product-card wishlist-card"
      onClick={() => navigate(`/products/${_id}`)}
      role="button"
      tabIndex={0}
    >
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

        {/* Quick Heart Badge */}
        <button
          type="button"
          className="wishlist-quick-remove-btn"
          onClick={handleRemove}
          disabled={removing}
          title="Remove from Wishlist"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
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

        {/* Card Actions: View Details and Remove */}
        <div className="wishlist-card-actions">
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
            type="button"
            className="btn-remove-wishlist"
            onClick={handleRemove}
            disabled={removing}
          >
            {removing ? (
              <span>Removing...</span>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Remove</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
