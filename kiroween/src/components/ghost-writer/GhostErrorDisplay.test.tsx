import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GhostErrorDisplay from './GhostErrorDisplay';

describe('GhostErrorDisplay - Friendly Error Messages', () => {
  it('displays friendly message for network errors', () => {
    render(<GhostErrorDisplay error="Network request failed" />);
    expect(screen.getByText('Connection to the ethereal realm lost')).toBeInTheDocument();
  });

  it('displays friendly message for timeout errors', () => {
    render(<GhostErrorDisplay error="Request timeout exceeded" />);
    expect(screen.getByText('The spirits are taking too long to respond...')).toBeInTheDocument();
  });

  it('displays friendly message for rate limit errors', () => {
    render(<GhostErrorDisplay error="Rate limit exceeded (429)" />);
    expect(screen.getByText('The ghost writer needs rest (rate limited)')).toBeInTheDocument();
  });

  it('displays friendly message for API key errors', () => {
    render(<GhostErrorDisplay error="Unauthorized: Invalid API key" />);
    expect(screen.getByText('API key missing - check your settings')).toBeInTheDocument();
  });

  it('displays friendly message for offline errors', () => {
    render(<GhostErrorDisplay error="You are offline" />);
    // Offline errors now map to network error message
    expect(screen.getByText('Connection to the ethereal realm lost')).toBeInTheDocument();
  });

  it('displays default friendly message for unknown errors', () => {
    render(<GhostErrorDisplay error="Something went wrong" />);
    expect(screen.getByText('The spirits are silent... Try again?')).toBeInTheDocument();
  });

  it('handles Error objects correctly', () => {
    const error = new Error('Network fetch failed');
    render(<GhostErrorDisplay error={error} />);
    expect(screen.getByText('Connection to the ethereal realm lost')).toBeInTheDocument();
  });

  it('shows technical details in collapsible section', () => {
    render(<GhostErrorDisplay error="Network request failed" />);
    
    // Technical details should be present but collapsed
    const details = screen.getByText('Technical details');
    expect(details).toBeInTheDocument();
    
    // Original error message should be in details
    expect(screen.getByText('Network request failed')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    
    render(<GhostErrorDisplay error="Test error" onRetry={onRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    
    render(<GhostErrorDisplay error="Test error" onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    await user.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('hides retry button when showRetry is false', () => {
    render(<GhostErrorDisplay error="Test error" showRetry={false} />);
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('hides dismiss button when showDismiss is false', () => {
    render(<GhostErrorDisplay error="Test error" showDismiss={false} />);
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<GhostErrorDisplay error="Test error" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-label', 'Error generating suggestion');
  });

  it('uses explicit error type when provided', () => {
    render(<GhostErrorDisplay error="Some technical error" errorType="RATE_LIMIT_ERROR" />);
    expect(screen.getByText('The ghost writer needs rest (rate limited)')).toBeInTheDocument();
  });

  it('displays context message for network errors', () => {
    render(<GhostErrorDisplay error="Network error" errorType="NETWORK_ERROR" />);
    expect(screen.getByText('Check your internet connection and try again')).toBeInTheDocument();
  });

  it('displays context message for API key errors', () => {
    render(<GhostErrorDisplay error="Auth error" errorType="INVALID_KEY_ERROR" />);
    expect(screen.getByText('Configure your API key in settings to use Ghost Writer')).toBeInTheDocument();
  });

  it('displays context message for rate limit errors', () => {
    render(<GhostErrorDisplay error="Too many requests" errorType="RATE_LIMIT_ERROR" />);
    expect(screen.getByText("You've made too many requests. Please wait a moment")).toBeInTheDocument();
  });
});
