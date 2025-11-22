/**
 * Tests for useMoodTransition hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMoodTransition, getMoodStateClass, getCombinedMoodClasses } from './useMoodTransition';
import { MoodState } from '../types/companionMood';
import { vi } from 'vitest';

describe('useMoodTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize with no transition', () => {
    const { result } = renderHook(() => useMoodTransition('neutral'));

    expect(result.current.transitionClass).toBe('');
    expect(result.current.isTransitioning).toBe(false);
  });

  it('should trigger transition when mood changes', () => {
    const { result, rerender } = renderHook(
      ({ mood }) => useMoodTransition(mood),
      { initialProps: { mood: 'neutral' as MoodState } }
    );

    // Change mood
    act(() => {
      rerender({ mood: 'happy' });
    });

    // Should be transitioning with appropriate class
    expect(result.current.isTransitioning).toBe(true);
    expect(result.current.transitionClass).toContain('companion-mood-transition');
  });

  it('should clear transition after duration', async () => {
    const transitionDuration = 1000;
    const { result, rerender } = renderHook(
      ({ mood }) => useMoodTransition(mood, { transitionDuration }),
      { initialProps: { mood: 'neutral' as MoodState } }
    );

    // Change mood
    act(() => {
      rerender({ mood: 'excited' });
    });

    expect(result.current.isTransitioning).toBe(true);

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(transitionDuration);
    });

    // Should no longer be transitioning
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.transitionClass).toBe('');
  });

  it('should call onTransitionStart callback', () => {
    const onTransitionStart = vi.fn();
    const { rerender } = renderHook(
      ({ mood }) => useMoodTransition(mood, { onTransitionStart }),
      { initialProps: { mood: 'neutral' as MoodState } }
    );

    act(() => {
      rerender({ mood: 'happy' });
    });

    expect(onTransitionStart).toHaveBeenCalledWith('neutral', 'happy');
  });

  it('should call onTransitionEnd callback after duration', () => {
    const onTransitionEnd = vi.fn();
    const transitionDuration = 1000;
    const { rerender } = renderHook(
      ({ mood }) => useMoodTransition(mood, { transitionDuration, onTransitionEnd }),
      { initialProps: { mood: 'neutral' as MoodState } }
    );

    act(() => {
      rerender({ mood: 'excited' });
    });

    expect(onTransitionEnd).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(transitionDuration);
    });

    expect(onTransitionEnd).toHaveBeenCalledWith('excited');
  });

  it('should use correct animation for dramatic transitions', () => {
    const { result, rerender } = renderHook(
      ({ mood }) => useMoodTransition(mood),
      { initialProps: { mood: 'concerned' as MoodState } }
    );

    act(() => {
      rerender({ mood: 'happy' });
    });

    // Should use relief-celebration animation
    expect(result.current.transitionClass).toContain('relief-celebration');
  });

  it('should use correct animation for energize transition', () => {
    const { result, rerender } = renderHook(
      ({ mood }) => useMoodTransition(mood),
      { initialProps: { mood: 'neutral' as MoodState } }
    );

    act(() => {
      rerender({ mood: 'excited' });
    });

    // Should use energize animation
    expect(result.current.transitionClass).toContain('energize');
  });

  it('should handle rapid mood changes', () => {
    const { result, rerender } = renderHook(
      ({ mood }) => useMoodTransition(mood, { transitionDuration: 1000 }),
      { initialProps: { mood: 'neutral' as MoodState } }
    );

    // First change
    act(() => {
      rerender({ mood: 'happy' });
    });

    const firstTransitionClass = result.current.transitionClass;

    // Second change before first completes
    act(() => {
      vi.advanceTimersByTime(500);
      rerender({ mood: 'excited' });
    });

    // Should have new transition
    expect(result.current.transitionClass).not.toBe(firstTransitionClass);
    expect(result.current.isTransitioning).toBe(true);
  });

  it('should allow manual transition triggering', () => {
    const { result } = renderHook(() => useMoodTransition('neutral'));

    act(() => {
      result.current.triggerTransition('neutral', 'playful');
    });

    expect(result.current.isTransitioning).toBe(true);
    expect(result.current.transitionClass).toContain('wiggle-playful');
  });

  it('should not trigger transition if mood does not change', () => {
    const onTransitionStart = vi.fn();
    const { rerender } = renderHook(
      ({ mood }) => useMoodTransition(mood, { onTransitionStart }),
      { initialProps: { mood: 'neutral' as MoodState } }
    );

    // Rerender with same mood
    act(() => {
      rerender({ mood: 'neutral' });
    });

    expect(onTransitionStart).not.toHaveBeenCalled();
  });

  it('should cleanup timeout on unmount', () => {
    const { result, unmount } = renderHook(
      ({ mood }) => useMoodTransition(mood),
      { initialProps: { mood: 'neutral' as MoodState } }
    );

    act(() => {
      result.current.triggerTransition('neutral', 'happy');
    });

    // Unmount before transition completes
    unmount();

    // Should not throw error
    act(() => {
      vi.advanceTimersByTime(2000);
    });
  });
});

describe('getMoodStateClass', () => {
  it('should return correct class for each mood', () => {
    expect(getMoodStateClass('happy')).toBe('companion-mood--happy');
    expect(getMoodStateClass('excited')).toBe('companion-mood--excited');
    expect(getMoodStateClass('energized')).toBe('companion-mood--energized');
    expect(getMoodStateClass('concerned')).toBe('companion-mood--concerned');
    expect(getMoodStateClass('neutral')).toBe('companion-mood--neutral');
    expect(getMoodStateClass('proud')).toBe('companion-mood--proud');
    expect(getMoodStateClass('playful')).toBe('companion-mood--playful');
  });
});

describe('getCombinedMoodClasses', () => {
  it('should return only mood class when no transition', () => {
    const result = getCombinedMoodClasses('happy', '');
    expect(result).toBe('companion-mood--happy');
  });

  it('should combine mood and transition classes', () => {
    const result = getCombinedMoodClasses(
      'excited',
      'companion-mood-transition companion-mood-transition--energize'
    );
    expect(result).toBe(
      'companion-mood--excited companion-mood-transition companion-mood-transition--energize'
    );
  });

  it('should handle all mood states', () => {
    const moods: MoodState[] = [
      'happy',
      'excited',
      'energized',
      'concerned',
      'neutral',
      'proud',
      'playful'
    ];

    moods.forEach(mood => {
      const result = getCombinedMoodClasses(mood, 'test-transition');
      expect(result).toContain(`companion-mood--${mood}`);
      expect(result).toContain('test-transition');
    });
  });
});
