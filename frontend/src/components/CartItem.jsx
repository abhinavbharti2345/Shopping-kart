import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const navigate = useNavigate();
  const { updateQuantity, removeFromCart, itemLoadingMap } = useCart();

  if (!item || !item.product) return null;

  const { product, quantity } = item;
  const { _id, name, price, category, image, stock } = product;

  const isUpdating = Boolean(itemLoadingMap[_id]);

  const formattedUnitPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);

  const formattedLineTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price * quantity);

  const handleIncrement = async () => {
    if (quantity < stock && !isUpdating) {
      try {
        await updateQuantity(_id, quantity + 1);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDecrement = async () => {
    if (quantity > 1 && !isUpdating) {
      try {
        await updateQuantity(_id, quantity - 1);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleRemove = async () => {
    if (!isUpdating) {
      try {
        await removeFromCart(_id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className={`cart-item-row ${isUpdating ? 'item-updating' : ''}`}>
      {/* Product Image Thumbnail */}
      <div
        className="cart-item-image-wrapper"
        onClick={() => navigate(`/products/${_id}`)}
        title="View Product Details"
      >
        <img
          src={image}
          alt={name}
          className="cart-item-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400';
          }}
        />
      </div>

      {/* Product Details Info */}
      <div className="cart-item-details">
        <span className="cart-item-category">{category}</span>
        <h3
          className="cart-item-title"
          onClick={() => navigate(`/products/${_id}`)}
        >
          {name}
        </h3>
        <span className="cart-item-unit-price">
          Unit Price: <strong>{formattedUnitPrice}</strong>
        </span>
        {stock <= 5 && stock > 0 && (
          <span className="cart-stock-warning">Only {stock} units left in stock!</span>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="cart-item-quantity-section">
        <div className="cart-qty-counter">
          <button
            type="button"
            className="btn-cart-qty"
            onClick={handleDecrement}
            disabled={quantity <= 1 || isUpdating}
            title="Decrease quantity"
          >
            -
          </button>
          <span className="cart-qty-val">
            {isUpdating ? '⏳' : quantity}
          </span>
          <button
            type="button"
            className="btn-cart-qty"
            onClick={handleIncrement}
            disabled={quantity >= stock || isUpdating}
            title={quantity >= stock ? 'Maximum stock reached' : 'Increase quantity'}
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="btn-cart-remove"
          onClick={handleRemove}
          disabled={isUpdating}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>Remove</span>
        </button>
      </div>

      {/* Line Item Total */}
      <div className="cart-item-total-section">
        <span className="cart-total-label">Subtotal</span>
        <span className="cart-item-total-price">{formattedLineTotal}</span>
      </div>
    </div>
  );
};

export default CartItem;
