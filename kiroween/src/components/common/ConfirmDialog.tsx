import { useEffect, useState } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { shouldSkipConfirmation } from '../../utils/confirmDialogPreferences';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  showDontAskAgain?: boolean;
  dontAskAgainKey?: string; // Unique key for localStorage
  children?: React.ReactNode;
}

/**
 * ConfirmDialog component - Modal dialog for confirming destructive actions
 * Requirements: 11.1, 11.2, 11.3, 11.5, 11.6, 9.6
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  showDontAskAgain = false,
  dontAskAgainKey,
  children,
}: ConfirmDialogProps) {
  const dialogRef = useFocusTrap({ isActive: isOpen, onEscape: onCancel });
  const [dontAskAgain, setDontAskAgain] = useState(false);

  // Check if user has previously selected "Don't ask again" - Requirement 11.6
  useEffect(() => {
    if (isOpen && dontAskAgainKey && showDontAskAgain && shouldSkipConfirmation(dontAskAgainKey)) {
      // Auto-confirm if user previously selected "Don't ask again"
      onConfirm();
    }
  }, [isOpen, dontAskAgainKey, showDontAskAgain, onConfirm]);

  const handleConfirm = () => {
    // Store preference if "Don't ask again" is checked - Requirement 11.6
    if (dontAskAgain && dontAskAgainKey) {
      localStorage.setItem(`confirmDialog.${dontAskAgainKey}`, 'true');
    }
    onConfirm();
  };

  // Handle Escape key - Requirement 11.5
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <h2 id="confirm-dialog-title" className={styles.title}>
          {title}
        </h2>
        
        <p id="confirm-dialog-message" className={styles.message}>
          {message}
        </p>

        {children}

        {showDontAskAgain && (
          <div className={styles.dontAskAgain}>
            <label>
              <input 
                type="checkbox" 
                checked={dontAskAgain}
                onChange={(e) => setDontAskAgain(e.target.checked)}
              />
              <span>Don't ask again</span>
            </label>
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={`${styles.cancelButton} button-secondary`}
            onClick={onCancel}
            autoFocus={!destructive}
          >
            {cancelLabel}
          </button>
          <button
            className={`${styles.confirmButton} ${destructive ? 'button-danger' : 'button-primary'}`}
            onClick={handleConfirm}
            autoFocus={destructive}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
