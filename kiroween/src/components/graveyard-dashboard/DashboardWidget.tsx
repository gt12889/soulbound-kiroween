import { type ReactNode } from 'react';
import styles from './DashboardWidget.module.css';

interface DashboardWidgetProps {
  title: string;
  icon: string;
  children: ReactNode;
  onRemove?: () => void;
  onSettings?: () => void;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export function DashboardWidget({ 
  title, 
  icon, 
  children, 
  onRemove, 
  onSettings,
  size = 'medium' 
}: DashboardWidgetProps) {
  return (
    <div className={`${styles.widget} ${styles[size]}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.icon}>{icon}</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.actions}>
          {onSettings && (
            <button 
              className={styles.actionButton} 
              onClick={onSettings}
              title="Widget Settings"
            >
              ⚙️
            </button>
          )}
          {onRemove && (
            <button 
              className={styles.actionButton} 
              onClick={onRemove}
              title="Remove Widget"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
