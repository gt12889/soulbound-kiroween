import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import type { Toast } from '../../contexts/ToastContext';
import styles from './ToastNotification.module.css';

/**
 * ToastNotification Component
 * Requirements: 4.2, 4.3, 4.4
 * 
 * Displays toast notifications with mystical styling and animations.
 * Supports success (green glow), error (red glow), info (blue glow), and warning types.
 */

interface ToastItemProps {
  toast: Toast;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const { dismissToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  // Handle exit animation before dismissal
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      dismissToast(toast.id);
    }, 300); // Match animation duration
  };

  // Auto-dismiss on action click
  const handleActionClick = () => {
    if (toast.action) {
      toast.action.onClick();
      handleDismiss();
    }
  };

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}
      onClick={handleDismiss}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.content}>
        <div className={styles.icon}>
          {toast.type === 'success' && '✓'}
          {toast.type === 'error' && '✕'}
          {toast.type === 'info' && 'ℹ'}
          {toast.type === 'warning' && '⚠'}
        </div>
        <div className={styles.message}>{toast.message}</div>
      </div>
      {toast.action && (
        <button
          className={`${styles.action} button-secondary`}
          onClick={(e) => {
            e.stopPropagation();
            handleActionClick();
          }}
          aria-label={toast.action.label}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div 
      className={styles.container} 
      aria-live="polite" 
      aria-atomic="false"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
