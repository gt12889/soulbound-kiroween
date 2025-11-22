# Firebase Persistence Implementation for Companion Context

## Overview

This document describes the Firebase persistence implementation for the Spirit Companion system, enabling authenticated users to sync their companion data across devices in real-time.

## Implementation Details

### Cloud Sync Service Extensions

Added three new methods to `cloudSyncService.ts`:

1. **`syncCompanionData(userId, companionData)`**
   - Syncs companion data to Firestore
   - Stores data in `users/{userId}/companion/data` document
   - Uses merge strategy to preserve existing data
   - Includes server timestamp for sync tracking

2. **`fetchCompanionData(userId)`**
   - Fetches companion data from Firestore
   - Returns null if no data exists
   - Used for initial load when user authenticates

3. **`subscribeToCompanionData(userId, callback, onError)`**
   - Subscribes to real-time updates from Firestore
   - Calls callback when data changes
   - Returns unsubscribe function for cleanup
   - Handles errors gracefully

### Companion Context Updates

Added three new useEffect hooks to `CompanionContext.tsx`:

#### 1. Initial Load from Firebase
```typescript
useEffect(() => {
  // Loads companion data from Firebase when user authenticates
  // Merges cloud data with local state
  // Only runs when auth state changes
}, [isAuthenticated, user, ...setters]);
```

#### 2. Real-time Subscription
```typescript
useEffect(() => {
  // Subscribes to real-time updates from Firebase
  // Updates local state when cloud data changes
  // Unsubscribes on cleanup
}, [isAuthenticated, user, ...setters]);
```

#### 3. Sync to Cloud
```typescript
useEffect(() => {
  // Syncs local changes to Firebase
  // Debounced by 2 seconds to avoid excessive writes
  // Only syncs for authenticated users
}, [isAuthenticated, user, ...companionState]);
```

## Data Structure

Companion data stored in Firestore:

```typescript
{
  activeCompanion: CompanionType,
  unlockedCompanions: CompanionType[],
  customNames: Record<CompanionType, string | undefined>,
  skillTrees: Record<CompanionType, SkillTree>,
  stats: CompanionStats,
  mood: CompanionMood,
  completedRituals: string[],
  ritualProgress: RitualProgress[],
  syncedAt: Timestamp // Server timestamp
}
```

## Behavior

### For Authenticated Users

1. **On Login/Authentication:**
   - Fetches companion data from Firebase
   - Merges with local data (cloud data takes precedence)
   - Subscribes to real-time updates

2. **During Session:**
   - Local changes are synced to Firebase (debounced by 2s)
   - Remote changes are received in real-time
   - Both local and cloud data stay in sync

3. **On Logout:**
   - Unsubscribes from real-time updates
   - Local data remains in localStorage
   - No more syncing to cloud

### For Unauthenticated Users

- All data stored in localStorage only
- No Firebase operations performed
- Works completely offline

## Error Handling

- All Firebase operations wrapped in try-catch
- Errors logged to console but don't break the app
- Graceful degradation to localStorage-only mode
- Retry logic handled by cloudSyncService

## Testing

Comprehensive test suite in `CompanionContext.firebase.test.tsx`:

1. ✅ Loads data from Firebase on authentication
2. ✅ Subscribes to real-time updates
3. ✅ Syncs changes to Firebase
4. ✅ Doesn't sync when unauthenticated
5. ✅ Handles Firebase errors gracefully
6. ✅ Updates local state from real-time updates

All tests passing.

## Requirements Satisfied

- **Task 2.1:** Add Firebase persistence (authenticated users) ✅
- **Requirement 2.5:** Persist companion mood across sessions ✅
- **Requirement 6.4:** Persist custom names across devices ✅
- **Requirement 11.6:** Persist skill allocations across devices ✅

## Future Enhancements

1. **Conflict Resolution:**
   - Currently uses last-write-wins
   - Could implement more sophisticated merge strategies

2. **Offline Queue:**
   - Could queue changes when offline
   - Sync when connection restored

3. **Selective Sync:**
   - Could allow users to choose what to sync
   - Privacy controls for sensitive data

4. **Backup/Restore:**
   - Export companion data
   - Import from backup

## Performance Considerations

- **Debouncing:** 2-second delay prevents excessive writes
- **Merge Strategy:** Only updates changed fields
- **Real-time Updates:** Efficient Firestore listeners
- **Cleanup:** Proper unsubscribe on unmount

## Security

- Data scoped to user ID
- Firestore security rules should enforce:
  ```
  match /users/{userId}/companion/{document=**} {
    allow read, write: if request.auth.uid == userId;
  }
  ```

## Migration Notes

- Existing localStorage data preserved
- First sync uploads local data to cloud
- Subsequent logins merge cloud and local data
- No data loss during migration
