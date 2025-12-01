# Token Usage Validation Implementation

## Overview

Token usage validation ensures that streak recovery tokens can only be used under specific conditions defined in the requirements (AC5: Streak Recovery System).

## Validation Rules

The token validation system enforces three critical rules:

### Rule 1: Token Availability
- **Requirement**: User must have at least 1 token available
- **Implementation**: `streakData.tokens.available > 0`
- **Reason Code**: `'no_tokens'`
- **Test Coverage**: ✅ Comprehensive

### Rule 2: Streak Must Be Broken
- **Requirement**: The streak must actually be broken (current = 0)
- **Implementation**: `streakInfo.current === 0`
- **Reason Code**: `'already_active'`
- **Test Coverage**: ✅ Comprehensive
- **Rationale**: Prevents wasting tokens on active streaks

### Rule 3: 48-Hour Recovery Window
- **Requirement**: Token must be used within 48 hours of missing the day
- **Implementation**: `(currentDate - missedDate) <= 48 hours`
- **Reason Code**: `'too_late'`
- **Test Coverage**: ✅ Comprehensive
- **Edge Cases Handled**:
  - Exactly at 48 hours: ✅ Allowed
  - 48 hours + 1 second: ✅ Rejected
  - Fractional hours: ✅ Handled correctly
  - Midnight boundaries: ✅ Handled correctly

## API Functions

### `validateTokenUsage(streakData, streakType, missedDate)`

Basic validation function that checks all three rules.

```typescript
const validation = validateTokenUsage(streakData, 'login', '2024-01-02');
if (validation.allowed) {
  // Can use token
} else {
  // Cannot use token
  console.log(validation.reason); // 'no_tokens' | 'already_active' | 'too_late'
}
```

**Returns**: `TokenValidation`
- `allowed: boolean` - Whether token can be used
- `reason?: string` - Reason if not allowed

### `validateTokenUsageDetailed(streakData, streakType, missedDate, currentDate)`

Detailed validation with explicit current date parameter for testing.

```typescript
const currentDate = new Date();
const validation = validateTokenUsageDetailed(
  streakData,
  'task',
  '2024-01-02',
  currentDate
);
```

**Returns**: `TokenValidation` (same as above)

### `canUseRecoveryToken(streakData, streakType, missedDate, currentDate)`

Boolean check for whether a token can be used.

```typescript
const canUse = canUseRecoveryToken(
  streakData,
  'login',
  new Date('2024-01-02'),
  new Date()
);
```

**Returns**: `boolean`

### `useRecoveryToken(streakData, streakType, missedDate, currentDate)`

Actually uses a token to recover a streak. Includes validation.

```typescript
const updatedData = useRecoveryToken(
  streakData,
  'login',
  '2024-01-02',
  new Date()
);

if (updatedData) {
  // Token used successfully
  // updatedData.tokens.available decreased by 1
  // updatedData.tokens.used increased by 1
  // Activity history updated for missed date
} else {
  // Validation failed
}
```

**Returns**: `StreakData | null`
- Returns updated streak data if successful
- Returns `null` if validation fails

## Validation Flow

```
User attempts to use token
         ↓
Check Rule 1: Has tokens?
         ↓ No → Return { allowed: false, reason: 'no_tokens' }
         ↓ Yes
Check Rule 2: Streak broken?
         ↓ No → Return { allowed: false, reason: 'already_active' }
         ↓ Yes
Check Rule 3: Within 48 hours?
         ↓ No → Return { allowed: false, reason: 'too_late' }
         ↓ Yes
Return { allowed: true }
```

## Integration Points

### StreakContext

The validation is integrated into the StreakContext:

```typescript
const useRecoveryToken = useCallback(async (streakType: StreakType) => {
  const streakInfo = getStreakInfo(streaks, streakType);
  
  // Validate token usage
  const validation = validateTokenUsage(
    streaks,
    streakType,
    streakInfo.lastActivityDate
  );
  
  if (!validation.allowed) {
    // Show error message based on validation.reason
    return false;
  }
  
  // Use the token...
}, [streaks]);
```

### UI Components

Components can use the validation to show appropriate messages:

```typescript
const validation = validateTokenUsage(streaks, 'login', missedDate);

if (!validation.allowed) {
  switch (validation.reason) {
    case 'no_tokens':
      showMessage('You have no recovery tokens available');
      break;
    case 'already_active':
      showMessage('Your streak is still active');
      break;
    case 'too_late':
      showMessage('Recovery window has expired (48 hours)');
      break;
  }
}
```

## Test Coverage

### Unit Tests
- ✅ Token availability checks (3 tests)
- ✅ Streak broken checks (2 tests)
- ✅ 48-hour window checks (5 tests)
- ✅ Combined validation rules (4 tests)
- ✅ Different streak types (4 tests)
- ✅ Edge cases (4 tests)
- ✅ Integration with useRecoveryToken (2 tests)

**Total**: 24 comprehensive tests

### Test Files
- `streakService.tokens.test.ts` - Token economy tests (39 tests)
- `streakService.tokenValidation.test.ts` - Validation tests (24 tests)

## Edge Cases Handled

1. **Exactly 48 hours**: Allowed ✅
2. **48 hours + 1 second**: Rejected ✅
3. **Fractional hours**: Handled correctly ✅
4. **Midnight boundaries**: Handled correctly ✅
5. **Empty lastActivityDate**: Handled gracefully ✅
6. **Multiple tokens available**: Works correctly ✅
7. **All streak types**: Login, Task, Note, Focus ✅

## Requirements Validation

### AC5: Streak Recovery System

| Requirement | Implementation | Status |
|------------|----------------|--------|
| Users earn 1 token per 30-day streak | `calculateTokensForMilestone(30) = 1` | ✅ |
| Tokens can be used within 48 hours | `isWithinRecoveryWindow()` | ✅ |
| Maximum 3 tokens can be held | `enforceTokenMaximum()` | ✅ |
| Token usage validation | `validateTokenUsage()` | ✅ |

## Performance Considerations

- All validation functions are O(1) time complexity
- No database queries during validation
- Validation happens synchronously
- Minimal memory footprint

## Future Enhancements

Potential improvements for future iterations:

1. **Configurable recovery window**: Allow users to see different windows
2. **Token expiration**: Tokens expire after X days
3. **Token trading**: Exchange tokens between streak types
4. **Partial recovery**: Use half a token for partial recovery
5. **Token history**: Track when and how tokens were used

## Related Files

- `src/services/streakService.ts` - Core validation logic
- `src/contexts/StreakContext.tsx` - Context integration
- `src/types/streak.ts` - Type definitions
- `src/services/streakService.tokens.test.ts` - Token economy tests
- `src/services/streakService.tokenValidation.test.ts` - Validation tests

## Completion Status

✅ **Task 3.1: Implement token usage validation** - COMPLETE

All validation rules implemented and tested:
- ✅ Token availability check
- ✅ Streak broken check
- ✅ 48-hour recovery window check
- ✅ Comprehensive test coverage (63 tests total)
- ✅ Edge cases handled
- ✅ Integration with StreakContext
- ✅ Documentation complete
