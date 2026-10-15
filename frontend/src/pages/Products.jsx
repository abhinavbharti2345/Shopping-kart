import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { fetchProducts, getWishlist } from '../services/api';
import api from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [wishlistSet, setWishlistSet] = useState(new Set());

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');

  // Fetch optional customer session and wishlist IDs
  useEffect(() => {
    let isMounted = true;
    const checkCustomer = async () => {
      try {
        const res = await api.get('/customers/me');
        if (res.data.success && isMounted) {
          setCustomer(res.data.customer);
          try {
            const wRes = await getWishlist();
            if (wRes.success && isMounted) {
              const ids = new Set((wRes.wishlist || []).map((item) => item._id));
              setWishlistSet(ids);
            }
          } catch (wErr) {}
        }
      } catch (err) {
        // Unauthenticated guest
      }
    };
    checkCustomer();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleWishlistChange = (productId, saved) => {
    setWishlistSet((prev) => {
      const next = new Set(prev);
      if (saved) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  };

  // Fetch products from backend with current query parameters
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({ search, category, sort });
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError('Failed to fetch products from catalog.');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  // Debounced/Triggered effect on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250); // 250ms debounce for smooth search responsiveness

    return () => clearTimeout(timer);
  }, [loadProducts]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
  };

  return (
    <div className="products-page-layout">
      <Navbar customer={customer} wishlistCount={wishlistSet.size} />

      <main className="products-main-container">
        {/* Header Hero Section */}
        <section className="catalog-hero-section">
          <div className="catalog-hero-header">
            <h1 className="catalog-title">
              Explore Our <span className="highlight-text">Collection</span>
            </h1>
            <p className="catalog-subtitle">
              Thoughtfully curated electronics, essentials, and modern lifestyle products.
            </p>
          </div>

          {/* Search, Filter & Sort Controls */}
          <SearchBar
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            sort={sort}
            setSort={setSort}
            onReset={handleResetFilters}
          />
        </section>

        {/* Results Info Bar */}
        <div className="catalog-results-bar">
          <div className="results-count-badge">
            {!loading && !error && (
              <span>
                Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
                {category && ` in ${category}`}
                {search && ` matching "${search}"`}
              </span>
            )}
          </div>
        </div>

        {/* Content Section: Loading / Error / Empty / Grid */}
        <section className="catalog-content-section">
          {/* 1. Loading State */}
          {loading && (
            <div className="state-container loading-state">
              <div className="spinner"></div>
              <h3 className="state-title">Loading catalog...</h3>
              <p className="state-desc">Fetching the latest available items</p>
              
              {/* Skeleton Cards Preview */}
              <div className="products-grid skeleton-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
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
              <h3 className="state-title">Unable to load catalog</h3>
              <p className="state-desc">{error}</p>
              <button
                type="button"
                className="btn-state-action"
                onClick={loadProducts}
              >
                Try Again
              </button>
            </div>
          )}

          {/* 3. Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="state-container empty-state">
              <div className="empty-icon-box">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <h3 className="state-title">No products found</h3>
              <p className="state-desc">
                We couldn't find any products matching your current filters.
              </p>
              <button
                type="button"
                className="btn-state-action"
                onClick={handleResetFilters}
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* 4. Products Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isWishlisted={wishlistSet.has(product._id)}
                  onWishlistChange={handleWishlistChange}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Products;
