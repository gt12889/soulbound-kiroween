# Keyboard-Only Navigation Analysis

## Test Results Summary

**Tests Passed:** 7/14
**Tests Failed:** 7/14

## Issues Identified

### 1. Focus Trap Not Working Properly ❌

**Problem:** When Tab is pressed, focus escapes the suggestion panel and goes to other elements on the page (like the "Summon Ghost Writer" button in the toolbar).

**Expected Behavior:** Focus should cycle between the three action buttons (Accept, Regenerate, Reject) and wrap around.

**Root Cause:** The `useFocusTrap` hook is attached to the suggestion container, but it's not preventing Tab from escaping to other focusable elements outside the container.

**Evidence:**
```
Expected element with focus: <button aria-label="Regenerate suggestion (Ctrl+R)">
Received element with focus: <button aria-label="Summon Ghost Writer assistant (Ctrl+G)">
```

### 2. Buttons Disabled During Accepting State ❌

**Problem:** When a suggestion is being accepted, all buttons are disabled (`disabled=""`), which prevents keyboard navigation.

**Expected Behavior:** Buttons should remain focusable even during the accepting animation, or focus should be managed differently.

**Root Cause:** The `disabled` prop is set to `true` when `ghostState.isAccepting` is true, which removes buttons from the tab order.

**Evidence:**
```html
<button
  aria-label="Accept suggestion (Tab or Enter)"
  class="_actionButton_f38d9b _acceptButton_f38d9b"
  disabled=""
>
```

### 3. Focus Not Restored to Editor ❌

**Problem:** After accepting or rejecting a suggestion, focus is not properly restored to the editor's contenteditable element.

**Expected Behavior:** Focus should return to the contenteditable div so the user can continue typing immediately.

**Root Cause:** The focus restoration logic in `GhostWriter.tsx` tries to focus `editorRef.current`, but the actual focusable element is the contenteditable div inside the editor component.

**Evidence:**
```
Expected: true (focus on editor)
Received: null (focus on body)
```

### 4. Shift+Tab Not Working ❌

**Problem:** Shift+Tab doesn't navigate backwards through the buttons as expected.

**Expected Behavior:** Shift+Tab should move focus from Accept → Reject → Regenerate → Accept (reverse order).

**Root Cause:** Related to issue #1 - the focus trap is not properly handling Shift+Tab to wrap around.

## Working Features ✅

1. **Tab/Enter to Accept** - Works correctly
2. **Escape to Reject** - Works correctly  
3. **Ctrl+R to Regenerate** - Works correctly
4. **Initial Focus on Accept Button** - Works correctly when suggestion appears
5. **Keyboard Shortcuts** - All keyboard shortcuts (Tab, Enter, Esc, Ctrl+R) work correctly
6. **Space Key Activation** - Would work if focus trap was fixed
7. **Double-Tab Trigger** - Works correctly to summon suggestions

## Recommendations

### Priority 1: Fix Focus Trap
- Ensure `useFocusTrap` properly contains focus within the suggestion panel
- Verify that Tab and Shift+Tab wrap around correctly
- Consider using `aria-modal="true"` to indicate this is a modal-like interaction

### Priority 2: Fix Focus Restoration
- Update focus restoration to target the actual contenteditable element
- Store a reference to the contenteditable div, not just the editor container
- Ensure focus is restored after both accept and reject actions

### Priority 3: Handle Disabled State Better
- Consider using `aria-disabled` instead of `disabled` to keep buttons in tab order
- Or manage focus differently during the accepting animation
- Ensure keyboard navigation still works during transitions

### Priority 4: Test with Real Screen Readers
- Verify that focus management works with NVDA/JAWS
- Ensure screen reader announcements happen at the right times
- Test that focus changes are announced properly

## Test Coverage

The test suite now includes comprehensive keyboard-only navigation tests:
- ✅ Navigating to editor with keyboard
- ✅ Triggering suggestions with double-Tab
- ✅ Focus on Accept button when suggestion appears
- ✅ Accepting with Tab key
- ✅ Accepting with Enter key
- ✅ Rejecting with Escape key
- ✅ Regenerating with Ctrl+R
- ❌ Navigating between buttons with Tab
- ❌ Navigating backwards with Shift+Tab
- ❌ Restoring focus after accepting
- ❌ Restoring focus after rejecting
- ❌ Clicking buttons with Space key
- ❌ Focus trap within suggestion panel
- ✅ Multiple suggestions support

## Next Steps

1. Fix the `useFocusTrap` hook to properly contain focus
2. Update focus restoration logic to target contenteditable element
3. Consider using `aria-disabled` instead of `disabled` for buttons
4. Re-run tests to verify fixes
5. Manual testing with keyboard only (no mouse)
6. Screen reader testing
