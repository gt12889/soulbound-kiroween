import React from 'react';
import styles from './SuggestionActions.module.css';

interface SuggestionActionsProps {
  onAccept: () => void;
  onReject: () => void;
  onRegenerate: () => void;
  disabled?: boolean;
  showShortcuts?: boolean;
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
}) => {
  return (
    <div 
      className={styles.actionsContainer}
      role="toolbar"
      aria-label="Suggestion actions"
    >
      {/* Accept Button */}
      <div className={styles.buttonWrapper}>
        <button
          className={`${styles.actionButton} ${styles.acceptButton}`}
          onClick={onAccept}
          disabled={disabled}
          aria-label="Accept suggestion (Tab or Enter)"
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
          className={`${styles.actionButton} ${styles.regenerateButton}`}
          onClick={onRegenerate}
          disabled={disabled}
          aria-label="Regenerate suggestion (Ctrl+R)"
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
          className={`${styles.actionButton} ${styles.rejectButton}`}
          onClick={onReject}
          disabled={disabled}
          aria-label="Reject suggestion (Esc)"
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
