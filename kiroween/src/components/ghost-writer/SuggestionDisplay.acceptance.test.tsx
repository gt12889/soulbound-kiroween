import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SuggestionDisplay from './SuggestionDisplay';
import type { GhostSuggestion } from '../../types';

describe('SuggestionDisplay - Acceptance Animation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const mockSuggestion: GhostSuggestion = {
    id: 'test-suggestion',
    text: 'This is a test suggestion from the spirits.',
    position: 0,
    confidence: 0.8,
  };

  describe('Animation Timing', () => {
    it('should show suggestion with fade-in animation', async () => {
      const { container } = render(
        <SuggestionDisplay suggestion={mockSuggestion} isAccepting={false} />
      );

      const display = container.querySelector('.suggestionDisplay');
      expect(display).toBeTruthy();

      // Initially not visible
      expect(display?.classList.contains('visible')).toBe(false);

      // Advance timers to trigger visibility
      vi.advanceTimersByTime(50);

      await waitFor(() => {
        expect(display?.classList.contains('visible')).toBe(true);
      });
    });

    it('should apply accepting class when isAccepting is true', () => {
      const { container } = render(
        <SuggestionDisplay suggestion={mockSuggestion} isAccepting={true} />
      );

      const display = container.querySelector('.suggestionDisplay');
      expect(display?.classList.contains('accepting')).toBe(true);
    });

    it('should show checkmark at 500ms during acceptance', async () => {
      const { container, rerender } = render(
        <SuggestionDisplay suggestion={mockSuggestion} isAccepting={false} />
      );

      // No checkmark initially
      expect(container.querySelector('.successCheckmark')).toBeNull();

      // Start accepting
      rerender(<SuggestionDisplay suggestion={mockSuggestion} isAccepting={true} />);

      // Still no checkmark immediately
      expect(container.querySelector('.successCheckmark')).toBeNull();

      // Advance to 500ms
      vi.advanceTimersByTime(500);

      await waitFor(() => {
        const checkmark = container.querySelector('.successCheckmark');
        expect(checkmark).toBeTruthy();
        expect(checkmark?.textContent).toBe('✓');
      });
    });

    it('should start fading checkmark at 800ms', async () => {
      const { container, rerender } = render(
        <SuggestionDisplay suggestion={mockSuggestion} isAccepting={false} />
      );

      // Start accepting
      rerender(<SuggestionDisplay suggestion={mockSuggestion} isAccepting={true} />);

      // Advance to show checkmark
      vi.advanceTimersByTime(500);

      await waitFor(() => {
        expect(container.querySelector('.successCheckmark')).toBeTruthy();
      });

      // Checkmark should not be fading yet
      let checkmark = container.querySelector('.successCheckmark');
      expect(checkmark?.classList.contains('fadeOut')).toBe(false);

      // Advance to 800ms
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        checkmark = container.querySelector('.successCheckmark');
        expect(checkmark?.classList.contains('fadeOut')).toBe(true);
      });
    });

    it('should show green glow effects during acceptance', () => {
      const { container } = render(
        <SuggestionDisplay suggestion={mockSuggestion} isAccepting={true} />
      );

      // Check for glow effect elements
      const acceptGlow = container.querySelector('.acceptGlow');
      const radialGlow = container.querySelector('.radialGlowOverlay');

      expect(acceptGlow).toBeTruthy();
      expect(radialGlow).toBeTruthy();
    });

    it('should apply text shimmer effect during acceptance', () => {
      const { container } = render(
        <SuggestionDisplay suggestion={mockSuggestion} isAccepting={true} />
      );

      const textContainer = container.querySelector('.textContainer');
      expect(textContainer?.classList.contains('textShimmer')).toBe(true);
    });

    it('should not show glow effects when not accepting', () => {
      const { container } = render(
        <SuggestionDisplay suggestion={mockSuggestion} isAccepting={false} />
      );

      const acceptGlow = container.querySelector('.acceptGlow');
      const radialGlow = container.querySelector('.radialGlowOverlay');

      expect(acceptGlow).toBeNull();
      expect(radialGlow).toBeNull();
    });
  });

  describe('Animation Sequence', () => {
    it('should complete full acceptance animation sequence', async () => {
      const { container, rerender } = render(
        <SuggestionDisplay suggestion={mockSuggestion} isAccepting={false} />
      );

      // Phase 1: Initial state
      expect(container.querySelector('.successCheckmark')).toBeNull();
      expect(container.querySelector('.acceptGlow')).toBeNull();

      // Phase 2: Start accepting (0ms)
      rerender(<SuggestionDisplay suggestion={mockSuggestion} isAccepting={true} />);
      expect(container.querySelector('.accepting')).toBeTruthy();
      expect(container.querySelector('.acceptGlow')).toBeTruthy();

      // Phase 3: Checkmark appears (500ms)
      vi.advanceTimersByTime(500);
      await waitFor(() => {
        const checkmark = container.querySelector('.successCheckmark');
        expect(checkmark).toBeTruthy();
        expect(checkmark?.classList.contains('fadeOut')).toBe(false);
      });

      // Phase 4: Checkmark starts fading (800ms)
      vi.advanceTimersByTime(300);
      await waitFor(() => {
        const checkmark = container.querySelector('.successCheckmark');
        expect(checkmark?.classList.contains('fadeOut')).toBe(true);
      });

      // Phase 5: Animation completes (1000ms)
      // The component would be unmounted by parent at this point
      vi.advanceTimersByTime(200);
    });
  });

  describe('Accessibility', () => {
    it('should maintain ARIA labels during acceptance', () => {
      const { container } = render(
        <SuggestionDisplay suggestion={mockSuggestion} isAccepting={true} />
      );

      const display = container.querySelector('[role="region"]');
      expect(display?.getAttribute('aria-label')).toBe('AI writing suggestion');
      expect(display?.getAttribute('aria-live')).toBe('polite');
    });

    it('should hide decorative elements from screen readers', () => {
      const { container } = render(
        <SuggestionDisplay suggestion={mockSuggestion} isAccepting={true} />
      );

      const glowEffect = container.querySelector('.glowEffect');
      const ghostIndicator = container.querySelector('.ghostIndicator');
      const acceptGlow = container.querySelector('.acceptGlow');
      const checkmark = container.querySelector('.successCheckmark');

      // Wait for checkmark to appear
      vi.advanceTimersByTime(500);

      expect(glowEffect?.getAttribute('aria-hidden')).toBe('true');
      expect(ghostIndicator?.getAttribute('aria-hidden')).toBe('true');
      expect(acceptGlow?.getAttribute('aria-hidden')).toBe('true');
      
      // Checkmark should also be hidden from screen readers
      waitFor(() => {
        const checkmarkElement = container.querySelector('.successCheckmark');
        expect(checkmarkElement?.getAttribute('aria-hidden')).toBe('true');
      });
    });
  });

  describe('CSS Animation Classes', () => {
    it('should apply correct animation classes', () => {
      const { container } = render(
        <SuggestionDisplay suggestion={mockSuggestion} isAccepting={true} />
      );

      const display = container.querySelector('.suggestionDisplay');
      expect(display?.classList.contains('accepting')).toBe(true);

      // Check for animation-related classes
      const textContainer = container.querySelector('.textContainer');
      expect(textContainer?.classList.contains('textShimmer')).toBe(true);
    });

    it('should not apply accepting class when not accepting', () => {
      const { container } = render(
        <SuggestionDisplay suggestion={mockSuggestion} isAccepting={false} />
      );

      const display = container.querySelector('.suggestionDisplay');
      expect(display?.classList.contains('accepting')).toBe(false);
    });
  });
});
