import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    totalItems,
    formattedSubtotal,
    refreshCart
  } = useCart();

  const [customer, setCustomer] = useState(null);

  // Fetch optional customer session for Navbar
  useEffect(() => {
    let isMounted = true;
    const fetchSession = async () => {
      try {
        const res = await api.get('/customers/me');
        if (res.data.success && isMounted) {
          setCustomer(res.data.customer);
        }
      } catch (err) {
        // Guest mode
      }
    };
    fetchSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page-layout">
      <Navbar customer={customer} />

      <main className="cart-main-container">
        {/* Header Title Section */}
        <section className="cart-header-section">
          <div className="cart-title-row">
            <div>
              <h1 className="cart-title">
                Shopping <span className="highlight-text">Bag</span>
              </h1>
              {!loading && !error && (
                <p className="cart-count-caption">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in your bag
                </p>
              )}
            </div>

            {cartItems.length > 0 && !loading && !error && (
              <button
                type="button"
                className="btn-continue-shopping"
                onClick={() => navigate('/products')}
              >
                <span>Continue Shopping</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* Content Section: Loading / Error / Empty / Grid */}
        <section className="cart-content-section">
          {/* 1. Loading State */}
          {loading && (
            <div className="state-container loading-state">
              <div className="spinner"></div>
              <h3 className="state-title">Loading bag...</h3>
              <p className="state-desc">Synchronizing your saved items</p>

              <div className="cart-skeleton-list">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="cart-skeleton-item">
                    <div className="skeleton-thumb"></div>
                    <div className="skeleton-details">
                      <div className="skeleton-line title"></div>
                      <div className="skeleton-line price"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Error State */}
          {!loading && error && (
            <div className="state-container error-state">
              <div className="error-icon-box">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3 className="state-title">Unable to load shopping bag</h3>
              <p className="state-desc">{error}</p>
              <button
                type="button"
                className="btn-state-action"
                onClick={refreshCart}
              >
                Try Again
              </button>
            </div>
          )}

          {/* 3. Empty Cart State */}
          {!loading && !error && cartItems.length === 0 && (
            <div className="state-container empty-cart-state">
              <div className="empty-cart-icon">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h2 className="empty-cart-title">Your shopping bag is empty</h2>
              <p className="empty-cart-subtitle">
                Explore our catalog to find products and add them to your cart.
              </p>
              <button
                type="button"
                id="browse-products-cart-btn"
                className="btn-browse-products"
                onClick={() => navigate('/products')}
              >
                <span>Explore Catalog</span>
              </button>
            </div>
          )}

          {/* 4. Populated Cart Split Layout */}
          {!loading && !error && cartItems.length > 0 && (
            <div className="cart-split-layout">
              {/* Left Column: Cart Item Rows */}
              <div className="cart-items-container">
                <div className="cart-items-header">
                  <span>Product Details</span>
                  <span className="cart-header-qty">Quantity</span>
                  <span className="cart-header-subtotal">Total</span>
                </div>

                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <CartItem key={item.product?._id} item={item} />
                  ))}
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="cart-summary-sidebar">
                <div className="order-summary-card">
                  <h2 className="summary-title">Order Summary</h2>

                  <div className="summary-rows-list">
                    <div className="summary-row">
                      <span className="summary-label">Total Items</span>
                      <span className="summary-value font-semibold">{totalItems} units</span>
                    </div>

                    <div className="summary-row">
                      <span className="summary-label">Subtotal</span>
                      <span className="summary-value font-semibold">{formattedSubtotal}</span>
                    </div>

                    <div className="summary-row">
                      <span className="summary-label">Estimated Delivery</span>
                      <span className="summary-value text-green">FREE</span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-row total-row">
                      <span className="summary-total-label">Total Amount</span>
                      <span className="summary-total-value">{formattedSubtotal}</span>
                    </div>
                  </div>

                  <button
                    id="checkout-btn"
                    type="button"
                    className="btn-proceed-checkout"
                    onClick={handleCheckoutClick}
                  >
                    <span>Proceed to Checkout</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </button>

                  {/* Trust & Guarantee Badges */}
                  <div className="summary-guarantees">
                    <div className="guarantee-item">
                      <span className="guarantee-icon">🔒</span>
                      <span>Secure 256-Bit SSL Checkout</span>
                    </div>
                    <div className="guarantee-item">
                      <span className="guarantee-icon">⚡</span>
                      <span>Instant Order Confirmation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Cart;
