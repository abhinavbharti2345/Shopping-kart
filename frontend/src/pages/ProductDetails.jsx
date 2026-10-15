import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchProductById, toggleWishlist, getWishlist } from '../services/api';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [cartError, setCartError] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistToast, setWishlistToast] = useState('');

  // Check optional customer session for Navbar
  useEffect(() => {
    let isMounted = true;
    const checkCustomer = async () => {
      try {
        const res = await api.get('/customers/me');
        if (res.data.success && isMounted) {
          setCustomer(res.data.customer);
        }
      } catch (err) {
        // Guest mode
      }
    };
    checkCustomer();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch single product by id
  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchProductById(id);
        if (data.success && isMounted) {
          setProduct(data.product);
        } else if (isMounted) {
          setError(data.message || 'Product not found');
        }

        // Check if item is already in user wishlist
        try {
          const wData = await getWishlist();
          if (wData.success && isMounted) {
            const inW = (wData.wishlist || []).some((item) => item._id === id);
            setIsWishlisted(inW);
          }
        } catch (e) {}
      } catch (err) {
        if (isMounted) {
          if (err.response?.status === 404) {
            setError('Product not found in our catalog.');
          } else if (err.response?.status === 400) {
            setError('Invalid product identifier.');
          } else {
            setError('Something went wrong while loading product details.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    setWishlistToast('');

    try {
      const res = await toggleWishlist(id);
      if (res.success) {
        setIsWishlisted(res.saved);
        setWishlistToast(res.saved ? 'Saved to your wishlist' : 'Removed from wishlist');
        setTimeout(() => setWishlistToast(''), 3000);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setWishlistToast('Unable to update wishlist');
        setTimeout(() => setWishlistToast(''), 3000);
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0 || addingToCart) return;

    setAddingToCart(true);
    setCartError('');
    setAddedToast(false);

    try {
      await addToCart(product._id, quantity);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    } catch (err) {
      if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized') || err.message.toLowerCase().includes('login')) {
        navigate('/login');
      } else {
        setCartError(err.message || 'Failed to add product to cart.');
        setTimeout(() => setCartError(''), 4000);
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Format currency
  const formattedPrice = product
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(product.price)
    : '';

  return (
    <div className="product-details-page-layout">
      <Navbar customer={customer} />

      <main className="product-details-container">
        {/* Navigation Breadcrumb */}
        <nav className="details-breadcrumb" aria-label="Breadcrumb">
          <Link to="/products" className="breadcrumb-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            <span>Catalog</span>
          </Link>
          <span className="breadcrumb-separator">/</span>
          {product?.category && (
            <>
              <span className="breadcrumb-category">{product.category}</span>
              <span className="breadcrumb-separator">/</span>
            </>
          )}
          <span className="breadcrumb-current">
            {loading ? 'Loading...' : product?.name || 'Product Details'}
          </span>
        </nav>

        {/* Loading State */}
        {loading && (
          <div className="details-loading-state state-container">
            <div className="spinner"></div>
            <h3 className="state-title">Loading product details...</h3>
            <p className="state-desc">Fetching specifications from the catalog</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="details-error-card state-container">
            <div className="error-icon-box">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className="state-title">Unable to load product</h2>
            <p className="state-desc">{error}</p>
            <button
              type="button"
              className="btn-state-action"
              onClick={() => navigate('/products')}
            >
              Browse All Products
            </button>
          </div>
        )}

        {/* Success / Product Showcase Grid */}
        {!loading && !error && product && (
          <div className="product-showcase-grid">
            {/* Left Column: Product Image Gallery */}
            <div className="product-gallery-card">
              <div className="main-image-viewport">
                <img
                  src={product.image}
                  alt={product.name}
                  className="showcase-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="showcase-category-badge">{product.category}</span>
              </div>

              {/* Quality & Trust Badges */}
              <div className="trust-badges-row">
                <div className="trust-badge-item">
                  <div className="trust-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <span>100% Genuine</span>
                </div>
                <div className="trust-badge-item">
                  <div className="trust-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  </div>
                  <span>Express Delivery</span>
                </div>
                <div className="trust-badge-item">
                  <div className="trust-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                      <path d="M21 3v5h-5"></path>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                      <path d="M8 16H3v5"></path>
                    </svg>
                  </div>
                  <span>7-Day Return</span>
                </div>
              </div>
            </div>

            {/* Right Column: Product Info & Order Action */}
            <div className="product-info-panel">
              <div className="product-meta-header">
                <div className="product-tag-row">
                  <span className="product-category-pill">{product.category}</span>
                  <span className="product-id-tag">ID: <code>{product._id.slice(-6)}</code></span>
                </div>
                <h1 className="product-showcase-title">{product.name}</h1>
              </div>

              {/* Price Banner */}
              <div className="showcase-price-row">
                <span className="showcase-price">{formattedPrice}</span>
                <span className="inclusive-tax-text">Inclusive of all taxes</span>
              </div>

              {/* Stock Status Pill */}
              <div className="showcase-stock-row">
                {product.stock > 0 ? (
                  <div className="stock-indicator in-stock">
                    <span className="stock-dot"></span>
                    <span>In Stock ({product.stock} units available)</span>
                  </div>
                ) : (
                  <div className="stock-indicator out-of-stock">
                    <span className="stock-dot" style={{ background: '#f87171' }}></span>
                    <span>Currently Out of Stock</span>
                  </div>
                )}
              </div>

              <div className="product-detail-divider"></div>

              {/* Description Section */}
              <div className="product-description-block">
                <h3 className="section-subheading">Product Description</h3>
                <p className="description-text">{product.description}</p>
              </div>

              <div className="product-detail-divider"></div>

              {/* Quantity Selector & Purchase Actions */}
              <div className="purchase-action-block">
                <div className="quantity-counter-box">
                  <span className="quantity-label">Quantity</span>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      className="btn-qty"
                      onClick={handleDecrement}
                      disabled={quantity <= 1 || product.stock <= 0}
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="qty-number">{quantity}</span>
                    <button
                      type="button"
                      className="btn-qty"
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock || product.stock <= 0}
                      title={quantity >= product.stock ? 'Maximum stock reached' : 'Increase quantity'}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="action-buttons-group">
                  <button
                    id="add-to-cart-btn"
                    type="button"
                    className="btn-add-to-cart"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0 || addingToCart}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                  </button>

                  <button
                    id="wishlist-detail-btn"
                    type="button"
                    className={`btn-detail-wishlist ${isWishlisted ? 'saved' : ''}`}
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span>{wishlistLoading ? 'Saving...' : isWishlisted ? 'Saved' : 'Wishlist'}</span>
                  </button>
                </div>
              </div>

              {/* Cart Error Toast */}
              {cartError && (
                <div className="cart-toast-banner" style={{ background: 'rgba(248, 113, 113, 0.08)', borderColor: 'rgba(248, 113, 113, 0.22)' }}>
                  <div>
                    <strong style={{ color: '#f87171' }}>{cartError}</strong>
                  </div>
                </div>
              )}

              {/* Wishlist Toast Notification */}
              {wishlistToast && (
                <div className="cart-toast-banner wishlist-toast">
                  <div>
                    <strong>{wishlistToast}</strong>
                    <p>View saved products in your <Link to="/wishlist" style={{ color: '#ffffff', textDecoration: 'underline' }}>Wishlist</Link>.</p>
                  </div>
                </div>
              )}

              {/* Added to Cart Success Toast Notification */}
              {addedToast && (
                <div className="cart-toast-banner">
                  <div>
                    <strong style={{ color: '#34d399' }}>Added {quantity} x {product.name} to bag</strong>
                    <p>View items in your <Link to="/cart" style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 600 }}>Shopping Bag</Link>.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetails;
