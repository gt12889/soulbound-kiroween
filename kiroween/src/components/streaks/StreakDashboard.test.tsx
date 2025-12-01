import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakDashboard } from './StreakDashboard';
import { StreakProvider } from '../../contexts/StreakContext';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the child components to simplify testing
vi.mock('./StreakCard', () => ({
  StreakCard: ({ streakType }: { streakType: string }) => (
    <div data-testid={`streak-card-${streakType}`}>Streak Card: {streakType}</div>
  ),
}));

vi.mock('./ActivityHeatmap', () => ({
  ActivityHeatmap: () => <div data-testid="activity-heatmap">Activity Heatmap</div>,
}));

vi.mock('./StreakTokens', () => ({
  StreakTokens: ({ availableTokens }: { availableTokens: number }) => (
    <div data-testid="streak-tokens">Tokens: {availableTokens}</div>
  ),
}));

describe('StreakDashboard', () => {
  const renderDashboard = () => {
    return render(
      <AuthProvider>
        <StreakProvider>
          <StreakDashboard />
        </StreakProvider>
      </AuthProvider>
    );
  };

  it('renders the dashboard title', async () => {
    renderDashboard();
    
    // Wait for loading to complete
    await screen.findByText(/Your Streaks/i);
    
    expect(screen.getByText(/Your Streaks/i)).toBeInTheDocument();
  });

  it('renders all streak cards', async () => {
    renderDashboard();
    
    // Wait for loading to complete
    await screen.findByText(/Your Streaks/i);
    
    // Check that all four streak types are rendered
    expect(screen.getByTestId('streak-card-login')).toBeInTheDocument();
    expect(screen.getByTestId('streak-card-task')).toBeInTheDocument();
    expect(screen.getByTestId('streak-card-note')).toBeInTheDocument();
    expect(screen.getByTestId('streak-card-focus')).toBeInTheDocument();
  });

  it('renders the activity heatmap', async () => {
    renderDashboard();
    
    // Wait for loading to complete
    await screen.findByText(/Your Streaks/i);
    
    expect(screen.getByTestId('activity-heatmap')).toBeInTheDocument();
  });

  it('renders the token display', async () => {
    renderDashboard();
    
    // Wait for loading to complete
    await screen.findByText(/Your Streaks/i);
    
    expect(screen.getByTestId('streak-tokens')).toBeInTheDocument();
  });

  it('renders section headings', async () => {
    renderDashboard();
    
    // Wait for loading to complete
    await screen.findByText(/Your Streaks/i);
    
    expect(screen.getByText(/Active Streaks/i)).toBeInTheDocument();
    expect(screen.getByText(/Activity History/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderDashboard();
    
    expect(screen.getByText(/Loading your streaks/i)).toBeInTheDocument();
  });

  it('renders milestone progress section', async () => {
    renderDashboard();
    
    // Wait for loading to complete
    await screen.findByText(/Your Streaks/i);
    
    // Check for milestone section
    expect(screen.getByText(/Next Milestone/i)).toBeInTheDocument();
    
    // Check for milestone progress elements
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    
    // Check for all milestones list
    expect(screen.getByText(/All Milestones/i)).toBeInTheDocument();
  });
});
