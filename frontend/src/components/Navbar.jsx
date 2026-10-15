import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api, { getWishlist } from '../services/api';

const Navbar = ({ customer, wishlistCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const [wCount, setWCount] = useState(wishlistCount !== undefined ? wishlistCount : 0);

  // Sync wishlist count if passed via props, or fetch if authenticated
  useEffect(() => {
    if (wishlistCount !== undefined) {
      setWCount(wishlistCount);
    } else if (customer) {
      let isMounted = true;
      getWishlist()
        .then((res) => {
          if (res.success && isMounted) {
            setWCount(res.count || (res.wishlist ? res.wishlist.length : 0));
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }
  }, [customer, wishlistCount]);

  const handleLogout = async () => {
    try {
      // Call the logout endpoint to clear the server-side HttpOnly cookie
      await api.post('/customers/logout');
    } catch (error) {
      console.error('Logout error on backend:', error);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const isProductsActive = location.pathname === '/' || location.pathname === '/home' || location.pathname.startsWith('/products');
  const isWishlistActive = location.pathname === '/wishlist';
  const isCartActive = location.pathname === '/cart';
  const isOrdersActive = location.pathname.startsWith('/orders') || location.pathname.startsWith('/order-success');
  const isProfileActive = location.pathname === '/profile';

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo - Navigates to main Store */}
        <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <span className="brand-name">ShopKart</span>
          <span className="brand-tag">Store</span>
        </div>

        {/* Center Nav Links */}
        <nav className="navbar-nav-links">
          <Link
            to="/"
            className={`nav-link-item ${isProductsActive ? 'active' : ''}`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="2" y="14" width="7" height="7"></rect>
            </svg>
            <span>Products</span>
          </Link>

          <Link
            to="/wishlist"
            className={`nav-link-item ${isWishlistActive ? 'active' : ''}`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill={isWishlistActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>Wishlist</span>
            {wCount > 0 && <span className="nav-wishlist-count-badge">({wCount})</span>}
          </Link>

          {/* Cart Link with Live Global Count */}
          <Link
            to="/cart"
            className={`nav-link-item ${isCartActive ? 'active' : ''}`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Cart</span>
            {totalItems > 0 && <span className="nav-cart-count-badge">({totalItems})</span>}
          </Link>

          {/* Orders Link */}
          <Link
            to="/orders"
            className={`nav-link-item ${isOrdersActive ? 'active' : ''}`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Orders</span>
          </Link>
        </nav>

        {/* Right Nav Actions */}
        <div className="navbar-actions">
          {customer ? (
            <>
              <div 
                className={`user-pill ${isProfileActive ? 'active-profile' : ''}`} 
                onClick={() => navigate('/profile')} 
                title="View Account Profile"
                style={{ cursor: 'pointer' }}
              >
                <div className="user-avatar">
                  {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-greeting">{customer.fullName}</span>
              </div>
              <button id="logout-btn" onClick={handleLogout} className="btn-logout" title="Sign out">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button id="login-nav-btn" onClick={() => navigate('/login')} className="btn-login-nav">
              <span>Sign In</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
