/**
 * Fragment Restorer Component
 * Displays corrupted fragments and allows restoration
 */

import React, { useState } from 'react';
import type { Fragment } from '../../../types/ghostArchive';
import { useGhostArchive } from '../../../contexts/GhostArchiveContext';
import styles from './FragmentRestorer.module.css';

interface FragmentRestorerProps {
  fragment: Fragment;
}

export const FragmentRestorer: React.FC<FragmentRestorerProps> = ({ fragment }) => {
  const { startFragmentRestoration } = useGhostArchive();
  const [restoredText, setRestoredText] = useState(fragment.restoredText || '');
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await startFragmentRestoration(fragment.id);
    } finally {
      setIsRestoring(false);
    }
  };

  const renderCorruptedText = () => {
    const parts = fragment.corruptedText.split('[MISSING]');
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        <span className={styles.normalText}>{part}</span>
        {index < parts.length - 1 && (
          <span className={styles.missingText} data-glitch>
            [MISSING]
          </span>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className={styles.fragmentRestorer}>
      <div className={styles.fragmentHeader}>
        <h3 className={styles.fragmentTitle}>{fragment.title}</h3>
        <span className={styles.fragmentType}>{fragment.type}</span>
        <span className={styles.fragmentDifficulty}>{fragment.difficulty}</span>
      </div>

      <div className={styles.fragmentContent}>
        <div className={styles.corruptedText}>
          {renderCorruptedText()}
        </div>

        {fragment.progress > 0 && (
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${fragment.progress}%` }}
            />
            <span className={styles.progressText}>{fragment.progress}% restored</span>
          </div>
        )}

        {restoredText && (
          <div className={styles.restoredText}>
            <div className={styles.restoredLabel}>Restored:</div>
            <div className={styles.restoredContent}>{restoredText}</div>
          </div>
        )}

        <div className={styles.restoreActions}>
          <button
            className={styles.restoreButton}
            onClick={handleRestore}
            disabled={isRestoring}
          >
            {isRestoring ? 'Restoring...' : 'Restore with AI'}
          </button>
        </div>
      </div>
    </div>
  );
};

