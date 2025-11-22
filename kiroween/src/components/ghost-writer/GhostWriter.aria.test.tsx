import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScreenReaderAnnouncement } from '../../hooks/useScreenReaderAnnouncement';

/**
 * ARIA Announcements Tests for Ghost Writer
 * 
 * These tests verify that screen reader announcements are properly made
 * for all Ghost Writer state changes as specified in the design document.
 */
describe('GhostWriter ARIA Announcements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any announcement elements
    const announcements = document.querySelectorAll('[role="status"][aria-live="polite"]');
    announcements.forEach(el => el.remove());
  });

  it('should create announcement element with correct ARIA attributes', () => {
    renderHook(() => useScreenReaderAnnouncement());

    const announcement = document.querySelector('[role="status"][aria-live="polite"]');
    expect(announcement).toBeTruthy();
    expect(announcement?.getAttribute('aria-atomic')).toBe('true');
    
    // Should be visually hidden
    const style = window.getComputedStyle(announcement as Element);
    expect(style.position).toBe('absolute');
  });

  it('should announce messages to screen readers', async () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce('Test announcement');
    });

    // Wait for the announcement to be set (100ms delay in the hook)
    await new Promise(resolve => setTimeout(resolve, 150));

    const announcement = document.querySelector('[role="status"][aria-live="polite"]');
    expect(announcement?.textContent).toBe('Test announcement');
  });

  it('should announce "Generating AI suggestion" state', async () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce('Generating AI suggestion');
    });

    await new Promise(resolve => setTimeout(resolve, 150));

    const announcement = document.querySelector('[role="status"][aria-live="polite"]');
    expect(announcement?.textContent).toBe('Generating AI suggestion');
  });

  it('should announce "Suggestion ready" with preview', async () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());
    const suggestionText = 'This is a test suggestion that is longer than fifty characters to test truncation';
    const preview = suggestionText.substring(0, 50) + '...';

    act(() => {
      result.current.announce(`Suggestion ready: ${preview}`);
    });

    await new Promise(resolve => setTimeout(resolve, 150));

    const announcement = document.querySelector('[role="status"][aria-live="polite"]');
    expect(announcement?.textContent).toContain('Suggestion ready:');
    expect(announcement?.textContent).toContain('...');
  });

  it('should announce "Suggestion accepted"', async () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce('Suggestion accepted');
    });

    await new Promise(resolve => setTimeout(resolve, 150));

    const announcement = document.querySelector('[role="status"][aria-live="polite"]');
    expect(announcement?.textContent).toBe('Suggestion accepted');
  });

  it('should announce "Suggestion rejected"', async () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce('Suggestion rejected');
    });

    await new Promise(resolve => setTimeout(resolve, 150));

    const announcement = document.querySelector('[role="status"][aria-live="polite"]');
    expect(announcement?.textContent).toBe('Suggestion rejected');
  });

  it('should announce errors with friendly messages', async () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce('Error: Connection to the ethereal realm lost');
    });

    await new Promise(resolve => setTimeout(resolve, 150));

    const announcement = document.querySelector('[role="status"][aria-live="polite"]');
    expect(announcement?.textContent).toContain('Error:');
    expect(announcement?.textContent).toContain('Connection to the ethereal realm lost');
  });

  it('should clear previous announcement before making new one', async () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce('First announcement');
    });

    await new Promise(resolve => setTimeout(resolve, 150));

    let announcement = document.querySelector('[role="status"][aria-live="polite"]');
    expect(announcement?.textContent).toBe('First announcement');

    act(() => {
      result.current.announce('Second announcement');
    });

    await new Promise(resolve => setTimeout(resolve, 150));

    announcement = document.querySelector('[role="status"][aria-live="polite"]');
    expect(announcement?.textContent).toBe('Second announcement');
  });

  it('should clean up announcement element on unmount', () => {
    const { unmount } = renderHook(() => useScreenReaderAnnouncement());

    let announcement = document.querySelector('[role="status"][aria-live="polite"]');
    expect(announcement).toBeTruthy();

    unmount();

    announcement = document.querySelector('[role="status"][aria-live="polite"]');
    expect(announcement).toBeFalsy();
  });
});
