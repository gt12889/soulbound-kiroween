import React, { useState } from 'react';
import { useCompanion } from '../../contexts/CompanionContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import styles from './CompanionStats.module.css';

interface CompanionStatsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CompanionStats Modal Component
 * Displays detailed companion statistics and allows custom naming
 * Requirements: 5.1-5.5, 6.1-6.5
 */
export const CompanionStats: React.FC<CompanionStatsProps> = ({ isOpen, onClose }) => {
  const {
    activeCompanion,
    customNames,
    setCustomName,
    level,
    experience,
    mood,
    stats,
    skillTree,
  } = useCompanion();

  const [nameInput, setNameInput] = useState(customNames[activeCompanion] || '');
  const [nameError, setNameError] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingName, setPendingName] = useState('');

  if (!isOpen) return null;

  const companionDisplayName = customNames[activeCompanion] || getDefaultName(activeCompanion);
  const daysSinceBonding = Math.floor((Date.now() - stats.bondedSince) / (1000 * 60 * 60 * 24));

  /**
   * Handle name input change
   * Requirements: 6.2 - Validate name is between 1-20 characters
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameInput(value);

    // Validate name length (check trimmed value for empty validation)
    const trimmedValue = value.trim();
    if (value.length === 0 || trimmedValue.length === 0) {
      setNameError('Name must be at least 1 character');
    } else if (value.length > 20) {
      setNameError('Name must be 20 characters or less');
    } else {
      setNameError('');
    }
  };

  /**
   * Handle name save - show confirmation if name is being changed
   * Requirements: 6.3 - Save custom name and display in all interfaces
   * Requirements: 6.5 - Allow users to change the name at any time
   */
  const handleSaveName = () => {
    // Trim the name and validate
    const trimmedName = nameInput.trim();
    if (trimmedName.length >= 1 && trimmedName.length <= 20) {
      const currentName = customNames[activeCompanion];
      
      // Show confirmation dialog if changing an existing name
      if (currentName && currentName !== trimmedName) {
        setPendingName(trimmedName);
        setShowConfirmDialog(true);
      } else {
        // No confirmation needed for first-time naming or same name
        setCustomName(activeCompanion, trimmedName);
        setIsEditingName(false);
        setNameError('');
      }
    }
  };

  /**
   * Confirm name change
   */
  const handleConfirmNameChange = () => {
    setCustomName(activeCompanion, pendingName);
    setIsEditingName(false);
    setNameError('');
    setShowConfirmDialog(false);
    setPendingName('');
  };

  /**
   * Cancel name change confirmation
   */
  const handleCancelNameChange = () => {
    setShowConfirmDialog(false);
    setPendingName('');
    // Reset the input to the current name and exit edit mode
    setNameInput(customNames[activeCompanion] || '');
    setIsEditingName(false);
    setNameError('');
  };

  /**
   * Handle name edit cancel
   */
  const handleCancelEdit = () => {
    setNameInput(customNames[activeCompanion] || '');
    setIsEditingName(false);
    setNameError('');
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isEditingName) {
        handleCancelEdit();
      } else {
        onClose();
      }
    } else if (e.key === 'Enter' && isEditingName) {
      handleSaveName();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-labelledby="companion-stats-title"
        aria-modal="true"
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close stats modal"
        >
          ✕
        </button>

        <div className={styles.header}>
          <div className={styles.companionIcon}>
            {getCompanionEmoji(activeCompanion)}
          </div>
          <div className={styles.headerInfo}>
            <h2 id="companion-stats-title" className={styles.title}>
              {activeCompanion.charAt(0).toUpperCase() + activeCompanion.slice(1)} Spirit
            </h2>
            
            {/* Name input/display section */}
            <div className={styles.nameSection}>
              {isEditingName ? (
                <div className={styles.nameEditContainer}>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={handleNameChange}
                    className={styles.nameInput}
                    placeholder="Enter companion name"
                    autoFocus
                    aria-label="Companion name"
                    aria-invalid={!!nameError}
                    aria-describedby={nameError ? 'name-error' : undefined}
                  />
                  <div className={styles.nameActions}>
                    <button
                      onClick={handleSaveName}
                      disabled={!!nameError || nameInput.length === 0}
                      className={styles.saveButton}
                      aria-label="Save name"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className={styles.cancelButton}
                      aria-label="Cancel editing"
                    >
                      Cancel
                    </button>
                  </div>
                  {nameError && (
                    <div id="name-error" className={styles.nameError} role="alert">
                      {nameError}
                    </div>
                  )}
                  <div className={styles.characterCount}>
                    {nameInput.length}/20
                  </div>
                </div>
              ) : (
                <div className={styles.nameDisplay}>
                  <span className={styles.companionName}>
                    "{companionDisplayName}"
                  </span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className={styles.editButton}
                    aria-label="Edit companion name"
                  >
                    ✏️ Edit Name
                  </button>
                </div>
              )}
            </div>

            <div className={styles.levelInfo}>
              Level {level} • {getMoodEmoji(mood)} {mood.charAt(0).toUpperCase() + mood.slice(1)}
            </div>
          </div>
        </div>

        <div className={styles.experienceBar}>
          <div className={styles.experienceLabel}>
            <span>Experience</span>
            <span>{experience}/{skillTree.experienceToNextLevel}</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(experience / skillTree.experienceToNextLevel) * 100}%` }}
            />
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📋</div>
            <div className={styles.statValue}>{stats.totalTasks}</div>
            <div className={styles.statLabel}>Tasks Completed</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔥</div>
            <div className={styles.statValue}>{stats.currentStreak}</div>
            <div className={styles.statLabel}>Current Streak</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statValue}>{stats.longestStreak}</div>
            <div className={styles.statLabel}>Longest Streak</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💫</div>
            <div className={styles.statValue}>{stats.totalInteractions}</div>
            <div className={styles.statLabel}>Interactions</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎭</div>
            <div className={styles.statValue}>{stats.ritualsCompleted}</div>
            <div className={styles.statLabel}>Rituals</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statValue}>{daysSinceBonding}</div>
            <div className={styles.statLabel}>Days Together</div>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.bondingDate}>
            Bonded since {new Date(stats.bondedSince).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Name change confirmation dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Change Companion Name?"
        message={`Are you sure you want to rename your companion from "${customNames[activeCompanion]}" to "${pendingName}"?`}
        confirmLabel="Change Name"
        cancelLabel="Keep Current Name"
        onConfirm={handleConfirmNameChange}
        onCancel={handleCancelNameChange}
        destructive={false}
        showDontAskAgain={true}
        dontAskAgainKey={`companion-name-change-${activeCompanion}`}
      />
    </div>
  );
};

/**
 * Get default companion name based on type
 */
function getDefaultName(type: string): string {
  switch (type) {
    case 'shadow':
      return 'Shadow Spirit';
    case 'forest':
      return 'Forest Spirit';
    case 'ember':
      return 'Ember Spirit';
    default:
      return 'Spirit Companion';
  }
}

/**
 * Get companion emoji based on type
 */
function getCompanionEmoji(type: string): string {
  switch (type) {
    case 'shadow':
      return '👻';
    case 'forest':
      return '🌿';
    case 'ember':
      return '🔥';
    default:
      return '✨';
  }
}

/**
 * Get mood emoji
 */
function getMoodEmoji(mood: string): string {
  switch (mood) {
    case 'happy':
      return '😊';
    case 'excited':
      return '🤩';
    case 'energized':
      return '⚡';
    case 'concerned':
      return '😟';
    case 'proud':
      return '😌';
    case 'playful':
      return '😄';
    default:
      return '😐';
  }
}

export default CompanionStats;
