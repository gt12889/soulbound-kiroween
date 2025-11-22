# Screen Reader Testing Guide for Ghost Writer

## Overview

This guide provides comprehensive instructions for manually testing the Ghost Writer component with screen readers. The Ghost Writer has been designed with accessibility in mind, including ARIA labels, live regions, focus management, and keyboard navigation.

## Prerequisites

### Recommended Screen Readers

- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

### Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (macOS only)

## Test Setup

1. **Enable Screen Reader**
   - Windows (NVDA): Download from nvaccess.org and launch
   - macOS (VoiceOver): Press `Cmd + F5`
   - Linux (Orca): Press `Super + Alt + S`

2. **Open Ghost Writer**
   - Navigate to the Ghost Writer page in your browser
   - Ensure you have a valid API key configured

3. **Disable Mouse**
   - Use keyboard-only navigation to simulate real screen reader usage
   - Tab through elements, don't click

## Test Scenarios

### 1. Initial Page Load

**Expected Behavior:**
- Screen reader announces: "Ghost Writer application, main region"
- Header is announced with title and subtitle
- Keyboard shortcuts are announced
- Writing area is identified as "Writing area, region"

**Test Steps:**
1. Load the Ghost Writer page
2. Listen to the initial announcements
3. Tab through the header elements
4. Verify all text is read correctly

**Pass Criteria:**
- ✓ Application role and label announced
- ✓ All header text is readable
- ✓ Keyboard shortcuts are announced
- ✓ Writing area is identified

---

### 2. Typing and Context Building

**Expected Behavior:**
- Text input is announced as you type
- When context is too short, hint message is announced: "Write at least 10 characters to summon suggestions..."
- Hint has `role="status"` with `aria-live="polite"`

**Test Steps:**
1. Focus on the writing area
2. Type 5 characters
3. Wait for hint announcement
4. Continue typing to 15 characters
5. Verify hint disappears

**Pass Criteria:**
- ✓ Typing is announced character by character
- ✓ Hint message is announced when context is short
- ✓ Hint disappears when sufficient context exists

---

### 3. Loading State

**Expected Behavior:**
- When suggestion generation starts, announces: "Generating AI suggestion"
- Loading indicator is announced: "Loading AI suggestion, status"
- Message "Summoning spirits from beyond..." is read
- Cancel button is announced: "Cancel suggestion generation, button"

**Test Steps:**
1. Type sufficient context (10+ characters)
2. Press Tab twice quickly (double-tab shortcut)
3. Listen for loading announcements
4. Tab to cancel button
5. Verify button is accessible

**Pass Criteria:**
- ✓ "Generating AI suggestion" announced
- ✓ Loading status region is identified
- ✓ Loading message is read
- ✓ Cancel button is accessible and labeled

---

### 4. Suggestion Ready State

**Expected Behavior:**
- When suggestion arrives, announces: "Suggestion ready: [first 50 chars]..."
- Suggestion panel is announced: "AI suggestion panel, region"
- Suggestion text is announced: "AI writing suggestion, region"
- Focus automatically moves to Accept button
- Accept button is announced: "Accept suggestion (Tab or Enter), button"

**Test Steps:**
1. Wait for suggestion to generate
2. Listen for "Suggestion ready" announcement
3. Verify focus is on Accept button
4. Tab through action buttons
5. Verify each button's label and shortcut

**Pass Criteria:**
- ✓ Suggestion preview announced
- ✓ Focus moves to Accept button
- ✓ All buttons have clear labels
- ✓ Keyboard shortcuts are announced
- ✓ Tooltips are accessible

---

### 5. Multiple Suggestions (Variants)

**Expected Behavior:**
- When multiple suggestions exist, variant indicator announces: "Suggestion 1 of 3"
- Pressing Alt+1/2/3 announces: "Switched to suggestion 2 of 3"
- Each variant change is announced

**Test Steps:**
1. Generate suggestions (if multiple variants are returned)
2. Press Alt+1, Alt+2, Alt+3
3. Listen for variant switch announcements
4. Verify current suggestion number is announced

**Pass Criteria:**
- ✓ Variant indicator is announced
- ✓ Switching variants announces new selection
- ✓ Current suggestion number is clear

---

### 6. Accepting Suggestion

**Expected Behavior:**
- Pressing Tab or Enter announces: "Suggestion accepted"
- Focus returns to writing area
- Undo button appears and is announced: "Undo action, complementary region"
- Undo button is labeled: "Undo last accepted suggestion, button"

**Test Steps:**
1. With suggestion visible, press Tab (or Enter)
2. Listen for acceptance announcement
3. Verify focus returns to editor
4. Tab to find undo button
5. Verify undo button is accessible

**Pass Criteria:**
- ✓ "Suggestion accepted" announced
- ✓ Focus returns to editor
- ✓ Undo button is accessible
- ✓ Undo button has clear label

