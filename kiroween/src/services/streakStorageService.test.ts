/**
 * Tests for StreakStorageService
 * Validates localStorage read/write, Firebase sync, and conflict resolution
 * Requirements: Task 1.3 - Streak Storage Service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { streakStorageService, StreakStorageError } from './streakStorageService';
import { storageService } from './storageService';
import { cloudSyncService } from './cloudSyncService';
import type { StreakData } from '../types/streak';

// Mock the storage service
vi.mock('./storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock the cloud sync service
vi.mock('./cloudSyncService', () => ({
  cloudSyncService: {
    fetchCompanionData: vi.fn(),
    syncCompanionData: vi.fn(),
  },
}));

describe('StreakStorageService - localStorage read/write', () => {
  const mockStreakData: StreakData = {
    loginStreak: {
      current: 5,
      longest: 10,
      lastActivityDate: '2024-01-15',
      startDate: '2024-01-10',
    },
    taskStreak: {
      current: 3,
      longest: 7,
      lastActivityDate: '2024-01-15',
      customGoal: 3,
      startDate: '2024-01-12',
    },
    noteStreak: {
      current: 2,
      longest: 5,
      lastActivityDate: '2024-01-15',
      startDate: '2024-01-13',
    },
    focusStreak: {
      current: 4,
      longest: 8,
      lastActivityDate: '2024-01-15',
      minimumMinutes: 25,
      startDate: '2024-01-11',
    },
    tokens: {
      available: 2,
      earned: 3,
      used: 1,
    },
    milestones: {
      3: { achieved: true, date: '2024-01-13', rewardClaimed: true },
      7: { achieved: false, rewardClaimed: false },
    },
    activityHistory: {
      '2024-01-15': {
        tasks: 5,
        notes: 2,
        focusMinutes: 50,
        login: true,
      },
      '2024-01-14': {
        tasks: 3,
        notes: 1,
        focusMinutes: 25,
        login: true,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    streakStorageService.cleanup();
  });

  describe('localStorage read operations', () => {
    it('should read streak data from localStorage', async () => {
      // Arrange
      vi.mocked(storageService.get).mockReturnValue(mockStreakData);

      // Act
      const result = await streakStorageService.loadStreakData();

      // Assert
      expect(storageService.get).toHaveBeenCalledWith('streak_data');
      expect(result).toEqual(mockStreakData);
    });

    it('should return null when no data exists in localStorage', async () => {
      // Arrange
      vi.mocked(storageService.get).mockReturnValue(null);

      // Act
      const result = await streakStorageService.loadStreakData();

      // Assert
      expect(storageService.get).toHaveBeenCalledWith('streak_data');
      expect(result).toBeNull();
    });

    it('should return null when localStorage data is invalid', async () => {
      // Arrange
      const invalidData = { invalid: 'data' };
      vi.mocked(storageService.get).mockReturnValue(invalidData);

      // Act
      const result = await streakStorageService.loadStreakData();

      // Assert
      expect(result).toBeNull();
    });

    it('should handle localStorage read errors gracefully', async () => {
      // Arrange
      vi.mocked(storageService.get).mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Act
      const result = await streakStorageService.loadStreakData();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('localStorage write operations', () => {
    it('should write streak data to localStorage', () => {
      // Arrange
      vi.mocked(storageService.set).mockImplementation(() => {});

      // Act
      streakStorageService.saveStreakData(mockStreakData);

      // Assert
      expect(storageService.set).toHaveBeenCalledWith('streak_data', mockStreakData);
    });

    it('should throw error when writing invalid data', () => {
      // Arrange
      const invalidData = { invalid: 'data' } as any;

      // Act & Assert
      expect(() => {
        streakStorageService.saveStreakData(invalidData);
      }).toThrow(StreakStorageError);
    });

    it('should handle localStorage write errors', () => {
      // Arrange
      vi.mocked(storageService.set).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Act & Assert
      expect(() => {
        streakStorageService.saveStreakData(mockStreakData);
      }).toThrow(StreakStorageError);
    });

    it('should save data immediately to localStorage without debounce', () => {
      // Arrange
      vi.mocked(storageService.set).mockImplementation(() => {});

      // Act
      streakStorageService.saveStreakData(mockStreakData);

      // Assert - should be called immediately
      expect(storageService.set).toHaveBeenCalledTimes(1);
      expect(storageService.set).toHaveBeenCalledWith('streak_data', mockStreakData);
    });
  });

  describe('data validation', () => {
    it('should validate complete streak data structure', () => {
      // Act
      streakStorageService.saveStreakData(mockStreakData);

      // Assert - should not throw
      expect(storageService.set).toHaveBeenCalled();
    });

    it('should reject data missing required streak properties', () => {
      // Arrange
      const incompleteData = {
        loginStreak: { current: 5 }, // missing required properties
        taskStreak: mockStreakData.taskStreak,
        noteStreak: mockStreakData.noteStreak,
        focusStreak: mockStreakData.focusStreak,
        tokens: mockStreakData.tokens,
        milestones: mockStreakData.milestones,
        activityHistory: mockStreakData.activityHistory,
      } as any;

      // Act & Assert
      expect(() => {
        streakStorageService.saveStreakData(incompleteData);
      }).toThrow(StreakStorageError);
    });

    it('should reject data missing tokens object', () => {
      // Arrange
      const dataWithoutTokens = {
        ...mockStreakData,
        tokens: undefined,
      } as any;

      // Act & Assert
      expect(() => {
        streakStorageService.saveStreakData(dataWithoutTokens);
      }).toThrow(StreakStorageError);
    });
  });

  describe('clear operations', () => {
    it('should clear streak data from localStorage', () => {
      // Arrange
      vi.mocked(storageService.remove).mockImplementation(() => {});

      // Act
      streakStorageService.clearStreakData();

      // Assert
      expect(storageService.remove).toHaveBeenCalledWith('streak_data');
      expect(storageService.remove).toHaveBeenCalledWith('streak_sync_queue');
    });
  });

  describe('integration with localStorage', () => {
    it('should perform complete read-write cycle', async () => {
      // Arrange
      let storedData: StreakData | null = null;
      vi.mocked(storageService.set).mockImplementation((_key, value) => {
        storedData = value as StreakData;
      });
      vi.mocked(storageService.get).mockImplementation(() => storedData);

      // Act - Write
      streakStorageService.saveStreakData(mockStreakData);

      // Act - Read
      const result = await streakStorageService.loadStreakData();

      // Assert
      expect(result).toEqual(mockStreakData);
      expect(storageService.set).toHaveBeenCalledWith('streak_data', mockStreakData);
      expect(storageService.get).toHaveBeenCalledWith('streak_data');
    });
  });
});

describe('StreakStorageService - Firebase sync', () => {
  const mockStreakData: StreakData = {
    loginStreak: {
      current: 5,
      longest: 10,
      lastActivityDate: '2024-01-15',
      startDate: '2024-01-10',
    },
    taskStreak: {
      current: 3,
      longest: 7,
      lastActivityDate: '2024-01-15',
      customGoal: 3,
      startDate: '2024-01-12',
    },
    noteStreak: {
      current: 2,
      longest: 5,
      lastActivityDate: '2024-01-15',
      startDate: '2024-01-13',
    },
    focusStreak: {
      current: 4,
      longest: 8,
      lastActivityDate: '2024-01-15',
      minimumMinutes: 25,
      startDate: '2024-01-11',
    },
    tokens: {
      available: 2,
      earned: 3,
      used: 1,
    },
    milestones: {
      3: { achieved: true, date: '2024-01-13', rewardClaimed: true },
      7: { achieved: false, rewardClaimed: false },
    },
    activityHistory: {
      '2024-01-15': {
        tasks: 5,
        notes: 2,
        focusMinutes: 50,
        login: true,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    streakStorageService.cleanup();
  });

  describe('Firebase sync operations', () => {
    it('should sync streak data to Firebase when online', async () => {
      // Arrange
      const userId = 'user123';
      vi.mocked(storageService.set).mockImplementation(() => {});
      vi.mocked(cloudSyncService.syncCompanionData).mockResolvedValue(undefined);

      // Act
      streakStorageService.saveStreakData(mockStreakData, userId);
      
      // Fast-forward past debounce delay
      await vi.advanceTimersByTimeAsync(5000);

      // Assert
      expect(cloudSyncService.syncCompanionData).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          streakData: mockStreakData,
        })
      );
    });

    it('should debounce Firebase sync calls', async () => {
      // Arrange
      const userId = 'user123';
      vi.mocked(storageService.set).mockImplementation(() => {});
      vi.mocked(cloudSyncService.syncCompanionData).mockResolvedValue(undefined);

      // Act - Multiple rapid saves
      streakStorageService.saveStreakData(mockStreakData, userId);
      await vi.advanceTimersByTimeAsync(1000);
      streakStorageService.saveStreakData(mockStreakData, userId);
      await vi.advanceTimersByTimeAsync(1000);
      streakStorageService.saveStreakData(mockStreakData, userId);
      
      // Fast-forward past debounce delay
      await vi.advanceTimersByTimeAsync(5000);

      // Assert - Should only sync once after debounce
      expect(cloudSyncService.syncCompanionData).toHaveBeenCalledTimes(1);
    });

    it('should load streak data from Firebase when online', async () => {
      // Arrange
      const userId = 'user123';
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue({
        streakData: mockStreakData,
      });
      vi.mocked(storageService.set).mockImplementation(() => {});

      // Act
      const result = await streakStorageService.loadStreakData(userId);

      // Assert
      expect(cloudSyncService.fetchCompanionData).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockStreakData);
      expect(storageService.set).toHaveBeenCalledWith('streak_data', mockStreakData);
    });

    it('should fall back to localStorage when Firebase fetch fails', async () => {
      // Arrange
      const userId = 'user123';
      vi.mocked(cloudSyncService.fetchCompanionData).mockRejectedValue(
        new Error('Network error')
      );
      vi.mocked(storageService.get).mockReturnValue(mockStreakData);

      // Act
      const result = await streakStorageService.loadStreakData(userId);

      // Assert
      expect(cloudSyncService.fetchCompanionData).toHaveBeenCalledWith(userId);
      expect(storageService.get).toHaveBeenCalledWith('streak_data');
      expect(result).toEqual(mockStreakData);
    });

    it('should force immediate sync bypassing debounce', async () => {
      // Arrange
      const userId = 'user123';
      vi.mocked(storageService.set).mockImplementation(() => {});
      vi.mocked(cloudSyncService.syncCompanionData).mockResolvedValue(undefined);

      // Act
      await streakStorageService.forceSync(mockStreakData, userId);

      // Assert - Should sync immediately without waiting
      expect(cloudSyncService.syncCompanionData).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          streakData: mockStreakData,
        })
      );
    });
  });

  describe('Offline queue management', () => {
    it('should add to sync queue when offline', async () => {
      // Arrange
      const userId = 'user123';
      vi.mocked(storageService.set).mockImplementation(() => {});
      vi.mocked(storageService.get).mockReturnValue([]);
      vi.mocked(cloudSyncService.syncCompanionData).mockRejectedValue(
        new Error('Network error')
      );

      // Act
      streakStorageService.saveStreakData(mockStreakData, userId);
      
      // Wait for debounce and catch expected error
      try {
        await vi.advanceTimersByTimeAsync(5000);
      } catch {
        // Expected error from sync failure
      }

      // Assert - Should add to queue after sync fails
      const queueCalls = vi.mocked(storageService.set).mock.calls.filter(
        call => call[0] === 'streak_sync_queue'
      );
      expect(queueCalls.length).toBeGreaterThan(0);
      expect(queueCalls[0][1]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: userId,
            data: mockStreakData,
          }),
        ])
      );
    });

    it('should process sync queue when coming back online', async () => {
      // Arrange
      const userId = 'user123';
      const queueItem = {
        id: userId,
        data: mockStreakData,
        timestamp: new Date(),
        retryCount: 0,
      };
      
      vi.mocked(storageService.get).mockReturnValue([queueItem]);
      vi.mocked(storageService.set).mockImplementation(() => {});
      vi.mocked(cloudSyncService.syncCompanionData).mockResolvedValue(undefined);

      // Act
      await streakStorageService.processSyncQueue();

      // Assert
      expect(cloudSyncService.syncCompanionData).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          streakData: mockStreakData,
        })
      );
      expect(storageService.set).toHaveBeenCalledWith('streak_sync_queue', []);
    });

    it('should retry failed sync items up to 3 times', async () => {
      // Arrange
      const userId = 'user123';
      const queueItem = {
        id: userId,
        data: mockStreakData,
        timestamp: new Date(),
        retryCount: 1, // Already tried once, will increment to 2
      };
      
      vi.mocked(storageService.get).mockReturnValue([queueItem]);
      vi.mocked(storageService.set).mockImplementation(() => {});
      vi.mocked(cloudSyncService.syncCompanionData).mockRejectedValue(
        new Error('Network error')
      );

      // Act
      await streakStorageService.processSyncQueue();

      // Assert - Should keep in queue with incremented retry count
      expect(storageService.set).toHaveBeenCalledWith(
        'streak_sync_queue',
        expect.arrayContaining([
          expect.objectContaining({
            id: userId,
            retryCount: 2,
          }),
        ])
      );
    });

    it('should drop items after max retries', async () => {
      // Arrange
      const userId = 'user123';
      const queueItem = {
        id: userId,
        data: mockStreakData,
        timestamp: new Date(),
        retryCount: 3, // Max retries reached
      };
      
      vi.mocked(storageService.get).mockReturnValue([queueItem]);
      vi.mocked(storageService.set).mockImplementation(() => {});
      vi.mocked(cloudSyncService.syncCompanionData).mockRejectedValue(
        new Error('Network error')
      );

      // Act
      await streakStorageService.processSyncQueue();

      // Assert - Should remove from queue
      expect(storageService.set).toHaveBeenCalledWith('streak_sync_queue', []);
    });

    it('should update existing queue item instead of duplicating', async () => {
      // Arrange
      const userId = 'user123';
      const existingItem = {
        id: userId,
        data: mockStreakData,
        timestamp: new Date(),
        retryCount: 1,
      };
      
      vi.mocked(storageService.get).mockReturnValue([existingItem]);
      vi.mocked(storageService.set).mockImplementation(() => {});
      vi.mocked(cloudSyncService.syncCompanionData).mockRejectedValue(
        new Error('Network error')
      );

      // Act
      streakStorageService.saveStreakData(mockStreakData, userId);
      
      // Wait for debounce and catch expected error
      try {
        await vi.advanceTimersByTimeAsync(5000);
      } catch {
        // Expected error from sync failure
      }

      // Assert - Should update existing item, not add duplicate
      const setCall = vi.mocked(storageService.set).mock.calls.find(
        call => call[0] === 'streak_sync_queue'
      );
      expect(setCall).toBeDefined();
      const queue = setCall![1] as any[];
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(userId);
    });
  });

  describe('Conflict resolution', () => {
    it('should use server-wins strategy for conflicts', async () => {
      // Arrange
      const localData: StreakData = {
        ...mockStreakData,
        loginStreak: { ...mockStreakData.loginStreak, current: 5 },
      };
      const remoteData: StreakData = {
        ...mockStreakData,
        loginStreak: { ...mockStreakData.loginStreak, current: 10 },
      };

      // Act
      const resolved = await streakStorageService.resolveConflict(localData, remoteData);

      // Assert - Should always prefer remote data
      expect(resolved).toEqual(remoteData);
      expect(resolved.loginStreak.current).toBe(10);
    });

    it('should sync and resolve conflicts between local and remote', async () => {
      // Arrange
      const userId = 'user123';
      const localData: StreakData = {
        ...mockStreakData,
        loginStreak: { ...mockStreakData.loginStreak, current: 5 },
      };
      const remoteData: StreakData = {
        ...mockStreakData,
        loginStreak: { ...mockStreakData.loginStreak, current: 10 },
      };

      vi.mocked(storageService.get).mockReturnValue(localData);
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue({
        streakData: remoteData,
      });
      vi.mocked(storageService.set).mockImplementation(() => {});

      // Act
      const result = await streakStorageService.syncStreakData(userId);

      // Assert - Should resolve to remote data and update localStorage
      expect(result).toEqual(remoteData);
      expect(storageService.set).toHaveBeenCalledWith('streak_data', remoteData);
    });

    it('should sync local data to cloud when only local exists', async () => {
      // Arrange
      const userId = 'user123';
      vi.mocked(storageService.get).mockReturnValue(mockStreakData);
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue(null);
      vi.mocked(cloudSyncService.syncCompanionData).mockResolvedValue(undefined);

      // Act
      const result = await streakStorageService.syncStreakData(userId);

      // Assert
      expect(result).toEqual(mockStreakData);
      expect(cloudSyncService.syncCompanionData).toHaveBeenCalled();
    });

    it('should sync remote data to local when only remote exists', async () => {
      // Arrange
      const userId = 'user123';
      vi.mocked(storageService.get).mockReturnValue(null);
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue({
        streakData: mockStreakData,
      });
      vi.mocked(storageService.set).mockImplementation(() => {});

      // Act
      const result = await streakStorageService.syncStreakData(userId);

      // Assert
      expect(result).toEqual(mockStreakData);
      expect(storageService.set).toHaveBeenCalledWith('streak_data', mockStreakData);
    });
  });

  describe('Sync queue status', () => {
    it('should return sync queue status', () => {
      // Arrange
      const queueItems = [
        {
          id: 'user1',
          data: mockStreakData,
          timestamp: new Date(),
          retryCount: 0,
        },
        {
          id: 'user2',
          data: mockStreakData,
          timestamp: new Date(),
          retryCount: 1,
        },
      ];
      vi.mocked(storageService.get).mockReturnValue(queueItems);

      // Act
      const status = streakStorageService.getSyncQueueStatus();

      // Assert
      expect(status.count).toBe(2);
      expect(status.items).toEqual(queueItems);
    });

    it('should return empty status when queue is empty', () => {
      // Arrange
      vi.mocked(storageService.get).mockReturnValue([]);

      // Act
      const status = streakStorageService.getSyncQueueStatus();

      // Assert
      expect(status.count).toBe(0);
      expect(status.items).toEqual([]);
    });
  });

  describe('Connection status', () => {
    it('should report online status', () => {
      // Act - Service initializes with navigator.onLine value
      const isConnected = streakStorageService.isConnected();

      // Assert - Should reflect current online status
      expect(typeof isConnected).toBe('boolean');
    });

    it('should update status when going offline', () => {
      // Arrange - Trigger offline event
      const offlineEvent = new Event('offline');
      
      // Act
      window.dispatchEvent(offlineEvent);
      const isConnected = streakStorageService.isConnected();

      // Assert
      expect(isConnected).toBe(false);
    });

    it('should update status when coming online', () => {
      // Arrange - First go offline
      const offlineEvent = new Event('offline');
      window.dispatchEvent(offlineEvent);
      
      // Then come back online
      const onlineEvent = new Event('online');
      
      // Act
      window.dispatchEvent(onlineEvent);
      const isConnected = streakStorageService.isConnected();

      // Assert
      expect(isConnected).toBe(true);
    });
  });
});
