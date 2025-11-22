import React from 'react';
import styles from './GhostLoadingIndicator.module.css';

interface GhostLoadingIndicatorProps {
  message?: string;
  progress?: number; // 0-100
  onCancel?: () => void;
  showCancel?: boolean;
}

/**
 * GhostLoadingIndicator - Loading state component for Ghost Writer
 * 
 * Displays a mystical loading animation with ghostly particles,
 * pulsing glow effects, and a thematic message while AI generates suggestions.
 * 
 * Features:
 * - Ghostly particle animation floating upward
 * - Pulsing purple glow effect
 * - Customizable loading message
 * - Optional cancel button
 * - Fully responsive design
 * - Accessible with ARIA labels
 */
const GhostLoadingIndicator: React.FC<GhostLoadingIndicatorProps> = ({
  message = 'Summoning spirits...',
  progress,
  onCancel,
  showCancel = true,
}) => {
  return (
    <div 
      className={styles.overlay}
      role="status"
      aria-live="polite"
      aria-label="Loading AI suggestion"
    >
      <div className={styles.container}>
        {/* Ghostly particles floating upward */}
        <div className={styles.particlesContainer} aria-hidden="true">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={styles.particle}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Central loading spinner with pulsing glow */}
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner} aria-hidden="true">
            <div className={styles.spinnerRing} />
            <div className={styles.spinnerRing} />
            <div className={styles.spinnerRing} />
            <div className={styles.ghostIcon}>👻</div>
          </div>
        </div>

        {/* Loading message */}
        <div className={styles.message}>
          {message}
        </div>

        {/* Optional progress indicator */}
        {progress !== undefined && (
          <div className={styles.progressContainer}>
            <div 
              className={styles.progressBar}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}

        {/* Cancel button */}
        {showCancel && onCancel && (
          <button
            className={styles.cancelButton}
            onClick={onCancel}
            aria-label="Cancel suggestion generation"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default GhostLoadingIndicator;
