# Screen Reader Testing - Quick Reference Card

## Quick Start

1. **Enable Screen Reader**
   - Windows (NVDA): Launch NVDA application
   - macOS: Press `Cmd + F5`
   - Linux: Press `Super + Alt + S`

2. **Navigate to Ghost Writer**
   - Open browser
   - Go to Ghost Writer page
   - Use Tab key to navigate (no mouse!)

## Key Test Points

### ✓ Initial Load
- Listen for "Ghost Writer application"
- Verify header and shortcuts are announced

### ✓ Typing
- Type 5 characters → Hear hint message
- Type 15 characters → Hint disappears

### ✓ Loading
- Double-tap Tab → Hear "Generating AI suggestion"
- Verify loading message is read
- Tab to Cancel button

### ✓ Suggestion Ready
- Hear "Suggestion ready: [preview]"
- Focus should be on Accept button
- Tab through all action buttons

### ✓ Accept
- Press Tab or Enter → Hear "Suggestion accepted"
- Focus returns to editor
- Undo button appears

### ✓ Reject
- Press Esc → Hear "Suggestion rejected"
- Focus returns to editor

### ✓ Regenerate
- Press Ctrl+R → Hear "Regenerating suggestion"
- New suggestion announced

### ✓ Error
- Trigger error → Hear error message immediately
- Tab to Retry and Dismiss buttons

### ✓ Keyboard Navigation
- All elements reachable via Tab
- All shortcuts work:
  - Tab Tab: Summon
  - Tab/Enter: Accept
  - Esc: Reject
  - Ctrl+R: Regenerate
  - Alt+1/2/3: Switch variants

## Expected Announcements

| Action | Expected Announcement |
|--------|----------------------|
| Page Load | "Ghost Writer application, main region" |
| Short Context | "Write at least 10 characters..." |
| Start Generating | "Generating AI suggestion" |
| Suggestion Ready | "Suggestion ready: [preview]" |
| Accept | "Suggestion accepted" |
| Reject | "Suggestion rejected" |
| Regenerate | "Regenerating suggestion" |
| Error | "Error: [friendly message]" |
| Go Offline | "Network connection lost" |
| Go Online | "Network connection restored" |
| Switch Variant | "Switched to suggestion 2 of 3" |
| Undo | "Suggestion undone" |

## ARIA Roles & Labels

| Element | Role | Label |
|---------|------|-------|
| Main Container | main | "Ghost Writer application" |
| Writing Area | region | "Writing area" |
| Loading Indicator | status | "Loading AI suggestion" |
| Suggestion Panel | region | "AI suggestion panel" |
| Suggestion Text | region | "AI writing suggestion" |
| Error Display | alert | "Error generating suggestion" |
| Accept Button | button | "Accept suggestion (Tab or Enter)" |
| Reject Button | button | "Reject suggestion (Esc)" |
| Regenerate Button | button | "Regenerate suggestion (Ctrl+R)" |
| Cancel Button | button | "Cancel suggestion generation" |
| Retry Button | button | "Retry suggestion generation" |
| Dismiss Button | button | "Dismiss error message" |
| Undo Button | button | "Undo last accepted suggestion" |

## Focus Flow

```
1. Page Load → Header
2. Tab → Writing Area
3. Double-Tab → Loading Indicator
4. Suggestion Ready → Accept Button (auto-focus)
5. Tab → Regenerate Button
6. Tab → Reject Button
7. Accept/Reject → Writing Area (focus returns)
```

## Common Screen Reader Commands

### NVDA (Windows)
- `Insert + Down Arrow`: Read current line
- `Insert + Up Arrow`: Read from top
- `Tab`: Next element
- `Shift + Tab`: Previous element
- `Insert + F7`: List elements

### VoiceOver (macOS)
- `VO + A`: Read all
- `VO + Right/Left Arrow`: Navigate
- `VO + Space`: Activate
- `VO + U`: Open rotor
- `Tab`: Next element

### JAWS (Windows)
- `Insert + Down Arrow`: Read current line
- `Insert + Up Arrow`: Read from top
- `Tab`: Next element
- `Insert + F5`: List form fields

## Pass/Fail Checklist

Quick checklist for each test session:

- [ ] All announcements are clear and timely
- [ ] Focus management works correctly
- [ ] All buttons are accessible
- [ ] Keyboard shortcuts work
- [ ] Error messages are helpful
- [ ] No keyboard traps (except intentional)
- [ ] Tab order is logical
- [ ] All text is readable
- [ ] Live regions work correctly
- [ ] Focus is always visible

## Issue Severity Guide

**Critical:** Blocks screen reader users completely
- Example: No ARIA labels, keyboard trap, no announcements

**High:** Major usability issue
- Example: Missing announcements, poor focus management

**Medium:** Usability inconvenience
- Example: Unclear labels, suboptimal tab order

**Low:** Minor polish issue
- Example: Verbose announcements, minor timing issues

## Quick Test (5 minutes)

1. Load page → Verify initial announcements
2. Type text → Verify hint
3. Double-Tab → Verify loading
4. Wait for suggestion → Verify announcement
5. Tab through buttons → Verify labels
6. Press Tab → Verify acceptance
7. Press Esc on next suggestion → Verify rejection
8. Trigger error → Verify error handling

If all 8 steps work correctly, basic accessibility is functional.

## Resources

- Full Test Guide: `SCREEN_READER_TEST_GUIDE.md`
- NVDA: https://www.nvaccess.org/
- VoiceOver: Built into macOS
- ARIA Practices: https://www.w3.org/WAI/ARIA/apg/

## Contact

Report accessibility issues with:
- Screen reader used
- Browser and OS
- Steps to reproduce
- Expected vs. actual behavior
