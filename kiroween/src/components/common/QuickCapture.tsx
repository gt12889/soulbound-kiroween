import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import { useTasks } from '../../contexts/TasksContext';
import styles from './QuickCapture.module.css';

/**
 * QuickCapture Component
 * Floating modal for quickly capturing notes or tasks
 * Requirements: 13.2, 13.3, 13.6, 6.4
 */

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
}

type CaptureType = 'note' | 'task';

const QuickCapture: React.FC<QuickCaptureProps> = ({ isOpen, onClose }) => {
  const [captureType, setCaptureType] = useState<CaptureType>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { createNote } = useNotes();
  const { createTask } = useTasks();
  
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Auto-focus on input field when modal opens
   * Requirement: 13.3
   */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  /**
   * Handle Escape key to cancel
   * Requirement: 13.6
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  /**
   * Reset form state when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      // Reset after animation completes
      setTimeout(() => {
        setTitle('');
        setContent('');
        setCaptureType('note');
        setShowConfirmation(false);
      }, 300);
    }
  }, [isOpen]);

  /**
   * Handle form submission
   * Requirements: 13.4, 13.5
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    // Create the item based on type
    if (captureType === 'note') {
      createNote(title.trim(), content.trim());
    } else {
      createTask(title.trim(), content.trim() || 'No description', 'medium');
    }

    // Show confirmation animation
    setShowConfirmation(true);

    // Close modal after brief confirmation
    setTimeout(() => {
      onClose();
    }, 500);
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!showConfirmation) {
      onClose();
    }
  };

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="quick-capture-title">
      <div className={`${styles.modal} ${showConfirmation ? styles.confirming : ''}`}>
        {showConfirmation ? (
          <div className={styles.confirmation} role="status" aria-live="polite">
            <div className={styles.confirmationIcon} aria-hidden="true">✓</div>
            <p className={styles.confirmationText}>
              {captureType === 'note' ? 'Note' : 'Task'} captured
            </p>
          </div>
        ) : (
          <>
            <header className={styles.header}>
              <h2 className={styles.title} id="quick-capture-title">Quick Capture</h2>
              <button
                className={styles.closeButton}
                onClick={handleClose}
                type="button"
                aria-label="Close quick capture dialog"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Type selector */}
              <div className={styles.typeSelector} role="group" aria-label="Capture type">
                <button
                  type="button"
                  className={`${styles.typeButton} ${captureType === 'note' ? styles.active : ''}`}
                  onClick={() => setCaptureType('note')}
                  aria-label="Capture as note"
                  aria-pressed={captureType === 'note'}
                >
                  <span className={styles.typeIcon} aria-hidden="true">📝</span>
                  Note
                </button>
                <button
                  type="button"
                  className={`${styles.typeButton} ${captureType === 'task' ? styles.active : ''}`}
                  onClick={() => setCaptureType('task')}
                  aria-label="Capture as task"
                  aria-pressed={captureType === 'task'}
                >
                  <span className={styles.typeIcon} aria-hidden="true">⚰️</span>
                  Task
                </button>
              </div>

              {/* Title input */}
              <div className={styles.inputGroup}>
                <label htmlFor="quick-capture-title" className={styles.label}>
                  {captureType === 'note' ? 'Note Title' : 'Task Title'}
                </label>
                <input
                  ref={inputRef}
                  id="quick-capture-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={captureType === 'note' ? 'Enter note title...' : 'Enter task title...'}
                  required
                />
              </div>

              {/* Content/Description input */}
              <div className={styles.inputGroup}>
                <label htmlFor="quick-capture-content" className={styles.label}>
                  {captureType === 'note' ? 'Content (optional)' : 'Description (optional)'}
                </label>
                <textarea
                  id="quick-capture-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={captureType === 'note' ? 'Enter note content...' : 'Enter task description...'}
                  rows={3}
                />
              </div>

              {/* Submit button */}
              <button 
                type="submit" 
                className={`${styles.submitButton} button-primary`}
                aria-label={`Capture ${captureType === 'note' ? 'note' : 'task'}`}
              >
                Capture {captureType === 'note' ? 'Note' : 'Task'}
              </button>
            </form>

            {/* Hint text */}
            <p className={styles.hint}>Press Escape to cancel</p>
          </>
        )}
      </div>
    </div>
  );
};

export default QuickCapture;