---

### 7. Rejecting Suggestion

**Expected Behavior:**
- Pressing Esc announces: "Suggestion rejected"
- Suggestion disappears
- Focus returns to writing area

**Test Steps:**
1. With suggestion visible, press Esc
2. Listen for rejection announcement
3. Verify focus returns to editor
4. Verify suggestion is gone

**Pass Criteria:**
- ✓ "Suggestion rejected" announced
- ✓ Focus returns to editor
- ✓ Suggestion is removed

---

### 8. Regenerating Suggestion

**Expected Behavior:**
- Pressing Ctrl+R announces: "Regenerating suggestion"
- Loading state begins again
- New suggestion is announced when ready

**Test Steps:**
1. With suggestion visible, press Ctrl+R
2. Listen for regeneration announcement
3. Wait for new suggestion
4. Verify new suggestion is announced

**Pass Criteria:**
- ✓ "Regenerating suggestion" announced
- ✓ Loading state is announced
- ✓ New suggestion is announced

---

### 9. Error States

**Expected Behavior:**
- When error occurs, announces: "Error: [friendly message]"
- Error display has `role="alert"` with `aria-live="assertive"`
- Error message is read immediately
- Retry button is announced: "Retry suggestion generation, button"
- Dismiss button is announced: "Dismiss error message, button"

**Test Steps:**
1. Trigger an error (disconnect network, invalid API key, etc.)
2. Listen for error announcement
3. Tab to retry button
4. Tab to dismiss button
5. Verify all elements are accessible

**Pass Criteria:**
- ✓ Error announced immediately
- ✓ Friendly error message is read
- ✓ Context message is read
- ✓ Retry button is accessible
- ✓ Dismiss button is accessible

---

### 10. Network Status

**Expected Behavior:**
- When going offline, announces: "Network connection lost"
- Offline warning appears: "You are currently offline. Ghost Writer requires an internet connection."
- When coming online, announces: "Network connection restored"
- If error was due to network, announces: "You can now retry your request"

**Test Steps:**
1. Disconnect network (turn off WiFi)
2. Listen for offline announcement
3. Verify offline warning is read
4. Reconnect network
5. Listen for online announcement

**Pass Criteria:**
- ✓ Offline status announced
- ✓ Offline warning is accessible
- ✓ Online status announced
- ✓ Retry suggestion is announced

---

### 11. Keyboard Navigation

**Expected Behavior:**
- All interactive elements are reachable via Tab
- Tab order is logical (top to bottom, left to right)
- Focus is visible on all elements
- Escape key works to close suggestion
- All shortcuts work without mouse

**Test Steps:**
1. Tab through entire interface
2. Verify tab order makes sense
3. Test all keyboard shortcuts:
   - Tab Tab: Summon suggestion
   - Tab/Enter: Accept
   - Esc: Reject
   - Ctrl+R: Regenerate
   - Alt+1/2/3: Switch variants
4. Verify focus is always visible

**Pass Criteria:**
- ✓ All elements are keyboard accessible
- ✓ Tab order is logical
- ✓ Focus is always visible
- ✓ All shortcuts work
- ✓ No keyboard traps

---

### 12. Focus Management

**Expected Behavior:**
- When suggestion appears, focus moves to Accept button
- When suggestion is accepted/rejected, focus returns to editor
- Focus trap keeps focus within suggestion panel
- Escape key releases focus trap

**Test Steps:**
1. Generate suggestion
2. Verify focus is on Accept button
3. Try to Tab outside suggestion panel
4. Verify focus stays within panel
5. Press Escape
6. Verify focus returns to editor

**Pass Criteria:**
- ✓ Focus moves to Accept button
- ✓ Focus trap works correctly
- ✓ Escape releases focus trap
- ✓ Focus returns to editor after actions

---

### 13. ARIA Live Regions

**Expected Behavior:**
- State changes are announced via `aria-live` regions
- Polite announcements don't interrupt current reading
- Assertive announcements (errors) interrupt immediately
- Announcements are clear and concise

**Test Steps:**
1. Trigger various state changes
2. Listen for announcements
3. Verify timing and priority
4. Verify announcements don't overlap

**Pass Criteria:**
- ✓ All state changes announced
- ✓ Polite announcements don't interrupt
- ✓ Errors interrupt immediately
- ✓ Announcements are clear

---

### 14. Long Suggestions

**Expected Behavior:**
- Long suggestions are fully readable
- Scrolling is announced if needed
- All text is accessible
- No content is cut off

**Test Steps:**
1. Generate a long suggestion (100+ words)
2. Navigate through the text
3. Verify all content is readable
4. Check if scrolling is announced

**Pass Criteria:**
- ✓ All text is readable
- ✓ Scrolling works correctly
- ✓ No content is hidden
- ✓ Navigation is smooth

