/**
 * CRT Effects Component
 * Provides retro terminal visual effects
 */

import React from 'react';
import styles from './CRTEffects.module.css';

interface CRTEffectsProps {
  children: React.ReactNode;
}

export const CRTEffects: React.FC<CRTEffectsProps> = ({ children }) => {
  return (
    <div className={styles.crtContainer}>
      <div className={styles.scanlines}></div>
      <div className={styles.flicker}></div>
      <div className={styles.noise}></div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

