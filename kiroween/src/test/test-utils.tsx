import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AppProvider } from '../contexts/AppContext';
import { NotesProvider } from '../contexts/NotesContext';
import { TasksProvider } from '../contexts/TasksContext';
import { ToastProvider } from '../contexts/ToastContext';

/**
 * Test utilities for integration tests
 * Provides a wrapper with all necessary providers
 */

// Wrapper with all providers
export const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <AppProvider>
          <NotesProvider>
            <TasksProvider>
              {children}
            </TasksProvider>
          </NotesProvider>
        </AppProvider>
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
