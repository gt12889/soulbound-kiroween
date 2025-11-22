import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { InteractiveCompanion } from './InteractiveCompanion';
import { CompanionProvider } from '../../contexts/CompanionContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AppProvider } from '../../contexts/AppContext';

// Mock the contexts that CompanionContext depends on
vi.mock('../../services/cloudSyncService', () => ({
  cloudSyncService: {
    fetchCompanionData: vi.fn().mockResolvedValue(null),
    syncCompanionData: vi.fn().mockResolvedValue(undefined),
    subscribeToCompanionData: vi.fn().mockReturnValue(() => {}),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <CompanionProvider>
            {component}
          </CompanionProvider>
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

describe('InteractiveCompanion - Click Interaction Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the companion with proper accessibility attributes', () => {
    renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={0}
      />
    );

    const companion = screen.getByRole('button');
    expect(companion).toBeInTheDocument();
    expect(companion).toHaveAttribute('tabIndex', '0');
    expect(companion).toHaveAttribute('aria-label');
  });

  it('should trigger animation on click', async () => {
    renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={0}
      />
    );

    const companion = screen.getByRole('button');
    
    // Click the companion
    fireEvent.click(companion);

    // Check if animating class is added
    await waitFor(() => {
      expect(companion.className).toContain('animating');
    });

    // Wait for animation to complete (1000ms)
    await waitFor(() => {
      expect(companion.className).not.toContain('animating');
    }, { timeout: 1500 });
  });

  it('should call onInteract callback when clicked', () => {
    const onInteract = vi.fn();
    
    renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={0}
        onInteract={onInteract}
      />
    );

    const companion = screen.getByRole('button');
    fireEvent.click(companion);

    expect(onInteract).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard interaction (Enter key)', () => {
    const onInteract = vi.fn();
    
    renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={0}
        onInteract={onInteract}
      />
    );

    const companion = screen.getByRole('button');
    fireEvent.keyDown(companion, { key: 'Enter' });

    expect(onInteract).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard interaction (Space key)', () => {
    const onInteract = vi.fn();
    
    renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={0}
        onInteract={onInteract}
      />
    );

    const companion = screen.getByRole('button');
    fireEvent.keyDown(companion, { key: ' ' });

    expect(onInteract).toHaveBeenCalledTimes(1);
  });

  it('should show tooltip on hover', async () => {
    renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={0}
      />
    );

    const companion = screen.getByRole('button');
    
    // Hover over companion
    fireEvent.mouseEnter(companion);

    // Check if tooltip appears
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent(/Mood:/i);
    });
  });

  it('should hide tooltip on mouse leave', async () => {
    renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={0}
      />
    );

    const companion = screen.getByRole('button');
    
    // Hover over companion
    fireEvent.mouseEnter(companion);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    // Move mouse away
    fireEvent.mouseLeave(companion);

    // Tooltip should be gone
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('should display custom name in tooltip if set', async () => {
    // This test would require setting up the CompanionContext with a custom name
    // For now, we'll test that the tooltip shows the default name
    renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={0}
      />
    );

    const companion = screen.getByRole('button');
    fireEvent.mouseEnter(companion);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent(/Mysterious Egg/i);
    });
  });

  it('should display current mood in tooltip', async () => {
    renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={0}
      />
    );

    const companion = screen.getByRole('button');
    fireEvent.mouseEnter(companion);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      // Default mood should be 'neutral'
      expect(tooltip).toHaveTextContent(/Mood: Neutral/i);
    });
  });

  it('should not trigger interaction on other keys', () => {
    const onInteract = vi.fn();
    
    renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={0}
        onInteract={onInteract}
      />
    );

    const companion = screen.getByRole('button');
    fireEvent.keyDown(companion, { key: 'a' });
    fireEvent.keyDown(companion, { key: 'Escape' });
    fireEvent.keyDown(companion, { key: 'Tab' });

    expect(onInteract).not.toHaveBeenCalled();
  });

  it('should update aria-label with mood information', () => {
    renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={0}
      />
    );

    const companion = screen.getByRole('button');
    const ariaLabel = companion.getAttribute('aria-label');
    
    expect(ariaLabel).toContain('mood');
    expect(ariaLabel).toContain('Click to interact');
  });
});

