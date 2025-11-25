import React, { useState } from 'react';
import { CompanionSelectionModal } from './CompanionSelectionModal';
import type { CompanionType } from '../../types/companion';
import { COMPANION_TYPES } from '../../types/companion';
import { useCompanion } from '../../contexts/CompanionContext';
import styles from './CompanionSelectionDemo.module.css';

/**
 * CompanionSelectionDemo Component
 * 
 * Standalone demo page to test the companion selection modal
 * as a new player would experience it.
 * 
 * Features:
 * - Button to trigger modal (simulates new player experience)
 * - Reset button to clear selection and test again
 * - Display selected companion information
 * - Simulates the actual selection flow
 */
export const CompanionSelectionDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectionHistory, setSelectionHistory] = useState<Array<{ type: CompanionType; timestamp: Date }>>([]);
  const { activeCompanion, switchCompanion } = useCompanion();

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCompanionSelect = async (type: CompanionType) => {
    // Actually switch the companion globally for testing
    await switchCompanion(type);
    
    setSelectionHistory(prev => [...prev, { type, timestamp: new Date() }]);
    setShowModal(false);
  };

  const handleReset = () => {
    setShowModal(false);
  };

  const companion = activeCompanion ? COMPANION_TYPES[activeCompanion] : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎃 Companion Selection Test</h1>
        <p className={styles.subtitle}>
          Test the new player experience for choosing a Spirit Companion
        </p>
      </div>

      <div className={styles.content}>
        {/* Current Status */}
        <div className={styles.statusCard}>
          <h2 className={styles.sectionTitle}>Current Status</h2>
          {activeCompanion ? (
            <div className={styles.selectedInfo}>
              <div className={styles.companionContainer}>
                {/* Show video for shadow and zombie companions */}
                {activeCompanion === 'shadow' && (
                  <video
                    className={styles.ghostVideo}
                    src="/ghost_)idle.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                )}
                {activeCompanion === 'zombie' && (
                  <video
                    className={styles.zombieVideo}
                    src="/zombie_idle.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                )}
                {/* Show emoji for all companions (overlays video for shadow/zombie) */}
                <div className={styles.companionEmoji}>{companion!.stages[0].emoji}</div>
              </div>
              <div className={styles.companionDetails}>
                <h3 className={styles.companionName}>{companion!.name}</h3>
                <p className={styles.companionTheme}>{companion!.theme}</p>
                <p className={styles.companionPersonality}>{companion!.personality}</p>
              </div>
            </div>
          ) : (
            <div className={styles.noSelection}>
              <p>No companion selected yet</p>
              <p className={styles.hint}>Click "Test New Player Experience" to begin</p>
            </div>
          )}
        </div>

        {/* Evolution Showcase */}
        {activeCompanion && (
          <div className={styles.evolutionShowcase}>
            <h2 className={styles.sectionTitle}>Complete Evolution Path</h2>
            <p className={styles.evolutionDescription}>
              Watch your {companion!.name} grow through 6 stages as you complete tasks and achieve goals
            </p>
            <div className={styles.evolutionGrid}>
              {companion!.stages.map((stage, index) => (
                <div key={index} className={styles.evolutionStage}>
                  <div className={styles.stageNumber}>Stage {index + 1}</div>
                  <div className={styles.stageEmojiLarge}>{stage.emoji}</div>
                  <h4 className={styles.stageName}>{stage.name}</h4>
                  <p className={styles.stageDescription}>{stage.description}</p>
                  <div className={styles.stageRequirement}>
                    {stage.requiredPoints === 0 
                      ? 'Starting form' 
                      : `${stage.requiredPoints} points required`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            className={styles.primaryButton}
            onClick={handleOpenModal}
            disabled={showModal}
          >
            {activeCompanion ? '🔄 Change Companion (Test)' : '✨ Test New Player Experience'}
          </button>
          
          <p className={styles.testNote}>
            ⚠️ This will change your companion globally for testing purposes
          </p>
        </div>

        {/* Selection History */}
        {selectionHistory.length > 0 && (
          <div className={styles.historyCard}>
            <h2 className={styles.sectionTitle}>Selection History</h2>
            <div className={styles.historyList}>
              {selectionHistory.map((entry, index) => (
                <div key={index} className={styles.historyItem}>
                  <span className={styles.historyEmoji}>
                    {COMPANION_TYPES[entry.type].stages[0].emoji}
                  </span>
                  <span className={styles.historyName}>
                    {COMPANION_TYPES[entry.type].name}
                  </span>
                  <span className={styles.historyTime}>
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className={styles.instructionsCard}>
          <h2 className={styles.sectionTitle}>Testing Instructions</h2>
          <ol className={styles.instructionsList}>
            <li>Click "Test New Player Experience" to open the selection modal</li>
            <li>Use mouse or keyboard to navigate between companions:
              <ul>
                <li><kbd>Tab</kbd> - Navigate between elements</li>
                <li><kbd>Arrow Left/Right</kbd> - Navigate between companions</li>
                <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Select companion</li>
              </ul>
            </li>
            <li>Click on a companion card to select it</li>
            <li>Click "Choose Companion" to confirm your selection</li>
            <li>The modal will close and show your selected companion</li>
            <li>Use "Reset Selection" to test again</li>
          </ol>
        </div>

        {/* Features to Test */}
        <div className={styles.featuresCard}>
          <h2 className={styles.sectionTitle}>Features to Test</h2>
          <ul className={styles.featuresList}>
            <li>✅ Modal appears fullscreen and cannot be dismissed</li>
            <li>✅ All 3 companions are displayed with their information</li>
            <li>✅ Hover effects on companion cards</li>
            <li>✅ Selection state (visual indicator when selected)</li>
            <li>✅ Confirm button disabled until companion selected</li>
            <li>✅ Loading state during confirmation ("Bonding...")</li>
            <li>✅ Focus trap (Tab key stays within modal)</li>
            <li>✅ Keyboard navigation with arrow keys</li>
            <li>✅ ARIA labels for screen readers</li>
            <li>✅ Responsive design on different screen sizes</li>
          </ul>
        </div>
      </div>

      {/* The Modal */}
      <CompanionSelectionModal
        isOpen={showModal}
        onSelect={handleCompanionSelect}
      />
    </div>
  );
};
