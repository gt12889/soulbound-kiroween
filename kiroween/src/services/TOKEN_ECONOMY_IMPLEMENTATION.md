# Token Economy System Implementation

## Overview

Implemented the complete token economy system for streak recovery, including token earning rules, usage validation, and the 48-hour recovery window.

## Implementation Date

December 1, 2024

## Files Modified

### Core Implementation
- **`src/services/streakService.ts`**: Added token economy functions

### Tests
- **`src/services/streakService.tokens.test.ts`**: Comprehensive test suite (39 tests, all passing)

## Features Implemented

### 1. Token Earning Rules

#### `calculateTokensForMilestone(milestoneDay: MilestoneDay): number`
Calculates how many tokens should be awarded for reaching a milestone:
- 30 days → 1 token
- 100 days → 2 tokens
- 365 days → 3 tokens
- Other milestones → 0 tokens

#### `awardTokensForMilestone(streakData, milestoneDay): TokenData`
Awards tokens for reaching a milestone while enforcing the 3-token maximum:
- Adds tokens to available count
- Caps at 3 tokens maximum
- Tracks total earned tokens
- Returns updated token data

### 2. Milestone Detection

#### `detectMilestoneReached(previousStreak, currentStreak): MilestoneDay | null`
Detects when a streak crosses a milestone threshold:
- Checks all milestones: 3, 7, 14, 30, 60, 100, 365 days
- Returns the first milestone crossed
- Returns null if no milestone reached
- Handles edge cases (decreasing streaks, already at milestone)

### 3. Token Usage Validation

#### `validateTokenUsageDetailed(streakData, streakType, missedDate, currentDate): TokenValidation`
Validates if a token can be used for streak recovery with detailed reasons:

**Validation Rules:**
1. **Has tokens available** - User must have at least 1 token
2. **Streak is broken** - Can't use token on active streak
3. **Within 48-hour window** - Must be within 48 hours of missed date

**Return Values:**
- `{ allowed: true }` - Token can be used
- `{ allowed: false, reason: 'no_tokens' }` - No tokens available
- `{ allowed: false, reason: 'already_active' }` - Streak still active
- `{ allowed: false, reason: 'too_late' }` - Outside 48-hour window

#### `useRecoveryToken(streakData, streakType, missedDate, currentDate): StreakData | null`
Uses a recovery token to restore a broken streak:
- Validates token usage first
- Decrements available tokens
- Increments used tokens count
- Marks missed date as having activity
- Returns updated streak data or null if validation fails

### 4. Recovery Window Management

#### `isWithinRecoveryWindow(missedDate, currentDate): boolean`
Checks if the 48-hour recovery window is still open:
- Calculates hours since missed date
- Returns true if ≤ 48 hours
- Returns false if > 48 hours

#### `getRecoveryWindowHoursRemaining(missedDate, currentDate): number`
Calculates hours remaining in the recovery window:
- Returns hours remaining (0-48)
- Returns 0 if window expired
- Useful for UI countdown displays

### 5. Token Maximum Enforcement

#### `enforceTokenMaximum(tokenData): TokenData`
Enforces the 3-token maximum limit:
- Caps available tokens at 3
- Preserves earned and used counts
- Returns updated token data

#### `canEarnMoreTokens(streakData): boolean`
Checks if user can earn more tokens:
- Returns true if available < 3
- Returns false if at maximum
- Useful for UI displays

### 6. Token Milestone Tracking

#### `getNextTokenMilestone(currentStreak): MilestoneDay | null`
Gets the next milestone that awards tokens:
- Returns 30, 100, or 365
- Returns null if no more token milestones
- Only considers token-awarding milestones

#### `daysUntilNextToken(currentStreak): number`
Calculates days until next token-earning milestone:
- Returns days remaining
- Returns 0 if no more token milestones
- Useful for progress displays

## Test Coverage

### Test Suite: `streakService.tokens.test.ts`
**Total Tests: 39 (all passing)**

#### Token Earning Rules (13 tests)
- ✅ calculateTokensForMilestone (4 tests)
  - Awards correct tokens for each milestone
  - Awards 0 for non-token milestones
- ✅ awardTokensForMilestone (4 tests)
  - Adds tokens when below maximum
  - Enforces 3-token maximum
  - Handles large token awards
  - Preserves tokens for non-token milestones
- ✅ detectMilestoneReached (5 tests)
  - Detects milestone crossings
  - Returns null when no milestone crossed
  - Handles multiple milestones
  - Handles edge cases

#### Token Usage Validation (7 tests)
- ✅ validateTokenUsageDetailed (5 tests)
  - Allows valid token usage
  - Rejects when no tokens
  - Rejects when streak active
  - Rejects when outside window
  - Allows at exactly 48 hours
- ✅ useRecoveryToken (2 tests)
  - Uses token and restores streak
  - Returns null on validation failure