---

### 15. Undo Functionality

**Expected Behavior:**
- Undo button appears after acceptance
- Undo button is announced
- Pressing undo announces: "Suggestion undone"
- Focus returns to editor

**Test Steps:**
1. Accept a suggestion
2. Tab to undo button
3. Activate undo button
4. Listen for undo announcement
5. Verify focus returns to editor

**Pass Criteria:**
- ✓ Undo button is accessible
- ✓ Undo action is announced
- ✓ Focus returns to editor
- ✓ Text is correctly removed

---

## Common Issues and Solutions

### Issue: Screen reader not announcing state changes
**Solution:** Verify `aria-live` regions are present and have correct values (`polite` or `assertive`)

### Issue: Focus not moving to Accept button
**Solution:** Check that `acceptButtonRef` is correctly passed and focus is set after a brief delay

### Issue: Keyboard shortcuts not working
**Solution:** Verify event listeners are attached and not being prevented by other handlers

### Issue: Announcements overlapping
**Solution:** Use `polite` for most announcements, `assertive` only for errors

### Issue: Focus trap not working
**Solution:** Check that `useFocusTrap` hook is correctly implemented and active

---

## Accessibility Checklist

Use this checklist to verify all accessibility features:

- [ ] All interactive elements have ARIA labels
- [ ] All state changes are announced
- [ ] Focus management works correctly
- [ ] Keyboard navigation is complete
- [ ] No keyboard traps (except intentional focus trap)
- [ ] All shortcuts work without mouse
- [ ] Error messages are clear and helpful
- [ ] Loading states are announced
- [ ] Success states are announced
- [ ] All buttons have descriptive labels
- [ ] Tooltips are accessible
- [ ] Live regions work correctly
- [ ] Focus is always visible
- [ ] Tab order is logical
- [ ] Escape key works to close overlays

---

## Screen Reader Specific Notes

### NVDA (Windows)
- Use Insert+Down Arrow to read current line
- Use Insert+Up Arrow to read from top
- Use Tab to navigate between elements
- Use Insert+F7 to list all links/buttons

### VoiceOver (macOS)
- Use VO+A to read all
- Use VO+Right/Left Arrow to navigate
- Use VO+Space to activate
- Use VO+U to open rotor

### JAWS (Windows)
- Use Insert+Down Arrow to read current line
- Use Insert+Up Arrow to read from top
- Use Tab to navigate between elements
- Use Insert+F5 to list form fields

---

## Reporting Issues

If you find accessibility issues during testing, please report them with:

1. **Screen Reader Used:** (NVDA, VoiceOver, JAWS, etc.)
2. **Browser:** (Chrome, Firefox, Safari, etc.)
3. **Operating System:** (Windows, macOS, Linux)
4. **Issue Description:** What happened vs. what should happen
5. **Steps to Reproduce:** Detailed steps to trigger the issue
6. **Severity:** Critical, High, Medium, Low

---

## Additional Resources

- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [JAWS Documentation](https://www.freedomscientific.com/training/jaws/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

---

## Test Results Template

```markdown
## Screen Reader Test Results

**Date:** [Date]
**Tester:** [Name]
**Screen Reader:** [NVDA/VoiceOver/JAWS] [Version]
**Browser:** [Browser] [Version]
**OS:** [Operating System]

### Test Results

| Test Scenario | Pass/Fail | Notes |
|--------------|-----------|-------|
| 1. Initial Page Load | ☐ Pass ☐ Fail | |
| 2. Typing and Context Building | ☐ Pass ☐ Fail | |
| 3. Loading State | ☐ Pass ☐ Fail | |
| 4. Suggestion Ready State | ☐ Pass ☐ Fail | |
| 5. Multiple Suggestions | ☐ Pass ☐ Fail | |
| 6. Accepting Suggestion | ☐ Pass ☐ Fail | |
| 7. Rejecting Suggestion | ☐ Pass ☐ Fail | |
| 8. Regenerating Suggestion | ☐ Pass ☐ Fail | |
| 9. Error States | ☐ Pass ☐ Fail | |
| 10. Network Status | ☐ Pass ☐ Fail | |
| 11. Keyboard Navigation | ☐ Pass ☐ Fail | |
| 12. Focus Management | ☐ Pass ☐ Fail | |
| 13. ARIA Live Regions | ☐ Pass ☐ Fail | |
| 14. Long Suggestions | ☐ Pass ☐ Fail | |
| 15. Undo Functionality | ☐ Pass ☐ Fail | |

### Issues Found

1. [Issue description]
2. [Issue description]

### Overall Assessment

☐ Fully Accessible
☐ Mostly Accessible (minor issues)
☐ Partially Accessible (major issues)
☐ Not Accessible

### Recommendations

[List any recommendations for improvement]
```
