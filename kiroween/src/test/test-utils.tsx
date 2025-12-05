import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AppProvider } from '../contexts/AppContext';
import { NotesProvider } from '../contexts/NotesContext';
import { TasksProvider } from '../contexts/TasksContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { CompanionProvider } from '../contexts/CompanionContext';
import { StreakProvider } from '../contexts/StreakContext';
import { TimerProvider } from '../contexts/TimerContext';

/**
 * Test utilities for integration tests
 * Provides a wrapper with all necessary providers
 */

// Wrapper with all providers
// Note: CompanionProvider must be before TasksProvider since TasksProvider depends on CompanionContext
// Note: StreakProvider must be before TasksProvider, NotesProvider, and TimerProvider since they depend on StreakContext
export const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider>
          <AppProvider>
            <CompanionProvider>
              <StreakProvider>
                <TimerProvider>
                  <NotesProvider>
                    <TasksProvider>
                      {children}
                    </TasksProvider>
                  </NotesProvider>
                </TimerProvider>
              </StreakProvider>
            </CompanionProvider>
          </AppProvider>
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

// Custom render function that includes all providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };
