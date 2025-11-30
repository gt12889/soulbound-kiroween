# Keyboard Shortcuts Implementation

## Overview
This document describes the keyboard shortcuts implementation for the Ghost Writer component.

## Implemented Shortcuts

### 1. Tab / Enter - Accept Suggestion
- **Keys**: `Tab` or `Enter`
- **Action**: Accepts the current AI suggestion
- **Conditions**: Only works when:
  - A suggestion is visible (`suggestions.length > 0`)
  - State is `READY` (not generating or accepting)
- **Behavior**: 
  - Prevents default browser behavior
  - Triggers acceptance animation
  - Inserts suggestion text into editor
  - Announces "Suggestion accepted" to screen readers

### 2. Escape - Reject Suggestion
- **Key**: `Esc`
- **Action**: Rejects/dismisses the current AI suggestion
- **Conditions**: Only works when:
  - A suggestion is visible (`suggestions.length > 0`)
  - State is `READY` or `ACCEPTING`
- **Behavior**:
  - Prevents default browser behavior
  - Removes suggestion from display
  - Resets state to `IDLE`
  - Announces "Suggestion rejected" to screen readers

### 3. Ctrl+R - Regenerate Suggestion
- **Keys**: `Ctrl` + `R`
- **Action**: Regenerates a new AI suggestion
- **Conditions**: Only works when:
  - A suggestion is visible (`suggestions.length > 0`)
  - State is `READY` (not generating or accepting)
- **Behavior**:
  - Prevents default browser behavior (stops page refresh)
  - Clears current suggestion
  - Triggers new AI generation with same context
  - Announces "Regenerating suggestion" to screen readers

## Implementation Details

### Event Listener Setup
```typescript
useEffect(() => {
  // Only add keyboard listeners when suggestions are visible
  if (suggestions.length === 0 || ghostState.isGenerating) {
    return;
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    // Handle Tab/Enter, Escape, and Ctrl+R
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [suggestions, ghostState, handlers]);
```

### State Guards
The implementation includes proper state guards to ensure shortcuts only work in appropriate states:
- Shortcuts are disabled during generation (`ghostState.isGenerating`)
- Shortcuts are disabled when no suggestions are visible
- Accept/Regenerate only work in `READY` state
- Reject works in both `READY` and `ACCEPTING` states

### UI Feedback
The shortcuts are displayed in the UI when suggestions are visible:
```
Tab/Enter Accept • Esc Reject • Ctrl+R Regenerate
```

## Accessibility
- All keyboard actions include screen reader announcements
- Shortcuts follow standard conventions (Esc to dismiss, Enter to accept)
- Visual hints are provided in the UI
- Focus management ensures keyboard navigation works smoothly

## Testing
To manually test the keyboard shortcuts:

1. **Test Accept (Tab/Enter)**:
   - Type at least 10 characters in the editor
   - Wait for suggestion to appear
   - Press `Tab` or `Enter`
   - Verify suggestion is accepted and inserted into text

2. **Test Reject (Escape)**:
   - Type at least 10 characters in the editor
   - Wait for suggestion to appear
   - Press `Esc`
   - Verify suggestion disappears

3. **Test Regenerate (Ctrl+R)**:
   - Type at least 10 characters in the editor
   - Wait for suggestion to appear
   - Press `Ctrl+R`
   - Verify new suggestion is generated

4. **Test State Guards**:
   - Press shortcuts when no suggestion is visible - should do nothing
   - Press shortcuts during generation - should do nothing
   - Verify browser default behaviors are prevented (no page refresh on Ctrl+R)

## Requirements Validation
✅ **US-4**: Interactive controls to review suggestions
- Keyboard shortcuts provide alternative to mouse interactions
- Clear action mapping (Tab/Enter = Accept, Esc = Reject, Ctrl+R = Regenerate)
- Shortcuts displayed in UI

✅ **Accessibility Requirements**:
- Keyboard navigation support
- Screen reader announcements
- Focus management
- Standard keyboard conventions

## Future Enhancements
- Alt+1/2/3 for selecting between multiple suggestion variants (Phase 6)
- Customizable keyboard shortcuts via settings
- Keyboard shortcut help overlay (?)
