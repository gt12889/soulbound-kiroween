/**
 * Tests for companion type state in AppContext
 * Requirements: FR-1.3, FR-4.1, FR-4.2, FR-4.3, FR-4.5, FR-6.3, NFR-4
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppProvider, useApp } from './AppContext';
import { AuthProvider } from './AuthContext';
import { cloudSyncService } from '../services/cloudSyncService';

// Mock dependencies
vi.mock('./AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
  })),
}));

vi.mock('../services/cloudSyncService', () => ({
  cloudSyncService: {
    syncCompanionData: vi.fn(),
    fetchCompanionData: vi.fn().mockResolvedValue(null),
    subscribeToCompanionData: vi.fn(() => () => {}), // Return unsubscribe function
    syncSettings: vi.fn(),
    fetchSettings: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('../hooks/useLocalStorage', async () => {
  const React = await import('react');
  return {
    useLocalStorage: vi.fn((_key: string, defaultValue: any) => {
      const [value, setValue] = React.useState(defaultValue);
      return [value, setValue];
    }),
  };
});

describe('AppContext - Companion Type', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with null companion type', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      ),
    });

    expect(result.current.companionType).toBeNull();
    expect(result.current.hasSelectedCompanion).toBe(false);
  });

  it('should set companion type to shadow', async () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      ),
    });

    await act(async () => {
      await result.current.setCompanionType('shadow');
    });

    expect(result.current.companionType).toBe('shadow');
    expect(result.current.hasSelectedCompanion).toBe(true);
  });

  it('should set companion type to forest', async () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      ),
    });

    await act(async () => {
      await result.current.setCompanionType('forest');
    });

    expect(result.current.companionType).toBe('forest');
    expect(result.current.hasSelectedCompanion).toBe(true);
  });

  it('should set companion type to ember', async () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      ),
    });

    await act(async () => {
      await result.current.setCompanionType('ember');
    });

    expect(result.current.companionType).toBe('ember');
    expect(result.current.hasSelectedCompanion).toBe(true);
  });

  it('should reject invalid companion type', async () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      ),
    });

    await expect(
      act(async () => {
        // @ts-expect-error Testing invalid type
        await result.current.setCompanionType('invalid');
      })
    ).rejects.toThrow('Invalid companion type');

    expect(result.current.companionType).toBeNull();
    expect(result.current.hasSelectedCompanion).toBe(false);
  });

  it('should update hasSelectedCompanion when companion type changes', async () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      ),
    });

    expect(result.current.hasSelectedCompanion).toBe(false);

    await act(async () => {
      await result.current.setCompanionType('shadow');
    });

    expect(result.current.hasSelectedCompanion).toBe(true);
  });

  it('should sync to Firebase for authenticated users', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    const { useAuth } = await import('./AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    } as any);

    const { result } = renderHook(() => useApp(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      ),
    });

    await act(async () => {
      await result.current.setCompanionType('forest');
    });

    await waitFor(() => {
      expect(cloudSyncService.syncCompanionData).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          type: 'forest',
          selectedAt: expect.any(String),
        })
      );
    });
  });

  it('should not sync to Firebase for unauthenticated users', async () => {
    // Reset the mock to unauthenticated state
    const { useAuth } = await import('./AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
    } as any);

    const { result } = renderHook(() => useApp(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      ),
    });

    await act(async () => {
      await result.current.setCompanionType('ember');
    });

    expect(cloudSyncService.syncCompanionData).not.toHaveBeenCalled();
  });

  it('should handle Firebase sync errors gracefully', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    const { useAuth } = await import('./AuthContext');
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    } as any);

    vi.mocked(cloudSyncService.syncCompanionData).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useApp(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      ),
    });

    // Should not throw even if Firebase sync fails
    await act(async () => {
      await result.current.setCompanionType('shadow');
    });

    expect(result.current.companionType).toBe('shadow');
    expect(result.current.hasSelectedCompanion).toBe(true);
  });
});
