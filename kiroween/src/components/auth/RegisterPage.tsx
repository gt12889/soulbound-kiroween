import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import SocialAuthButtons from './SocialAuthButtons';
import styles from './RegisterPage.module.css';

/**
 * RegisterPage component with mystical registration form
 * Requirements: 18.1, 18.2
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { playUIClick } = useAudio();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate password strength
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: 'Empty', color: '#4a1a1a' };
    
    let score = 0;
    
    // Length check
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 15;
    
    // Character variety checks
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/\d/.test(pwd)) score += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 15;
    
    // Determine label and color
    if (score < 30) return { score, label: 'Weak', color: '#6e2d2d' };
    if (score < 50) return { score, label: 'Fair', color: '#6e4a2d' };
    if (score < 70) return { score, label: 'Good', color: '#4a6e2d' };
    return { score, label: 'Strong', color: '#2d6e4a' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Form validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!acceptedTerms) {
      setError('You must accept the terms of service to continue');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register the user
      await register(email, password);
      playUIClick();
      
      // Automatic login after registration - navigate to main app
      navigate('/graveyard-dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      {/* Mystical background effects */}
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
          <span className={styles.portalTitle}>Create Your Passage</span>
          <span className={styles.portalSymbol}>◈</span>
        </div>

        {/* Registration form */}
        <form className={styles.registerForm} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Join the Realm</h1>
            <p className={styles.formSubtitle}>
              Inscribe your name in the ancient tome to begin your journey
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
              autoComplete="new-password"
            />
            
            {/* Password strength meter */}
            {password && (
              <div className={styles.strengthMeter}>
                <div className={styles.strengthLabel}>
                  <span className={styles.strengthIcon}>⚡</span>
                  <span>Mystical Power: {passwordStrength.label}</span>
                </div>
                <div className={styles.strengthBar}>
                  <div 
                    className={styles.strengthFill}
                    style={{ 
                      width: `${passwordStrength.score}%`,
                      backgroundColor: passwordStrength.color,
                      boxShadow: `0 0 15px ${passwordStrength.color}`
                    }}
                  >
                    <div className={styles.strengthGlow}></div>
                  </div>
                </div>
                <div className={styles.strengthHint}>
                  Use 8+ characters with uppercase, lowercase, and numbers
                </div>
              </div>
            )}
          </div>

          {/* Confirm password field */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.formLabel}>
              <span className={styles.labelIcon}>🔐</span>
              <span>Confirm Ancient Words</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          {/* Terms of service checkbox */}
          <div className={styles.termsGroup}>
            <label className={styles.termsLabel}>
              <input
                type="checkbox"
                className={styles.termsCheckbox}
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={isLoading}
              />
              <span className={styles.customCheckbox}>
                {acceptedTerms && <span className={styles.checkmark}>✓</span>}
              </span>
              <span className={styles.termsText}>
                I accept the{' '}
                <Link to="/terms" className={styles.termsLink} target="_blank">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className={styles.termsLink} target="_blank">
                  Privacy Policy
                </Link>
              </span>
            </label>
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
                <span>Creating Passage...</span>
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>✨</span>
                <span>Enter the Realm</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine}></span>
            <span className={styles.dividerText}>or enter through</span>
            <span className={styles.dividerLine}></span>
          </div>

          {/* Social auth buttons */}
          <SocialAuthButtons onError={setError} disabled={isLoading} />

          {/* Login link */}
          <div className={styles.loginPrompt}>
            <span className={styles.promptText}>Already have passage?</span>
            <Link to="/login" className={styles.loginLink}>
              Return through the portal
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

export default RegisterPage;
