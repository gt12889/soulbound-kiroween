# Alt+1/2/3 Keyboard Shortcuts Implementation

## Overview
Implemented keyboard shortcuts Alt+1, Alt+2, and Alt+3 to allow users to quickly switch between multiple suggestion variants when available.

## Implementation Details

### Keyboard Shortcuts
- **Alt+1**: Select first suggestion variant
- **Alt+2**: Select second suggestion variant  
- **Alt+3**: Select third suggestion variant

### Features
1. **Current Suggestion Tracking**: Added `currentSuggestionIndex` state to track which suggestion is currently displayed
2. **Keyboard Event Handler**: Extended the existing keyboard shortcut handler to listen for Alt+1/2/3 key combinations
3. **Visual Indicator**: Added a variant indicator that shows "Suggestion X of Y" when multiple suggestions are available
4. **Screen Reader Support**: Announces when switching between variants
5. **Shortcut Hints**: Updated the UI to show Alt+1/2/3 hint when multiple suggestions are present

### Code Changes

#### GhostWriter.tsx
- Added `currentSuggestionIndex` state variable
- Updated keyboard event handler to handle Alt+1/2/3 keys
- Modified suggestion display to use `currentSuggestionIndex` instead of always showing `suggestions[0]`
- Added variant indicator UI element
- Updated shortcuts hint to include Alt+1/2/3 when multiple suggestions exist
- Reset index to 0 when suggestions change or are cleared

#### GhostWriter.module.css
- Added `.variantIndicator` styles for the suggestion counter display

### Usage
When multiple suggestions are available (future enhancement):
1. User generates suggestions
2. Multiple variants are displayed
3. User can press Alt+1, Alt+2, or Alt+3 to switch between them
4. The variant indicator shows which suggestion is currently selected
5. Pressing Tab/Enter accepts the currently selected variant

### Testing
Created `GhostWriter.variants.test.tsx` with 6 tests covering:
- Variant indicator display
- Alt+2 key press handling
- Alt+3 key press handling
- Out-of-range key handling (Alt+4)
- Shortcut hint visibility
- Accepting currently selected variant

All tests pass successfully.

### Future Enhancements
To fully utilize this feature, the GhostWriter component would need to:
1. Call `aiService.getSuggestions(context, 3)` instead of `getSuggestion(context)`
2. Store multiple suggestions in the state
3. Display all suggestions or use the SuggestionCarousel component

### Notes
- The keyboard shortcuts are only active when suggestions are visible and ready
- Invalid indices (e.g., Alt+4 when only 3 suggestions exist) are safely ignored
- The implementation is backward compatible with single-suggestion mode
- Screen reader announcements keep users informed of variant changes
