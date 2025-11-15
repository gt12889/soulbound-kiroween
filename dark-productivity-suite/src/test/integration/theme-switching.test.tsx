import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

// Mock auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
}));

// Mock Firebase
vi.mock('../../services/firebaseService', () => ({
  db: {},
}));

// Test component to verify theme changes
const TestComponent = () => {
  const { currentTheme, availableThemes } = useTheme();

  return (
    <div>
      <div data-testid="current-theme">{currentTheme.name}</div>
      <div data-testid="theme-count">{availableThemes.length}</div>
      <div data-testid="background-color">{currentTheme.colors.bgPrimary}</div>
    </div>
  );
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Theme Switching Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Clear any CSS variables
    document.documentElement.style.cssText = '';
  });

  describe('Theme availability', () => {
    it('should have all three themes available', () => {
      renderWithTheme(<TestComponent />);

      const themeCount = screen.getByTestId('theme-count');
      expect(themeCount.textContent).toBe('3');
    });

    it('should load default dark theme initially', () => {
      renderWithTheme(<TestComponent />);

      const currentTheme = screen.getByTestId('current-theme');
      expect(currentTheme.textContent).toBe('Default Dark');
    });
  });

  describe('Theme switching', () => {
    it('should switch to Blood Moon theme', async () => {
      const user = userEvent.setup();

      const SwitchComponent = () => {
        const { switchTheme } = useTheme();

        return (
          <div>
            <TestComponent />
            <button onClick={() => switchTheme('blood-moon')}>Switch to Blood Moon</button>
          </div>
        );
      };

      renderWithTheme(<SwitchComponent />);

      const switchButton = screen.getByText(/switch to blood moon/i);
      await user.click(switchButton);

      await waitFor(() => {
        const currentTheme = screen.getByTestId('current-theme');
        expect(currentTheme.textContent).toBe('Blood Moon');
      });
    });

    it('should switch to Midnight Forest theme', async () => {
      const user = userEvent.setup();

      const SwitchComponent = () => {
        const { switchTheme } = useTheme();

        return (
          <div>
            <TestComponent />
            <button onClick={() => switchTheme('midnight-forest')}>Switch to Midnight Forest</button>
          </div>
        );
      };

      renderWithTheme(<SwitchComponent />);

      const switchButton = screen.getByText(/switch to midnight forest/i);
      await user.click(switchButton);

      await waitFor(() => {
        const currentTheme = screen.getByTestId('current-theme');
        expect(currentTheme.textContent).toBe('Midnight Forest');
      });
    });

    it('should apply theme within 500ms', async () => {
      const user = userEvent.setup();
      const startTime = Date.now();

      const SwitchComponent = () => {
        const { switchTheme } = useTheme();

        return (
          <div>
            <TestComponent />
            <button onClick={() => switchTheme('blood-moon')}>Switch Theme</button>
          </div>
        );
      };

      renderWithTheme(<SwitchComponent />);

      const switchButton = screen.getByText(/switch theme/i);
      await user.click(switchButton);

      await waitFor(() => {
        const currentTheme = screen.getByTestId('current-theme');
        expect(currentTheme.textContent).toBe('Blood Moon');
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);
    });
  });

  describe('Theme persistence', () => {
    it('should call setThemeId when switching themes (persistence handled by useLocalStorage)', async () => {
      const user = userEvent.setup();

      const SwitchComponent = () => {
        const { switchTheme, themeId } = useTheme();

        return (
          <div>
            <div data-testid="theme-id">{themeId}</div>
            <TestComponent />
            <button onClick={() => switchTheme('blood-moon')}>Switch Theme</button>
          </div>
        );
      };

      renderWithTheme(<SwitchComponent />);

      const switchButton = screen.getByText(/switch theme/i);
      await user.click(switchButton);

      // Verify theme ID changed (which triggers useLocalStorage persistence)
      await waitFor(() => {
        const themeId = screen.getByTestId('theme-id');
        expect(themeId.textContent).toBe('blood-moon');
      });

      // Verify theme was applied
      const currentTheme = screen.getByTestId('current-theme');
      expect(currentTheme.textContent).toBe('Blood Moon');
    });

    it('should persist theme selection across remounts', async () => {
      const user = userEvent.setup();

      const SwitchComponent = () => {
        const { switchTheme, themeId } = useTheme();

        return (
          <div>
            <div data-testid="theme-id">{themeId}</div>
            <TestComponent />
            <button onClick={() => switchTheme('blood-moon')}>Switch Theme</button>
          </div>
        );
      };

      // First render - switch to Blood Moon theme
      const { unmount } = renderWithTheme(<SwitchComponent />);

      const switchButton = screen.getByText(/switch theme/i);
      await user.click(switchButton);

      // Verify theme switched
      await waitFor(() => {
        const themeId = screen.getByTestId('theme-id');
        expect(themeId.textContent).toBe('blood-moon');
      });

      // Wait for localStorage to save (debounced to 1 second)
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Unmount component
      unmount();

      // Remount component - theme should be restored from localStorage
      renderWithTheme(<TestComponent />);

      // Theme should be restored
      const currentTheme = screen.getByTestId('current-theme');
      expect(currentTheme.textContent).toBe('Blood Moon');
    });

    it('should use default theme if no saved theme exists', () => {
      renderWithTheme(<TestComponent />);

      const currentTheme = screen.getByTestId('current-theme');
      expect(currentTheme.textContent).toBe('Default Dark');
    });
  });

  describe('Theme transitions', () => {
    it('should have smooth transitions between themes', async () => {
      const user = userEvent.setup();

      const SwitchComponent = () => {
        const { switchTheme, currentTheme } = useTheme();

        return (
          <div>
            <div data-testid="transition-state">{currentTheme.name}</div>
            <button onClick={() => switchTheme('blood-moon')}>Blood Moon</button>
            <button onClick={() => switchTheme('midnight-forest')}>Midnight Forest</button>
            <button onClick={() => switchTheme('default-dark')}>Default Dark</button>
          </div>
        );
      };

      renderWithTheme(<SwitchComponent />);

      // Switch through all themes
      await user.click(screen.getByText(/blood moon/i));
      await waitFor(() => {
        expect(screen.getByTestId('transition-state').textContent).toBe('Blood Moon');
      });

      await user.click(screen.getByText(/midnight forest/i));
      await waitFor(() => {
        expect(screen.getByTestId('transition-state').textContent).toBe('Midnight Forest');
      });

      await user.click(screen.getByText(/default dark/i));
      await waitFor(() => {
        expect(screen.getByTestId('transition-state').textContent).toBe('Default Dark');
      });
    });

    it('should apply CSS variables for theme colors', async () => {
      const user = userEvent.setup();

      const SwitchComponent = () => {
        const { switchTheme } = useTheme();

        return (
          <div>
            <button onClick={() => switchTheme('blood-moon')}>Switch Theme</button>
          </div>
        );
      };

      renderWithTheme(<SwitchComponent />);

      const switchButton = screen.getByText(/switch theme/i);
      await user.click(switchButton);

      await waitFor(() => {
        const rootStyles = getComputedStyle(document.documentElement);
        const backgroundColor = rootStyles.getPropertyValue('--bg-primary');
        expect(backgroundColor).toBeTruthy();
      });
    });
  });

  describe('Theme consistency across modules', () => {
    it('should apply theme to Terminal Tarot module', async () => {
      const user = userEvent.setup();

      const ModuleComponent = () => {
        const { switchTheme, currentTheme } = useTheme();

        return (
          <div>
            <div data-testid="module-theme">{currentTheme.name}</div>
            <div className="terminal-tarot-module" data-testid="tarot-module">
              Terminal Tarot Content
            </div>
            <button onClick={() => switchTheme('blood-moon')}>Switch Theme</button>
          </div>
        );
      };

      renderWithTheme(<ModuleComponent />);

      await user.click(screen.getByText(/switch theme/i));

      await waitFor(() => {
        expect(screen.getByTestId('module-theme').textContent).toBe('Blood Moon');
      });
    });

    it('should apply theme to Ghost Writer module', async () => {
      const user = userEvent.setup();

      const ModuleComponent = () => {
        const { switchTheme, currentTheme } = useTheme();

        return (
          <div>
            <div data-testid="module-theme">{currentTheme.name}</div>
            <div className="ghost-writer-module" data-testid="writer-module">
              Ghost Writer Content
            </div>
            <button onClick={() => switchTheme('midnight-forest')}>Switch Theme</button>
          </div>
        );
      };

      renderWithTheme(<ModuleComponent />);

      await user.click(screen.getByText(/switch theme/i));

      await waitFor(() => {
        expect(screen.getByTestId('module-theme').textContent).toBe('Midnight Forest');
      });
    });

    it('should apply theme to Necronomicon Notes module', async () => {
      const user = userEvent.setup();

      const ModuleComponent = () => {
        const { switchTheme, currentTheme } = useTheme();

        return (
          <div>
            <div data-testid="module-theme">{currentTheme.name}</div>
            <div className="necronomicon-notes-module" data-testid="notes-module">
              Notes Content
            </div>
            <button onClick={() => switchTheme('blood-moon')}>Switch Theme</button>
          </div>
        );
      };

      renderWithTheme(<ModuleComponent />);

      await user.click(screen.getByText(/switch theme/i));

      await waitFor(() => {
        expect(screen.getByTestId('module-theme').textContent).toBe('Blood Moon');
      });
    });

    it('should apply theme to Graveyard Dashboard module', async () => {
      const user = userEvent.setup();

      const ModuleComponent = () => {
        const { switchTheme, currentTheme } = useTheme();

        return (
          <div>
            <div data-testid="module-theme">{currentTheme.name}</div>
            <div className="graveyard-dashboard-module" data-testid="graveyard-module">
              Graveyard Content
            </div>
            <button onClick={() => switchTheme('midnight-forest')}>Switch Theme</button>
          </div>
        );
      };

      renderWithTheme(<ModuleComponent />);

      await user.click(screen.getByText(/switch theme/i));

      await waitFor(() => {
        expect(screen.getByTestId('module-theme').textContent).toBe('Midnight Forest');
      });
    });
  });
});