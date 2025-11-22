/**
 * useMoodTransition Hook
 * 
 * Manages mood transition animations for Spirit Companions.
 * Automatically applies appropriate CSS animations when mood changes.
 */

import { useEffect, useRef, useState } from 'react';
import { MoodState, getMoodTransitionAnimation } from '../types/companionMood';

interface UseMoodTransitionOptions {
  /**
   * Duration to keep the transition class applied (ms)
   * Should match or exceed the longest animation duration
   */
  transitionDuration?: number;
  
  /**
   * Callback when transition starts
   */
  onTransitionStart?: (fromMood: MoodState, toMood: MoodState) => void;
  
  /**
   * Callback when transition completes
   */
  onTransitionEnd?: (mood: MoodState) => void;
}

interface UseMoodTransitionReturn {
  /**
   * CSS class name for the current transition animation
   */
  transitionClass: string;
  
  /**
   * Whether a transition is currently playing
   */
  isTransitioning: boolean;
  
  /**
   * Manually trigger a transition (useful for testing)
   */
  triggerTransition: (fromMood: MoodState, toMood: MoodState) => void;
}

/**
 * Hook to manage mood transition animations
 * 
 * @param currentMood - The current mood state
 * @param options - Configuration options
 * @returns Transition state and controls
 * 
 * @example
 * ```tsx
 * const { transitionClass, isTransitioning } = useMoodTransition(mood);
 * 
 * return (
 *   <div className={`companion ${transitionClass}`}>
 *     <SpiritCompanion />
 *   </div>
 * );
 * ```
 */
export function useMoodTransition(
  currentMood: MoodState,
  options: UseMoodTransitionOptions = {}
): UseMoodTransitionReturn {
  const {
    transitionDuration = 2000, // Default 2 seconds (covers longest animation)
    onTransitionStart,
    onTransitionEnd
  } = options;
  
  const [transitionClass, setTransitionClass] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousMoodRef = useRef<MoodState>(currentMood);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Trigger transition when mood changes
  useEffect(() => {
    const previousMood = previousMoodRef.current;
    
    // Only trigger if mood actually changed
    if (previousMood !== currentMood) {
      triggerTransition(previousMood, currentMood);
      previousMoodRef.current = currentMood;
    }
  }, [currentMood]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  /**
   * Trigger a mood transition animation
   */
  const triggerTransition = (fromMood: MoodState, toMood: MoodState) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Get the appropriate animation for this transition
    const animationName = getMoodTransitionAnimation(fromMood, toMood);
    const className = `companion-mood-transition companion-mood-transition--${animationName}`;
    
    // Start transition
    setIsTransitioning(true);
    setTransitionClass(className);
    
    // Call start callback
    if (onTransitionStart) {
      onTransitionStart(fromMood, toMood);
    }
    
    // Clear transition class after animation completes
    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
      setTransitionClass('');
      
      // Call end callback
      if (onTransitionEnd) {
        onTransitionEnd(toMood);
      }
    }, transitionDuration);
  };
  
  return {
    transitionClass,
    isTransitioning,
    triggerTransition
  };
}

/**
 * Get the CSS class for a mood's persistent visual state
 * 
 * @param mood - The mood state
 * @returns CSS class name for the mood
 * 
 * @example
 * ```tsx
 * const moodClass = getMoodStateClass(mood);
 * return <div className={`companion ${moodClass}`} />;
 * ```
 */
export function getMoodStateClass(mood: MoodState): string {
  return `companion-mood--${mood}`;
}

/**
 * Combine mood state class with transition class
 * 
 * @param mood - Current mood state
 * @param transitionClass - Active transition class
 * @returns Combined class string
 * 
 * @example
 * ```tsx
 * const { transitionClass } = useMoodTransition(mood);
 * const className = getCombinedMoodClasses(mood, transitionClass);
 * ```
 */
export function getCombinedMoodClasses(
  mood: MoodState,
  transitionClass: string
): string {
  const moodClass = getMoodStateClass(mood);
  return transitionClass ? `${moodClass} ${transitionClass}` : moodClass;
}
