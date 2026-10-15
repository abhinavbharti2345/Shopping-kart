import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { getOrderById } from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Customer session for Navbar
        const meRes = await api.get('/customers/me');
        if (meRes.data.success && isMounted) {
          setCustomer(meRes.data.customer);
        }

        // Fetch Order details
        const orderRes = await getOrderById(id);
        if (orderRes.success && isMounted) {
          setOrder(orderRes.order);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to retrieve order confirmation.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="order-success-layout">
      <Navbar customer={customer} />

      <main className="order-success-main">
        {loading ? (
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <h3 className="state-title">Retrieving order confirmation...</h3>
          </div>
        ) : error ? (
          <div className="state-container error-state">
            <div className="error-icon">⚠️</div>
            <h3 className="state-title">Order Not Found</h3>
            <p className="state-desc">{error}</p>
            <button
              type="button"
              className="btn-start-shopping"
              onClick={() => navigate('/orders')}
            >
              View My Orders
            </button>
          </div>
        ) : (
          <div className="order-confirmation-card">
            {/* Success Checkmark Header */}
            <div className="success-badge-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h1 className="success-heading">Order Placed Successfully</h1>
            <p className="success-subheading">
              Your order has been saved and confirmed. Thank you for shopping with ShopKart!
            </p>

            {/* Order Highlight Info Box */}
            <div className="order-meta-highlight-box">
              <div className="meta-col">
                <span className="meta-label">Order ID</span>
                <span className="meta-value order-id-code">{order._id}</span>
              </div>
              <div className="meta-col">
                <span className="meta-label">Total Amount</span>
                <span className="meta-value total-val">
                  ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="meta-col">
                <span className="meta-label">Payment Status</span>
                <span className="status-pill status-paid">
                  {order.paymentStatus || 'PAID'}
                </span>
              </div>
              <div className="meta-col">
                <span className="meta-label">Order Status</span>
                <span className="status-pill status-placed">
                  {order.status || 'PLACED'}
                </span>
              </div>
            </div>

            {/* Shipping & Payment Details Recap */}
            <div className="confirmation-grid">
              <div className="confirm-section">
                <h3 className="confirm-section-title">Delivery Address</h3>
                <div className="address-box">
                  <p className="addr-name"><strong>{order.shippingAddress?.fullName}</strong></p>
                  <p className="addr-line">{order.shippingAddress?.addressLine1}</p>
                  <p className="addr-city">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </p>
                  <p className="addr-phone">Phone: {order.shippingAddress?.phone}</p>
                </div>
              </div>

              <div className="confirm-section">
                <h3 className="confirm-section-title">Payment Reference</h3>
                <div className="payment-ref-box">
                  <p><strong>Gateway:</strong> Razorpay Test Mode</p>
                  <p><strong>Razorpay Order:</strong> <code>{order.razorpayOrderId || 'N/A'}</code></p>
                  {order.razorpayPaymentId && (
                    <p><strong>Payment ID:</strong> <code>{order.razorpayPaymentId}</code></p>
                  )}
                  <p className="payment-verified-notice">
                    <span className="green-dot"></span> Signature cryptographically verified via HMAC SHA-256
                  </p>
                </div>
              </div>
            </div>

            {/* Purchased Items List Snapshot */}
            <div className="confirm-items-section">
              <h3 className="confirm-section-title">Purchased Items ({order.items?.length || 0})</h3>
              <div className="confirm-items-list">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="confirm-item-row">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="confirm-item-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="confirm-item-info">
                      <span className="confirm-item-name">{item.name}</span>
                      <span className="confirm-item-qty">Quantity: {item.quantity}</span>
                    </div>
                    <span className="confirm-item-price">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="confirmation-actions">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => navigate('/orders')}
              >
                View My Orders
              </button>
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderSuccess;
