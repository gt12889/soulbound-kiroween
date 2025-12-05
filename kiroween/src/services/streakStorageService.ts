/**
 * Streak Storage Service
 * Handles persistence of streak data with localStorage and Firebase sync
 * Includes debounced save, offline queue, and conflict resolution
 * Requirements: Task 1.3 - Streak Storage Service
 */

import { storageService } from './storageService';
import { cloudSyncService } from './cloudSyncService';
import type { StreakData } from '../types/streak';

const STREAK_DATA_KEY = 'streak_data';
const STREAK_SYNC_QUEUE_KEY = 'streak_sync_queue';
const DEBOUNCE_DELAY_MS = 5000; // 5 seconds

export class StreakStorageError extends Error {
  public readonly code: 'VALIDATION_ERROR' | 'STORAGE_ERROR' | 'SYNC_ERROR';
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: 'VALIDATION_ERROR' | 'STORAGE_ERROR' | 'SYNC_ERROR',
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'StreakStorageError';
    this.code = code;
    this.retryable = retryable;
  }
}

interface StreakSyncQueueItem {
  id: string;
  data: StreakData;
  timestamp: Date;
  retryCount: number;
}

class StreakStorageService {
  private debounceTimer: number | null = null;
  private pendingSave: StreakData | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  /**
   * Load streak data from storage
   * For authenticated users: attempts Firebase first, falls back to localStorage
   * For local users: loads from localStorage only
   * Requirements: AC7 - Data Persistence
   */
  async loadStreakData(userId?: string): Promise<StreakData | null> {
    try {
      // For authenticated users, try Firebase first
      if (userId && this.isOnline) {
        try {
          const cloudData = await cloudSyncService.fetchCompanionData(userId);
          const streakData = cloudData?.streakData;

          if (streakData && this.validateStreakData(streakData)) {
            // Update localStorage with cloud data for offline access - user-scoped
            storageService.set(STREAK_DATA_KEY, streakData, userId);
            return streakData;
          }
        } catch (error) {
          console.error('Failed to load streak data from Firebase, falling back to localStorage:', error);
          // Fall through to localStorage
        }
      }

      // Load from localStorage - user-scoped
      const localData = storageService.get<StreakData>(STREAK_DATA_KEY, userId);

      if (localData && this.validateStreakData(localData)) {
        return localData;
      }

      return null;
    } catch (error) {
      console.error('Failed to load streak data:', error);
      return null;
    }
  }

  /**
   * Save streak data with debouncing
   * Saves to localStorage immediately, queues Firebase sync
   * Requirements: AC7 - Data Persistence, Task 1.3 - Debounced save
   */
  saveStreakData(data: StreakData, userId?: string): void {
    try {
      // Validate data before saving
      if (!this.validateStreakData(data)) {
        throw new StreakStorageError(
          'Invalid streak data structure',
          'VALIDATION_ERROR',
          false
        );
      }

      // Save to localStorage immediately - user-scoped
      storageService.set(STREAK_DATA_KEY, data, userId);

      // Debounce Firebase sync
      if (userId) {
        this.debouncedFirebaseSync(data, userId);
      }
    } catch (error) {
      console.error('Failed to save streak data:', error);
      throw new StreakStorageError(
        `Failed to save streak data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR',
        false
      );
    }
  }

  /**
   * Debounced Firebase sync
   * Delays sync by 5 seconds to batch multiple updates
   * Requirements: Task 1.3 - Debounced save (5 second delay)
   */
  private debouncedFirebaseSync(data: StreakData, userId: string): void {
    // Clear existing timer
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    // Store pending save
    this.pendingSave = data;

    // Set new timer
    this.debounceTimer = window.setTimeout(async () => {
      if (this.pendingSave) {
        await this.syncToFirebase(this.pendingSave, userId);
        this.pendingSave = null;
      }
      this.debounceTimer = null;
    }, DEBOUNCE_DELAY_MS);
  }

  /**
   * Sync streak data to Firebase
   * If offline, adds to queue for later sync
   * Requirements: Task 1.3 - Firebase sync, offline queue
   */
  private async syncToFirebase(data: StreakData, userId: string): Promise<void> {
    if (!this.isOnline) {
      // Add to offline queue
      this.addToSyncQueue(data, userId);
      return;
    }

    try {
      await cloudSyncService.syncCompanionData(userId, {
        streakData: data,
        syncedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to sync streak data to Firebase:', error);
      // Add to offline queue for retry
      this.addToSyncQueue(data, userId);
      throw new StreakStorageError(
        'Failed to sync streak data to cloud',
        'SYNC_ERROR',
        true
      );
    }
  }

  /**
   * Add streak data to offline sync queue
   * Requirements: Task 1.3 - Offline queue
   */
  private addToSyncQueue(data: StreakData, userId: string): void {
    try {
      const queue = storageService.get<StreakSyncQueueItem[]>(STREAK_SYNC_QUEUE_KEY) || [];
      
      // Check if item already in queue (update instead of duplicate)
      const existingIndex = queue.findIndex(item => item.id === userId);
      
      const queueItem: StreakSyncQueueItem = {
        id: userId,
        data,
        timestamp: new Date(),
        retryCount: existingIndex >= 0 ? queue[existingIndex].retryCount : 0,
      };

      if (existingIndex >= 0) {
        queue[existingIndex] = queueItem;
      } else {
        queue.push(queueItem);
      }

      storageService.set(STREAK_SYNC_QUEUE_KEY, queue);
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  /**
   * Process offline sync queue
   * Attempts to sync all queued items when online
   * Requirements: Task 1.3 - Offline queue, sync on reconnect
   */
  async processSyncQueue(): Promise<void> {
    if (!this.isOnline) {
      return;
    }

    try {
      const queue = storageService.get<StreakSyncQueueItem[]>(STREAK_SYNC_QUEUE_KEY) || [];
      
      if (queue.length === 0) {
        return;
      }

      const failedItems: StreakSyncQueueItem[] = [];

      // Process each item
      for (const item of queue) {
        try {
          await cloudSyncService.syncCompanionData(item.id, {
            streakData: item.data,
            syncedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error(`Failed to sync queue item for user ${item.id}:`, error);
          
          // Increment retry count
          item.retryCount++;
          
          // Keep in queue if retry count < 3
          if (item.retryCount < 3) {
            failedItems.push(item);
          } else {
            console.error(`Max retries exceeded for user ${item.id}, dropping from queue`);
          }
        }
      }

      // Update queue with only failed items
      storageService.set(STREAK_SYNC_QUEUE_KEY, failedItems);
    } catch (error) {
      console.error('Failed to process sync queue:', error);
    }
  }

  /**
   * Handle online event
   * Processes sync queue when connection restored
   * Requirements: Task 1.3 - Sync on reconnect
   */
  private handleOnline(): void {
    this.isOnline = true;
    console.log('Connection restored, processing sync queue...');
    this.processSyncQueue();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnline = false;
    console.log('Connection lost, queuing syncs...');
  }

  /**
   * Resolve conflicts between local and remote data
   * Uses server-wins strategy as specified
   * Requirements: Task 1.3 - Conflict resolution (server wins)
   */
  async resolveConflict(
    localData: StreakData,
    remoteData: StreakData
  ): Promise<StreakData> {
    // Server wins strategy - always prefer remote data
    console.log('Conflict detected, using server data (server-wins strategy)');
    return remoteData;
  }

  /**
   * Sync streak data between localStorage and Firebase
   * Resolves conflicts using server-wins strategy
   * Requirements: Task 1.3 - Conflict resolution
   */
  async syncStreakData(userId: string): Promise<StreakData | null> {
    try {
      // Get local data
      const localData = storageService.get<StreakData>(STREAK_DATA_KEY);
      
      // Get remote data
      let remoteData: StreakData | null = null;
      if (this.isOnline) {
        try {
          const cloudData = await cloudSyncService.fetchCompanionData(userId);
          remoteData = cloudData?.streakData || null;
        } catch (error) {
          console.error('Failed to fetch remote streak data:', error);
        }
      }

      // Resolve conflicts
      if (localData && remoteData) {
        // Both exist - resolve conflict (server wins)
        const resolved = await this.resolveConflict(localData, remoteData);
        
        // Update localStorage with resolved data
        storageService.set(STREAK_DATA_KEY, resolved);
        
        return resolved;
      } else if (remoteData) {
        // Only remote exists - sync from cloud to local
        storageService.set(STREAK_DATA_KEY, remoteData);
        return remoteData;
      } else if (localData) {
        // Only local exists - sync from local to cloud
        if (this.isOnline) {
          await this.syncToFirebase(localData, userId);
        } else {
          this.addToSyncQueue(localData, userId);
        }
        return localData;
      }

      return null;
    } catch (error) {
      console.error('Failed to sync streak data:', error);
      throw new StreakStorageError(
        `Failed to sync streak data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SYNC_ERROR',
        true
      );
    }
  }

