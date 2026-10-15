import React from 'react';

const OrderSummary = ({
  cartItems,
  subtotal,
  formattedSubtotal,
  onPlaceOrder,
  isSubmitting,
  backendError
}) => {
  return (
    <div className="order-summary-card">
      <div className="checkout-card-header">
        <div className="card-header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <div>
          <h2 className="checkout-card-title">Order Summary</h2>
          <p className="checkout-card-subtitle">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your bag</p>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="summary-items-list">
        {cartItems.map((item) => {
          const product = item.product || {};
          const itemPrice = product.price || 0;
          const qty = item.quantity || 1;
          const lineTotal = itemPrice * qty;

          const formattedLineTotal = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
          }).format(lineTotal);

          return (
            <div key={product._id || item._id} className="summary-item-row">
              <div className="summary-item-left">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="summary-item-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="summary-item-info">
                  <span className="summary-item-name">{product.name}</span>
                  <span className="summary-item-qty">
                    Qty: <strong>{qty}</strong> × ₹{itemPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <span className="summary-item-price">{formattedLineTotal}</span>
            </div>
          );
        })}
      </div>

      <div className="summary-divider"></div>

      {/* Pricing Details */}
      <div className="summary-cost-breakdown">
        <div className="cost-row">
          <span className="cost-label">Subtotal</span>
          <span className="cost-value">{formattedSubtotal}</span>
        </div>

        <div className="cost-row">
          <span className="cost-label">Shipping & Handling</span>
          <span className="cost-free-badge">FREE</span>
        </div>

        <div className="cost-row">
          <span className="cost-label">Estimated Tax (GST included)</span>
          <span className="cost-value">₹0</span>
        </div>

        <div className="summary-divider"></div>

        <div className="cost-row total-highlight-row">
          <span className="total-label">Total to Pay</span>
          <span className="total-amount-value">{formattedSubtotal}</span>
        </div>
      </div>

      {/* Backend Error Banner */}
      {backendError && (
        <div className="checkout-error-banner" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div className="error-banner-content">
            <strong>Order Failed</strong>
            <p>{backendError}</p>
          </div>
        </div>
      )}

      {/* Place Order / Razorpay Checkout Button */}
      <button
        id="place-order-btn"
        type="button"
        className="btn-pay-razorpay"
        onClick={onPlaceOrder}
        disabled={isSubmitting || cartItems.length === 0}
      >
        {isSubmitting ? (
          <>
            <span className="btn-spinner"></span>
            <span>Processing Order...</span>
          </>
        ) : (
          <>
            <span>Pay with Razorpay</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </>
        )}
      </button>

      {/* Payment Modes & Trust */}
      <div className="summary-trust-footer">
        <div className="trust-pill">
          <span className="trust-dot"></span>
          <span>Razorpay Test Mode Active</span>
        </div>
        <p className="test-mode-notice">
          💳 Use any test card or UPI in Razorpay test mode. No real money will be charged.
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
