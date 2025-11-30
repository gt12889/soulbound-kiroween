import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InteractiveCompanion } from './InteractiveCompanion';
import { CompanionProvider } from '../../contexts/CompanionContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AppProvider } from '../../contexts/AppContext';

// Mock the contexts
vi.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));

vi.mock('../../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: () => ({ themeId: 'default' }),
}));

vi.mock('../../contexts/AppContext', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useApp: () => ({ currentModule: 'home' }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <CompanionProvider>{component}</CompanionProvider>
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

describe('InteractiveCompanion - Encouragement Animation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should show encouragement animation after 30 minutes of inactivity', async () => {
    renderWithProviders(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={0} />
    );

    // Initially, no encouragement should be shown
    expect(screen.queryByText(/Come back!/i)).not.toBeInTheDocument();

    // Fast-forward 30 minutes (trigger the interval check)
    await act(async () => {
      // Advance by 30 minutes + 1 minute to trigger the check
      vi.advanceTimersByTime(31 * 60 * 1000);
    });

    // Wait for the encouragement to appear
    await waitFor(() => {
      expect(screen.getByText(/Come back!/i)).toBeInTheDocument();
    });
  });

  it('should not show encouragement before 30 minutes', async () => {
    renderWithProviders(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={0} />
    );

    // Fast-forward 29 minutes
    vi.advanceTimersByTime(29 * 60 * 1000);

    // Encouragement should not be shown yet
    expect(screen.queryByText(/Come back!/i)).not.toBeInTheDocument();
  });

  it('should hide encouragement animation after 3 seconds', async () => {
    renderWithProviders(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={0} />
    );

    // Fast-forward 31 minutes to trigger encouragement
    await act(async () => {
      vi.advanceTimersByTime(31 * 60 * 1000);
    });

    // Wait for encouragement to appear
    await waitFor(() => {
      expect(screen.getByText(/Come back!/i)).toBeInTheDocument();
    });

    // Fast-forward 3 seconds
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Encouragement should be hidden
    await waitFor(() => {
      expect(screen.queryByText(/Come back!/i)).not.toBeInTheDocument();
    });
  });

  it('should reset inactivity timer when task is completed', async () => {
    const { rerender } = renderWithProviders(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={0} />
    );

    // Fast-forward 25 minutes
    await act(async () => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });

    // Complete a task (this should reset the timer)
    await act(async () => {
      rerender(
        <AuthProvider>
          <ThemeProvider>
            <AppProvider>
              <CompanionProvider>
                <InteractiveCompanion achievementCount={0} taskCompletionCount={1} />
              </CompanionProvider>
            </AppProvider>
          </ThemeProvider>
        </AuthProvider>
      );
    });

    // Fast-forward another 25 minutes (total would be 50 if not reset)
    await act(async () => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });

    // Encouragement should not be shown because timer was reset
    expect(screen.queryByText(/Come back!/i)).not.toBeInTheDocument();

    // Fast-forward 6 more minutes (31 minutes since task completion to trigger check)
    await act(async () => {
      vi.advanceTimersByTime(6 * 60 * 1000);
    });

    // Now encouragement should appear
    await waitFor(() => {
      expect(screen.getByText(/Come back!/i)).toBeInTheDocument();
    });
  });

  it('should not spam encouragement animations', async () => {
    renderWithProviders(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={0} />
    );

    // Fast-forward 31 minutes to trigger first encouragement
    await act(async () => {
      vi.advanceTimersByTime(31 * 60 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/Come back!/i)).toBeInTheDocument();
    });

    // Fast-forward 3 seconds for animation to complete
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Fast-forward another 5 minutes (should not trigger again immediately)
    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    // Should not show encouragement again yet
    expect(screen.queryByText(/Come back!/i)).not.toBeInTheDocument();
  });

  it('should render encouragement hearts', async () => {
    const { container } = renderWithProviders(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={0} />
    );

    // Fast-forward 31 minutes
    await act(async () => {
      vi.advanceTimersByTime(31 * 60 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/Come back!/i)).toBeInTheDocument();
    });

    // Check for hearts (💜 emoji)
    const hearts = container.querySelectorAll('.encouragementHeart');
    expect(hearts.length).toBe(6);
  });

  it('should render encouragement waves', async () => {
    const { container } = renderWithProviders(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={0} />
    );

    // Fast-forward 31 minutes
    await act(async () => {
      vi.advanceTimersByTime(31 * 60 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/Come back!/i)).toBeInTheDocument();
    });

    // Check for waves
    const waves = container.querySelectorAll('.encouragementWave');
    expect(waves.length).toBe(3);
  });

  it('should apply encouraging class to companion', async () => {
    const { container } = renderWithProviders(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={0} />
    );

    // Fast-forward 31 minutes
    await act(async () => {
      vi.advanceTimersByTime(31 * 60 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/Come back!/i)).toBeInTheDocument();
    });

    // Check for encouraging class
    const companion = container.querySelector('.companion');
    expect(companion).toHaveClass('encouraging');
  });
});