#### Recovery Window (6 tests)
- ✅ isWithinRecoveryWindow (3 tests)
  - Returns true within 48 hours
  - Returns false after 48 hours
  - Handles exact 48-hour boundary
- ✅ getRecoveryWindowHoursRemaining (3 tests)
  - Calculates remaining hours
  - Returns 0 when expired
  - Handles fractional hours

#### Token Maximum Enforcement (6 tests)
- ✅ enforceTokenMaximum (3 tests)
  - Caps tokens at 3
  - Preserves tokens below maximum
  - Handles exact maximum
- ✅ canEarnMoreTokens (3 tests)
  - Returns true when below maximum
  - Returns false at maximum
  - Handles zero tokens

#### Token Milestone Tracking (7 tests)
- ✅ getNextTokenMilestone (4 tests)
  - Returns correct next milestone
  - Returns null when no more milestones
- ✅ daysUntilNextToken (3 tests)
  - Calculates days correctly
  - Returns 0 when no more milestones
  - Handles exact milestone values

## Usage Examples

### Awarding Tokens on Milestone
```typescript
import { detectMilestoneReached, awardTokensForMilestone } from './streakService';

// When streak increments
const previousStreak = 29;
const currentStreak = 30;

const milestone = detectMilestoneReached(previousStreak, currentStreak);
if (milestone) {
  const updatedTokens = awardTokensForMilestone(streakData, milestone);
  // updatedTokens.available will be incremented by 1
}
```

### Validating Token Usage
```typescript
import { validateTokenUsageDetailed } from './streakService';

const validation = validateTokenUsageDetailed(
  streakData,
  'login',
  '2024-12-01',
  new Date()
);

if (validation.allowed) {
  // Show recovery modal
} else {
  // Show error message based on validation.reason
  switch (validation.reason) {
    case 'no_tokens':
      showError('You have no recovery tokens available');
      break;
    case 'already_active':
      showError('Your streak is still active');
      break;
    case 'too_late':
      showError('Recovery window has expired (48 hours)');
      break;
  }
}
```

### Using Recovery Token
```typescript
import { useRecoveryToken } from './streakService';

const updatedData = useRecoveryToken(
  streakData,
  'login',
  '2024-12-01',
  new Date()
);

if (updatedData) {
  // Token used successfully
  // updatedData.tokens.available decreased by 1
  // updatedData.activityHistory['2024-12-01'] marked as active
  saveStreakData(updatedData);
} else {
  // Validation failed
  showError('Unable to use recovery token');
}
```

### Checking Recovery Window
```typescript
import { getRecoveryWindowHoursRemaining } from './streakService';

const missedDate = new Date('2024-12-01');
const hoursLeft = getRecoveryWindowHoursRemaining(missedDate);

if (hoursLeft > 0) {
  showMessage(`You have ${Math.floor(hoursLeft)} hours to recover this streak`);
} else {
  showMessage('Recovery window has expired');
}
```

## Edge Cases Handled

1. **Token Maximum**: Tokens are capped at 3, even if multiple milestones would award more
2. **Recovery Window**: Exactly 48 hours is considered valid (≤ 48, not < 48)
3. **Active Streaks**: Cannot use token on a streak that's still active
4. **Multiple Milestones**: If somehow jumping multiple milestones, detects the first one
5. **Decreasing Streaks**: Returns null when streak decreases
6. **Expired Windows**: Returns 0 hours remaining when window expired
7. **Fractional Hours**: Handles sub-hour precision in recovery window

## Integration Points

### StreakContext
The token economy functions will be integrated into StreakContext:
- Call `detectMilestoneReached()` when streak increments
- Call `awardTokensForMilestone()` when milestone detected
- Call `validateTokenUsageDetailed()` before showing recovery modal
- Call `useRecoveryToken()` when user confirms token usage

### UI Components
- **StreakRecoveryModal**: Uses validation functions to enable/disable recovery
- **StreakTokens**: Displays available tokens and next token milestone
- **StreakCard**: Shows recovery window countdown if applicable

## Next Steps

1. **Task 3.2**: Create StreakRecoveryModal component
2. **Task 3.3**: Create StreakTokens display component
3. **Task 3.4**: Implement notification system for streak warnings
4. Integrate token functions into StreakContext
5. Add token usage to Firebase sync

## Acceptance Criteria Status

✅ **Tokens earned at correct milestones**
- 30 days → 1 token
- 100 days → 2 tokens
- 365 days → 3 tokens

✅ **Can't use token after 48 hours**
- Validation rejects with 'too_late' reason
- Recovery window properly enforced

✅ **Can't exceed 3 tokens**
- Maximum enforced in awardTokensForMilestone
- enforceTokenMaximum caps at 3

✅ **All edge cases handled**
- Active streaks
- No tokens available
- Expired windows
- Multiple milestones
- Token maximum

## Notes

- All functions are pure and side-effect free
- Comprehensive test coverage (39 tests)
- TypeScript types ensure type safety
- Functions are composable and reusable
- Clear error reasons for validation failures
