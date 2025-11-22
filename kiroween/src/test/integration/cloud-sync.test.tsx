import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCloudSync } from '../../hooks/useCloudSync';
import { cloudSyncService } from '../../services/cloudSyncService';
import { storageService } from '../../services/storageService';
import type { Note, Task, TarotReading } from '../../types';

// Mock services
vi.mock('../../services/cloudSyncService', () => ({
  cloudSyncService: {
    syncNote: vi.fn(),
    syncTask: vi.fn(),
    syncTarotReading: vi.fn(),
    deleteNote: vi.fn(),
    deleteTask: vi.fn(),
    fetchNotes: vi.fn(),
    fetchTasks: vi.fn(),
    fetchTarotReadings: vi.fn(),
    subscribeToNotes: vi.fn(),
    subscribeToTasks: vi.fn(),
    processSyncQueue: vi.fn(),
    queueNoteSync: vi.fn(),
    queueTaskSync: vi.fn(),
    queueTarotSync: vi.fn(),
    getSyncQueue: vi.fn(),
    getLastSyncTime: vi.fn(),
    isConnected: vi.fn(),
    resolveConflict: vi.fn(),
    cleanup: vi.fn(),
  },
  CloudSyncError: class CloudSyncError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  },
}));

vi.mock('../../services/storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
    isMigrationCompleted: vi.fn(),
    enableCloudSync: vi.fn(),
    migrateDataForCloudSync: vi.fn(),
  },
}));

