import React from 'react';
import type { HeatmapData } from '../../types/streak';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import styles from './DayDetailModal.module.css';

/**
 * Props for DayDetailModal component
 */
interface DayDetailModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Day data to display */
  day: HeatmapData | null;
  /** Close handler */
  onClose: () => void;
}

/**
 * DayDetailModal Component
 * 
 * Modal that displays detailed information about a specific day's activity.
 * Shows breakdown of tasks, notes, and focus time with visual indicators.
 * 
 * Requirements: Task 2.4 - Create day detail modal/popover
 * - Click shows detailed breakdown
 * - Keyboard navigation works (Escape to close)
 * - Screen reader announces day info
 * - Accessible with focus trap
 */
export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  day,
  onClose,
}) => {
  // Focus trap for modal accessibility
  const modalRef = useFocusTrap({
    isActive: isOpen,
    onEscape: onClose,
    restoreFocus: true,
  });

  if (!isOpen || !day || !day.date) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format date for display
  const date = new Date(day.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate total activity
  const totalActivity = day.activities.tasks + day.activities.notes + day.activities.focusMinutes;
  const hasActivity = totalActivity > 0;

  // Get activity level description
  const getActivityDescription = (level: number): string => {
    switch (level) {
      case 0:
        return 'No activity';
      case 1:
        return 'Light activity';
      case 2:
        return 'Moderate activity';
      case 3:
        return 'High activity';
      case 4:
        return 'Very high activity';
      default:
        return 'Unknown';
    }
  };

  return (
    <div 
      className={styles.modalBackdrop} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-detail-title"
    >
      <div className={styles.modalContent} ref={modalRef}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 id="day-detail-title" className={styles.modalTitle}>
            {formattedDate}
          </h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close day details"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Activity Level Indicator */}
          <div className={styles.activityLevel}>
            <div 
              className={styles.activityIndicator}
              data-level={day.level}
              aria-label={`Activity level: ${getActivityDescription(day.level)}`}
            />
            <span className={styles.activityLabel}>
              {getActivityDescription(day.level)}
            </span>
          </div>

          {/* Activity Breakdown */}
          {hasActivity ? (
            <div className={styles.activityBreakdown}>
              <h3 className={styles.sectionTitle}>Activity Breakdown</h3>
              
              {/* Tasks */}
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>⚡</div>
                <div className={styles.activityInfo}>
                  <div className={styles.activityName}>Tasks Completed</div>
                  <div className={styles.activityValue}>{day.activities.tasks}</div>
                </div>
                <div className={styles.activityBar}>
                  <div 
                    className={styles.activityBarFill}
                    style={{ width: `${Math.min((day.activities.tasks / 10) * 100, 100)}%` }}
                    data-type="tasks"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>📝</div>
                <div className={styles.activityInfo}>
                  <div className={styles.activityName}>Notes Created</div>
                  <div className={styles.activityValue}>{day.activities.notes}</div>
                </div>
                <div className={styles.activityBar}>
                  <div 
                    className={styles.activityBarFill}
                    style={{ width: `${Math.min((day.activities.notes / 5) * 100, 100)}%` }}
                    data-type="notes"
                  />
                </div>
              </div>

              {/* Focus Time */}
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>⏱️</div>
                <div className={styles.activityInfo}>
                  <div className={styles.activityName}>Focus Time</div>
                  <div className={styles.activityValue}>
                    {day.activities.focusMinutes} min
                  </div>
                </div>
                <div className={styles.activityBar}>
                  <div 
                    className={styles.activityBarFill}
                    style={{ width: `${Math.min((day.activities.focusMinutes / 120) * 100, 100)}%` }}
                    data-type="focus"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🌙</div>
              <p className={styles.emptyText}>No activity recorded for this day</p>
              <p className={styles.emptySubtext}>
                Complete tasks, create notes, or start focus sessions to track your progress
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button 
            className={styles.closeButtonSecondary}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayDetailModal;
