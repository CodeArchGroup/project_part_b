import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup, resetPassword } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function clearForm() {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (isRegister) {
      if (!name.trim()) {
        setError('Name is required.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        await signup(name.trim(), email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess('Password reset request submitted.');
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  }

  // Forgot Password View
  if (isForgotPassword) {
    return (
      <div className="auth-page">
        <div className="auth-container glass-panel">
          <div className="auth-header">
            <div className="auth-logo">ITQAN AI</div>
            <p className="auth-subtitle">Reset Your Password</p>
          </div>

          {error && <div className="auth-alert auth-alert-error">{error}</div>}
          {success && <div className="auth-alert auth-alert-success">{success}</div>}

          <form onSubmit={handleForgotPassword}>
            <div className="auth-field">
              <label htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email"
                type="email"
                className="input-field"
                required
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? <span className="auth-spinner" /> : 'Request Reset'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Remember your password?{' '}
              <span
                className="auth-link"
                onClick={() => { setIsForgotPassword(false); clearForm(); }}
              >
                Back to Login
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Login / Register View
  return (
    <div className="auth-page">
      <div className="auth-container glass-panel">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">ITQAN AI</div>
          <p className="auth-subtitle">Islamic Finance Advisor</p>
        </div>

        {/* Login / Register Toggle */}
        <div className="auth-toggle">
          <button
            className={`auth-toggle-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); clearForm(); }}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-toggle-btn ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); clearForm(); }}
            type="button"
          >
            Register
          </button>
        </div>

        {/* Error / Success Messages */}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {success && <div className="auth-alert auth-alert-success">{success}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                className="input-field"
                required
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              className="input-field"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="input-field"
              required
              placeholder="••••••••"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {isRegister && (
            <div className="auth-field">
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <input
                id="auth-confirm-password"
                type="password"
                className="input-field"
                required
                placeholder="••••••••"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {!isRegister && (
            <div className="auth-forgot">
              <span
                className="auth-link"
                onClick={() => { setIsForgotPassword(true); clearForm(); }}
              >
                Forgot password?
              </span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In Securely'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer" style={{ marginTop: '20px' }}>
          <p>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <span
              className="auth-link"
              onClick={() => { setIsRegister(!isRegister); clearForm(); }}
            >
              {isRegister ? 'Login here' : 'Register here'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
