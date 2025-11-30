# Error Recovery Logic Implementation

## Overview
Implemented comprehensive error recovery logic for the Ghost Writer component following the design specifications.

## Features Implemented

### 1. Progressive Retry Strategy
The error recovery system implements a three-tier retry strategy:

#### First Failure (Retry Count = 0)
- Shows immediate retry button
- User can retry right away
- No delay or restrictions

#### Second Failure (Retry Count = 1)
- Implements 5-second cooldown before retry
- Shows countdown timer on retry button
- Button is disabled during countdown
- Automatically retries after 5 seconds
- User sees "Retry in Xs" message

#### Third+ Failure (Retry Count >= 2)
- Suggests checking settings
- Provides contextual help based on error type:
  - Invalid API Key → "Please check your API key in settings"
  - Network Error → "Please check your internet connection"
  - Rate Limit → "Rate limit exceeded. Please wait a few minutes"
  - Other errors → "Multiple failures detected. Please check your settings"
- For invalid API key errors, retry button is hidden (not retryable)

### 2. Retry Count Tracking
- `retryCountRef` tracks the number of consecutive failures
- Resets to 0 when user types new text (not a retry)
- Persists across retry attempts to implement progressive backoff

### 3. Context Preservation
- `lastContextRef` stores the last context and cursor position
- Allows retry to use the same context even if editor state changes
- Ensures consistent retry behavior

### 4. Countdown Timer
- `retryDelaySeconds` state tracks remaining seconds
- Updates every second during countdown
- Retry button shows "Retry in Xs" during countdown
- Button is disabled while countdown is active

### 5. Offline Detection
- Monitors `navigator.onLine` status
- Listens for `online` and `offline` events
- Shows offline warning banner when connection is lost
- Announces connection status to screen readers
- Automatically suggests retry when connection is restored
- If generating while offline, immediately shows network error

### 6. Settings Link
- Shows "⚙️ Open Settings" link for:
  - Invalid API key errors
  - Multiple failures (retry count >= 2)
- Navigates to settings page when clicked
- Helps users fix configuration issues

### 7. Enhanced Error Display
The `GhostErrorDisplay` component now supports:
- `retryDelaySeconds` prop - shows countdown on retry button
- `retryCount` prop - determines which messages to show
- Disabled state for retry button during countdown
- Dynamic retry button text based on state:
  - "Retry" (first attempt)
  - "Retry Again" (second attempt)
  - "Try Once More" (third+ attempt)
  - "Retry in Xs" (during countdown)

### 8. Automatic Retry
- After second failure, system waits 5 seconds then automatically retries
- Uses `retryTimeoutRef` to manage the timeout
- Clears timeout on component unmount or manual retry

### 9. Screen Reader Announcements
- Announces retry attempts
- Announces connection status changes
- Announces when retry is available after connection restore
- Provides accessible feedback for all error recovery actions

## Code Changes

### GhostWriter.tsx
1. Added error recovery state:
   - `retryCountRef` - tracks retry attempts
   - `retryTimeoutRef` - manages automatic retry timeout
   - `retryDelaySeconds` - countdown state
   - `lastContextRef` - preserves context for retry
   - `isOnline` - tracks network status

2. Updated `handleTextChange`:
   - Stores context in `lastContextRef`
   - Resets retry count on new user input

3. Enhanced error handling:
   - Implements progressive retry strategy
   - Shows different messages based on retry count
   - Starts countdown timer on second failure
   - Schedules automatic retry after 5 seconds
   - Detects offline state

4. Updated `handleRetry`:
   - Increments retry count
   - Clears countdown timer
   - Uses preserved context from `lastContextRef`

5. Added online/offline monitoring:
   - Listens for network events
   - Shows offline warning
   - Announces status changes
   - Suggests retry when connection restored

6. Updated error display props:
   - Passes `retryDelaySeconds`
   - Passes `retryCount`
   - Disables retry button during countdown

7. Added cleanup:
   - Clears retry timeout on unmount

### GhostErrorDisplay.tsx
1. Added new props:
   - `retryDelaySeconds?: number`
   - `retryCount?: number`

2. Added helper functions:
   - `getRetryButtonText()` - dynamic button text
   - `showSettingsLink` - determines when to show settings

3. Enhanced UI:
   - Settings link for API key errors and multiple failures
   - Disabled state for retry button during countdown
   - Dynamic retry button text based on state

### GhostErrorDisplay.module.css
1. Added styles:
   - `.settingsLink` - container for settings link
   - `.link` - styled link with hover effects
   - `.retryButton:disabled` - disabled button state

### GhostWriter.module.css
1. Added `.offlineWarning` style:
   - Red-tinted warning banner
   - Pulse animation
   - Prominent visibility

## Testing Considerations

The existing retry tests need to be updated to:
1. Use the correct selector for the contenteditable editor
2. Account for the progressive retry strategy
3. Test countdown timer functionality
4. Test offline detection
5. Test settings link visibility

## Design Compliance

This implementation follows the design document specifications:
- ✅ First failure → Immediate retry button
- ✅ Second failure → Wait 5s, show retry
- ✅ Third failure → Suggest checking settings
- ✅ Network error → Show offline message
- ✅ Rate limited → Show cooldown timer
- ✅ Invalid key → Link to settings

## Future Enhancements

Potential improvements:
1. Exponential backoff for multiple failures
2. Persistent retry count across sessions
3. More sophisticated offline detection
4. Retry history tracking
5. Analytics for error patterns
