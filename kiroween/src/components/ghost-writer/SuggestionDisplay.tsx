import React, { useEffect, useState, useRef } from 'react';
import type { GhostSuggestion as GhostSuggestionType } from '../../types';
import styles from './SuggestionDisplay.module.css';
import './animations.css';

interface SuggestionDisplayProps {
  suggestion: GhostSuggestionType;
  isAccepting?: boolean;
  isOptimistic?: boolean; // Indicates if this is a placeholder/optimistic suggestion
}

/**
 * SuggestionDisplay - Displays AI-generated suggestions with mystical styling
 * 
 * Features:
 * - Ghostly purple tint and glow effects
 * - Smooth fade-in and slide-up entrance animation
 * - Italic text styling for distinction from user text
 * - Scrollable content for long suggestions
 * - Accessible with ARIA labels
 * 
 * Design Requirements:
 * - Background: rgba(139, 92, 246, 0.1) with purple tint
 * - Border-left: 3px solid accent-purple
 * - Font-style: italic
 * - Opacity: 0.9
 * - Box-shadow with purple glow
 */
const SuggestionDisplay: React.FC<SuggestionDisplayProps> = ({
  suggestion,
  isAccepting = false,
  isOptimistic = false,
}) => {
  const [isVisible, setIsVisible] = useState(true); // Start visible to prevent flash
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [checkmarkFading, setCheckmarkFading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // No delay needed - component starts visible

  // Handle acceptance animation sequence
  useEffect(() => {
    if (isAccepting) {
      // Show checkmark after initial glow (500ms into animation)
      const checkmarkTimer = setTimeout(() => {
        setShowCheckmark(true);
      }, 500);

      // Start fading checkmark (800ms into animation)
      const fadeTimer = setTimeout(() => {
        setCheckmarkFading(true);
      }, 800);

      return () => {
        clearTimeout(checkmarkTimer);
        clearTimeout(fadeTimer);
      };
    }
  }, [isAccepting]);

  return (
    <div
      ref={containerRef}
      className={`${styles.suggestionDisplay} ${isVisible ? styles.visible : ''} ${
        isAccepting ? styles.accepting : ''
      } ${isOptimistic ? styles.optimistic : ''}`}
      role="region"
      aria-label={isOptimistic ? "Generating AI suggestion..." : "AI writing suggestion"}
      aria-live="polite"
    >
      {/* Ghostly glow effect */}
      <div className={styles.glowEffect} aria-hidden="true" />
      
      {/* Green glow effect during acceptance */}
      {isAccepting && (
        <>
          <div className="acceptGlow" aria-hidden="true" />
          <div className="radialGlowOverlay" aria-hidden="true" />
        </>
      )}
      
      {/* Optimistic loading indicator */}
      {isOptimistic && (
        <div className={styles.optimisticLabel} aria-hidden="true">
          <span className={styles.loadingDots}>Generating</span>
        </div>
      )}
      
      {/* Suggestion text with shimmer effect during acceptance */}
      <div className={`${styles.textContainer} ${isAccepting ? 'textShimmer' : ''}`}>
        <p className={styles.suggestionText}>
          {suggestion.text}
        </p>
      </div>

      {/* Success checkmark indicator */}
      {showCheckmark && (
        <div 
          className={`successCheckmark ${checkmarkFading ? 'fadeOut' : ''}`}
          aria-hidden="true"
        >
          ✓
        </div>
      )}

      {/* Ghost icon indicator */}
      <div className={styles.ghostIndicator} aria-hidden="true">
        👻
      </div>
    </div>
  );
};

export default SuggestionDisplay;
