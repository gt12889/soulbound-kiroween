import React, { useEffect, useState } from 'react';
import type { CompanionType } from '../../types/skillTree';
import styles from './CompanionDialogue.module.css';

export interface CompanionDialogueProps {
  message: string;
  companionType: CompanionType;
  position?: 'top' | 'bottom' | 'left' | 'right';
  duration?: number; // Auto-dismiss after duration (ms)
  onDismiss?: () => void;
  showTail?: boolean; // Speech bubble tail
}

/**
 * CompanionDialogue Component
 * 
 * Displays contextual messages from the Spirit Companion in a speech bubble.
 * Features companion-specific colored styling, typewriter effect, and auto-dismiss.
 * 
 * Requirements:
 * - 3.1: Display contextual message in speech bubble
 * - 3.4: Personality-specific dialogue for each companion type
 */
export const CompanionDialogue: React.FC<CompanionDialogueProps> = ({
  message,
  companionType,
  position = 'top',
  duration = 5000,
  onDismiss,
  showTail = true,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissing, setIsDismissing] = useState(false);

  // Typewriter effect
  useEffect(() => {
    let currentIndex = 0;
    const typewriterInterval = setInterval(() => {
      if (currentIndex <= message.length) {
        setDisplayedText(message.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typewriterInterval);
      }
    }, 30); // 30ms per character for smooth typewriter effect

    return () => clearInterval(typewriterInterval);
  }, [message]);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration > 0) {
      const dismissTimer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(dismissTimer);
    }
  }, [duration]);

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300); // Match animation duration
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`${styles.dialogueContainer} ${styles[position]} ${styles[companionType]} ${isDismissing ? styles.dismissing : ''}`}
      role="tooltip"
      aria-live="polite"
      aria-label={`${companionType} companion says: ${message}`}
    >
      <div className={styles.bubble}>
        <div className={styles.bubbleContent}>
          <p className={styles.message}>{displayedText}</p>
          {onDismiss && (
            <button
              className={styles.dismissButton}
              onClick={handleDismiss}
              aria-label="Dismiss message"
              type="button"
            >
              ×
            </button>
          )}
        </div>
        {showTail && <div className={styles.tail} />}
      </div>
    </div>
  );
};

export default CompanionDialogue;
