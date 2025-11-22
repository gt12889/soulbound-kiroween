import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SuggestionCarousel from './SuggestionCarousel';
import type { GhostSuggestion } from '../../types';

describe('SuggestionCarousel - Keyboard Navigation', () => {
  const mockSuggestions: GhostSuggestion[] = [
    {
      id: '1',
      text: 'First suggestion',
      timestamp: Date.now(),
    },
    {
      id: '2',
      text: 'Second suggestion',
      timestamp: Date.now(),
    },
    {
      id: '3',
      text: 'Third suggestion',
      timestamp: Date.now(),
    },
  ];

  it('should navigate to next suggestion with ArrowRight key', () => {
    render(
      <SuggestionCarousel
        suggestions={mockSuggestions}
        isAccepting={false}
      />
    );

    // Initially showing first suggestion
    expect(screen.getByText('First suggestion')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // Press ArrowRight
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Should show second suggestion
    expect(screen.getByText('Second suggestion')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('should navigate to previous suggestion with ArrowLeft key', () => {
    render(
      <SuggestionCarousel
        suggestions={mockSuggestions}
        isAccepting={false}
      />
    );

    // Navigate to second suggestion first
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('Second suggestion')).toBeInTheDocument();

    // Press ArrowLeft
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    // Should show first suggestion again
    expect(screen.getByText('First suggestion')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('should wrap around to last suggestion when pressing ArrowLeft on first suggestion', () => {
    render(
      <SuggestionCarousel
        suggestions={mockSuggestions}
        isAccepting={false}
      />
    );

    // Initially on first suggestion
    expect(screen.getByText('First suggestion')).toBeInTheDocument();

    // Press ArrowLeft
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    // Should wrap to last suggestion
    expect(screen.getByText('Third suggestion')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('should wrap around to first suggestion when pressing ArrowRight on last suggestion', () => {
    render(
      <SuggestionCarousel
        suggestions={mockSuggestions}
        isAccepting={false}
      />
    );

    // Navigate to last suggestion
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('Third suggestion')).toBeInTheDocument();

    // Press ArrowRight again
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Should wrap to first suggestion
    expect(screen.getByText('First suggestion')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('should prevent default behavior for arrow keys', () => {
    render(
      <SuggestionCarousel
        suggestions={mockSuggestions}
        isAccepting={false}
      />
    );

    const preventDefaultSpy = vi.fn();
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    event.preventDefault = preventDefaultSpy;

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should work with single suggestion (no navigation needed)', () => {
    const singleSuggestion: GhostSuggestion[] = [
      {
        id: '1',
        text: 'Only suggestion',
        timestamp: Date.now(),
      },
    ];

    render(
      <SuggestionCarousel
        suggestions={singleSuggestion}
        isAccepting={false}
      />
    );

    // Should show the suggestion
    expect(screen.getByText('Only suggestion')).toBeInTheDocument();

    // Arrow keys should not cause errors (but won't change anything)
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    // Should still show the same suggestion
    expect(screen.getByText('Only suggestion')).toBeInTheDocument();
  });

  it('should navigate through all suggestions sequentially', () => {
    render(
      <SuggestionCarousel
        suggestions={mockSuggestions}
        isAccepting={false}
      />
    );

    // Start at first
    expect(screen.getByText('First suggestion')).toBeInTheDocument();

    // Navigate forward through all
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('Second suggestion')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('Third suggestion')).toBeInTheDocument();

    // Navigate backward through all
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('Second suggestion')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('First suggestion')).toBeInTheDocument();
  });
});
