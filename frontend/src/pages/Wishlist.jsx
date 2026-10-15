import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';
import { getWishlist, removeFromWishlist } from '../services/api';
import api from '../services/api';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isUnauth, setIsUnauth] = useState(false);

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

  // Fetch current user's wishlist from backend
  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsUnauth(false);

    try {
      const data = await getWishlist();
      if (data.success) {
        setWishlistItems(data.wishlist || []);
      } else {
        setError('Failed to load wishlist.');
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      if (err.response?.status === 401) {
        setIsUnauth(true);
      } else {
        setError('Unable to load wishlist.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Handle item removal from wishlist
  const handleRemoveItem = async (productId) => {
    try {
      const res = await removeFromWishlist(productId);
      if (res.success) {
        // Optimistically update local state immediately
        setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
      }
    } catch (err) {
      console.error('Error removing item from wishlist:', err);
      throw err;
    }
  };

  return (
    <div className="wishlist-page-layout">
      <Navbar customer={customer} wishlistCount={wishlistItems.length} />

      <main className="wishlist-main-container">
        {/* Header Title Section */}
        <section className="wishlist-header-section">
          <div className="wishlist-title-row">
            <div>
              <h1 className="wishlist-title">
                My <span className="highlight-text">Wishlist</span>
              </h1>
              {!loading && !error && !isUnauth && (
                <p className="wishlist-count-caption">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'product' : 'products'} saved
                </p>
              )}
            </div>

            {wishlistItems.length > 0 && !loading && !error && (
              <button
                type="button"
                className="btn-continue-shopping"
                onClick={() => navigate('/products')}
              >
                <span>Browse Catalog</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* Content Section: Loading / Unauth / Error / Empty / Grid */}
        <section className="wishlist-content-section">
          {/* 1. Loading State */}
          {loading && (
            <div className="state-container loading-state">
              <div className="spinner"></div>
              <h3 className="state-title">Loading wishlist...</h3>
              <p className="state-desc">Retrieving your saved items</p>

              {/* Skeleton Cards Grid */}
              <div className="products-grid skeleton-grid">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="product-card skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-line short"></div>
                      <div className="skeleton-line title"></div>
                      <div className="skeleton-line price"></div>
                      <div className="skeleton-btn"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Unauthenticated State */}
          {!loading && isUnauth && (
            <div className="state-container unauth-state">
              <div className="empty-icon-box">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="state-title">Please sign in</h3>
              <p className="state-desc">
                Sign in to view and manage your saved wishlist items.
              </p>
              <button
                type="button"
                className="btn-state-action"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          )}

          {/* 3. Error State */}
          {!loading && !isUnauth && error && (
            <div className="state-container error-state">
              <div className="error-icon-box">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3 className="state-title">Unable to load wishlist</h3>
              <p className="state-desc">{error}</p>
              <button
                type="button"
                className="btn-state-action"
                onClick={loadWishlist}
              >
                Try Again
              </button>
            </div>
          )}

          {/* 4. Empty Wishlist State */}
          {!loading && !isUnauth && !error && wishlistItems.length === 0 && (
            <div className="state-container empty-wishlist-state">
              <div className="empty-icon-box">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h2 className="empty-wishlist-title">Your wishlist is empty</h2>
              <p className="empty-wishlist-subtitle">
                Explore the catalog and save products you love for later.
              </p>
              <button
                type="button"
                className="btn-browse-products"
                onClick={() => navigate('/products')}
              >
                Explore Catalog
              </button>
            </div>
          )}

          {/* 5. Populated Wishlist Grid */}
          {!loading && !isUnauth && !error && wishlistItems.length > 0 && (
            <div className="products-grid">
              {wishlistItems.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Wishlist;
