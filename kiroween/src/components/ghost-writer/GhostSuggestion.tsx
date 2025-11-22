import React, { useEffect, useState, useRef } from 'react';
import type { GhostSuggestion as GhostSuggestionType } from '../../types';
import { useAudio } from '../../hooks/useAudio';
import styles from './GhostSuggestion.module.css';

interface GhostSuggestionProps {
  suggestion: GhostSuggestionType;
  onAccept: (suggestion: GhostSuggestionType) => void;
  onDismiss: (suggestionId: string) => void;
  cursorPosition?: { x: number; y: number };
}

const GhostSuggestion: React.FC<GhostSuggestionProps> = ({
  suggestion,
  onAccept,
  onDismiss,
  cursorPosition,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const dismissTimerRef = useRef<number | null>(null);
  const fadeInTimerRef = useRef<number | null>(null);
  const { playGhostAppear, playGhostDisappear, playSuggestionAccept } = useAudio();

  // Fade in animation on mount
  useEffect(() => {
    // Play appear sound
    playGhostAppear();
    
    fadeInTimerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // Auto-dismiss after 3 seconds if not hovered
    dismissTimerRef.current = setTimeout(() => {
      if (!isHovered) {
        handleDismiss();
      }
    }, 3000);

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (fadeInTimerRef.current) clearTimeout(fadeInTimerRef.current);
    };
  }, []);

  // Reset dismiss timer when hover state changes
  useEffect(() => {
    if (isHovered && dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    } else if (!isHovered && isVisible && !isFadingOut) {
      dismissTimerRef.current = setTimeout(() => {
        handleDismiss();
      }, 3000);
    }
  }, [isHovered, isVisible, isFadingOut]);

  const handleDismiss = () => {
    setIsFadingOut(true);
    playGhostDisappear();
    setTimeout(() => {
      onDismiss(suggestion.id);
    }, 300); // Match fade-out animation duration
  };

  const handleClick = () => {
    playSuggestionAccept();
    onAccept(suggestion);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Calculate position based on cursor
  const getPositionStyle = (): React.CSSProperties => {
    if (cursorPosition) {
      return {
        position: 'absolute',
        left: `${cursorPosition.x}px`,
        top: `${cursorPosition.y + 25}px`,
      };
    }
    return {};
  };

  return (
    <button
      className={`${styles.ghostSuggestion} ${isVisible ? styles.visible : ''} ${
        isFadingOut ? styles.fadingOut : ''
      } ${isHovered ? styles.hovered : ''}`}
      style={getPositionStyle()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      aria-label={`Accept suggestion: ${suggestion.text.substring(0, 50)}${suggestion.text.length > 50 ? '...' : ''}`}
      aria-live="polite"
    >
      <span className={styles.suggestionText} aria-hidden="false">{suggestion.text}</span>
      <span className={styles.ghostIcon} aria-hidden="true">👻</span>
    </button>
  );
};

export default GhostSuggestion;
