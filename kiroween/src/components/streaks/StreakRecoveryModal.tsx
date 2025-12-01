import React, { useState } from 'react';
import type { StreakType, StreakInfo, TaskStreakInfo, FocusStreakInfo } from '../../types/streak';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import styles from './StreakRecoveryModal.module.css';

/**
 * Props for StreakRecoveryModal component
 */
interface StreakRecoveryModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Type of streak that was broken */
  streakType: StreakType;
  /** Broken streak information */
  streakInfo: StreakInfo | TaskStreakInfo | FocusStreakInfo;
  /** Number of available recovery tokens */
  availableTokens: number;
  /** Close handler */
  onClose: () => void;
  /** Recovery confirmation handler */
  onRecover: () => Promise<boolean>;
}

/**
 * Get icon for streak type
 */
function getStreakIcon(type: StreakType): string {
  switch (type) {
    case 'login':
      return '🔥';
    case 'task':
      return '⚡';
    case 'note':
      return '📝';
    case 'focus':
      return '⏱️';
    default:
      return '🔥';
  }
}

/**
 * Get display name for streak type
 */
function getStreakName(type: StreakType): string {
  switch (type) {
    case 'login':
      return 'Login Streak';
    case 'task':
      return 'Task Streak';
    case 'note':
      return 'Note Streak';
    case 'focus':
      return 'Focus Streak';
    default:
      return 'Streak';
  }
}

/**
 * StreakRecoveryModal Component
 * 
 * Modal that allows users to recover a broken streak using recovery tokens.
 * Shows broken streak info, available tokens, and confirmation flow.
 * 
 * Requirements: Task 3.2 - Streak Recovery Modal
 * - Show broken streak info
 * - Display available tokens
 * - Add confirmation flow
 * - Show success/error states
 * - Style with mystical theme
 */
