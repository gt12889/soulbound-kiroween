import React, { useState, useEffect, useRef } from 'react';
import type { CompanionType } from '../../types/companion';
import { COMPANION_TYPES } from '../../types/companion';
import { CompanionOption } from './CompanionOption';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import styles from './CompanionSelectionModal.module.css';

interface CompanionSelectionModalProps {
  isOpen: boolean;
  onSelect: (companionType: CompanionType) => void;
  onClose?: () => void; // Optional, modal is not dismissible by default
}

/**
 * CompanionSelectionModal Component
 * 
 * Fullscreen modal for selecting a permanent Spirit Companion.
 * Displays all three companion options and handles the selection flow.
 * 
 * Features:
 * - Fullscreen overlay (not dismissible)
 * - Focus trap for accessibility
 * - Keyboard navigation support
 * - Loading and error states
 * - Confirmation button only enabled when companion selected
 * 
 * Keyboard Navigation:
 * - Tab: Navigate between companions and confirm button
 * - Enter/Space: Select companion or confirm selection
 * - Arrow Keys: Navigate between companion options
 */
export const CompanionSelectionModal: React.FC<CompanionSelectionModalProps> = ({
  isOpen,
  onSelect,
  // onClose is intentionally unused - modal is not dismissible
}) => {
  const [selectedType, setSelectedType] = useState<CompanionType | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Companion types in order
  const companionTypes: CompanionType[] = ['shadow', 'zombie', 'ember'];

  /**
   * Focus trap: Keep focus within modal using useFocusTrap hook
   * Note: onEscape is not provided since modal is not dismissible
   */
  const modalRef = useFocusTrap({
    isActive: isOpen,
    restoreFocus: true,
  });

  /**
   * Handle Arrow keys for companion navigation
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Arrow keys for companion navigation
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        
        const currentIndex = selectedType ? companionTypes.indexOf(selectedType) : -1;
        let newIndex: number;

        if (event.key === 'ArrowLeft') {
          newIndex = currentIndex <= 0 ? companionTypes.length - 1 : currentIndex - 1;
        } else {
          newIndex = currentIndex >= companionTypes.length - 1 ? 0 : currentIndex + 1;
        }

        setSelectedType(companionTypes[newIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedType, companionTypes]);

  /**
   * Handle companion selection
   */
  const handleCompanionSelect = (type: CompanionType) => {
    setSelectedType(type);
    setError(null); // Clear any previous errors
  };

  /**
   * Handle confirmation button click
   */
  const handleConfirm = async () => {
    if (!selectedType) return;

    setIsConfirming(true);
    setError(null);

    try {
      await Promise.resolve(onSelect(selectedType));
      // Modal will be closed by parent component after successful selection
    } catch (err) {
      console.error('Failed to save companion selection:', err);
      setError('Failed to save your companion choice. Please try again.');
      setIsConfirming(false);
    }
  };

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    setError(null);
    handleConfirm();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      ref={modalRef}
    >
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            Choose Your Spirit Companion
          </h2>
          <p id="modal-description" className={styles.subtitle}>
            This choice is permanent and will shape your journey
          </p>
        </header>

        {/* Companion Options Grid */}
        <div className={styles.optionsGrid} role="radiogroup" aria-label="Companion selection">
          {companionTypes.map((type, index) => (
            <CompanionOption
              key={type}
              companion={COMPANION_TYPES[type]}
              isSelected={selectedType === type}
              onSelect={() => handleCompanionSelect(type)}
              ref={index === 0 ? firstFocusableRef : undefined}
            />
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className={styles.errorContainer} role="alert" aria-live="assertive">
            <p className={styles.errorMessage}>{error}</p>
            <button
              className={styles.retryButton}
              onClick={handleRetry}
              disabled={isConfirming}
            >
              Retry
            </button>
          </div>
        )}

        {/* Confirmation Button */}
        <div className={styles.footer}>
          <button
            ref={confirmButtonRef}
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={!selectedType || isConfirming}
            aria-label={
              selectedType
                ? `Confirm selection of ${COMPANION_TYPES[selectedType].name}`
                : 'Choose a companion to continue'
            }
          >
            {isConfirming ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Bonding...</span>
              </>
            ) : (
              'Choose Companion'
            )}
          </button>
          
          {!selectedType && (
            <p className={styles.hint} aria-live="polite">
              Select a companion above to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
