import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Profile = () => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchCustomerProfile = async () => {
      try {
        // GET /customers/me verifies the HttpOnly cookie session on the server
        const response = await api.get('/customers/me');

        if (response.data.success && isMounted) {
          setCustomer(response.data.customer);
        }
      } catch (err) {
        // If 401 Unauthorized or invalid session, auto-redirect to /login
        if (isMounted) {
          setError('Session expired or unauthorized. Redirecting to login...');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 800);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Loading state with smooth spinner
  if (loading) {
    return (
      <div className="home-loading-screen">
        <div className="spinner"></div>
        <h2>Authenticating Session...</h2>
        <p>Verifying secure cookie credentials with server</p>
      </div>
    );
  }

  // Error fallback if redirection in progress
  if (error && !customer) {
    return (
      <div className="home-loading-screen">
        <div className="alert-box alert-error" style={{ maxWidth: '420px' }}>
          <span>⚠️ {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page-layout">
      <Navbar customer={customer} />

      <main className="home-main-container">
        {/* Hero Welcome Banner */}
        <section className="welcome-hero">
          <div className="welcome-hero-content">
            <div className="welcome-badge">
              <span className="status-dot-active"></span> Authenticated Session
            </div>
            <h1 className="welcome-title">
              Customer Profile: <span className="highlight-text">{customer?.fullName}</span>
            </h1>
            <p className="welcome-subtitle">
              Securely connected via <code>HttpOnly</code> JWT session credentials.
            </p>
          </div>
        </section>

        {/* Customer Information Profile Card */}
        <section className="dashboard-grid">
          <div className="profile-detail-card">
            <div className="card-header">
              <div className="card-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h3 className="card-title">Account Details</h3>
                <p className="card-caption">Fetched dynamically from <code>GET /customers/me</code></p>
              </div>
            </div>

            <div className="profile-fields-list">
              <div className="profile-field-row">
                <span className="field-label">Full Name:</span>
                <span className="field-value font-semibold">{customer?.fullName}</span>
              </div>

              <div className="profile-field-row">
                <span className="field-label">Email Address:</span>
                <span className="field-value">{customer?.email}</span>
              </div>

              <div className="profile-field-row">
                <span className="field-label">Phone Number:</span>
                <span className="field-value">{customer?.phone}</span>
              </div>

              <div className="profile-field-row">
                <span className="field-label">Account ID:</span>
                <span className="field-value mono-text">{customer?._id}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats / Info Widget */}
          <div className="info-stats-card">
            <div className="card-header">
              <div className="card-icon-box accent-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <h3 className="card-title">Security & Session Status</h3>
                <p className="card-caption">Zero-trust token guard</p>
              </div>
            </div>

            <div className="security-badges-list">
              <div className="security-item">
                <div className="security-icon-ok">✓</div>
                <div>
                  <strong>HttpOnly Cookie Token</strong>
                  <p>Inaccessible to client scripts (immune to XSS attacks)</p>
                </div>
              </div>

              <div className="security-item">
                <div className="security-icon-ok">✓</div>
                <div>
                  <strong>Protected Route Guard</strong>
                  <p>Auto-redirects unauthenticated requests to <code>/login</code></p>
                </div>
              </div>

              <div className="security-item">
                <div className="security-icon-ok">✓</div>
                <div>
                  <strong>Single Source of Truth</strong>
                  <p>Profile synced directly with MongoDB backend</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;
