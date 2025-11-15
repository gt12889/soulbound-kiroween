/**
 * useSettingsInitialization Hook
 * Ensures all settings are properly loaded on app initialization
 * Coordinates loading from local storage and cloud sync
 * Requirements: 10.3, 17.3
 */

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cloudSyncService } from '../services/cloudSyncService';
import { storageService } from '../services/storageService';
import type { AppSettings } from '../types';

interface SettingsInitializationStatus {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

// Configuration constants
const CLOUD_SETTINGS_TIMEOUT_MS = 5000; // 5 seconds
const PERIODIC_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Custom error for cloud settings timeout
 * Allows distinguishing timeout from network errors
 */
class CloudSettingsTimeoutError extends Error {
  constructor() {
    super('Cloud settings fetch timeout');
    this.name = 'CloudSettingsTimeoutError';
  }
}

/**
 * Creates a cancellable timeout promise
 * Prevents memory leaks by allowing cleanup
 */
function createCancellableTimeout(ms: number) {
  let timeoutId: NodeJS.Timeout;
  const promise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new CloudSettingsTimeoutError()), ms);
  });
  
  return {
    promise,
    cancel: () => clearTimeout(timeoutId),
  };
}

/**
 * Hook to initialize all settings on app startup
 * Loads settings from local storage first, then syncs with cloud if authenticated
 */
export function useSettingsInitialization(): SettingsInitializationStatus {
  const { user, isAuthenticated, loading } = useAuth();
  const hasInitialized = useRef(false);
  const [status, setStatus] = useState<SettingsInitializationStatus>({
    isInitialized: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Prevent multiple initializations
    if (loading || hasInitialized.current) {
      return;
    }

    const initializeSettings = async () => {
      try {
        setStatus(prev => ({ ...prev, isLoading: true, error: null }));

        // Step 1: Load settings from local storage (always available)
        console.log('Loading settings from local storage...');
        const localSettings = storageService.get<AppSettings>('settings');
        
        if (localSettings && Object.keys(localSettings).length > 0) {
          console.log('Local settings loaded:', localSettings);
        } else {
          console.log('No local settings found');
        }

        // Step 2: If authenticated, load and merge with cloud settings
        if (isAuthenticated && user) {
          console.log('User authenticated, loading settings from cloud...');
          
          const timeout = createCancellableTimeout(CLOUD_SETTINGS_TIMEOUT_MS);
          
          try {
            const cloudSettings = await Promise.race([
              cloudSyncService.fetchSettings(user.id),
              timeout.promise
            ]);
            
            // Success - clean up timeout
            timeout.cancel();
            
            if (cloudSettings) {
              console.log('Cloud settings loaded:', cloudSettings);
              
              // Merge cloud settings with local settings (cloud takes precedence)
              const mergedSettings: AppSettings = {
                ...(localSettings || {}),
                ...(cloudSettings || {}),
              };
              
              // Save merged settings back to local storage
              storageService.set('settings', mergedSettings);
              console.log('Settings merged and saved to local storage');
            }
          } catch (cloudError) {
            // Clean up timeout on error
            timeout.cancel();
            
            if (cloudError instanceof CloudSettingsTimeoutError) {
              console.warn('Cloud settings fetch timed out, continuing with local settings');
              // Timeout is expected behavior in slow networks - not a critical error
            } else {
              console.warn('Failed to load cloud settings, using local settings:', cloudError);
              // Network errors are also non-critical - we have local fallback
            }
          }
        }

        setStatus({
          isInitialized: true,
          isLoading: false,
          error: null,
        });
        
        console.log('Settings initialization complete');
      } catch (error) {
        console.error('Error initializing settings:', error);
        setStatus({
          isInitialized: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    hasInitialized.current = true;
    initializeSettings();
  }, [isAuthenticated, user, loading]);

  return status;
}

/**
 * Hook to ensure settings are persisted across app sessions
 * Monitors settings changes and ensures they're saved
 */
export function useSettingsPersistence() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Subscribe to storage events to detect changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith('darkprod_')) {
        console.log('Settings changed in another tab:', event.key);
        // The contexts will automatically pick up the changes via useLocalStorage
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Set up periodic sync to cloud (every 5 minutes)
    if (!isAuthenticated || !user) return;

    const syncInterval = setInterval(async () => {
      try {
        console.log('Performing periodic settings sync...');
        const localSettings = storageService.get<AppSettings>('settings');
        if (localSettings) {
          await cloudSyncService.syncSettings(user.id, localSettings);
          console.log('Periodic settings sync complete');
        }
      } catch (error) {
        console.error('Periodic settings sync failed:', error);
      }
    }, PERIODIC_SYNC_INTERVAL_MS);

    return () => clearInterval(syncInterval);
  }, [isAuthenticated, user]);
}

/**
 * Hook to get comprehensive settings status
 */
export function useSettingsStatus() {
  const { user, isAuthenticated } = useAuth();
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    // Get last sync time from cloud sync service
    const lastSyncTime = cloudSyncService.getLastSyncTime();
    setLastSync(lastSyncTime);
  }, []);

  useEffect(() => {
    // Monitor sync status
    if (!isAuthenticated || !user) {
      setSyncError(null);
      return;
    }

    // Check if there are pending changes in sync queue
    const queue = cloudSyncService.getSyncQueue();
    if (queue.length > 0) {
      console.log(`${queue.length} settings changes pending sync`);
    }
  }, [isAuthenticated, user]);

  return {
    isAuthenticated,
    lastSync,
    syncError,
    isOnline: cloudSyncService.isConnected(),
  };
}
