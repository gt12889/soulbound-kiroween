import React from 'react';
import ThemeSelector from './ThemeSelector';
import styles from './SettingsModal.module.css';

/**
 * SettingsModal Component
 * Displays settings including theme selector
 * Requirement 10.5: Provide theme selector in settings or navigation area
 */

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Realm Settings</h2>
          <button className={styles.closeButton} onClick={onClose} title="Close settings">
            ✕
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <ThemeSelector />
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
