import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cloudSyncService, CloudSyncError } from '../../services/cloudSyncService';
import * as firestore from 'firebase/firestore';
import { storageService } from '../../services/storageService';
import type { Note, Task } from '../../types';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _seconds: Date.now() / 1000 })),
  Timestamp: {
    fromDate: vi.fn((date: Date) => ({ toDate: () => date })),
  },
}));

vi.mock('../../services/firebaseService', () => ({
  db: {},
}));

vi.mock('../../services/storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
}));

describe('CloudSyncService', () => {
  const mockUserId = 'test-user-id';
  
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cloudSyncService.cleanup();
  });

  describe('syncNote', () => {
    it('should sync note to Firestore', async () => {
      vi.mocked(firestore.setDoc).mockResolvedValue();

      await cloudSyncService.syncNote(mockUserId, mockNote);

      expect(firestore.doc).toHaveBeenCalled();
      expect(firestore.setDoc).toHaveBeenCalled();
    });

    it('should handle sync errors', async () => {
      vi.mocked(firestore.setDoc).mockRejectedValue(new Error('Network error'));

      await expect(cloudSyncService.syncNote(mockUserId, mockNote)).rejects.toThrow();
    });
  });

  describe('syncTask', () => {
    it('should sync task to Firestore', async () => {
      vi.mocked(firestore.setDoc).mockResolvedValue();

      await cloudSyncService.syncTask(mockUserId, mockTask);

      expect(firestore.doc).toHaveBeenCalled();
      expect(firestore.setDoc).toHaveBeenCalled();
    });

    it('should handle completed task with timestamp', async () => {
      const completedTask = {
        ...mockTask,
        completed: true,
        completedAt: new Date('2024-01-03'),
      };

      vi.mocked(firestore.setDoc).mockResolvedValue();

      await cloudSyncService.syncTask(mockUserId, completedTask);

      expect(firestore.setDoc).toHaveBeenCalled();
    });
  });

  describe('fetchNotes', () => {
    it('should fetch notes from Firestore', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'note-1',
            data: () => ({
              title: 'Test Note',
              content: 'Test content',
              markdown: false,
              tags: ['test'],
              createdAt: { toDate: () => new Date('2024-01-01') },
              updatedAt: { toDate: () => new Date('2024-01-02') },
            }),
          },
        ],
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const notes = await cloudSyncService.fetchNotes(mockUserId);

      expect(notes).toHaveLength(1);
      expect(notes[0].title).toBe('Test Note');
    });

    it('should handle fetch errors', async () => {
      vi.mocked(firestore.getDocs).mockRejectedValue(new Error('Network error'));

      await expect(cloudSyncService.fetchNotes(mockUserId)).rejects.toThrow(CloudSyncError);
    });
  });

  describe('fetchTasks', () => {
    it('should fetch tasks from Firestore', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'task-1',
            data: () => ({
              title: 'Test Task',
              description: 'Test description',
              priority: 'high',
              completed: false,
              archived: false,
              tags: ['work'],
              createdAt: { toDate: () => new Date('2024-01-01') },
            }),
          },
        ],
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const tasks = await cloudSyncService.fetchTasks(mockUserId);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Test Task');
    });
  });

  describe('Real-time subscriptions', () => {
    it('should subscribe to note updates', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(firestore.onSnapshot).mockReturnValue(mockUnsubscribe);

      const unsubscribe = cloudSyncService.subscribeToNotes(mockUserId, callback);

      expect(firestore.onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should subscribe to task updates', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(firestore.onSnapshot).mockReturnValue(mockUnsubscribe);

      const unsubscribe = cloudSyncService.subscribeToTasks(mockUserId, callback);

      expect(firestore.onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle subscription errors', () => {
      const callback = vi.fn();
      const onError = vi.fn();

      vi.mocked(firestore.onSnapshot).mockImplementation((_ref, _onNext, onErr) => {
        // Simulate error
        if (onErr) {
          onErr(new Error('Subscription error') as any);
        }
        return vi.fn();
      });

      cloudSyncService.subscribeToNotes(mockUserId, callback, onError);

      expect(onError).toHaveBeenCalled();
    });

    it('should unsubscribe from all listeners', () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(firestore.onSnapshot).mockReturnValue(mockUnsubscribe);

      cloudSyncService.subscribeToNotes(mockUserId, vi.fn());
      cloudSyncService.subscribeToTasks(mockUserId, vi.fn());

      cloudSyncService.unsubscribeAll();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
    });
  });

  describe('Offline queue', () => {
    it('should queue note for sync when offline', () => {
      vi.mocked(storageService.get).mockReturnValue([]);

      cloudSyncService.queueNoteSync(mockNote, 'create');

      expect(storageService.set).toHaveBeenCalled();
    });

    it('should queue task for sync when offline', () => {
      vi.mocked(storageService.get).mockReturnValue([]);

      cloudSyncService.queueTaskSync(mockTask, 'update');

      expect(storageService.set).toHaveBeenCalled();
    });

    it('should get sync queue', () => {
      const mockQueue = [
        {
          id: 'queue-1',
          type: 'note',
          action: 'create',
          data: mockNote,
          timestamp: new Date(),
        },
      ];

      vi.mocked(storageService.get).mockReturnValue(mockQueue);

      const queue = cloudSyncService.getSyncQueue();

      expect(queue).toEqual(mockQueue);
    });
  });

  describe('processSyncQueue', () => {
    it('should process queued items when online', async () => {
      const mockQueue = [
        {
          id: 'queue-1',
          type: 'note',
          action: 'create',
          data: mockNote,
          timestamp: new Date(),
        },
      ];

      vi.mocked(storageService.get).mockReturnValue(mockQueue);
      vi.mocked(firestore.setDoc).mockResolvedValue();

      await cloudSyncService.processSyncQueue(mockUserId);

      expect(firestore.setDoc).toHaveBeenCalled();
    });

    it('should handle failed items and retry', async () => {
      const mockQueue = [
        {
          id: 'queue-1',
          type: 'note',
          action: 'create',
          data: mockNote,
          timestamp: new Date(),
        },
      ];

      vi.mocked(storageService.get).mockReturnValue(mockQueue);
      vi.mocked(firestore.setDoc).mockRejectedValue(new Error('Network error'));

      await cloudSyncService.processSyncQueue(mockUserId);

      // Failed items should remain in queue
      expect(storageService.set).toHaveBeenCalled();
    });

    it('should not process queue when offline', async () => {
      // Simulate offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      await cloudSyncService.processSyncQueue(mockUserId);

      expect(firestore.setDoc).not.toHaveBeenCalled();
    });
  });

  describe('Conflict resolution', () => {
    it('should resolve conflict using last-write-wins', async () => {
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

      const resolved = await cloudSyncService.resolveConflict(localNote, remoteNote);

      expect(resolved.content).toBe('Local content');
      expect(resolved.updatedAt).toEqual(localNote.updatedAt);
    });

    it('should prefer remote when local has no timestamp', async () => {
      const localNote = { ...mockNote, updatedAt: undefined as any };
      const remoteNote = { ...mockNote, updatedAt: new Date('2024-01-02') };

      const resolved = await cloudSyncService.resolveConflict(localNote as Note, remoteNote);

      expect(resolved).toEqual(remoteNote);
    });
  });

  describe('Connection status', () => {
    it('should detect online status', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      expect(cloudSyncService.isConnected()).toBe(true);
    });

    it('should detect offline status', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      // Trigger offline event
      window.dispatchEvent(new Event('offline'));

      expect(cloudSyncService.isConnected()).toBe(false);
    });
  });

  describe('Settings sync', () => {
    it('should sync settings to Firestore', async () => {
      const mockSettings = {
        theme: 'dark',
        audioEnabled: true,
      };

      vi.mocked(firestore.setDoc).mockResolvedValue();

      await cloudSyncService.syncSettings(mockUserId, mockSettings);

      expect(firestore.setDoc).toHaveBeenCalled();
    });

    it('should fetch settings from Firestore', async () => {
      const mockSnapshot = {
        empty: false,
        docs: [
          {
            id: 'preferences',
            data: () => ({
              theme: 'dark',
              audioEnabled: true,
            }),
          },
        ],
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const settings = await cloudSyncService.fetchSettings(mockUserId);

      expect(settings).toEqual({
        theme: 'dark',
        audioEnabled: true,
      });
    });
  });
});
