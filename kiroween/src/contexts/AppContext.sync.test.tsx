/**
 * Tests for localStorage and Firebase sync logic in AppContext
 * Requirements: FR-4.2, FR-4.3, FR-4.5
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppProvider, useApp } from './AppContext';
import { AuthProvider } from './AuthContext';
import { cloudSyncService } from '../services/cloudSyncService';
import type { CompanionType } from '../types/companion';

// Mock dependencies
const mockUseAuth = vi.fn();
vi.mock('./AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => mockUseAuth(),
}));

const mockSyncCompanionData = vi.fn();
const mockFetchCompanionData = vi.fn();
const mockSubscribeToCompanionData = vi.fn();
const mockSyncSettings = vi.fn();
const mockFetchSettings = vi.fn();

vi.mock('../services/cloudSyncService', () => ({
  cloudSyncService: {
    syncCompanionData: (...args: any[]) => mockSyncCompanionData(...args),
    fetchCompanionData: (...args: any[]) => mockFetchCompanionData(...args),
    subscribeToCompanionData: (...args: any[]) => mockSubscribeToCompanionData(...args),
    syncSettings: (...args: any[]) => mockSyncSettings(...args),
    fetchSettings: (...args: any[]) => mockFetchSettings(...args),
  },
}));

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
const mockUseLocalStorage = vi.fn((key: string, defaultValue: any) => {
  const React = require('react');
  const [value, setValue] = React.useState(() => {
    const stored = mockLocalStorage[key];
    return stored ? JSON.parse(stored) : defaultValue;
  });

  const setStoredValue = React.useCallback((newValue: any) => {
    mockLocalStorage[key] = JSON.stringify(newValue);
    setValue(newValue);
  }, [key]);

  return [value, setStoredValue];
});

vi.mock('../hooks/useLocalStorage', () => ({
  useLocalStorage: (...args: any[]) => mockUseLocalStorage(...args),
}));

describe('AppContext - localStorage and Firebase Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
    
    // Default to unauthenticated
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    // Default mock implementations
    mockFetchCompanionData.mockResolvedValue(null);
    mockFetchSettings.mockResolvedValue(null);
    mockSyncCompanionData.mockResolvedValue(undefined);
    mockSyncSettings.mockResolvedValue(undefined);
    mockSubscribeToCompanionData.mockReturnValue(() => {});
  });

  describe('Initial Sync on Login', () => {
    it('should sync from Firebase to localStorage when user logs in with cloud data', async () => {
      // Setup: Cloud has 'forest', local has nothing
      mockFetchCompanionData.mockResolvedValue({ type: 'forest' });
      
      // Start with authenticated user
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      // Wait for sync to complete
      await waitFor(() => {
        expect(mockFetchCompanionData).toHaveBeenCalledWith('user123');
      });

      await waitFor(() => {
        expect(result.current.companionType).toBe('forest');
      });
    });

    it('should sync from localStorage to Firebase when user logs in with local data only', async () => {
      // Setup: Local has 'shadow', cloud has nothing
      mockLocalStorage['dark-productivity-companion-type'] = JSON.stringify('shadow');
      mockFetchCompanionData.mockResolvedValue(null);

      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      // Wait for sync to complete
      await waitFor(() => {
        expect(mockSyncCompanionData).toHaveBeenCalledWith(
          'user123',
          expect.objectContaining({
            type: 'shadow',
            selectedAt: expect.any(String),
          })
        );
      });
    });

    it('should prefer Firebase data when both local and cloud have data', async () => {
      // Setup: Local has 'shadow', cloud has 'ember'
      mockLocalStorage['dark-productivity-companion-type'] = JSON.stringify('shadow');
      mockFetchCompanionData.mockResolvedValue({ type: 'ember' });

      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      // Wait for sync to complete
      await waitFor(() => {
        expect(result.current.companionType).toBe('ember');
      });

      // Should not sync to cloud since cloud is source of truth
      expect(mockSyncCompanionData).not.toHaveBeenCalled();
    });

    it('should handle invalid Firebase data gracefully', async () => {
      // Setup: Local has 'shadow', cloud has invalid data
      mockLocalStorage['dark-productivity-companion-type'] = JSON.stringify('shadow');
      mockFetchCompanionData.mockResolvedValue({ type: 'invalid-type' });

      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      // Should keep local data when cloud data is invalid
      await waitFor(() => {
        expect(result.current.companionType).toBe('shadow');
      });
    });
  });

  describe('Real-time Sync', () => {
    it('should subscribe to Firebase changes when authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      await waitFor(() => {
        expect(mockSubscribeToCompanionData).toHaveBeenCalledWith(
          'user123',
          expect.any(Function),
          expect.any(Function)
        );
      });
    });

    it('should update localStorage when Firebase data changes', async () => {
      let firebaseCallback: ((data: any) => void) | null = null;
      
      mockSubscribeToCompanionData.mockImplementation((userId, callback) => {
        firebaseCallback = callback;
        return () => {}; // unsubscribe function
      });

      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      // Wait for subscription to be set up
      await waitFor(() => {
        expect(firebaseCallback).not.toBeNull();
      });

      // Simulate Firebase update
      await act(async () => {
        firebaseCallback!({ type: 'forest' });
      });

      // Should update local state
      await waitFor(() => {
        expect(result.current.companionType).toBe('forest');
      });
    });

    it('should not update if Firebase data is same as local', async () => {
      let firebaseCallback: ((data: any) => void) | null = null;
      
      mockSubscribeToCompanionData.mockImplementation((userId, callback) => {
        firebaseCallback = callback;
        return () => {};
      });

      mockLocalStorage['dark-productivity-companion-type'] = JSON.stringify('shadow');
      mockFetchCompanionData.mockResolvedValue({ type: 'shadow' });

      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      await waitFor(() => {
        expect(firebaseCallback).not.toBeNull();
      });

      const initialType = result.current.companionType;

      // Simulate Firebase update with same data
      await act(async () => {
        firebaseCallback!({ type: 'shadow' });
      });

      // Should not trigger unnecessary updates
      expect(result.current.companionType).toBe(initialType);
    });

    it('should ignore invalid Firebase updates', async () => {
      let firebaseCallback: ((data: any) => void) | null = null;
      
      mockSubscribeToCompanionData.mockImplementation((userId, callback) => {
        firebaseCallback = callback;
        return () => {};
      });

      mockLocalStorage['dark-productivity-companion-type'] = JSON.stringify('shadow');

      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      await waitFor(() => {
        expect(firebaseCallback).not.toBeNull();
      });

      // Simulate invalid Firebase update
      await act(async () => {
        firebaseCallback!({ type: 'invalid-type' });
      });

      // Should keep existing valid data
      await waitFor(() => {
        expect(result.current.companionType).toBe('shadow');
      });
    });

    it('should unsubscribe when user logs out', async () => {
      const mockUnsubscribe = vi.fn();
      mockSubscribeToCompanionData.mockReturnValue(mockUnsubscribe);

      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      const { rerender } = renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      await waitFor(() => {
        expect(mockSubscribeToCompanionData).toHaveBeenCalled();
      });

      // Simulate logout
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      rerender();

      await waitFor(() => {
        expect(mockUnsubscribe).toHaveBeenCalled();
      });
    });
  });

  describe('Bidirectional Sync', () => {
    it('should sync to Firebase when local data changes', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

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

      expect(mockSyncCompanionData).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          type: 'forest',
          selectedAt: expect.any(String),
        })
      );
    });

    it('should update localStorage immediately even if Firebase sync fails', async () => {
      mockSyncCompanionData.mockRejectedValue(new Error('Network error'));

      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

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

      // Local state should be updated despite Firebase error
      expect(result.current.companionType).toBe('ember');
      expect(result.current.hasSelectedCompanion).toBe(true);
    });

    it('should handle concurrent updates correctly', async () => {
      let firebaseCallback: ((data: any) => void) | null = null;
      
      mockSubscribeToCompanionData.mockImplementation((userId, callback) => {
        firebaseCallback = callback;
        return () => {};
      });

      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      await waitFor(() => {
        expect(firebaseCallback).not.toBeNull();
      });

      // Simulate local update
      await act(async () => {
        await result.current.setCompanionType('shadow');
      });

      // Simulate Firebase update (from another device)
      await act(async () => {
        firebaseCallback!({ type: 'forest' });
      });

      // Firebase update should win (last write wins)
      await waitFor(() => {
        expect(result.current.companionType).toBe('forest');
      });
    });
  });

  describe('Cross-device Sync', () => {
    it('should sync companion selection across devices', async () => {
      let firebaseCallback: ((data: any) => void) | null = null;
      
      mockSubscribeToCompanionData.mockImplementation((userId, callback) => {
        firebaseCallback = callback;
        return () => {};
      });

      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      await waitFor(() => {
        expect(firebaseCallback).not.toBeNull();
      });

      // Simulate selection on Device A (via Firebase update)
      await act(async () => {
        firebaseCallback!({ type: 'ember', selectedAt: new Date().toISOString() });
      });

      // Device B should receive the update
      await waitFor(() => {
        expect(result.current.companionType).toBe('ember');
        expect(result.current.hasSelectedCompanion).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Firebase fetch errors gracefully', async () => {
      mockFetchCompanionData.mockRejectedValue(new Error('Network error'));
      mockLocalStorage['dark-productivity-companion-type'] = JSON.stringify('shadow');

      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      // Should fall back to local data
      await waitFor(() => {
        expect(result.current.companionType).toBe('shadow');
      });
    });

    it('should handle subscription errors gracefully', async () => {
      const mockErrorCallback = vi.fn();
      
      mockSubscribeToCompanionData.mockImplementation((userId, callback, onError) => {
        // Simulate subscription error
        setTimeout(() => onError?.(new Error('Subscription error')), 100);
        return () => {};
      });

      mockUseAuth.mockReturnValue({
        user: { id: 'user123', email: 'test@example.com' },
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }) => (
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        ),
      });

      // App should continue to function despite subscription error
      await act(async () => {
        await result.current.setCompanionType('forest');
      });

      expect(result.current.companionType).toBe('forest');
    });
  });
});
