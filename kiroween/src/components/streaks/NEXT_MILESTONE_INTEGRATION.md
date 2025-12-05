# Next Token Milestone Integration Guide

## Overview

The StreakTokens component now displays the next token-earning milestone and days remaining. This guide shows how to integrate this feature using the StreakContext.

## Implementation

### Using StreakContext

The StreakContext provides a `nextMilestone` function that returns the next milestone for any streak type:

```typescript
import { useStreak } from '../contexts/StreakContext';
import { StreakTokens } from './StreakTokens';
import { getNextTokenMilestone, daysUntilNextToken } from '../services/streakService';

function MyComponent() {
  const { streaks, nextMilestone } = useStreak();
  
  if (!streaks) return null;
  
  // Get the next token-earning milestone based on login streak
  const currentStreak = streaks.loginStreak.current;
  const nextTokenMilestone = getNextTokenMilestone(currentStreak);
  const daysUntil = nextTokenMilestone ? daysUntilNextToken(currentStreak) : undefined;
  
  return (
    <StreakTokens
      availableTokens={streaks.tokens.available}
      nextTokenMilestone={nextTokenMilestone ?? undefined}
      daysUntilNextToken={daysUntil}
    />
  );
}
```

## Features

### 1. Tooltip Display
When milestone props are provided, the tooltip shows:
- "Next Token:" section
- Days remaining until milestone
- Milestone day count (e.g., "30-day milestone")

### 2. Inline Display
On desktop, an inline display shows:
- "Next token in X days"
- Hidden on mobile to save space

### 3. Token-Earning Milestones
Only these milestones award tokens:
- 30 days: +1 token
- 100 days: +2 tokens  
- 365 days: +3 tokens

## Testing

The feature is fully tested in `StreakTokens.test.tsx`:
- ✓ Shows milestone info when provided
- ✓ Hides milestone info when not provided
- ✓ Handles edge cases (0 days, 1 day remaining)

## Status

✅ Task 3.3 - Show next token milestone: **COMPLETE**
