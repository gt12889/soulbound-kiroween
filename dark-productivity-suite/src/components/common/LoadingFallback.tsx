import React, { useEffect, useState } from 'react';
import styles from './LoadingFallback.module.css';

interface LoadingFallbackProps {
  message?: string;
}

/**
 * LoadingFallback - Mystical-themed loading component for lazy-loaded routes
 * Requirements: 1.5, 2.1
 */
const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = 'Summoning dark forces...'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Prevent flash of loading state for very fast loads
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.loadingFallback}>
      <div className={styles.loadingContent}>
        <div className={styles.spinningRing}>
          <div className={styles.ring}></div>
          <div className={styles.ring}></div>
          <div className={styles.ring}></div>
        </div>
        <p className={styles.loadingMessage}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
