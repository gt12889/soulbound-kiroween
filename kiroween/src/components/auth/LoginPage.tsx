import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import SocialAuthButtons from './SocialAuthButtons';
import styles from './LoginPage.module.css';

/**
 * LoginPage component with mystical portal-styled login form
 * Requirements: 18.3, 18.7
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { playUIClick } = useAudio();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Form validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      playUIClick();
      // Navigate to the page user was trying to access, or default to graveyard-dashboard
      const from = (location.state as any)?.from?.pathname || '/graveyard-dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className={styles.loginPage}>
      {/* Mystical background elements */}
      <div className={styles.backgroundEffects}>
        <div className={styles.portalGlow}></div>
        <div className={styles.floatingRune}>✦</div>
        <div className={styles.floatingRune}>✧</div>
        <div className={styles.floatingRune}>✦</div>
        <div className={styles.mistLayer}></div>
      </div>

      {/* Portal frame */}
      <div className={styles.portalFrame}>
        <div className={styles.portalTop}>
          <span className={styles.portalSymbol}>◈</span>
          <span className={styles.portalTitle}>The Portal Awaits</span>
          <span className={styles.portalSymbol}>◈</span>
        </div>

        {/* Login form */}
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Enter the Realm</h1>
            <p className={styles.formSubtitle}>
              Speak your name and the ancient words to pass through
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Email field */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              <span className={styles.labelIcon}>✉</span>
              <span>Your Name (Email)</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="traveler@realm.com"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Password field */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              <span className={styles.labelIcon}>🔑</span>
              <span>Ancient Words (Password)</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {/* Forgot password link */}
          <div className={styles.formLinks}>
            <Link to="/password-reset" className={styles.forgotLink}>
              Forgotten the ancient words?
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className={`${styles.submitButton} button-primary`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.loadingSpinner}>◌</span>
                <span>Opening Portal...</span>
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>⚡</span>
                <span>Pass Through the Portal</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine}></span>
            <span className={styles.dividerText}>or enter through</span>
            <span className={styles.dividerLine}></span>
          </div>

          {/* Social login buttons */}
          <SocialAuthButtons onError={handleSocialError} disabled={isLoading} />

          {/* Register link */}
          <div className={styles.registerPrompt}>
            <span className={styles.promptText}>New to this realm?</span>
            <Link to="/register" className={styles.registerLink}>
              Create your passage
            </Link>
          </div>
        </form>

        {/* Portal bottom decoration */}
        <div className={styles.portalBottom}>
          <span className={styles.portalRune}>◆</span>
          <span className={styles.portalRune}>◆</span>
          <span className={styles.portalRune}>◆</span>
        </div>
      </div>

      {/* Back to landing link */}
      <Link to="/" className={styles.backLink}>
        <span className={styles.backIcon}>←</span>
        <span>Return to the forest</span>
      </Link>
    </div>
  );
};

export default LoginPage;
