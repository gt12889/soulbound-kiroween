import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { sendPasswordReset, resetPassword } from '../../services/authService';
import { useAudio } from '../../hooks/useAudio';
import styles from './PasswordReset.module.css';

type ResetStep = 'request' | 'verify' | 'success';

/**
 * PasswordReset component with mystical rune-styled verification
 * Requirements: 18.5
 */
const PasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const { playUIClick } = useAudio();
  const [searchParams] = useSearchParams();
  
  // Check if we have a reset code in URL (from email link)
  const oobCode = searchParams.get('oobCode');
  
  const [step, setStep] = useState<ResetStep>(oobCode ? 'verify' : 'request');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(oobCode || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle password reset request
  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await sendPasswordReset(email);
      playUIClick();
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset with verification code
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!verificationCode.trim()) {
      setError('Verification code is required');
      return;
    }
    
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(verificationCode, newPassword);
      playUIClick();
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render request reset form
  const renderRequestForm = () => (
    <form className={styles.resetForm} onSubmit={handleRequestReset}>
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Forgotten Words</h1>
        <p className={styles.formSubtitle}>
          Speak your name and we shall send you the ancient runes to restore your passage
        </p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠</span>
          <span>{error}</span>
        </div>
      )}

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
          autoFocus
        />
      </div>

      <button
        type="submit"
        className={`${styles.submitButton} button-primary`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.loadingSpinner}>◌</span>
            <span>Summoning Runes...</span>
          </>
        ) : (
          <>
            <span className={styles.buttonIcon}>📜</span>
            <span>Send Ancient Runes</span>
          </>
        )}
      </button>

      <div className={styles.backPrompt}>
        <span className={styles.promptText}>Remember your words?</span>
        <Link to="/login" className={styles.backToLoginLink}>
          Return to portal
        </Link>
      </div>
    </form>
  );

  // Render verification and new password form
  const renderVerifyForm = () => (
    <form className={styles.resetForm} onSubmit={handleResetPassword}>
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Decipher the Runes</h1>
        <p className={styles.formSubtitle}>
          Enter the mystical runes sent to your realm and forge new ancient words
        </p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Verification code input styled as rune entry */}
      <div className={styles.formGroup}>
        <label htmlFor="verificationCode" className={styles.formLabel}>
          <span className={styles.labelIcon}>✦</span>
          <span>Mystical Runes (Verification Code)</span>
        </label>
        <div className={styles.runeInputContainer}>
          <input
            id="verificationCode"
            type="text"
            className={styles.runeInput}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter the sacred runes..."
            disabled={isLoading || !!oobCode}
            autoComplete="off"
            autoFocus={!oobCode}
          />
          <div className={styles.runeGlow}></div>
        </div>
        <div className={styles.runeHint}>
          <span className={styles.runeSymbol}>◈</span>
          <span>Check your email for the verification code</span>
        </div>
      </div>

      {/* New password field */}
      <div className={styles.formGroup}>
        <label htmlFor="newPassword" className={styles.formLabel}>
          <span className={styles.labelIcon}>🔑</span>
          <span>New Ancient Words (Password)</span>
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
          autoComplete="new-password"
        />
      </div>

      {/* Confirm password field */}
      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword" className={styles.formLabel}>
          <span className={styles.labelIcon}>🔐</span>
          <span>Confirm New Words</span>
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

      <button
        type="submit"
        className={`${styles.submitButton} button-primary`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.loadingSpinner}>◌</span>
            <span>Forging New Words...</span>
          </>
        ) : (
          <>
            <span className={styles.buttonIcon}>⚡</span>
            <span>Restore Passage</span>
          </>
        )}
      </button>

      {!oobCode && (
        <div className={styles.backPrompt}>
          <span className={styles.promptText}>Didn't receive the runes?</span>
          <button
            type="button"
            className={styles.backToLoginLink}
            onClick={() => setStep('request')}
            disabled={isLoading}
          >
            Request again
          </button>
        </div>
      )}
    </form>
  );

  // Render success message
  const renderSuccess = () => (
    <div className={styles.successContainer}>
      <div className={styles.successIcon}>✨</div>
      <h1 className={styles.successTitle}>Passage Restored</h1>
      <p className={styles.successMessage}>
        Your ancient words have been renewed. You may now enter the realm with your new passage.
      </p>
      <button
        className={`${styles.submitButton} button-primary`}
        onClick={() => {
          playUIClick();
          navigate('/login');
        }}
      >
        <span className={styles.buttonIcon}>⚡</span>
        <span>Return to Portal</span>
      </button>
    </div>
  );

  return (
    <div className={styles.passwordResetPage}>
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
          <span className={styles.portalTitle}>
            {step === 'request' && 'Restore Your Passage'}
            {step === 'verify' && 'Ancient Runes'}
            {step === 'success' && 'Passage Renewed'}
          </span>
          <span className={styles.portalSymbol}>◈</span>
        </div>

        {/* Render appropriate form based on step */}
        {step === 'request' && renderRequestForm()}
        {step === 'verify' && renderVerifyForm()}
        {step === 'success' && renderSuccess()}

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

export default PasswordReset;