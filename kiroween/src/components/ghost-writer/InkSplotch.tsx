import React from 'react';
import styles from './InkSplotch.module.css';

interface InkSplotch {
  id: number;
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
}

interface InkSplotchProps {
  splotches: InkSplotch[];
  onSplotchComplete?: (id: number) => void;
}

/**
 * InkSplotch - Displays ink splotches on paper
 */
export const InkSplotch: React.FC<InkSplotchProps> = ({ splotches, onSplotchComplete }) => {
  if (splotches.length === 0) return null;

  return (
    <div className={styles.inkSplotchContainer}>
      {splotches.map((splotch) => (
        <div
          key={splotch.id}
          className={`${styles.inkSplotch} ${styles[splotch.size]}`}
          style={{
            left: `${splotch.x}%`,
            top: `${splotch.y}%`,
          }}
          onAnimationEnd={() => {
            if (onSplotchComplete) {
              setTimeout(() => onSplotchComplete(splotch.id), 800);
            }
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};



