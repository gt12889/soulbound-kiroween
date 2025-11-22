import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuggestionDisplay from './SuggestionDisplay';
import type { GhostSuggestion } from '../../types';

describe('SuggestionDisplay', () => {
  const mockSuggestion: GhostSuggestion = {
    id: 'test-suggestion-1',
    text: 'This is a test suggestion from the spirits.',
    position: 0,
    confidence: 0.8,
  };

  it('renders suggestion text', () => {
    render(<SuggestionDisplay suggestion={mockSuggestion} />);
    expect(screen.getByText('This is a test suggestion from the spirits.')).toBeInTheDocument();
  });

  it('renders ghost indicator emoji', () => {
    render(<SuggestionDisplay suggestion={mockSuggestion} />);
    expect(screen.getByText('👻')).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<SuggestionDisplay suggestion={mockSuggestion} />);
    
    const region = screen.getByRole('region', { name: /AI writing suggestion/i });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('applies visible class after mount', async () => {
    const { container } = render(<SuggestionDisplay suggestion={mockSuggestion} />);
    
    const display = container.querySelector('[class*="suggestionDisplay"]');
    expect(display).toBeInTheDocument();
    
    // Wait for the visibility timeout
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check that the className includes 'visible'
    expect(display?.className).toMatch(/visible/);
  });

  it('applies accepting class when isAccepting is true', () => {
    const { container } = render(
      <SuggestionDisplay suggestion={mockSuggestion} isAccepting={true} />
    );
    
    const display = container.querySelector('[class*="suggestionDisplay"]');
    // Check that the className includes 'accepting'
    expect(display?.className).toMatch(/accepting/);
  });

  it('uses relative positioning (container handles absolute positioning)', () => {
    const { container } = render(
      <SuggestionDisplay suggestion={mockSuggestion} />
    );
    
    const display = container.querySelector('[class*="suggestionDisplay"]');
    const styles = window.getComputedStyle(display!);
    
    // SuggestionDisplay uses relative positioning
    // The parent container handles absolute positioning
    expect(styles.position).toBe('relative');
  });

  it('handles long suggestions with scrollable container', () => {
    const longSuggestion: GhostSuggestion = {
      id: 'long-suggestion',
      text: 'This is a very long suggestion that should trigger scrolling. '.repeat(20),
      position: 0,
      confidence: 0.8,
    };
    
    const { container } = render(<SuggestionDisplay suggestion={longSuggestion} />);
    
    const textContainer = container.querySelector('[class*="textContainer"]');
    expect(textContainer).toBeInTheDocument();
    
    // Check that max-height is set (should be 300px from CSS)
    const styles = window.getComputedStyle(textContainer!);
    expect(styles.maxHeight).toBe('300px');
    expect(styles.overflowY).toBe('auto');
  });

  it('applies italic font style to suggestion text', () => {
    const { container } = render(<SuggestionDisplay suggestion={mockSuggestion} />);
    
    const text = container.querySelector('[class*="suggestionText"]');
    const styles = window.getComputedStyle(text!);
    expect(styles.fontStyle).toBe('italic');
  });

  it('has purple tint background', () => {
    const { container } = render(<SuggestionDisplay suggestion={mockSuggestion} />);
    
    const display = container.querySelector('[class*="suggestionDisplay"]');
    const styles = window.getComputedStyle(display!);
    
    // Check for rgba background with purple tint
    expect(styles.background).toContain('rgba');
  });

  it('has left border for visual distinction', () => {
    const { container } = render(<SuggestionDisplay suggestion={mockSuggestion} />);
    
    const display = container.querySelector('[class*="suggestionDisplay"]');
    const styles = window.getComputedStyle(display!);
    
    // Check for left border
    expect(styles.borderLeftWidth).toBe('3px');
    expect(styles.borderLeftStyle).toBe('solid');
  });

  it('renders glow effect layer', () => {
    const { container } = render(<SuggestionDisplay suggestion={mockSuggestion} />);
    
    const glowEffect = container.querySelector('[class*="glowEffect"]');
    expect(glowEffect).toBeInTheDocument();
    expect(glowEffect).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders ghost indicator with proper styling', () => {
    const { container } = render(<SuggestionDisplay suggestion={mockSuggestion} />);
    
    const ghostIndicator = container.querySelector('[class*="ghostIndicator"]');
    expect(ghostIndicator).toBeInTheDocument();
    expect(ghostIndicator).toHaveAttribute('aria-hidden', 'true');
    
    const styles = window.getComputedStyle(ghostIndicator!);
    expect(styles.position).toBe('absolute');
  });

  it('handles empty suggestion text gracefully', () => {
    const emptySuggestion: GhostSuggestion = {
      id: 'empty-suggestion',
      text: '',
      position: 0,
      confidence: 0.8,
    };
    
    render(<SuggestionDisplay suggestion={emptySuggestion} />);
    
    // Should still render the component structure
    const region = screen.getByRole('region', { name: /AI writing suggestion/i });
    expect(region).toBeInTheDocument();
  });

  it('has z-index for proper layering within container', () => {
    const { container } = render(<SuggestionDisplay suggestion={mockSuggestion} />);
    
    const display = container.querySelector('[class*="suggestionDisplay"]');
    const styles = window.getComputedStyle(display!);
    
    // z-index should be 1 (parent container has higher z-index)
    expect(parseInt(styles.zIndex)).toBe(1);
  });
});
