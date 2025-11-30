/**
 * Unit tests for Companion Storage Service
 * Tests all storage functions with various scenarios
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  saveCompanionType,
  loadCompanionType,
  hasCompanionSelection,
  getCompanionSelectionTimestamp,
  clearCompanionSelection,
  syncCompanionType,
  migrateExistingUser,
  CompanionStorageError,
} from './companionStorageService';
import { storageService } from './storageService';
import { cloudSyncService } from './cloudSyncService';

// Mock the storage and cloud sync services
vi.mock('./storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('./cloudSyncService', () => ({
  cloudSyncService: {
    syncCompanionData: vi.fn(),
    fetchCompanionData: vi.fn(),
  },
}));

describe('companionStorageService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveCompanionType', () => {
    it('should save valid companion type to localStorage', async () => {
      await saveCompanionType('shadow');

      expect(storageService.set).toHaveBeenCalledWith(
        'dark-productivity-companion-type',
        'shadow'
      );
      expect(storageService.set).toHaveBeenCalledWith(
        'companion-selection-timestamp',
        expect.any(Date)
      );
    });

    it('should save all three valid companion types', async () => {
      const types = ['shadow', 'forest', 'ember'] as const;

      for (const type of types) {
        vi.clearAllMocks();
        await saveCompanionType(type);

        expect(storageService.set).toHaveBeenCalledWith(
          'dark-productivity-companion-type',
          type
        );
      }
    });

    it('should sync to Firebase for authenticated users', async () => {
      const userId = 'user123';
      vi.mocked(cloudSyncService.syncCompanionData).mockResolvedValue();

      await saveCompanionType('forest', userId);

      expect(cloudSyncService.syncCompanionData).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          type: 'forest',
          selectedAt: expect.any(String),
        })
      );
    });

    it('should throw error for invalid companion type', async () => {
      try {
        await saveCompanionType('invalid' as any);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CompanionStorageError);
        expect((error as CompanionStorageError).code).toBe('VALIDATION_ERROR');
      }
    });

    it('should throw error for null companion type', async () => {
      await expect(saveCompanionType(null as any)).rejects.toThrow(
        CompanionStorageError
      );
    });

    it('should throw error for undefined companion type', async () => {
      await expect(saveCompanionType(undefined as any)).rejects.toThrow(
        CompanionStorageError
      );
    });

    it('should save to localStorage even if Firebase sync fails', async () => {
      const userId = 'user123';
      vi.mocked(cloudSyncService.syncCompanionData).mockRejectedValue(
        new Error('Network error')
      );

      try {
        await saveCompanionType('ember', userId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CompanionStorageError);
        expect((error as CompanionStorageError).code).toBe('SYNC_ERROR');
      }

      // localStorage should still be updated
      expect(storageService.set).toHaveBeenCalledWith(
        'dark-productivity-companion-type',
        'ember'
      );
    }, 10000); // Increase timeout for retry logic

    it('should handle storage service errors', async () => {
      vi.mocked(storageService.set).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      try {
        await saveCompanionType('shadow');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CompanionStorageError);
        expect((error as CompanionStorageError).code).toBe('STORAGE_ERROR');
      }
    });
  });

  describe('loadCompanionType', () => {
    it('should load companion type from localStorage', async () => {
      vi.mocked(storageService.get).mockReturnValue('shadow');

      const result = await loadCompanionType();

      expect(result).toBe('shadow');
      expect(storageService.get).toHaveBeenCalledWith(
        'dark-productivity-companion-type'
      );
    });

    it('should return null when no companion type exists', async () => {
      vi.mocked(storageService.get).mockReturnValue(null);

      const result = await loadCompanionType();

      expect(result).toBeNull();
    });

    it('should load from Firebase for authenticated users', async () => {
      const userId = 'user123';
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue({
        type: 'forest',
        selectedAt: new Date().toISOString(),
      });
      // Mock storageService.set to not throw
      vi.mocked(storageService.set).mockImplementation(() => {});

      const result = await loadCompanionType(userId);

      expect(result).toBe('forest');
      expect(cloudSyncService.fetchCompanionData).toHaveBeenCalledWith(userId);
    });

    it('should update localStorage with Firebase data', async () => {
      const userId = 'user123';
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue({
        type: 'ember',
        selectedAt: new Date().toISOString(),
      });

      await loadCompanionType(userId);

      expect(storageService.set).toHaveBeenCalledWith(
        'dark-productivity-companion-type',
        'ember'
      );
    });

    it('should fall back to localStorage if Firebase fails', async () => {
      const userId = 'user123';
      vi.mocked(cloudSyncService.fetchCompanionData).mockRejectedValue(
        new Error('Network error')
      );
      vi.mocked(storageService.get).mockReturnValue('shadow');

      const result = await loadCompanionType(userId);

      expect(result).toBe('shadow');
    }, 10000); // Increase timeout for retry logic

    it('should return null for invalid companion type', async () => {
      vi.mocked(storageService.get).mockReturnValue('invalid');

      const result = await loadCompanionType();

      expect(result).toBeNull();
      // Should clear invalid data
      expect(storageService.remove).toHaveBeenCalledWith(
        'dark-productivity-companion-type'
      );
    });

    it('should handle Firebase returning invalid type', async () => {
      const userId = 'user123';
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue({
        type: 'invalid',
        selectedAt: new Date().toISOString(),
      });
      vi.mocked(storageService.get).mockReturnValue(null);

      const result = await loadCompanionType(userId);

      expect(result).toBeNull();
    });

    it('should handle errors gracefully and return null', async () => {
      vi.mocked(storageService.get).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await loadCompanionType();

      expect(result).toBeNull();
    });
  });

  describe('hasCompanionSelection', () => {
    it('should return true when valid companion type exists', () => {
      vi.mocked(storageService.get).mockReturnValue('shadow');

      const result = hasCompanionSelection();

      expect(result).toBe(true);
    });

    it('should return false when no companion type exists', () => {
      vi.mocked(storageService.get).mockReturnValue(null);

      const result = hasCompanionSelection();

      expect(result).toBe(false);
    });

    it('should return false for invalid companion type', () => {
      vi.mocked(storageService.get).mockReturnValue('invalid');

      const result = hasCompanionSelection();

      expect(result).toBe(false);
    });

    it('should handle errors and return false', () => {
      vi.mocked(storageService.get).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = hasCompanionSelection();

      expect(result).toBe(false);
    });
  });

  describe('getCompanionSelectionTimestamp', () => {
    it('should return timestamp when it exists', () => {
      const timestamp = new Date('2024-01-01');
      vi.mocked(storageService.get).mockReturnValue(timestamp);

      const result = getCompanionSelectionTimestamp();

      expect(result).toEqual(timestamp);
    });

    it('should return null when timestamp does not exist', () => {
      vi.mocked(storageService.get).mockReturnValue(null);

      const result = getCompanionSelectionTimestamp();

      expect(result).toBeNull();
    });

    it('should handle errors and return null', () => {
      vi.mocked(storageService.get).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = getCompanionSelectionTimestamp();

      expect(result).toBeNull();
    });
  });

  describe('clearCompanionSelection', () => {
    it('should remove companion type and timestamp', () => {
      clearCompanionSelection();

      expect(storageService.remove).toHaveBeenCalledWith(
        'dark-productivity-companion-type'
      );
      expect(storageService.remove).toHaveBeenCalledWith(
        'companion-selection-timestamp'
      );
    });

    it('should handle errors gracefully', () => {
      vi.mocked(storageService.remove).mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => clearCompanionSelection()).not.toThrow();
    });
  });

  describe('syncCompanionType', () => {
    it('should prefer cloud data when both exist', async () => {
      const userId = 'user123';
      vi.mocked(storageService.get).mockReturnValue('shadow');
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue({
        type: 'forest',
        selectedAt: new Date().toISOString(),
      });
      // Mock storageService.set to not throw
      vi.mocked(storageService.set).mockImplementation(() => {});

      const result = await syncCompanionType(userId);

      expect(result).toBe('forest');
      expect(storageService.set).toHaveBeenCalledWith(
        'dark-productivity-companion-type',
        'forest'
      );
    });

    it('should sync from cloud to local when only cloud has data', async () => {
      const userId = 'user123';
      vi.mocked(storageService.get).mockReturnValue(null);
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue({
        type: 'ember',
        selectedAt: new Date().toISOString(),
      });
      // Mock storageService.set to not throw
      vi.mocked(storageService.set).mockImplementation(() => {});

      const result = await syncCompanionType(userId);

      expect(result).toBe('ember');
      expect(storageService.set).toHaveBeenCalledWith(
        'dark-productivity-companion-type',
        'ember'
      );
    });

    it('should sync from local to cloud when only local has data', async () => {
      const userId = 'user123';
      vi.mocked(storageService.get).mockReturnValue('shadow');
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue(null);
      vi.mocked(cloudSyncService.syncCompanionData).mockResolvedValue();

      const result = await syncCompanionType(userId);

      expect(result).toBe('shadow');
      expect(cloudSyncService.syncCompanionData).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          type: 'shadow',
          selectedAt: expect.any(String),
        })
      );
    });

    it('should return null when neither has data', async () => {
      const userId = 'user123';
      vi.mocked(storageService.get).mockReturnValue(null);
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue(null);

      const result = await syncCompanionType(userId);

      expect(result).toBeNull();
    });

    it('should handle invalid cloud data', async () => {
      const userId = 'user123';
      vi.mocked(storageService.get).mockReturnValue(null);
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue({
        type: 'invalid',
        selectedAt: new Date().toISOString(),
      });

      const result = await syncCompanionType(userId);

      expect(result).toBeNull();
    });

    it('should handle invalid local data', async () => {
      const userId = 'user123';
      vi.mocked(storageService.get).mockReturnValue('invalid');
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue(null);
      // Mock storageService.remove to not throw
      vi.mocked(storageService.remove).mockImplementation(() => {});

      const result = await syncCompanionType(userId);

      expect(result).toBeNull();
      expect(storageService.remove).toHaveBeenCalledWith(
        'dark-productivity-companion-type'
      );
    });

    it('should handle Firebase fetch errors', async () => {
      const userId = 'user123';
      vi.mocked(storageService.get).mockReturnValue('shadow');
      vi.mocked(cloudSyncService.fetchCompanionData).mockRejectedValue(
        new Error('Network error')
      );

      const result = await syncCompanionType(userId);

      // Should still return local data
      expect(result).toBe('shadow');
    }, 10000); // Increase timeout for retry logic

    it('should throw error on sync failure', async () => {
      const userId = 'user123';
      vi.mocked(storageService.get).mockImplementation(() => {
        throw new Error('Storage error');
      });

      try {
        await syncCompanionType(userId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CompanionStorageError);
        expect((error as CompanionStorageError).code).toBe('SYNC_ERROR');
      }
    });
  });

  describe('migrateExistingUser', () => {
    it('should not migrate if user already has companion selection', async () => {
      vi.mocked(storageService.get).mockImplementation((key) => {
        if (key === 'dark-productivity-companion-type') return 'shadow';
        return null;
      });

      const result = await migrateExistingUser();

      expect(result).toBe(false);
      expect(storageService.set).not.toHaveBeenCalled();
    });

    it('should migrate user with existing tasks', async () => {
      vi.mocked(storageService.get).mockImplementation((key) => {
        if (key === 'dark-productivity-companion-type') return null;
        if (key === 'tasks') return [{ id: '1', title: 'Task 1' }];
        return null;
      });
      // Mock storageService.set to not throw
      vi.mocked(storageService.set).mockImplementation(() => {});

      const result = await migrateExistingUser();

      expect(result).toBe(true);
      expect(storageService.set).toHaveBeenCalledWith(
        'dark-productivity-companion-type',
        'shadow'
      );
    });

    it('should migrate user with existing notes', async () => {
      vi.mocked(storageService.get).mockImplementation((key) => {
        if (key === 'dark-productivity-companion-type') return null;
        if (key === 'notes') return [{ id: '1', title: 'Note 1' }];
        return null;
      });
      // Mock storageService.set to not throw
      vi.mocked(storageService.set).mockImplementation(() => {});

      const result = await migrateExistingUser();

      expect(result).toBe(true);
    });

    it('should migrate user with existing settings', async () => {
      vi.mocked(storageService.get).mockImplementation((key) => {
        if (key === 'dark-productivity-companion-type') return null;
        if (key === 'settings') return { audioEnabled: true };
        return null;
      });
      // Mock storageService.set to not throw
      vi.mocked(storageService.set).mockImplementation(() => {});

      const result = await migrateExistingUser();

      expect(result).toBe(true);
    });

    it('should migrate user with existing tarot readings', async () => {
      vi.mocked(storageService.get).mockImplementation((key) => {
        if (key === 'dark-productivity-companion-type') return null;
        if (key === 'tarot_readings') return [{ id: '1' }];
        return null;
      });
      // Mock storageService.set to not throw
      vi.mocked(storageService.set).mockImplementation(() => {});

      const result = await migrateExistingUser();

      expect(result).toBe(true);
    });

    it('should not migrate new user with no data', async () => {
      vi.mocked(storageService.get).mockReturnValue(null);

      const result = await migrateExistingUser();

      expect(result).toBe(false);
      expect(storageService.set).not.toHaveBeenCalled();
    });

    it('should sync to Firebase for authenticated users', async () => {
      const userId = 'user123';
      vi.mocked(storageService.get).mockImplementation((key) => {
        if (key === 'dark-productivity-companion-type') return null;
        if (key === 'tasks') return [{ id: '1' }];
        return null;
      });
      // Mock storageService.set to not throw
      vi.mocked(storageService.set).mockImplementation(() => {});
      vi.mocked(cloudSyncService.syncCompanionData).mockResolvedValue();

      const result = await migrateExistingUser(userId);

      expect(result).toBe(true);
      expect(cloudSyncService.syncCompanionData).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          type: 'shadow',
        })
      );
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(storageService.get).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await migrateExistingUser();

      expect(result).toBe(false);
    });
  });

  describe('validation edge cases', () => {
    it('should reject empty string as companion type', async () => {
      await expect(saveCompanionType('' as any)).rejects.toThrow(
        CompanionStorageError
      );
    });

    it('should reject number as companion type', async () => {
      await expect(saveCompanionType(123 as any)).rejects.toThrow(
        CompanionStorageError
      );
    });

    it('should reject object as companion type', async () => {
      await expect(saveCompanionType({} as any)).rejects.toThrow(
        CompanionStorageError
      );
    });

    it('should reject array as companion type', async () => {
      await expect(saveCompanionType([] as any)).rejects.toThrow(
        CompanionStorageError
      );
    });

    it('should reject boolean as companion type', async () => {
      await expect(saveCompanionType(true as any)).rejects.toThrow(
        CompanionStorageError
      );
    });
  });

  describe('retry logic', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should retry Firebase sync on transient failures', async () => {
      const userId = 'user123';
      let attemptCount = 0;

      vi.mocked(cloudSyncService.syncCompanionData).mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network timeout');
        }
        // Succeed on third attempt
      });

      const savePromise = saveCompanionType('shadow', userId);

      // Fast-forward through retry delays
      await vi.runAllTimersAsync();

      await savePromise;

      expect(attemptCount).toBe(3);
      expect(cloudSyncService.syncCompanionData).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries for Firebase sync', async () => {
      const userId = 'user123';

      vi.mocked(cloudSyncService.syncCompanionData).mockRejectedValue(
        new Error('Persistent network error')
      );

      const savePromise = saveCompanionType('shadow', userId);

      // Fast-forward through all retry delays
      await vi.runAllTimersAsync();

      try {
        await savePromise;
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CompanionStorageError);
        expect((error as CompanionStorageError).code).toBe('SYNC_ERROR');
        expect((error as CompanionStorageError).retryable).toBe(true);
      }

      // Should have tried 4 times (initial + 3 retries)
      expect(cloudSyncService.syncCompanionData).toHaveBeenCalledTimes(4);
    });

    it('should retry Firebase fetch on transient failures', async () => {
      const userId = 'user123';
      let attemptCount = 0;

      vi.mocked(cloudSyncService.fetchCompanionData).mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 2) {
          throw new Error('Network timeout');
        }
        return { type: 'forest', selectedAt: new Date().toISOString() };
      });

      // Mock storageService.set to not throw
      vi.mocked(storageService.set).mockImplementation(() => {});

      const loadPromise = loadCompanionType(userId);

      // Fast-forward through retry delays
      await vi.runAllTimersAsync();

      const result = await loadPromise;

      expect(result).toBe('forest');
      expect(attemptCount).toBe(2);
    });

    it('should fall back to localStorage after Firebase fetch retries exhausted', async () => {
      const userId = 'user123';

      vi.mocked(cloudSyncService.fetchCompanionData).mockRejectedValue(
        new Error('Persistent network error')
      );
      vi.mocked(storageService.get).mockReturnValue('shadow');

      const loadPromise = loadCompanionType(userId);

      // Fast-forward through all retry delays
      await vi.runAllTimersAsync();

      const result = await loadPromise;

      expect(result).toBe('shadow');
      // Should have tried 4 times (initial + 3 retries)
      expect(cloudSyncService.fetchCompanionData).toHaveBeenCalledTimes(4);
    });

    it('should retry sync operations with exponential backoff', async () => {
      const userId = 'user123';
      let attemptCount = 0;
      const delays: number[] = [];
      let lastTime = Date.now();

      vi.mocked(storageService.get).mockReturnValue('shadow');
      vi.mocked(cloudSyncService.fetchCompanionData).mockResolvedValue(null);
      vi.mocked(cloudSyncService.syncCompanionData).mockImplementation(async () => {
        const currentTime = Date.now();
        if (attemptCount > 0) {
          delays.push(currentTime - lastTime);
        }
        lastTime = currentTime;
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network error');
        }
      });

      const syncPromise = syncCompanionType(userId);

      // Fast-forward through retry delays
      await vi.runAllTimersAsync();

      await syncPromise;

      expect(attemptCount).toBe(3);
      // Verify delays are increasing (exponential backoff)
      expect(delays.length).toBeGreaterThan(0);
      // First delay should be around 1000ms (with jitter)
      expect(delays[0]).toBeGreaterThanOrEqual(750);
      expect(delays[0]).toBeLessThanOrEqual(1250);
    });

    it('should not retry validation errors', async () => {
      const invalidType = 'invalid' as any;

      const savePromise = saveCompanionType(invalidType);

      try {
        await savePromise;
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CompanionStorageError);
        expect((error as CompanionStorageError).code).toBe('VALIDATION_ERROR');
        expect((error as CompanionStorageError).retryable).toBe(false);
      }

      // Should not have retried
      expect(storageService.set).not.toHaveBeenCalled();
    });

    it('should retry migration on transient failures', async () => {
      const userId = 'user123';
      let attemptCount = 0;

      vi.mocked(storageService.get).mockImplementation((key) => {
        if (key === 'dark-productivity-companion-type') return null;
        if (key === 'tasks') return [{ id: '1' }];
        return null;
      });

      vi.mocked(storageService.set).mockImplementation(() => {});

      vi.mocked(cloudSyncService.syncCompanionData).mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 2) {
          throw new Error('Network timeout');
        }
      });

      const migratePromise = migrateExistingUser(userId);

      // Fast-forward through retry delays
      await vi.runAllTimersAsync();

      const result = await migratePromise;

      expect(result).toBe(true);
      expect(attemptCount).toBe(2);
    });

    it('should handle migration failure gracefully after retries', async () => {
      const userId = 'user123';

      vi.mocked(storageService.get).mockImplementation((key) => {
        if (key === 'dark-productivity-companion-type') return null;
        if (key === 'tasks') return [{ id: '1' }];
        return null;
      });

      vi.mocked(storageService.set).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const migratePromise = migrateExistingUser(userId);

      // Fast-forward through retry delays
      await vi.runAllTimersAsync();

      const result = await migratePromise;

      // Should return false on failure
      expect(result).toBe(false);
    });
  });
});