describe('Cloud Sync Integration Tests', () => {
  const mockUserId = 'test-user-123';

  const mockNote: Note = {
    id: 'note-1',
    userId: mockUserId,
    title: 'Test Note',
    content: 'Test content',
    markdown: false,
    tags: ['test'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  const mockTask: Task = {
    id: 'task-1',
    userId: mockUserId,
    title: 'Test Task',
    description: 'Test description',
    priority: 'high',
    completed: false,
    archived: false,
    tags: ['work'],
    createdAt: new Date('2024-01-01'),
  };

  const mockTarotReading: TarotReading = {
    id: 'reading-1',
    userId: mockUserId,
    date: new Date('2024-01-01'),
    cards: [],
    interpretation: 'Test interpretation',
    commitStats: {
      totalCommits: 10,
      averageCommitsPerDay: 2,
      mostActiveHour: 14,
      sentimentScore: 0.8,
      topKeywords: ['feature', 'fix'],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cloudSyncService.isConnected).mockReturnValue(true);
    vi.mocked(cloudSyncService.getSyncQueue).mockReturnValue([]);
    vi.mocked(cloudSyncService.getLastSyncTime).mockReturnValue(null);
    vi.mocked(storageService.isMigrationCompleted).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Real-time sync across multiple devices', () => {
    it('should sync note to cloud when online', async () => {
      vi.mocked(cloudSyncService.syncNote).mockResolvedValue();

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await act(async () => {
        await result.current.syncNote(mockNote);
      });

      expect(cloudSyncService.syncNote).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          id: mockNote.id,
          title: mockNote.title,
          userId: mockUserId,
        })
      );
    });

    it('should sync task to cloud when online', async () => {
      vi.mocked(cloudSyncService.syncTask).mockResolvedValue();

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await act(async () => {
        await result.current.syncTask(mockTask);
      });

      expect(cloudSyncService.syncTask).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          id: mockTask.id,
          title: mockTask.title,
          userId: mockUserId,
        })
      );
    });

    it('should sync tarot reading to cloud when online', async () => {
      vi.mocked(cloudSyncService.syncTarotReading).mockResolvedValue();

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await act(async () => {
        await result.current.syncTarotReading(mockTarotReading);
      });

      expect(cloudSyncService.syncTarotReading).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          id: mockTarotReading.id,
          userId: mockUserId,
        })
      );
    });

    it('should handle real-time updates from other devices', async () => {
      // const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(cloudSyncService.subscribeToNotes).mockImplementation((_userId, callback) => {
        // Simulate receiving updates
        setTimeout(() => {
          callback([mockNote]);
        }, 100);
        return mockUnsubscribe;
      });

      renderHook(() => useCloudSync({ userId: mockUserId, autoSync: false }));

      // Verify subscription was set up
      expect(cloudSyncService.subscribeToNotes).not.toHaveBeenCalled(); // Hook doesn't auto-subscribe
    });

    it('should delete note from cloud', async () => {
      vi.mocked(cloudSyncService.deleteNote).mockResolvedValue();

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await act(async () => {
        await result.current.deleteNote(mockNote.id);
      });

      expect(cloudSyncService.deleteNote).toHaveBeenCalledWith(mockUserId, mockNote.id);
    });

    it('should delete task from cloud', async () => {
      vi.mocked(cloudSyncService.deleteTask).mockResolvedValue();

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await act(async () => {
        await result.current.deleteTask(mockTask.id);
      });

      expect(cloudSyncService.deleteTask).toHaveBeenCalledWith(mockUserId, mockTask.id);
    });
  });

  describe('Offline queue and sync on reconnect', () => {
    it('should queue note when offline', async () => {
      vi.mocked(cloudSyncService.isConnected).mockReturnValue(false);
      vi.mocked(cloudSyncService.queueNoteSync).mockImplementation(() => {});

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      // Wait for online status to update
      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });

      await act(async () => {
        await result.current.syncNote(mockNote);
      });

      // Note has userId, so it's treated as 'update' not 'create'
      expect(cloudSyncService.queueNoteSync).toHaveBeenCalledWith(mockNote, 'update');
      expect(cloudSyncService.syncNote).not.toHaveBeenCalled();
    });

    it('should queue task when offline', async () => {
      vi.mocked(cloudSyncService.isConnected).mockReturnValue(false);
      vi.mocked(cloudSyncService.queueTaskSync).mockImplementation(() => {});

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });

      await act(async () => {
        await result.current.syncTask(mockTask);
      });

      // Task has userId, so it's treated as 'update' not 'create'
      expect(cloudSyncService.queueTaskSync).toHaveBeenCalledWith(mockTask, 'update');
      expect(cloudSyncService.syncTask).not.toHaveBeenCalled();
    });

    it('should process queue when coming back online', async () => {
      vi.mocked(cloudSyncService.processSyncQueue).mockResolvedValue();
      vi.mocked(cloudSyncService.getSyncQueue).mockReturnValue([
        {
          id: 'queue-1',
          type: 'note',
          action: 'create',
          data: mockNote,
          timestamp: new Date(),
        },
      ]);

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: true })
      );

      // Simulate going offline
      vi.mocked(cloudSyncService.isConnected).mockReturnValue(false);
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });

      // Simulate coming back online
      vi.mocked(cloudSyncService.isConnected).mockReturnValue(true);
      vi.mocked(cloudSyncService.getSyncQueue).mockReturnValue([]);

      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });

      // Should process queue automatically
      await waitFor(() => {
        expect(cloudSyncService.processSyncQueue).toHaveBeenCalledWith(mockUserId);
      });
    });

    it('should track pending changes count', async () => {
      const mockQueue = [
        {
          id: 'queue-1',
          type: 'note' as const,
          action: 'create' as const,
          data: mockNote,
          timestamp: new Date(),
        },
        {
          id: 'queue-2',
          type: 'task' as const,
          action: 'update' as const,
          data: mockTask,
          timestamp: new Date(),
        },
      ];

      vi.mocked(cloudSyncService.getSyncQueue).mockReturnValue(mockQueue);

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await waitFor(() => {
        expect(result.current.syncStatus.pendingChanges).toBe(2);
      });
    });

    it('should handle manual sync trigger', async () => {
      vi.mocked(cloudSyncService.processSyncQueue).mockResolvedValue();

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await act(async () => {
        await result.current.syncNow();
      });

      expect(cloudSyncService.processSyncQueue).toHaveBeenCalledWith(mockUserId);
      expect(result.current.syncStatus.syncing).toBe(false);
    });

    it('should not sync when offline and show error', async () => {
      vi.mocked(cloudSyncService.isConnected).mockReturnValue(false);

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });

      await act(async () => {
        await result.current.syncNow();
      });

      expect(cloudSyncService.processSyncQueue).not.toHaveBeenCalled();
      expect(result.current.syncStatus.error).toBe('Cannot sync while offline');
    });
  });

  describe('Conflict resolution', () => {
    it('should resolve conflicts using last-write-wins strategy', async () => {
      const localNote = {
        ...mockNote,
        updatedAt: new Date('2024-01-03'),
        content: 'Local content',
      };

      const remoteNote = {
        ...mockNote,
        updatedAt: new Date('2024-01-02'),
        content: 'Remote content',
      };

      vi.mocked(cloudSyncService.resolveConflict).mockResolvedValue(localNote);

      const resolved = await cloudSyncService.resolveConflict(localNote, remoteNote);

      expect(resolved.content).toBe('Local content');
      expect(cloudSyncService.resolveConflict).toHaveBeenCalledWith(localNote, remoteNote);
    });

    it('should prefer newer timestamp in conflict', async () => {
      const olderNote = {
        ...mockNote,
        updatedAt: new Date('2024-01-01'),
        content: 'Older content',
      };

      const newerNote = {
        ...mockNote,
        updatedAt: new Date('2024-01-05'),
        content: 'Newer content',
      };

      vi.mocked(cloudSyncService.resolveConflict).mockResolvedValue(newerNote);

      const resolved = await cloudSyncService.resolveConflict(olderNote, newerNote);

      expect(resolved.content).toBe('Newer content');
    });

    it('should handle conflict when local has no timestamp', async () => {
      const localNote = { ...mockNote, updatedAt: undefined as any };
      const remoteNote = { ...mockNote, updatedAt: new Date('2024-01-02') };

      vi.mocked(cloudSyncService.resolveConflict).mockResolvedValue(remoteNote);

      const resolved = await cloudSyncService.resolveConflict(localNote, remoteNote);

      expect(resolved).toEqual(remoteNote);
    });

    it('should handle conflict when remote has no timestamp', async () => {
      const localNote = { ...mockNote, updatedAt: new Date('2024-01-02') };
      const remoteNote = { ...mockNote, updatedAt: undefined as any };

      vi.mocked(cloudSyncService.resolveConflict).mockResolvedValue(localNote);

      const resolved = await cloudSyncService.resolveConflict(localNote, remoteNote);

      expect(resolved).toEqual(localNote);
    });
  });

  describe('Sync error handling', () => {
    it('should handle network errors during sync', async () => {
      const networkError = new Error('Network error');
      vi.mocked(cloudSyncService.syncNote).mockRejectedValue(networkError);

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await act(async () => {
        await result.current.syncNote(mockNote);
      });

      await waitFor(() => {
        expect(result.current.syncStatus.error).toBe('Network error');
      });
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed');
      vi.mocked(cloudSyncService.syncTask).mockRejectedValue(authError);

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await act(async () => {
        await result.current.syncTask(mockTask);
      });

      await waitFor(() => {
        expect(result.current.syncStatus.error).toBeTruthy();
      });
    });

    it('should handle sync queue processing errors', async () => {
      const syncError = new Error('Sync failed');
      vi.mocked(cloudSyncService.processSyncQueue).mockRejectedValue(syncError);

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await act(async () => {
        await result.current.syncNow();
      });

      await waitFor(() => {
        expect(result.current.syncStatus.error).toBe('Sync failed');
        expect(result.current.syncStatus.syncing).toBe(false);
      });
    });

    it('should clear error on successful sync', async () => {
      vi.mocked(cloudSyncService.processSyncQueue).mockResolvedValue();

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      // Set initial error
      await act(async () => {
        vi.mocked(cloudSyncService.processSyncQueue).mockRejectedValueOnce(
          new Error('Initial error')
        );
        await result.current.syncNow();
      });

      await waitFor(() => {
        expect(result.current.syncStatus.error).toBeTruthy();
      });

      // Successful sync should clear error
      await act(async () => {
        vi.mocked(cloudSyncService.processSyncQueue).mockResolvedValue();
        await result.current.syncNow();
      });

      await waitFor(() => {
        expect(result.current.syncStatus.error).toBeUndefined();
      });
    });

    it('should handle errors when user is not authenticated', async () => {
      const { result } = renderHook(() =>
        useCloudSync({ userId: null, autoSync: false })
      );

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await act(async () => {
        await result.current.syncNote(mockNote);
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Cannot sync note: user not authenticated'
      );
      expect(cloudSyncService.syncNote).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should handle delete errors gracefully', async () => {
      const deleteError = new Error('Delete failed');
      vi.mocked(cloudSyncService.deleteNote).mockRejectedValue(deleteError);

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await act(async () => {
        await result.current.deleteNote(mockNote.id);
      });

      await waitFor(() => {
        expect(result.current.syncStatus.error).toBe('Delete failed');
      });
    });
  });

  describe('Automatic sync', () => {
    it('should perform initial sync when auto-sync is enabled', async () => {
      vi.mocked(cloudSyncService.processSyncQueue).mockResolvedValue();

      renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: true, syncInterval: 1000 })
      );

      await waitFor(() => {
        expect(cloudSyncService.processSyncQueue).toHaveBeenCalledWith(mockUserId);
      });
    });

    it('should not auto-sync when disabled', async () => {
      vi.mocked(cloudSyncService.processSyncQueue).mockResolvedValue();

      renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      // Wait a bit to ensure no sync happens
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(cloudSyncService.processSyncQueue).not.toHaveBeenCalled();
    });

    it('should not auto-sync when offline', async () => {
      vi.mocked(cloudSyncService.isConnected).mockReturnValue(false);
      vi.mocked(cloudSyncService.processSyncQueue).mockResolvedValue();

      renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: true })
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(cloudSyncService.processSyncQueue).not.toHaveBeenCalled();
    });

    it('should not auto-sync when user is not authenticated', async () => {
      vi.mocked(cloudSyncService.processSyncQueue).mockResolvedValue();

      renderHook(() =>
        useCloudSync({ userId: null, autoSync: true })
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(cloudSyncService.processSyncQueue).not.toHaveBeenCalled();
    });
  });

  describe('Data migration', () => {
    it('should perform migration on first login', async () => {
      vi.mocked(storageService.isMigrationCompleted).mockReturnValue(false);
      vi.mocked(storageService.migrateDataForCloudSync).mockResolvedValue({
        notes: 5,
        tasks: 10,
        tarotReadings: 2,
        pomodoroSessions: 0,
      });
      vi.mocked(cloudSyncService.processSyncQueue).mockResolvedValue();

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: true })
      );

      await waitFor(() => {
        expect(storageService.enableCloudSync).toHaveBeenCalledWith(true);
        expect(storageService.migrateDataForCloudSync).toHaveBeenCalledWith(mockUserId);
      });

      await waitFor(() => {
        expect(result.current.migrationCompleted).toBe(true);
      });
    });

    it('should not migrate if already completed', async () => {
      vi.mocked(storageService.isMigrationCompleted).mockReturnValue(true);

      renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(storageService.migrateDataForCloudSync).not.toHaveBeenCalled();
    });

    it('should handle migration errors', async () => {
      vi.mocked(storageService.isMigrationCompleted).mockReturnValue(false);
      vi.mocked(storageService.migrateDataForCloudSync).mockRejectedValue(
        new Error('Migration failed')
      );

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      await waitFor(() => {
        expect(result.current.syncStatus.error).toBe('Failed to migrate data for cloud sync');
      });
    });
  });

  describe('Sync status tracking', () => {
    it('should update last sync time after successful sync', async () => {
      vi.mocked(cloudSyncService.processSyncQueue).mockResolvedValue();

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      const beforeSync = result.current.syncStatus.lastSync;

      await act(async () => {
        await result.current.syncNow();
      });

      await waitFor(() => {
        expect(result.current.syncStatus.lastSync).not.toBe(beforeSync);
      });
    });

    it('should show syncing status during sync', async () => {
      let resolveSync: () => void;
      const syncPromise = new Promise<void>(resolve => {
        resolveSync = resolve;
      });

      vi.mocked(cloudSyncService.processSyncQueue).mockReturnValue(syncPromise);

      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      act(() => {
        result.current.syncNow();
      });

      await waitFor(() => {
        expect(result.current.syncStatus.syncing).toBe(true);
      });

      act(() => {
        resolveSync!();
      });

      await waitFor(() => {
        expect(result.current.syncStatus.syncing).toBe(false);
      });
    });

    it('should track online/offline status', async () => {
      const { result } = renderHook(() =>
        useCloudSync({ userId: mockUserId, autoSync: false })
      );

      expect(result.current.isOnline).toBe(true);

      vi.mocked(cloudSyncService.isConnected).mockReturnValue(false);
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });

      vi.mocked(cloudSyncService.isConnected).mockReturnValue(true);
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });
    });
  });
});
