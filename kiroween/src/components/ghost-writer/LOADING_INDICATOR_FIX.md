# Loading Indicator Fix - No Interruption During Typing

## Issue

When typing in Ghost Writer, the automatic AI suggestion generation was showing a loading indicator that interrupted the writing experience. The loading indicator should only appear for **manual/explicit** generation requests (like double-Tab, regenerate, or retry), not for automatic background suggestions that happen while typing.

## Root Cause

The `showLoadingIndicator` state was being set to `true` after a 200ms delay for **all** generation requests, including:
- ✅ Manual requests (double-Tab, regenerate button, retry button)
- ❌ Automatic requests (background suggestions while typing)

This caused the loading overlay to appear and interrupt the user's typing flow.

## Solution

### 1. Added Manual Generation Tracking

Added a new state variable to track whether the current generation was manually triggered:

```typescript
const [isManualGeneration, setIsManualGeneration] = useState(false);
```

### 2. Updated `handleTextChange` Function

Modified the function signature to accept an `isManual` parameter:

```typescript
const handleTextChange = useCallback(async (
  _text: string, 
  context: string, 
  position: number, 
  isManual: boolean = false  // New parameter
) => {
  // Track if this is a manual generation
  setIsManualGeneration(isManual);
  
  // Only show loading indicator for manual generation
  if (isManual) {
    loadingDelayTimeoutRef.current = setTimeout(() => {
      setShowLoadingIndicator(true);
    }, 200);
  }
  // ... rest of the function
}, []);
```

### 3. Updated All Manual Generation Calls

Updated all places where generation is manually triggered to pass `isManual: true`:

**Regenerate Button:**
```typescript
handleTextChange('', context, position, true); // Manual request
```

**Retry Button:**
```typescript
handleTextChange('', context, position, true); // Manual retry
```

**Double-Tab Shortcut:**
```typescript
handleTextChange('', context, position, true); // Manual generation
```

**Automatic Typing (unchanged):**
```typescript
handleTextChange('', context, position); // Defaults to false (automatic)
```

## Behavior After Fix

### Automatic Generation (While Typing)
- ✅ Optimistic suggestion appears immediately
- ✅ Real suggestion replaces optimistic one when ready
- ✅ **NO loading indicator shown**
- ✅ Writing experience is uninterrupted

### Manual Generation (Explicit Request)
- ✅ Optimistic suggestion appears immediately
- ✅ Loading indicator appears after 200ms delay
- ✅ Real suggestion replaces optimistic one when ready
- ✅ Loading indicator disappears
- ✅ User gets visual feedback that their action is being processed

## User Experience Improvements

1. **Seamless Typing**: Users can type continuously without visual interruptions
2. **Clear Feedback**: Manual actions (double-Tab, regenerate, retry) show loading state
3. **Optimistic UI**: Both automatic and manual requests show instant optimistic suggestions
4. **Consistent Behavior**: Loading indicator only appears when user explicitly requests generation

## Testing

To verify the fix:

1. **Automatic Generation Test**:
   - Type continuously in the editor
   - Observe that suggestions appear without loading indicator
   - Writing flow should be uninterrupted

2. **Manual Generation Test**:
   - Press Tab-Tab (double-Tab)
   - Observe loading indicator appears
   - Click "Regenerate" button
   - Observe loading indicator appears
   - Click "Retry" after an error
   - Observe loading indicator appears

## Files Modified

- `kiroween/src/components/ghost-writer/GhostWriter.tsx`

## Related Requirements

- **Ghost Writer UX Requirement 8.2**: Optimistic UI updates
- **Ghost Writer UX Requirement 2.1**: Loading indicators
- **User Feedback**: Loading indicator should not interrupt typing experience

## Impact

- ✅ Improved writing experience
- ✅ No visual interruptions during typing
- ✅ Clear feedback for manual actions
- ✅ Maintains all existing functionality
- ✅ No breaking changes
