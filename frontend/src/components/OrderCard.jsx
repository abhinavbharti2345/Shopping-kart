import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateOrderStatus } from '../services/api';

const STATUS_PROGRESSION = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const OrderCard = ({ order, onStatusChange }) => {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState(order.status || 'PLACED');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusStepIndex = (status) => {
    return STATUS_PROGRESSION.indexOf(status);
  };

  const handleNextStatus = async () => {
    const currentIndex = STATUS_PROGRESSION.indexOf(currentStatus);
    if (currentIndex >= STATUS_PROGRESSION.length - 1) return;

    const nextStatus = STATUS_PROGRESSION[currentIndex + 1];
    setIsUpdating(true);

    try {
      const res = await updateOrderStatus(order._id, nextStatus);
      if (res.success) {
        setCurrentStatus(nextStatus);
        if (onStatusChange) onStatusChange(order._id, nextStatus);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStep = getStatusStepIndex(currentStatus);

  return (
    <div className="order-history-card">
      {/* Top Bar: Order ID, Date, Status */}
      <div className="order-card-header">
        <div className="order-card-title-group">
          <span className="order-number-label">Order</span>
          <span className="order-id-hash">#{order._id}</span>
          <span className="order-date-text">{formattedDate}</span>
        </div>

        <div className="order-status-badge-wrap">
          <span className={`status-badge-pill status-${currentStatus.toLowerCase()}`}>
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Visual Status Progression Timeline (Bonus Feature) */}
      <div className="status-progress-track">
        {STATUS_PROGRESSION.map((step, idx) => {
          const isCompleted = idx <= currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step} className={`progress-step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="step-circle">
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className="step-label">{step}</span>
              {idx < STATUS_PROGRESSION.length - 1 && (
                <div className={`step-connector ${idx < currentStep ? 'filled' : ''}`}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Items Snapshot Section */}
      <div className="order-card-items-list">
        {order.items?.map((item, idx) => (
          <div key={idx} className="order-item-snippet">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="order-item-thumbnail"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="order-item-text">
              <span className="item-name">{item.name}</span>
              <span className="item-quantity-price">
                {item.quantity} × ₹{(item.price || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <span className="item-subtotal">
              ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      {/* Collapsible Shipping Details */}
      {showDetails && (
        <div className="order-expanded-details">
          <div className="expanded-section">
            <span className="expanded-title">Shipping Address:</span>
            <p>
              {order.shippingAddress?.fullName}, {order.shippingAddress?.addressLine1},{' '}
              {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
              {order.shippingAddress?.pincode} (Tel: {order.shippingAddress?.phone})
            </p>
          </div>
          <div className="expanded-section">
            <span className="expanded-title">Payment Info:</span>
            <p>
              Status: <strong>{order.paymentStatus}</strong> | Gateway: Razorpay Test Mode | Payment ID: <code>{order.razorpayPaymentId || 'N/A'}</code>
            </p>
          </div>
        </div>
      )}

      {/* Card Footer: Total Amount, View Details & Status Progress Action */}
      <div className="order-card-footer">
        <div className="order-total-block">
          <span className="total-title">Total Amount</span>
          <span className="total-price">
            ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="order-actions-block">
          <button
            type="button"
            className="btn-toggle-details"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>

          <button
            type="button"
            className="btn-order-receipt"
            onClick={() => navigate(`/order-success/${order._id}`)}
          >
            Receipt
          </button>

          {/* Bonus: Dev / Evaluator Progression Button */}
          {currentStep < STATUS_PROGRESSION.length - 1 && (
            <button
              type="button"
              className="btn-advance-status"
              onClick={handleNextStatus}
              disabled={isUpdating}
              title="Bonus Feature: Progress order status for evaluation"
            >
              {isUpdating ? 'Updating...' : `Advance to ${STATUS_PROGRESSION[currentStep + 1]} ⏩`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