  /**
   * Validate streak data structure
   * Requirements: NFR - Data integrity
   */
  private validateStreakData(data: any): data is StreakData {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check required top-level properties
    const requiredProps = ['loginStreak', 'taskStreak', 'noteStreak', 'focusStreak', 'tokens', 'milestones', 'activityHistory'];
    for (const prop of requiredProps) {
      if (!(prop in data)) {
        return false;
      }
    }

    // Validate streak objects have required properties
    const streakProps = ['current', 'longest', 'startDate'];
    for (const streakType of ['loginStreak', 'taskStreak', 'noteStreak', 'focusStreak']) {
      const streak = data[streakType];
      if (!streak || typeof streak !== 'object') {
        return false;
      }
      for (const prop of streakProps) {
        if (!(prop in streak)) {
          return false;
        }
      }
    }

    // Validate tokens object
    if (!data.tokens || typeof data.tokens !== 'object') {
      return false;
    }
    if (!('available' in data.tokens) || !('earned' in data.tokens) || !('used' in data.tokens)) {
      return false;
    }

    return true;
  }

  /**
   * Clear all streak data (for testing/debugging)
   * @internal
   */
  clearStreakData(): void {
    try {
      storageService.remove(STREAK_DATA_KEY);
      storageService.remove(STREAK_SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear streak data:', error);
    }
  }

  /**
   * Get sync queue status
   * Returns number of items waiting to sync
   */
  getSyncQueueStatus(): { count: number; items: StreakSyncQueueItem[] } {
    try {
      const queue = storageService.get<StreakSyncQueueItem[]>(STREAK_SYNC_QUEUE_KEY) || [];
      return {
        count: queue.length,
        items: queue,
      };
    } catch (error) {
      console.error('Failed to get sync queue status:', error);
      return { count: 0, items: [] };
    }
  }

  /**
   * Check if online
   */
  isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Force immediate sync (bypasses debounce)
   * Useful for critical updates like token usage
   */
  async forceSync(data: StreakData, userId: string): Promise<void> {
    // Clear any pending debounced sync
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
      this.pendingSave = null;
    }

    // Save to localStorage
    storageService.set(STREAK_DATA_KEY, data);

    // Sync to Firebase immediately
    if (this.isOnline) {
      await this.syncToFirebase(data, userId);
    } else {
      this.addToSyncQueue(data, userId);
    }
  }

  /**
   * Cleanup (call on service destruction)
   */
  cleanup(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingSave = null;
  }
}

// Export singleton instance
export const streakStorageService = new StreakStorageService();
