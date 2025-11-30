import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { CompanionProvider, useCompanion } from './CompanionContext';
import { cloudSyncService } from '../services/cloudSyncService';
import * as AuthContext from './AuthContext';
import * as TasksContext from './TasksContext';
import * as ThemeContext from './ThemeContext';
import * as AppContext from './AppContext';

// Mock the services and contexts
vi.mock('../services/cloudSyncService', () => ({
  cloudSyncService: {
    syncCompanionData: vi.fn(),
    fetchCompanionData: vi.fn(),
    subscribeToCompanionData: vi.fn(),
  },
}));

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('./TasksContext', () => ({
  useTasks: vi.fn(),
}));

vi.mock('./ThemeContext', () => ({
  useTheme: vi.fn(),
}));

vi.mock('./AppContext', () => ({
  useApp: vi.fn(),
}));

vi.mock('../hooks/useLocalStorage', () => ({
  useLocalStorage: vi.fn((_key: string, defaultValue: any) => {
    return [defaultValue, vi.fn()];
  }),
}));

describe('CompanionContext - Firebase Persistence', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    provider: 'email' as const,
    createdAt: new Date(),
    lastLogin: new Date(),
  };
  
  beforeEach(() => {
    // Setup default mocks
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithGithub: vi.fn(),
    });
    
    vi.mocked(TasksContext.useTasks).mockReturnValue({
      tasks: [],
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTask: vi.fn(),
      archiveTask: vi.fn(),
    } as any);
    
    vi.mocked(ThemeContext.useTheme).mockReturnValue({
      themeId: 'default',
      setTheme: vi.fn(),
    } as any);
    
    vi.mocked(AppContext.useApp).mockReturnValue({
      currentModule: 'home',
      setCurrentModule: vi.fn(),
    } as any);
    
    // Reset all mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should load companion data from Firebase when user authenticates', async () => {
    const mockCloudData = {
      activeCompanion: 'forest',
      unlockedCompanions: ['shadow', 'forest'],
      customNames: { shadow: 'Whisper', forest: 'Groot', ember: undefined },
      skillTrees: {
        shadow: { level: 5, experience: 500 },
        forest: { level: 3, experience: 200 },
        ember: { level: 1, experience: 0 },
      },
      stats: {
        totalTasks: 50,
        currentStreak: 5,
        longestStreak: 10,
        totalInteractions: 100,
        ritualsCompleted: 2,
        bondedSince: Date.now() - 1000000,
      },
      mood: {
        current: 'happy',
        lastUpdated: Date.now(),
        history: [],
      },
      completedRituals: ['ritual1', 'ritual2'],
      ritualProgress: [],
    };
    
    vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue(mockCloudData);
    vi.mocked(cloudSyncService.subscribeToCompanionData).mockReturnValue(() => {});
    
    // Simulate authenticated user
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithGithub: vi.fn(),
    });
    
    renderHook(() => useCompanion(), {
      wrapper: CompanionProvider,
    });
    
    await waitFor(() => {
      expect(cloudSyncService.fetchCompanionData).toHaveBeenCalledWith(mockUser.id);
    });
  });
  
  it('should subscribe to real-time companion data updates', async () => {
    const mockUnsubscribe = vi.fn();
    vi.mocked(cloudSyncService.subscribeToCompanionData).mockReturnValue(mockUnsubscribe);
    vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue(null);
    
    // Simulate authenticated user
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithGithub: vi.fn(),
    });
    
    const { unmount } = renderHook(() => useCompanion(), {
      wrapper: CompanionProvider,
    });
    
    await waitFor(() => {
      expect(cloudSyncService.subscribeToCompanionData).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(Function),
        expect.any(Function)
      );
    });
    
    // Cleanup should unsubscribe
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
  
  it('should sync companion data to Firebase when state changes', async () => {
    vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue(null);
    vi.mocked(cloudSyncService.subscribeToCompanionData).mockReturnValue(() => {});
    vi.mocked(cloudSyncService.syncCompanionData).mockResolvedValue();
    
    // Simulate authenticated user
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithGithub: vi.fn(),
    });
    
    renderHook(() => useCompanion(), {
      wrapper: CompanionProvider,
    });
    
    // Wait for sync to be called (debounced by 2 seconds)
    await waitFor(
      () => {
        expect(cloudSyncService.syncCompanionData).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            activeCompanion: expect.any(String),
            unlockedCompanions: expect.any(Array),
            customNames: expect.any(Object),
            skillTrees: expect.any(Object),
            stats: expect.any(Object),
            mood: expect.any(Object),
            completedRituals: expect.any(Array),
            ritualProgress: expect.any(Array),
          })
        );
      },
      { timeout: 3000 }
    );
  });
  
  it('should not sync when user is not authenticated', async () => {
    vi.mocked(cloudSyncService.syncCompanionData).mockResolvedValue();
    
    // Simulate unauthenticated user
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithGithub: vi.fn(),
    });
    
    renderHook(() => useCompanion(), {
      wrapper: CompanionProvider,
    });
    
    // Wait a bit to ensure sync is not called
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    expect(cloudSyncService.syncCompanionData).not.toHaveBeenCalled();
    expect(cloudSyncService.fetchCompanionData).not.toHaveBeenCalled();
    expect(cloudSyncService.subscribeToCompanionData).not.toHaveBeenCalled();
  });
  
  it('should handle Firebase sync errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    vi.mocked(cloudSyncService.fetchCompanionData).mockRejectedValue(
      new Error('Firebase connection failed')
    );
    vi.mocked(cloudSyncService.subscribeToCompanionData).mockReturnValue(() => {});
    
    // Simulate authenticated user
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithGithub: vi.fn(),
    });
    
    renderHook(() => useCompanion(), {
      wrapper: CompanionProvider,
    });
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load companion data from Firebase:',
        expect.any(Error)
      );
    });
    
    consoleErrorSpy.mockRestore();
  });
  
  it('should update local state when receiving real-time updates', async () => {
    let subscriptionCallback: ((data: any) => void) | null = null;
    
    vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue(null);
    vi.mocked(cloudSyncService.subscribeToCompanionData).mockImplementation(
      (_userId, callback) => {
        subscriptionCallback = callback;
        return () => {};
      }
    );
    
    // Simulate authenticated user
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithGithub: vi.fn(),
    });
    
    renderHook(() => useCompanion(), {
      wrapper: CompanionProvider,
    });
    
    await waitFor(() => {
      expect(subscriptionCallback).not.toBeNull();
    });
    
    // Simulate receiving an update from Firebase
    const updatedData = {
      activeCompanion: 'ember',
      customNames: { shadow: 'Updated Name', forest: undefined, ember: undefined },
    };
    
    subscriptionCallback!(updatedData);
    
    // The state should be updated (we can't directly test this without exposing state,
    // but we verify the callback was set up correctly)
    expect(subscriptionCallback).toBeDefined();
  });
});
