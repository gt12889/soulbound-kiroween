/**
 * useFocusTrap hook for trapping focus within a modal or dialog
 * Requirements: 5.5, 5.6
 */

import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  isActive: boolean;
  onEscape?: () => void;
  restoreFocus?: boolean;
}

/**
 * Hook to trap focus within a container element
 * @param isActive - Whether the focus trap is active
 * @param onEscape - Callback when Escape key is pressed
 * @param restoreFocus - Whether to restore focus to the trigger element on unmount
 */
export function useFocusTrap({ isActive, onEscape, restoreFocus = true }: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Store the element that had focus before the modal opened
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements within the container
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];

      const elements = container.querySelectorAll<HTMLElement>(focusableSelectors.join(','));
      return Array.from(elements).filter((el) => {
        // Filter out hidden elements
        return el.offsetParent !== null;
      });
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle Tab key to trap focus - use capture phase to intercept before other handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        e.stopPropagation();
        onEscape();
        return;
      }

      // Handle Tab key
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const currentElement = document.activeElement;

        // Check if focus is currently within the container
        const focusIsInContainer = container.contains(currentElement);

        // Only trap focus at the boundaries
        if (e.shiftKey) {
          // Shift + Tab: wrap to last element if at first element
          if (focusIsInContainer && currentElement === firstElement) {
            e.preventDefault();
            e.stopPropagation();
            lastElement.focus();
          } else if (!focusIsInContainer) {
            // If focus escaped, bring it back to last element
            e.preventDefault();
            e.stopPropagation();
            lastElement.focus();
          }
        } else {
          // Tab: wrap to first element if at last element
          if (focusIsInContainer && currentElement === lastElement) {
            e.preventDefault();
            e.stopPropagation();
            firstElement.focus();
          } else if (!focusIsInContainer) {
            // If focus escaped, bring it back to first element
            e.preventDefault();
            e.stopPropagation();
            firstElement.focus();
          }
        }
      }
    };

    // Add event listener with capture phase to intercept Tab before it bubbles
    document.addEventListener('keydown', handleKeyDown, true);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);

      // Restore focus to the element that had focus before the modal opened
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, onEscape, restoreFocus]);

  return containerRef;
}
