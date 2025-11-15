/**
 * Sync Status Indicator Component
 * Displays sync status, last sync time, and provides manual sync button
 * Requirements: 17.3
 */

import { useAuth } from '../../contexts/AuthContext';
import { useCloudSync } from '../../hooks/useCloudSync';
import styles from './SyncStatusIndicator.module.css';

export const SyncStatusIndicator = () => {
  const { user } = useAuth();
  const { syncStatus, syncNow, isOnline } = useCloudSync({
    userId: user?.id || null,
    autoSync: true,
  });

  if (!user) {
    return null; // Don't show sync status if not logged in
  }

  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Never';
    
    // Ensure date is a Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleSyncClick = async () => {
    if (!syncStatus.syncing && isOnline) {
      await syncNow();
    }
  };

  return (
    <div className={styles.syncIndicator}>
      <div className={styles.statusContainer}>
        {/* Online/Offline Indicator */}
        <div className={`${styles.statusDot} ${isOnline ? styles.online : styles.offline}`} 
             title={isOnline ? 'Online' : 'Offline'} />
        
        {/* Sync Status */}
        <div className={styles.statusText}>
          {syncStatus.syncing ? (
            <span className={styles.syncing}>
              <span className={styles.syncSpinner} />
              Syncing...
            </span>
          ) : syncStatus.error ? (
            <span className={styles.error} title={syncStatus.error}>
              Sync Error
            </span>
          ) : syncStatus.pendingChanges > 0 ? (
            <span className={styles.pending}>
              {syncStatus.pendingChanges} pending
            </span>
          ) : (
            <span className={styles.synced}>
              Synced {formatLastSync(syncStatus.lastSync)}
            </span>
          )}
        </div>

        {/* Manual Sync Button */}
        <button
          className={styles.syncButton}
          onClick={handleSyncClick}
          disabled={syncStatus.syncing || !isOnline}
          title="Sync now"
          aria-label="Sync now"
        >
          <svg
            className={`${styles.syncIcon} ${syncStatus.syncing ? styles.spinning : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
        </button>
      </div>

      {/* Error Message */}
      {syncStatus.error && (
        <div className={styles.errorMessage}>
          {syncStatus.error}
        </div>
      )}
    </div>
  );
};
