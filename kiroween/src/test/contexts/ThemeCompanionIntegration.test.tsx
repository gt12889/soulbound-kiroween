import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { CompanionProvider, useCompanion } from '../../contexts/CompanionContext';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { AppProvider } from '../../contexts/AppContext';
import type { ReactNode } from 'react';

// Mock Firebase
vi.mock('../../services/firebaseService', () => ({
  db: null,
  auth: null,
  isFirebaseConfigured: false,
}));

// Mock cloud sync service
vi.mock('../../services/cloudSyncService', () => ({
  cloudSyncService: {
    syncCompanionData: vi.fn(),
    fetchCompanionData: vi.fn(),
    subscribeToCompanionData: vi.fn(() => vi.fn()),
  },
}));

// Mock moon phase service
vi.mock('../../services/moonPhaseService', () => ({
  calculateMoonPhase: vi.fn(() => ({
    name: 'waxing_crescent',
    phase: 0.25,
    illumination: 0.5,
  })),
}));

/**
 * Test wrapper with all required providers
 */
function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider>
          <CompanionProvider>{children}</CompanionProvider>
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}

describe('Theme and Companion Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should track theme changes in companion context', async () => {
    const { result } = renderHook(() => ({
      companion: useCompanion(),
      theme: useTheme(),
    }), {
      wrapper: TestWrapper,
    });

    // Initial theme should be tracked
    expect(result.current.companion.currentContext.currentTheme).toBe('default-dark');

    // Switch theme
    act(() => {
      result.current.theme.switchTheme('blood-moon');
    });

    // Wait for context to update
    await waitFor(() => {
      expect(result.current.companion.currentContext.currentTheme).toBe('blood-moon');
    }, { timeout: 2000 });
  });

  it('should update context when theme changes to midnight-forest', async () => {
    const { result } = renderHook(() => ({
      companion: useCompanion(),
      theme: useTheme(),
    }), {
      wrapper: TestWrapper,
    });

    // Switch to midnight-forest theme
    act(() => {
      result.current.theme.switchTheme('midnight-forest');
    });

    // Verify context updated
    await waitFor(() => {
      expect(result.current.companion.currentContext.currentTheme).toBe('midnight-forest');
    }, { timeout: 2000 });
  });

  it('should maintain theme tracking across multiple theme switches', async () => {
    const { result } = renderHook(() => ({
      companion: useCompanion(),
      theme: useTheme(),
    }), {
      wrapper: TestWrapper,
    });

    // Switch themes multiple times
    act(() => {
      result.current.theme.switchTheme('blood-moon');
    });

    await waitFor(() => {
      expect(result.current.companion.currentContext.currentTheme).toBe('blood-moon');
    }, { timeout: 2000 });

    act(() => {
      result.current.theme.switchTheme('midnight-forest');
    });

    await waitFor(() => {
      expect(result.current.companion.currentContext.currentTheme).toBe('midnight-forest');
    }, { timeout: 2000 });

    act(() => {
      result.current.theme.switchTheme('default-dark');
    });

    await waitFor(() => {
      expect(result.current.companion.currentContext.currentTheme).toBe('default-dark');
    }, { timeout: 2000 });
  });

  it('should preserve other context properties when theme changes', async () => {
    const { result } = renderHook(() => ({
      companion: useCompanion(),
      theme: useTheme(),
    }), {
      wrapper: TestWrapper,
    });

    // Set some context properties
    act(() => {
      result.current.companion.updateContext({
        currentModule: 'ghost-writer',
        currentActivity: 'writing',
      });
    });

    // Verify initial context
    expect(result.current.companion.currentContext.currentModule).toBe('ghost-writer');
    expect(result.current.companion.currentContext.currentActivity).toBe('writing');

    // Switch theme
    act(() => {
      result.current.theme.switchTheme('blood-moon');
    });

    // Verify theme updated but other properties preserved
    await waitFor(() => {
      expect(result.current.companion.currentContext.currentTheme).toBe('blood-moon');
      expect(result.current.companion.currentContext.currentModule).toBe('ghost-writer');
      expect(result.current.companion.currentContext.currentActivity).toBe('writing');
    }, { timeout: 2000 });
  });

  it('should track theme in user context for dialogue generation', async () => {
    const { result } = renderHook(() => ({
      companion: useCompanion(),
      theme: useTheme(),
    }), {
      wrapper: TestWrapper,
    });

    // The currentContext should always have a theme value
    expect(result.current.companion.currentContext.currentTheme).toBeDefined();
    expect(typeof result.current.companion.currentContext.currentTheme).toBe('string');

    // Switch to blood-moon theme
    act(() => {
      result.current.theme.switchTheme('blood-moon');
    });

    // Context should reflect the new theme for dialogue generation
    await waitFor(() => {
      const context = result.current.companion.currentContext;
      expect(context.currentTheme).toBe('blood-moon');
      
      // Verify context structure is complete for dialogue service
      expect(context).toHaveProperty('currentModule');
      expect(context).toHaveProperty('currentActivity');
      expect(context).toHaveProperty('currentTheme');
      expect(context).toHaveProperty('currentMoonPhase');
    }, { timeout: 2000 });
  });
});
