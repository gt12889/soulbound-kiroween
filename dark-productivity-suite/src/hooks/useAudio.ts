import { useCallback, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { audioService, type SoundEffect } from '../services/audioService';

/**
 * Custom hook for playing audio effects
 * Integrates with global audio settings from AppContext
 * Provides interface for playing sound effects and manages audio state
 * Requirements: 8.5
 */
export const useAudio = () => {
  const { settings } = useApp();

  // Sync audio service with settings
  useEffect(() => {
    audioService.setEnabled(settings.audioEnabled);
    audioService.setVolume(settings.audioVolume);
  }, [settings.audioEnabled, settings.audioVolume]);

  // Initialize audio service on mount
  useEffect(() => {
    if (settings.audioEnabled) {
      audioService.initialize();
    }

    return () => {
      // Cleanup is handled by the service singleton
    };
  }, [settings.audioEnabled]);

  /**
   * Generic play sound effect function
   * Ensures effects don't exceed 500ms as per requirements
   */
  const playSound = useCallback(
    (soundName: SoundEffect): void => {
      audioService.playSound(soundName);
    },
    []
  );

  /**
   * Play ghost appearance sound effect
   * Ethereal, mysterious tone
   */
  const playGhostAppear = useCallback(() => {
    audioService.playSound('ghost-appear');
  }, []);

  /**
   * Play ghost disappear sound effect
   * Fading, descending tone
   */
  const playGhostDisappear = useCallback(() => {
    audioService.playSound('ghost-disappear');
  }, []);

  /**
   * Play suggestion accepted sound effect
   * Positive, confirming tone
   */
  const playSuggestionAccept = useCallback(() => {
    audioService.playSound('suggestion-accept');
  }, []);

  /**
   * Play page turn sound effect
   * Rustling paper sound simulation
   */
  const playPageTurn = useCallback(() => {
    audioService.playSound('page-turn');
  }, []);

  /**
   * Play tombstone rise sound effect
   * Deep rumbling rise
   */
  const playTombstoneRise = useCallback(() => {
    audioService.playSound('tombstone-rise');
  }, []);

  /**
   * Play tombstone sink sound effect
   * Descending rumble
   */
  const playTombstoneSink = useCallback(() => {
    audioService.playSound('tombstone-sink');
  }, []);

  /**
   * Play UI click sound effect
   * Short click sound
   */
  const playUIClick = useCallback(() => {
    audioService.playSound('ui-click');
  }, []);

  /**
   * Play UI hover sound effect
   * Subtle hover sound
   */
  const playUIHover = useCallback(() => {
    audioService.playSound('ui-hover');
  }, []);

  return {
    playSound,
    playGhostAppear,
    playGhostDisappear,
    playSuggestionAccept,
    playPageTurn,
    playTombstoneRise,
    playTombstoneSink,
    playUIClick,
    playUIHover,
  };
};

export default useAudio;