export const StreakRecoveryModal: React.FC<StreakRecoveryModalProps> = ({
  isOpen,
  streakType,
  streakInfo,
  availableTokens,
  onClose,
  onRecover,
}) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Focus trap for modal accessibility
  const modalRef = useFocusTrap({
    isActive: isOpen && !showSuccess,
    onEscape: showConfirmation ? () => setShowConfirmation(false) : onClose,
    restoreFocus: true,
  });

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isRecovering) {
      if (showConfirmation) {
        setShowConfirmation(false);
      } else {
        onClose();
      }
    }
  };

  const handleRecoverClick = () => {
    if (availableTokens === 0 || isRecovering) {
      return;
    }
    // Show confirmation step
    setShowConfirmation(true);
  };

  const handleConfirmRecover = async () => {
    if (availableTokens === 0 || isRecovering) {
      return;
    }

    setIsRecovering(true);
    setShowError(false);

    try {
      const success = await onRecover();
      
      if (success) {
        setShowSuccess(true);
        setShowConfirmation(false);
        // Auto-close after showing success
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      } else {
        setShowError(true);
        setErrorMessage('Unable to recover streak. Please try again.');
        setShowConfirmation(false);
      }
    } catch (error) {
      setShowError(true);
      setErrorMessage('An error occurred. Please try again.');
      setShowConfirmation(false);
    } finally {
      setIsRecovering(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const icon = getStreakIcon(streakType);
  const name = getStreakName(streakType);
  const canRecover = availableTokens > 0;

  // Success state
  if (showSuccess) {
    return (
      <div className={styles.modalBackdrop}>
        <div className={styles.modalContent} ref={modalRef}>
          <div className={styles.successState}>
            <div className={styles.successIcon}>✨</div>
            <h2 className={styles.successTitle}>Streak Recovered!</h2>
            <p className={styles.successText}>
              Your {name.toLowerCase()} has been restored
            </p>
            <div className={styles.successStreak}>
              <span className={styles.successStreakIcon}>{icon}</span>
              <span className={styles.successStreakCount}>{streakInfo.longest}</span>
              <span className={styles.successStreakLabel}>days</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation state
  if (showConfirmation) {
    return (
      <div 
        className={styles.modalBackdrop} 
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
      >
        <div className={styles.modalContent} ref={modalRef}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <div className={styles.headerIcon}>⚠️</div>
            <h2 id="confirmation-modal-title" className={styles.modalTitle}>
              Confirm Token Use
            </h2>
            <button 
              className={styles.closeButton} 
              onClick={handleCancelConfirmation}
              disabled={isRecovering}
              aria-label="Close confirmation"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className={styles.modalBody}>
            <div className={styles.confirmationContent}>
              <div className={styles.confirmationIcon}>🎟️</div>
              <p className={styles.confirmationText}>
                Are you sure you want to use a recovery token to restore your <strong>{name.toLowerCase()}</strong>?
              </p>
              <div className={styles.confirmationWarning}>
                <p className={styles.warningText}>
                  This will use 1 of your {availableTokens} available token{availableTokens !== 1 ? 's' : ''}.
                  Recovery tokens are rare and valuable!
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button 
              className={styles.cancelButton}
              onClick={handleCancelConfirmation}
              disabled={isRecovering}
            >
              Cancel
            </button>
            <button 
              className={styles.confirmButton}
              onClick={handleConfirmRecover}
              disabled={isRecovering}
              aria-busy={isRecovering}
            >
              {isRecovering ? (
                <>
                  <span className={styles.spinner} aria-hidden="true">⏳</span>
                  Recovering...
                </>
              ) : (
                <>
                  <span aria-hidden="true">✨</span>
                  Yes, Use Token
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={styles.modalBackdrop} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recovery-modal-title"
    >
      <div className={styles.modalContent} ref={modalRef}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerIcon}>{icon}</div>
          <h2 id="recovery-modal-title" className={styles.modalTitle}>
            Streak Broken
          </h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            disabled={isRecovering}
            aria-label="Close recovery modal"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Broken Streak Info */}
          <div className={styles.brokenInfo}>
            <div className={styles.brokenIcon}>💔</div>
            <div className={styles.brokenText}>
              <p className={styles.brokenMessage}>
                Your <strong>{name.toLowerCase()}</strong> of <strong>{streakInfo.longest} days</strong> has been broken.
              </p>
              <p className={styles.brokenSubtext}>
                Don't worry! You can use a recovery token to restore your streak.
              </p>
            </div>
          </div>

          {/* Token Display */}
          <div className={styles.tokenSection}>
            <h3 className={styles.sectionTitle}>Recovery Tokens</h3>
            <div className={styles.tokenDisplay}>
              <div className={styles.tokenIcons}>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.tokenIcon} ${i < availableTokens ? styles.tokenAvailable : styles.tokenUsed}`}
                    aria-label={i < availableTokens ? 'Available token' : 'Used token'}
                  >
                    {i < availableTokens ? '●' : '○'}
                  </div>
                ))}
              </div>
              <div className={styles.tokenCount}>
                {availableTokens} / 3 available
              </div>
            </div>
            
            {/* Token Explanation */}
            <div className={styles.tokenExplanation}>
              <p className={styles.explanationText}>
                Recovery tokens allow you to restore a broken streak within 48 hours.
                Earn tokens by reaching milestone streaks (30, 100 days).
              </p>
            </div>
          </div>

          {/* Error Message */}
          {showError && (
            <div className={styles.errorMessage} role="alert">
              <span className={styles.errorIcon}>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* No Tokens Warning */}
          {!canRecover && (
            <div className={styles.warningMessage} role="alert">
              <span className={styles.warningIcon}>🎟️</span>
              <span>
                You don't have any recovery tokens. Keep building streaks to earn more!
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button 
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isRecovering}
          >
            Cancel
          </button>
          <button 
            className={styles.recoverButton}
            onClick={handleRecoverClick}
            disabled={!canRecover || isRecovering}
          >
            <span aria-hidden="true">✨</span>
            Use Token to Recover
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreakRecoveryModal;
