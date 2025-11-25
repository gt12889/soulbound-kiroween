import React, { forwardRef } from 'react';
import type { CompanionDefinition } from '../../types/companion';
import styles from './CompanionOption.module.css';

interface CompanionOptionProps {
  companion: CompanionDefinition;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * CompanionOption Component
 * 
 * Displays a selectable card for a companion type during the selection process.
 * Shows the companion's egg stage, name, personality, and evolution preview.
 * 
 * Keyboard Accessible:
 * - Tab: Navigate to this option
 * - Enter/Space: Select this companion
 */
export const CompanionOption = forwardRef<HTMLButtonElement, CompanionOptionProps>(({
  companion,
  isSelected,
  onSelect,
}, ref) => {
  const eggStage = companion.stages[0];

  /**
   * Handle keyboard events for accessibility
   * Enter and Space keys trigger selection
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Enter or Space key should select the companion
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent default space scrolling
      onSelect();
    }
  };

  // Generate unique IDs for ARIA relationships
  const themeId = `companion-theme-${companion.type}`;
  const personalityId = `companion-personality-${companion.type}`;
  const evolutionId = `companion-evolution-${companion.type}`;

  return (
    <button
      ref={ref}
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role="radio"
      aria-checked={isSelected}
      aria-label={`${companion.name}: ${companion.personality}`}
      aria-describedby={`${themeId} ${personalityId} ${evolutionId}`}
      tabIndex={0}
      style={{
        '--companion-primary': companion.colorPrimary,
        '--companion-secondary': companion.colorSecondary,
      } as React.CSSProperties}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className={styles.selectionIndicator} aria-hidden="true">
          <span className={styles.checkmark}>✓</span>
        </div>
      )}

      {/* Egg Emoji Display */}
      <div className={styles.emojiContainer} aria-hidden="true">
        <div className={styles.emoji}>
          {eggStage.emoji}
        </div>
        <div className={styles.emojiGlow} />
      </div>

      {/* Companion Name */}
      <h3 className={styles.name} aria-hidden="true">{companion.name}</h3>

      {/* Theme */}
      <p id={themeId} className={styles.theme}>{companion.theme}</p>

      {/* Personality Description */}
      <p id={personalityId} className={styles.personality}>{companion.personality}</p>

      {/* Evolution Preview */}
      <div className={styles.evolutionPreview}>
        <p className={styles.evolutionLabel} aria-hidden="true">Evolution Path:</p>
        <div 
          id={evolutionId}
          className={styles.evolutionStages} 
          aria-label={`Evolution path: ${companion.stages.map(s => s.name).join(', ')}`}
        >
          {companion.stages.map((stage, index) => (
            <span
              key={index}
              className={styles.miniEmoji}
              title={stage.name}
              aria-hidden="true"
            >
              {stage.emoji}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
});

CompanionOption.displayName = 'CompanionOption';
