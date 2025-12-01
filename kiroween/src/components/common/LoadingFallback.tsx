/**
 * Loading Fallback Component
 * Simple loading indicator for Suspense boundaries
 */

import React from 'react';
import styles from './LoadingFallback.module.css';

interface LoadingFallbackProps {
  message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className={styles.loadingFallback}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingFallback;
