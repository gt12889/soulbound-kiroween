import React from 'react';
import styles from './AmbientBackground.module.css';

interface AmbientBackgroundProps {
  showFog?: boolean;
  showGlow?: boolean;
  glowColor?: string;
}

export function AmbientBackground({
  showFog = false,
  showGlow = false,
  glowColor = 'var(--glow-purple)',
}: AmbientBackgroundProps) {
  return (
    <div className={styles.ambientContainer}>
      {showFog && (
        <>
          <div className={`${styles.fogLayer} ${styles.fogLayer1}`}></div>
          <div className={`${styles.fogLayer} ${styles.fogLayer2}`}></div>
          <div className={`${styles.fogLayer} ${styles.fogLayer3}`}></div>
        </>
      )}
      {showGlow && (
        <div 
          className={styles.glowOverlay}
          style={{ '--glow-color': glowColor } as React.CSSProperties}
        ></div>
      )}
    </div>
  );
}
