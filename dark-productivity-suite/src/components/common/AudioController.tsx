import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import styles from './AudioController.module.css';

/**
 * AudioController Component
 * Provides UI controls for audio toggle and volume
 * Persists settings to LocalStorage via AppContext
 * Requirements: 8.2, 8.3
 */
const AudioController: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleAudio = () => {
    updateSettings({ audioEnabled: !settings.audioEnabled });
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(event.target.value, 10);
    updateSettings({ audioVolume: volume });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.audioController}>
      <button
        className={styles.toggleButton}
        onClick={handleToggleAudio}
        title={settings.audioEnabled ? 'Disable Audio' : 'Enable Audio'}
        aria-label={settings.audioEnabled ? 'Disable Audio' : 'Enable Audio'}
      >
        {settings.audioEnabled ? (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        ) : (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        )}
      </button>

      {settings.audioEnabled && (
        <button
          className={styles.expandButton}
          onClick={toggleExpanded}
          title="Volume Control"
          aria-label="Toggle volume control"
        >
          <svg className={styles.expandIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isExpanded ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
            />
          </svg>
        </button>
      )}

      {settings.audioEnabled && isExpanded && (
        <div className={styles.volumeControl}>
          <label htmlFor="volume-slider" className={styles.volumeLabel}>
            Volume
          </label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="100"
            value={settings.audioVolume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
            aria-label="Volume slider"
          />
          <span className={styles.volumeValue}>{settings.audioVolume}%</span>
        </div>
      )}
    </div>
  );
};

export default AudioController;
