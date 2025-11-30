# CompanionContext localStorage Persistence

## Overview

The CompanionContext implements comprehensive localStorage persistence for all companion-related state. This ensures that user progress, preferences, and companion data are preserved across browser sessions.

## Implementation

### Storage Hook

The implementation uses the `useLocalStorage` hook from `src/hooks/useLocalStorage.ts`, which provides:

- **Automatic persistence**: State changes are automatically saved to localStorage with 1-second debouncing
- **Cross-tab synchronization**: Changes in one tab are reflected in other tabs via storage events
- **Error handling**: Graceful handling of storage quota exceeded and other errors
- **Type safety**: Full TypeScript support with generic types

### Persisted State

All companion state is persisted to localStorage with the following keys (prefixed with `darkprod_`):

#### Core Companion State
- `activeCompanion`: Currently active companion type (shadow/forest/ember)
- `unlockedCompanions`: Array of unlocked companion types
- `companionCustomNames`: Custom names for each companion type

#### Mood and Interaction
- `companionMood`: Complete mood state including current mood, history, and timestamps
- `companionLastInteraction`: Timestamp of last user interaction
- `companionInteractionCount`: Total interaction count
- `companionDailyInteractions`: Daily interaction counter with date tracking

#### Progression
- `companionSkillTrees`: Skill trees for all three companion types including:
  - Level and experience
  - Unlocked skills
  - Available skill points
  - Skill branches (power, wisdom, charm)

#### Rituals
- `companionRitualProgress`: Progress tracking for all rituals
- `companionCompletedRituals`: Array of completed ritual IDs

#### Statistics
- `companionStats`: Comprehensive statistics including:
  - Total tasks completed
  - Current and longest streaks
  - Total interactions
  - Rituals completed
  - Bonding date

#### Settings
- `companionAudioEnabled`: Audio on/off toggle
- `companionAudioVolume`: Volume level (0-100)
- `companionAnimationIntensity`: Animation level (full/reduced/minimal)
- `companionMultiSpiritInteractions`: Multi-spirit interaction toggle

## Storage Service

The underlying `storageService` (from `src/services/storageService.ts`) provides:

- **Namespacing**: All keys are prefixed with `darkprod_` to avoid conflicts
- **JSON serialization**: Automatic serialization/deserialization of complex objects
- **Quota management**: Detection and handling of storage quota exceeded errors
- **Type safety**: Generic get/set methods with TypeScript support

## Cloud Sync Integration

For authenticated users, the CompanionContext also syncs data to Firebase:

```typescript
useEffect(() => {
  const syncToCloud = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      await cloudSyncService.syncSettings(user.id, {
        companionData: {
          activeCompanion,
          unlockedCompanions,
          customNames,
          skillTrees,
          stats,
          mood,
          completedRituals,
        },
      });
    } catch (error) {
      console.error('Failed to sync companion data to cloud:', error);
    }
  };
  
  const timeoutId = setTimeout(syncToCloud, 2000);
  return () => clearTimeout(timeoutId);
}, [/* dependencies */]);
```

This provides:
- **Cross-device sync**: Access companion data from any device
- **Backup**: Cloud backup of companion progress
- **Debounced sync**: 2-second delay to avoid excessive API calls

## Testing

The localStorage persistence is tested in `CompanionContext.test.tsx`:

```typescript
it('should persist state to localStorage', () => {
  const { result } = renderHook(() => useCompanion(), {
    wrapper: AllProviders,
  });

  act(() => {
    result.current.setCustomName('shadow', 'TestName');
    result.current.interact();
  });

  // Verify the state is updated in the context
  expect(result.current.customNames.shadow).toBe('TestName');
  expect(result.current.interactionCount).toBeGreaterThan(0);
});
```

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 2.5**: "THE system SHALL persist the companion's mood state across sessions"
- **Requirement 6.4**: "THE system SHALL persist the custom name across sessions and devices"
- **Requirement 11.6**: "THE system SHALL persist skill allocations across sessions and devices"
- **Task 2.1**: "Add localStorage persistence" ✅

## Usage Example

The persistence is automatic and transparent to consumers of the context:

```typescript
function MyComponent() {
  const { 
    activeCompanion,
    customNames,
    setCustomName,
    interact 
  } = useCompanion();
  
  // All state changes are automatically persisted
  const handleNameChange = (name: string) => {
    setCustomName(activeCompanion, name);
    // Automatically saved to localStorage after 1 second
  };
  
  const handleInteraction = () => {
    interact();
    // Interaction count automatically persisted
  };
  
  return (
    <div>
      <h1>{customNames[activeCompanion] || activeCompanion}</h1>
      <button onClick={handleInteraction}>Interact</button>
    </div>
  );
}
```

## Performance Considerations

- **Debouncing**: 1-second debounce prevents excessive localStorage writes
- **Selective updates**: Only changed values trigger storage updates
- **Async operations**: Storage operations don't block the UI
- **Error recovery**: Failed storage operations don't crash the app

## Future Enhancements

Potential improvements for future iterations:

1. **Compression**: Compress large objects before storing
2. **Versioning**: Add version numbers for migration support
3. **Selective sync**: Allow users to choose what to sync to cloud
4. **Export/Import**: Allow manual backup and restore of companion data
5. **Storage analytics**: Track storage usage and provide cleanup suggestions