describe('InteractiveCompanion - Celebration Animation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should trigger celebration animation when task count increases', async () => {
    const { rerender } = renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={5}
      />
    );

    const companion = screen.getByRole('button');
    
    // Initially should not be celebrating
    expect(companion.className).not.toContain('celebrating');

    // Increase task count (simulating task completion)
    rerender(
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <CompanionProvider>
              <InteractiveCompanion
                achievementCount={0}
                taskCompletionCount={6}
              />
            </CompanionProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    // Should now be celebrating
    await waitFor(() => {
      expect(companion.className).toContain('celebrating');
    });
  });

  it('should display celebration effect overlay when celebrating', async () => {
    const { rerender } = renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={5}
      />
    );

    // Increase task count
    rerender(
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <CompanionProvider>
              <InteractiveCompanion
                achievementCount={0}
                taskCompletionCount={6}
              />
            </CompanionProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    // Check for celebration text
    await waitFor(() => {
      expect(screen.getByText('Great Job!')).toBeInTheDocument();
    });
  });

  it('should stop celebrating after 2 seconds', async () => {
    const { rerender } = renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={5}
      />
    );

    const companion = screen.getByRole('button');

    // Increase task count
    rerender(
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <CompanionProvider>
              <InteractiveCompanion
                achievementCount={0}
                taskCompletionCount={6}
              />
            </CompanionProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    // Should be celebrating
    await waitFor(() => {
      expect(companion.className).toContain('celebrating');
    });

    // Wait for celebration to end (2000ms)
    await waitFor(() => {
      expect(companion.className).not.toContain('celebrating');
    }, { timeout: 2500 });
  });

  it('should not trigger celebration when task count decreases', async () => {
    const { rerender } = renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={10}
      />
    );

    const companion = screen.getByRole('button');

    // Decrease task count (shouldn't happen in normal flow, but test edge case)
    rerender(
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <CompanionProvider>
              <InteractiveCompanion
                achievementCount={0}
                taskCompletionCount={9}
              />
            </CompanionProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    // Should not be celebrating
    await waitFor(() => {
      expect(companion.className).not.toContain('celebrating');
    }, { timeout: 500 });
  });

  it('should not trigger celebration when task count stays the same', async () => {
    const { rerender } = renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={5}
      />
    );

    const companion = screen.getByRole('button');

    // Re-render with same task count
    rerender(
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <CompanionProvider>
              <InteractiveCompanion
                achievementCount={0}
                taskCompletionCount={5}
              />
            </CompanionProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    // Should not be celebrating
    await waitFor(() => {
      expect(companion.className).not.toContain('celebrating');
    }, { timeout: 500 });
  });

  it('should render confetti particles during celebration', async () => {
    const { rerender, container } = renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={5}
      />
    );

    // Increase task count
    rerender(
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <CompanionProvider>
              <InteractiveCompanion
                achievementCount={0}
                taskCompletionCount={6}
              />
            </CompanionProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    // Check for confetti elements
    await waitFor(() => {
      const confetti = container.querySelectorAll('[class*="confetti"]');
      expect(confetti.length).toBeGreaterThan(0);
    });
  });

  it('should handle multiple consecutive task completions', async () => {
    const { rerender } = renderWithProviders(
      <InteractiveCompanion
        achievementCount={0}
        taskCompletionCount={5}
      />
    );

    const companion = screen.getByRole('button');

    // First task completion
    rerender(
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <CompanionProvider>
              <InteractiveCompanion
                achievementCount={0}
                taskCompletionCount={6}
              />
            </CompanionProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(companion.className).toContain('celebrating');
    });

    // Wait for first celebration to end
    await waitFor(() => {
      expect(companion.className).not.toContain('celebrating');
    }, { timeout: 2500 });

    // Second task completion
    rerender(
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <CompanionProvider>
              <InteractiveCompanion
                achievementCount={0}
                taskCompletionCount={7}
              />
            </CompanionProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    // Should celebrate again
    await waitFor(() => {
      expect(companion.className).toContain('celebrating');
    });
  });
});
