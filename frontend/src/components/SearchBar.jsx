import React from 'react';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Books',
  'Home'
];

const SORT_OPTIONS = [
  { label: 'Featured / Newest', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' }
];

const SearchBar = ({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  onReset
}) => {
  const hasActiveFilters = search.trim() !== '' || (category !== '' && category !== 'All Categories') || sort !== '';

  return (
    <div className="discovery-controls-card">
      <div className="search-controls-grid">
        {/* Search Input Field */}
        <div className="search-input-wrapper">
          <div className="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            id="product-search-input"
            type="text"
            className="search-input-field"
            placeholder="Search products by name... (e.g. keyboard, headphones)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Dropdown Filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="category-select" className="filter-label">Category</label>
          <div className="select-box-custom">
            <select
              id="category-select"
              className="custom-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="select-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Sort Dropdown Filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="sort-select" className="filter-label">Sort By</label>
          <div className="select-box-custom">
            <select
              id="sort-select"
              className="custom-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="select-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="reset-filter-wrapper">
            <button
              type="button"
              id="reset-filters-btn"
              className="btn-reset-filters"
              onClick={onReset}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
