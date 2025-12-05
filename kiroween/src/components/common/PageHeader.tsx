import React from 'react';
import GhostCursor from './GhostCursor';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
  
  // GhostCursor customization
  cursorColor?: string;
  cursorBrightness?: number;
  enableCursor?: boolean;
}

/**
 * PageHeader component with integrated GhostCursor effect
 * Wraps page titles with a ghostly cursor trail effect
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  className = '',
  children,
  cursorColor = '#B19EEF',
  cursorBrightness = 1,
  enableCursor = true
}) => {
  return (
    <header className={`${styles.pageHeader} ${className}`}>
      {enableCursor && (
        <GhostCursor
          color={cursorColor}
          brightness={cursorBrightness}
          trailLength={50}
          bloomStrength={0.15}
          mixBlendMode="screen"
          zIndex={1}
        />
      )}
      <div className={styles.headerContent}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </header>
  );
};

export default PageHeader;

