import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OrderCard from '../components/OrderCard';
import api, { getOrders } from '../services/api';

const Orders = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Check customer authentication
      const authRes = await api.get('/customers/me');
      if (authRes.data.success) {
        setCustomer(authRes.data.customer);

        // 2. Fetch authenticated user's orders
        const ordersRes = await getOrders();
        if (ordersRes.success) {
          setOrders(ordersRes.orders || []);
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { state: { from: '/orders' }, replace: true });
      } else {
        setError(err.response?.data?.message || 'Unable to load orders. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  return (
    <div className="orders-page-layout">
      <Navbar customer={customer} />

      <main className="orders-main-container">
        {/* Header Section */}
        <section className="orders-header-section">
          <div className="orders-title-row">
            <div>
              <h1 className="orders-title">
                My <span className="highlight-text">Orders</span>
              </h1>
              {!loading && !error && (
                <p className="orders-count-caption">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
                </p>
              )}
            </div>

            <button
              type="button"
              className="btn-continue-shopping"
              onClick={() => navigate('/products')}
            >
              <span>Explore Products</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </section>

        {/* Content Section: Loading / Error / Empty / List */}
        <section className="orders-content-section">
          {/* 1. Loading State */}
          {loading && (
            <div className="state-container loading-state">
              <div className="spinner"></div>
              <h3 className="state-title">Loading order history...</h3>
              <p className="state-desc">Fetching your previous purchases</p>

              <div className="orders-skeleton-list">
                {[1, 2].map((i) => (
                  <div key={i} className="order-skeleton-card">
                    <div className="skeleton-bar header"></div>
                    <div className="skeleton-bar item"></div>
                    <div className="skeleton-bar footer"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Error State */}
          {!loading && error && (
            <div className="state-container error-state">
              <div className="error-icon">⚠️</div>
              <h3 className="state-title">Unable to Load Orders</h3>
              <p className="state-desc">{error}</p>
              <button
                type="button"
                className="btn-retry"
                onClick={fetchOrders}
              >
                Retry
              </button>
            </div>
          )}

          {/* 3. Empty State */}
          {!loading && !error && orders.length === 0 && (
            <div className="state-container empty-state">
              <div className="empty-state-icon">📦</div>
              <h3 className="state-title">You have not placed any orders yet.</h3>
              <p className="state-desc">
                Browse our product catalogue, add items to your cart, and experience seamless checkout!
              </p>
              <button
                type="button"
                className="btn-start-shopping"
                onClick={() => navigate('/products')}
              >
                Start Shopping
              </button>
            </div>
          )}

          {/* 4. Populated Orders List */}
          {!loading && !error && orders.length > 0 && (
            <div className="orders-list-grid">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Orders;
