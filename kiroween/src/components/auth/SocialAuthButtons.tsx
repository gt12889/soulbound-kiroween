import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import styles from './SocialAuthButtons.module.css';

interface SocialAuthButtonsProps {
  onError?: (error: string) => void;
  disabled?: boolean;
}

/**
 * SocialAuthButtons component with OAuth buttons for Google and GitHub
 * Requirements: 18.8
 */
const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ onError, disabled = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle } = useAuth();
  const { playUIClick } = useAudio();
  
  const [loadingProvider, setLoadingProvider] = useState<'google' | null>(null);

  const handleGoogleLogin = async () => {
    if (disabled || loadingProvider) return;
    
    setLoadingProvider('google');
    playUIClick();
    
    try {
      await signInWithGoogle();
      // Check if user has selected a companion - check both context and localStorage
      // This handles timing issues where context might not be updated yet
      const companionType = localStorage.getItem('companionType');
      const hasCompanion = companionType !== null && companionType !== '';
      
      // If no companion selected, redirect to achievements page to select one
      // Otherwise, navigate to the page user was trying to access, or default to graveyard-dashboard
      const from = (location.state as any)?.from?.pathname;
      if (!hasCompanion) {
        navigate('/achievements', { replace: true });
      } else {
        navigate(from || '/graveyard-dashboard', { replace: true });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Google sign-in failed. Please try again.';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const isLoading = loadingProvider !== null;

  return (
    <div className={styles.socialButtons}>
      {/* Google OAuth Button */}
      <button
        type="button"
        className={`${styles.socialButton} ${styles.googleButton}`}
        onClick={handleGoogleLogin}
        disabled={disabled || isLoading}
        aria-label="Sign in with Google"
      >
        <span className={styles.buttonGlow}></span>
        <span className={styles.buttonContent}>
          {loadingProvider === 'google' ? (
            <>
              <span className={styles.loadingSpinner}>◌</span>
              <span className={styles.buttonText}>Channeling...</span>
            </>
          ) : (
            <>
              <span className={styles.socialIcon}>
                <svg viewBox="0 0 24 24" className={styles.iconSvg}>
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </span>
              <span className={styles.buttonText}>Google Gateway</span>
            </>
          )}
        </span>
        <span className={styles.mysticalParticles}>
          <span className={styles.particle}>✦</span>
          <span className={styles.particle}>✧</span>
          <span className={styles.particle}>✦</span>
        </span>
      </button>
    </div>
  );
};

export default SocialAuthButtons;
