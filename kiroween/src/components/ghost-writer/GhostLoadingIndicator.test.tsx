import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GhostLoadingIndicator from './GhostLoadingIndicator';

describe('GhostLoadingIndicator', () => {
  it('renders with default message', () => {
    render(<GhostLoadingIndicator />);
    expect(screen.getByText('Summoning spirits...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<GhostLoadingIndicator message="Channeling ethereal wisdom..." />);
    expect(screen.getByText('Channeling ethereal wisdom...')).toBeInTheDocument();
  });

  it('renders cancel button when showCancel is true and onCancel is provided', () => {
    const onCancel = vi.fn();
    render(<GhostLoadingIndicator onCancel={onCancel} showCancel={true} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<GhostLoadingIndicator onCancel={onCancel} showCancel={true} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not render cancel button when showCancel is false', () => {
    const onCancel = vi.fn();
    render(<GhostLoadingIndicator onCancel={onCancel} showCancel={false} />);
    
    const cancelButton = screen.queryByRole('button', { name: /cancel/i });
    expect(cancelButton).not.toBeInTheDocument();
  });

  it('does not render cancel button when onCancel is not provided', () => {
    render(<GhostLoadingIndicator showCancel={true} />);
    
    const cancelButton = screen.queryByRole('button', { name: /cancel/i });
    expect(cancelButton).not.toBeInTheDocument();
  });

  it('renders progress bar when progress is provided', () => {
    render(<GhostLoadingIndicator progress={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('does not render progress bar when progress is not provided', () => {
    render(<GhostLoadingIndicator />);
    
    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).not.toBeInTheDocument();
  });

  it('clamps progress value between 0 and 100', () => {
    const { rerender } = render(<GhostLoadingIndicator progress={150} />);
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '100%' });

    rerender(<GhostLoadingIndicator progress={-50} />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<GhostLoadingIndicator />);
    
    const overlay = screen.getByRole('status');
    expect(overlay).toHaveAttribute('aria-live', 'polite');
    expect(overlay).toHaveAttribute('aria-label', 'Loading AI suggestion');
  });

  it('renders 12 ghostly particles', () => {
    const { container } = render(<GhostLoadingIndicator />);
    
    // Query for particle divs, excluding the particlesContainer
    const particlesContainer = container.querySelector('[class*="particlesContainer"]');
    const particles = particlesContainer?.querySelectorAll('[class*="particle"]');
    expect(particles).toHaveLength(12);
  });

  it('renders spinner with ghost icon', () => {
    render(<GhostLoadingIndicator />);
    
    const ghostIcon = screen.getByText('👻');
    expect(ghostIcon).toBeInTheDocument();
  });

  it('overlay is positioned absolutely to cover entire parent', () => {
    const { container } = render(<GhostLoadingIndicator />);
    
    const overlay = container.querySelector('[class*="overlay"]');
    expect(overlay).toBeInTheDocument();
    
    // Check that overlay has absolute positioning
    const styles = window.getComputedStyle(overlay!);
    expect(styles.position).toBe('absolute');
    expect(styles.top).toBe('0px');
    expect(styles.left).toBe('0px');
    expect(styles.right).toBe('0px');
    expect(styles.bottom).toBe('0px');
  });

  it('overlay has high z-index to appear above other content', () => {
    const { container } = render(<GhostLoadingIndicator />);
    
    const overlay = container.querySelector('[class*="overlay"]');
    const styles = window.getComputedStyle(overlay!);
    
    // z-index should be 1001 (higher than suggestions at 1000)
    expect(parseInt(styles.zIndex)).toBeGreaterThan(1000);
  });
});
