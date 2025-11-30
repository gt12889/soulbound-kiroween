import React, { useState, useCallback, useRef } from 'react';
import SuggestionDisplay from './SuggestionDisplay';
import type { GhostSuggestion } from '../../types';
import styles from './SuggestionCarousel.module.css';

interface SuggestionCarouselProps {
  suggestions: GhostSuggestion[];
  isAccepting: boolean;
  onAccept?: (suggestion: GhostSuggestion) => void;
  onReject?: (suggestionId: string) => void;
  onRegenerate?: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  isDragging: boolean;
}

const SuggestionCarousel: React.FC<SuggestionCarouselProps> = ({
  suggestions,
  isAccepting,
  // onAccept, onReject, onRegenerate - Reserved for future integration with action buttons
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | 'none'>('none');
  const touchStateRef = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isDragging: false,
  });
  const suggestionWrapperRef = useRef<HTMLDivElement>(null);

  // Navigate to previous suggestion
  const handlePrevious = useCallback(() => {
    setTransitionDirection('right');
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    
    // Reset transition direction after animation completes
    setTimeout(() => {
      setTransitionDirection('none');
    }, 300);
  }, [suggestions.length]);

  // Navigate to next suggestion
  const handleNext = useCallback(() => {
    setTransitionDirection('left');
    setCurrentIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    
    // Reset transition direction after animation completes
    setTimeout(() => {
      setTransitionDirection('none');
    }, 300);
  }, [suggestions.length]);

  // Navigate to specific suggestion
  const handleDotClick = useCallback((index: number) => {
    if (index === currentIndex) return;
    
    // Determine direction based on index change
    setTransitionDirection(index > currentIndex ? 'left' : 'right');
    setCurrentIndex(index);
    
    // Reset transition direction after animation completes
    setTimeout(() => {
      setTransitionDirection('none');
    }, 300);
  }, [currentIndex]);

  // Handle touch start
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (isAccepting || suggestions.length <= 1) return;

    const touch = event.touches[0];
    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isDragging: true,
    };
  }, [isAccepting, suggestions.length]);

  // Handle touch move
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!touchStateRef.current.isDragging) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStateRef.current.startX;
    const deltaY = touch.clientY - touchStateRef.current.startY;

    // If horizontal movement is greater than vertical, prevent default scrolling
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      event.preventDefault();
    }
  }, []);

  // Handle touch end
  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!touchStateRef.current.isDragging) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStateRef.current.startX;
    const deltaY = touch.clientY - touchStateRef.current.startY;
    const deltaTime = Date.now() - touchStateRef.current.startTime;

    // Reset dragging state
    touchStateRef.current.isDragging = false;

    // Swipe detection thresholds
    const SWIPE_THRESHOLD = 50; // Minimum distance for swipe
    const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity (pixels/ms)
    const MAX_VERTICAL_DEVIATION = 100; // Maximum vertical movement allowed

    // Calculate velocity
    const velocity = Math.abs(deltaX) / deltaTime;

    // Check if this is a valid horizontal swipe
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const meetsDistanceThreshold = Math.abs(deltaX) > SWIPE_THRESHOLD;
    const meetsVelocityThreshold = velocity > SWIPE_VELOCITY_THRESHOLD;
    const withinVerticalLimit = Math.abs(deltaY) < MAX_VERTICAL_DEVIATION;

    if (
      isHorizontalSwipe &&
      (meetsDistanceThreshold || meetsVelocityThreshold) &&
      withinVerticalLimit
    ) {
      if (deltaX > 0) {
        // Swipe right - go to previous
        handlePrevious();
      } else {
        // Swipe left - go to next
        handleNext();
      }
    }
  }, [handlePrevious, handleNext]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  if (suggestions.length === 0) {
    return null;
  }

  const currentSuggestion = suggestions[currentIndex];

  return (
    <div className={styles.carousel}>
      {/* Navigation arrows */}
      {suggestions.length > 1 && (
        <>
          <button
            className={`${styles.navButton} ${styles.navButtonPrev}`}
            onClick={handlePrevious}
            disabled={isAccepting}
            aria-label="Previous suggestion"
            title="Previous suggestion (←)"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            className={`${styles.navButton} ${styles.navButtonNext}`}
            onClick={handleNext}
            disabled={isAccepting}
            aria-label="Next suggestion"
            title="Next suggestion (→)"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Suggestion display */}
      <div
        ref={suggestionWrapperRef}
        className={`${styles.suggestionWrapper} ${
          transitionDirection === 'left' ? styles.transitionLeft :
          transitionDirection === 'right' ? styles.transitionRight :
          ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <SuggestionDisplay
          key={currentIndex}
          suggestion={currentSuggestion}
          isAccepting={isAccepting}
        />
      </div>

      {/* Indicator dots */}
      {suggestions.length > 1 && (
        <div className={styles.indicators}>
          {suggestions.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentIndex ? styles.indicatorActive : ''
              }`}
              onClick={() => handleDotClick(index)}
              disabled={isAccepting}
              aria-label={`Go to suggestion ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* Suggestion counter */}
      {suggestions.length > 1 && (
        <div className={styles.counter} aria-live="polite">
          {currentIndex + 1} / {suggestions.length}
        </div>
      )}

      {/* Keyboard navigation hint */}
      {suggestions.length > 1 && (
        <div className={styles.navigationHint}>
          <kbd>←</kbd> <kbd>→</kbd> Navigate • Swipe to change
        </div>
      )}
    </div>
  );
};

export default SuggestionCarousel;
