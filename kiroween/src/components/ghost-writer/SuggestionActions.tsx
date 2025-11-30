import React from 'react';
import styles from './SuggestionActions.module.css';

interface SuggestionActionsProps {
  onAccept: () => void;
  onReject: () => void;
  onRegenerate: () => void;
  disabled?: boolean;
  showShortcuts?: boolean;
  acceptButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

/**
 * SuggestionActions - Action buttons for AI suggestions
 * 
 * Features:
 * - Accept button with green glow
 * - Regenerate button with purple glow
 * - Reject button with red glow
 * - Hover effects and animations
 * - Tooltips with keyboard shortcuts
 * - Responsive design
 * - Accessible with ARIA labels
 * 
 * Keyboard Shortcuts:
 * - Tab/Enter: Accept
 * - Esc: Reject
 * - Ctrl+R: Regenerate
 */
const SuggestionActions: React.FC<SuggestionActionsProps> = ({
  onAccept,
  onReject,
  onRegenerate,
  disabled = false,
  showShortcuts = true,
  acceptButtonRef,
}) => {
  // Handle button clicks - prevent action if disabled
  const handleAccept = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onAccept();
  };

  const handleRegenerate = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onRegenerate();
  };

  const handleReject = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onReject();
  };

  return (
    <div 
      className={styles.actionsContainer}
      role="toolbar"
      aria-label="Suggestion actions"
    >
      {/* Accept Button */}
      <div className={styles.buttonWrapper}>
        <button
          ref={acceptButtonRef}
          className={`${styles.actionButton} ${styles.acceptButton} ${disabled ? styles.disabled : ''}`}
          onClick={handleAccept}
          aria-disabled={disabled}
          aria-label="Accept suggestion (Tab or Enter)"
          tabIndex={0}
        >
          <span className={styles.buttonIcon} aria-hidden="true">✓</span>
          <span className={styles.buttonText}>Accept</span>
          {showShortcuts && (
            <span className={styles.shortcut} aria-hidden="true">
              Tab
            </span>
          )}
        </button>
        {showShortcuts && !disabled && (
          <div className={`${styles.tooltip} ${styles.tooltipAccept}`} role="tooltip">
            Accept suggestion
            <div className={styles.tooltipShortcut}>Tab or Enter</div>
          </div>
        )}
      </div>

      {/* Regenerate Button */}
      <div className={styles.buttonWrapper}>
        <button
          className={`${styles.actionButton} ${styles.regenerateButton} ${disabled ? styles.disabled : ''}`}
          onClick={handleRegenerate}
          aria-disabled={disabled}
          aria-label="Regenerate suggestion (Ctrl+R)"
          tabIndex={0}
        >
          <span className={styles.buttonIcon} aria-hidden="true">↻</span>
          <span className={styles.buttonText}>Regenerate</span>
          {showShortcuts && (
            <span className={styles.shortcut} aria-hidden="true">
              Ctrl+R
            </span>
          )}
        </button>
        {showShortcuts && !disabled && (
          <div className={`${styles.tooltip} ${styles.tooltipRegenerate}`} role="tooltip">
            Generate new suggestion
            <div className={styles.tooltipShortcut}>Ctrl+R</div>
          </div>
        )}
      </div>

      {/* Reject Button */}
      <div className={styles.buttonWrapper}>
        <button
          className={`${styles.actionButton} ${styles.rejectButton} ${disabled ? styles.disabled : ''}`}
          onClick={handleReject}
          aria-disabled={disabled}
          aria-label="Reject suggestion (Esc)"
          tabIndex={0}
        >
          <span className={styles.buttonIcon} aria-hidden="true">✕</span>
          <span className={styles.buttonText}>Reject</span>
          {showShortcuts && (
            <span className={styles.shortcut} aria-hidden="true">
              Esc
            </span>
          )}
        </button>
        {showShortcuts && !disabled && (
          <div className={`${styles.tooltip} ${styles.tooltipReject}`} role="tooltip">
            Reject suggestion
            <div className={styles.tooltipShortcut}>Esc</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionActions;
