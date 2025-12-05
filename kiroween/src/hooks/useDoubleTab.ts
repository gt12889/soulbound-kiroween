/**
 * Custom hook to detect double Tab key press
 * Triggers callback when Tab is pressed twice within a specified time window
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseDoubleTabOptions {
  onDoubleTab: () => void;
  timeWindow?: number; // Time window in ms for double press (default: 500ms)
  enabled?: boolean;
}

export const useDoubleTab = ({
  onDoubleTab,
  timeWindow = 500,
  enabled = true,
}: UseDoubleTabOptions) => {
  const lastTabPressRef = useRef<number>(0);
  const tabCountRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Only handle Tab key
      if (event.key !== 'Tab') {
        // Reset on any other key
        tabCountRef.current = 0;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        return;
      }

      const now = Date.now();
      const timeSinceLastPress = now - lastTabPressRef.current;

      // If within time window, increment count
      if (timeSinceLastPress < timeWindow) {
        tabCountRef.current += 1;

        // If this is the second Tab press
        if (tabCountRef.current === 2) {
          event.preventDefault(); // Prevent default Tab behavior
          onDoubleTab();
          
          // Reset
          tabCountRef.current = 0;
          lastTabPressRef.current = 0;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      } else {
        // First Tab or too much time passed, reset
        tabCountRef.current = 1;
        lastTabPressRef.current = now;

        // Set timeout to reset if second Tab doesn't come
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          tabCountRef.current = 0;
          lastTabPressRef.current = 0;
        }, timeWindow);
      }
    },
    [enabled, onDoubleTab, timeWindow]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, handleKeyDown]);

  return {
    reset: () => {
      tabCountRef.current = 0;
      lastTabPressRef.current = 0;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    },
  };
};
