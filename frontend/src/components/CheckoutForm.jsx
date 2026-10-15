import React from 'react';

const CheckoutForm = ({
  shippingAddress,
  errors,
  onChange,
  onBlur
}) => {
  return (
    <div className="checkout-form-card">
      <div className="checkout-card-header">
        <div className="card-header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div>
          <h2 className="checkout-card-title">Shipping Details</h2>
          <p className="checkout-card-subtitle">Where should we deliver your order?</p>
        </div>
      </div>

      <div className="checkout-form-grid">
        {/* Full Name */}
        <div className="form-group full-width">
          <label htmlFor="fullName" className="form-label">
            Full Name <span className="required-star">*</span>
          </label>
          <div className="input-with-icon">
            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className={`form-input ${errors.fullName ? 'input-error' : ''}`}
              placeholder="e.g. Aarav Sharma"
              value={shippingAddress.fullName}
              onChange={onChange}
              onBlur={onBlur}
            />
          </div>
          {errors.fullName && <p className="form-error-msg">{errors.fullName}</p>}
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number <span className="required-star">*</span>
          </label>
          <div className="input-with-icon">
            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <input
              id="phone"
              name="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
              placeholder="10-digit mobile number"
              maxLength="10"
              value={shippingAddress.phone}
              onChange={onChange}
              onBlur={onBlur}
            />
          </div>
          {errors.phone && <p className="form-error-msg">{errors.phone}</p>}
        </div>

        {/* Pincode */}
        <div className="form-group">
          <label htmlFor="pincode" className="form-label">
            Pincode <span className="required-star">*</span>
          </label>
          <div className="input-with-icon">
            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20"></path>
              <path d="m17 5-5-3-5 3"></path>
              <path d="m17 19-5 3-5-3"></path>
            </svg>
            <input
              id="pincode"
              name="pincode"
              type="text"
              className={`form-input ${errors.pincode ? 'input-error' : ''}`}
              placeholder="6-digit ZIP / PIN"
              maxLength="6"
              value={shippingAddress.pincode}
              onChange={onChange}
              onBlur={onBlur}
            />
          </div>
          {errors.pincode && <p className="form-error-msg">{errors.pincode}</p>}
        </div>

        {/* Address Line 1 */}
        <div className="form-group full-width">
          <label htmlFor="addressLine1" className="form-label">
            Street Address / House No. <span className="required-star">*</span>
          </label>
          <div className="input-with-icon">
            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <input
              id="addressLine1"
              name="addressLine1"
              type="text"
              className={`form-input ${errors.addressLine1 ? 'input-error' : ''}`}
              placeholder="e.g. Flat 402, Lotus Residency, MG Road"
              value={shippingAddress.addressLine1}
              onChange={onChange}
              onBlur={onBlur}
            />
          </div>
          {errors.addressLine1 && <p className="form-error-msg">{errors.addressLine1}</p>}
        </div>

        {/* City */}
        <div className="form-group">
          <label htmlFor="city" className="form-label">
            City <span className="required-star">*</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            className={`form-input ${errors.city ? 'input-error' : ''}`}
            placeholder="e.g. Bengaluru"
            value={shippingAddress.city}
            onChange={onChange}
            onBlur={onBlur}
          />
          {errors.city && <p className="form-error-msg">{errors.city}</p>}
        </div>

        {/* State */}
        <div className="form-group">
          <label htmlFor="state" className="form-label">
            State <span className="required-star">*</span>
          </label>
          <input
            id="state"
            name="state"
            type="text"
            className={`form-input ${errors.state ? 'input-error' : ''}`}
            placeholder="e.g. Karnataka"
            value={shippingAddress.state}
            onChange={onChange}
            onBlur={onBlur}
          />
          {errors.state && <p className="form-error-msg">{errors.state}</p>}
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
