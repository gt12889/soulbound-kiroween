import React, { useState, useEffect } from 'react';
import styles from './LoadingTransition.module.css';

interface LoadingTransitionProps {
  isLoading: boolean;
  minDisplayTime?: number; // Minimum time to display in ms (default 500ms)
}

const LoadingTransition: React.FC<LoadingTransitionProps> = ({ 
  isLoading, 
  minDisplayTime = 500 
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isLoading) {
      // Show immediately when loading starts
      setShouldShow(true);
      setIsVisible(true);
    } else if (shouldShow) {
      // Ensure minimum display time before hiding
      timer = setTimeout(() => {
        setIsVisible(false);
        // Wait for fade out animation before unmounting
        setTimeout(() => setShouldShow(false), 500);
      }, minDisplayTime);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, shouldShow, minDisplayTime]);

  if (!shouldShow) return null;

  return (
    <div className={`${styles.loadingTransition} ${!isVisible ? styles.fadeOut : ''}`}>
      {/* Multiple fog layers for depth */}
      <div className={styles.fogLayer1}></div>
      <div className={styles.fogLayer2}></div>
      <div className={styles.fogLayer3}></div>
      
      {/* Shadow effects */}
      <div className={styles.shadowEffect}></div>
      
      {/* Loading content */}
      <div className={styles.loadingContent}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
        </div>
        <div className={styles.loadingText}>
          <span className={styles.loadingDots}>
            Loading<span className={styles.dot}>.</span><span className={styles.dot}>.</span><span className={styles.dot}>.</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingTransition;
