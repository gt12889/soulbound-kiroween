/**
 * Custom hook for cloud synchronization
 * Handles real-time updates, manual sync, conflict resolution, and sync status
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { cloudSyncService } from '../services/cloudSyncService';
import { storageService } from '../services/storageService';
import type { SyncStatus, Note, Task, TarotReading } from '../types';

interface UseCloudSyncOptions {
  userId: string | null;
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

interface UseCloudSyncReturn {
  syncStatus: SyncStatus;
  syncNow: () => Promise<void>;
  syncNote: (note: Note) => Promise<void>;
  syncTask: (task: Task) => Promise<void>;
  syncTarotReading: (reading: TarotReading) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  isOnline: boolean;
  migrationCompleted: boolean;
}

export const useCloudSync = (options: UseCloudSyncOptions): UseCloudSyncReturn => {
  const { userId, autoSync = true, syncInterval = 30000 } = options;
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: cloudSyncService.getLastSyncTime(),
    syncing: false,
    pendingChanges: cloudSyncService.getSyncQueue().length,
  });

  const [isOnline, setIsOnline] = useState(cloudSyncService.isConnected());
  const [migrationCompleted, setMigrationCompleted] = useState(storageService.isMigrationCompleted());
  const syncIntervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const migrationAttemptedRef = useRef(false);

  /**
   * Update sync status
   */
  const updateSyncStatus = useCallback((updates: Partial<SyncStatus>) => {
    if (isMountedRef.current) {
      setSyncStatus(prev => ({ ...prev, ...updates }));
    }
  }, []);

  /**
   * Sync a note to cloud
   */
  const syncNote = useCallback(async (note: Note) => {
    if (!userId) {
      console.warn('Cannot sync note: user not authenticated');
      return;
    }

    try {
      if (isOnline) {
        await cloudSyncService.syncNote(userId, { ...note, userId });
      } else {
        cloudSyncService.queueNoteSync(note, note.userId ? 'update' : 'create');
        updateSyncStatus({ 
          pendingChanges: cloudSyncService.getSyncQueue().length 
        });
      }
    } catch (error) {
      console.error('Error syncing note:', error);
      updateSyncStatus({ 
        error: error instanceof Error ? error.message : 'Failed to sync note' 
      });
    }
  }, [userId, isOnline, updateSyncStatus]);

  /**
   * Sync a task to cloud
   */
  const syncTask = useCallback(async (task: Task) => {
    if (!userId) {
      console.warn('Cannot sync task: user not authenticated');
      return;
    }

    try {
      if (isOnline) {
        await cloudSyncService.syncTask(userId, { ...task, userId });
      } else {
        cloudSyncService.queueTaskSync(task, task.userId ? 'update' : 'create');
        updateSyncStatus({ 
          pendingChanges: cloudSyncService.getSyncQueue().length 
        });
      }
    } catch (error) {
      console.error('Error syncing task:', error);
      updateSyncStatus({ 
        error: error instanceof Error ? error.message : 'Failed to sync task' 
      });
    }
  }, [userId, isOnline, updateSyncStatus]);

  /**
   * Sync a tarot reading to cloud
   */
  const syncTarotReading = useCallback(async (reading: TarotReading) => {
    if (!userId) {
      console.warn('Cannot sync tarot reading: user not authenticated');
      return;
    }

    try {
      if (isOnline) {
        await cloudSyncService.syncTarotReading(userId, { ...reading, userId });
      } else {
        cloudSyncService.queueTarotSync(reading, reading.userId ? 'update' : 'create');
        updateSyncStatus({ 
          pendingChanges: cloudSyncService.getSyncQueue().length 
        });
      }
    } catch (error) {
      console.error('Error syncing tarot reading:', error);
      updateSyncStatus({ 
        error: error instanceof Error ? error.message : 'Failed to sync tarot reading' 
      });
    }
  }, [userId, isOnline, updateSyncStatus]);

  /**
   * Delete a note from cloud
   */
  const deleteNote = useCallback(async (noteId: string) => {
    if (!userId) {
      console.warn('Cannot delete note: user not authenticated');
      return;
    }

    try {
      if (isOnline) {
        await cloudSyncService.deleteNote(userId, noteId);
      } else {
        cloudSyncService.queueNoteSync({ id: noteId } as Note, 'delete');
        updateSyncStatus({ 
          pendingChanges: cloudSyncService.getSyncQueue().length 
        });
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      updateSyncStatus({ 
        error: error instanceof Error ? error.message : 'Failed to delete note' 
      });
    }
  }, [userId, isOnline, updateSyncStatus]);

  /**
   * Delete a task from cloud
   */
  const deleteTask = useCallback(async (taskId: string) => {
    if (!userId) {
      console.warn('Cannot delete task: user not authenticated');
      return;
    }

    try {
      if (isOnline) {
        await cloudSyncService.deleteTask(userId, taskId);
      } else {
        cloudSyncService.queueTaskSync({ id: taskId } as Task, 'delete');
        updateSyncStatus({ 
          pendingChanges: cloudSyncService.getSyncQueue().length 
        });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      updateSyncStatus({ 
        error: error instanceof Error ? error.message : 'Failed to delete task' 
      });
    }
  }, [userId, isOnline, updateSyncStatus]);

  /**
   * Manual sync trigger - process offline queue
   */
  const syncNow = useCallback(async () => {
    if (!userId) {
      console.warn('Cannot sync: user not authenticated');
      return;
    }

    if (!isOnline) {
      updateSyncStatus({ error: 'Cannot sync while offline' });
      return;
    }

    updateSyncStatus({ syncing: true, error: undefined });

    try {
      await cloudSyncService.processSyncQueue(userId);
      updateSyncStatus({
        syncing: false,
        lastSync: new Date(),
        pendingChanges: 0,
        error: undefined,
      });
    } catch (error) {
      console.error('Error during manual sync:', error);
      updateSyncStatus({
        syncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      });
    }
  }, [userId, isOnline, updateSyncStatus]);

  /**
   * Handle online/offline status changes
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      updateSyncStatus({ error: undefined });
      
      // Automatically sync when coming back online
      if (userId && autoSync) {
        syncNow();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateSyncStatus({ error: 'Offline - changes will be synced when connection is restored' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId, autoSync, syncNow, updateSyncStatus]);

  /**
   * Perform data migration when user first logs in
   */
  useEffect(() => {
    const performMigration = async () => {
      if (!userId || migrationAttemptedRef.current || migrationCompleted) {
        return;
      }

      migrationAttemptedRef.current = true;

      try {
        console.log('Performing data migration for cloud sync...');
        updateSyncStatus({ syncing: true });
        
        // Enable cloud sync mode
        storageService.enableCloudSync(true);
        
        // Migrate existing data
        const stats = await storageService.migrateDataForCloudSync(userId);
        console.log('Migration completed:', stats);
        
        setMigrationCompleted(true);
        updateSyncStatus({ syncing: false });
        
        // Trigger initial sync after migration
        if (isOnline) {
          await syncNow();
        }
      } catch (error) {
        console.error('Error during data migration:', error);
        updateSyncStatus({ 
          syncing: false,
          error: 'Failed to migrate data for cloud sync' 
        });
      }
    };

    performMigration();
  }, [userId, migrationCompleted, isOnline, syncNow, updateSyncStatus]);

  /**
   * Set up automatic sync interval
   */
  useEffect(() => {
    if (!userId || !autoSync || !isOnline || !migrationCompleted) {
      return;
    }

    // Initial sync
    syncNow();

    // Set up periodic sync
    syncIntervalRef.current = setInterval(() => {
      syncNow();
    }, syncInterval);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [userId, autoSync, isOnline, syncInterval, syncNow, migrationCompleted]);

  /**
   * Update pending changes count periodically
   */
  useEffect(() => {
    const updatePendingCount = () => {
      const pendingChanges = cloudSyncService.getSyncQueue().length;
      updateSyncStatus({ pendingChanges });
    };

    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, [updateSyncStatus]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  return {
    syncStatus,
    syncNow,
    syncNote,
    syncTask,
    syncTarotReading,
    deleteNote,
    deleteTask,
    isOnline,
    migrationCompleted,
  };
};
