import React from 'react';
import styles from './PaperTexture.module.css';

interface PaperTextureProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * PaperTexture - Provides aged paper texture background
 */
export const PaperTexture: React.FC<PaperTextureProps> = ({ children, className = '' }) => {
  return (
    <div className={`${styles.paperTexture} ${className}`}>
      {children}
    </div>
  );
};




