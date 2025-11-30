# Screen Reader Testing - Visual Guide

## Component States & Expected Announcements

This visual guide shows what screen readers should announce for each component state.

---

## 1. Initial Page Load

```
┌─────────────────────────────────────────────────────────┐
│  👻 Ghost Writer                                        │
│  Let spectral whispers guide your words...              │
│                                                          │
│  Press [Tab] [Tab] to summon Ghost Writer               │
└─────────────────────────────────────────────────────────┘

Screen Reader Announces:
🔊 "Ghost Writer application, main region"
🔊 "Ghost Writer, heading level 1"
🔊 "Let spectral whispers guide your words"
🔊 "Press Tab Tab to summon Ghost Writer"
```

---

## 2. Typing (Short Context)

```
┌─────────────────────────────────────────────────────────┐
│  [Writing Area]                                          │
│  Hello wo█                                               │
│                                                          │
│  💀 Write at least 10 characters to summon              │
│     suggestions...                                       │
└─────────────────────────────────────────────────────────┘

Screen Reader Announces:
🔊 "H" "e" "l" "l" "o" (as you type)
🔊 "Write at least 10 characters to summon suggestions"
```

---

## 3. Loading State

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│              ╔═══════════════════╗                      │
│              ║   👻  ⟳  ⟳  ⟳   ║                      │
│              ║                   ║                      │
│              ║  Summoning        ║                      │
│              ║  spirits from     ║                      │
│              ║  beyond...        ║                      │
│              ║                   ║                      │
│              ║   [Cancel]        ║                      │
│              ╚═══════════════════╝                      │
│                                                          │
└─────────────────────────────────────────────────────────┘

Screen Reader Announces:
🔊 "Generating AI suggestion"
🔊 "Loading AI suggestion, status"
🔊 "Summoning spirits from beyond..."
🔊 (Tab to) "Cancel suggestion generation, button"
```

---

## 4. Suggestion Ready

```
┌─────────────────────────────────────────────────────────┐
│  [Writing Area]                                          │
│  Hello world, I am writing a story about...█            │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 👻 a mysterious forest where ancient spirits      │ │
│  │    dwell and guide lost travelers to safety.      │ │
│  │                                                    │ │
│  │  [✓ Accept]  [↻ Regenerate]  [✕ Reject]         │ │
│  │    Tab         Ctrl+R          Esc                │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

Screen Reader Announces:
🔊 "Suggestion ready: a mysterious forest where ancient..."
🔊 "AI suggestion panel, region"
🔊 "AI writing suggestion, region"
🔊 "a mysterious forest where ancient spirits dwell..."
🔊 (Focus on) "Accept suggestion (Tab or Enter), button"
🔊 (Tab to) "Regenerate suggestion (Ctrl+R), button"
🔊 (Tab to) "Reject suggestion (Esc), button"
```

---

## 5. Multiple Suggestions

```
┌─────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────┐ │
│  │ 👻 a mysterious forest where ancient spirits      │ │
│  │    dwell and guide lost travelers to safety.      │ │
│  │                                                    │ │
│  │  Suggestion 2 of 3                                │ │
│  │                                                    │ │
│  │  [✓ Accept]  [↻ Regenerate]  [✕ Reject]         │ │
│  │    Tab         Ctrl+R          Esc                │ │
│  │                                                    │ │
│  │  Alt+1/2/3 Switch variants                        │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

Screen Reader Announces:
🔊 "Suggestion 2 of 3"
🔊 (Press Alt+2) "Switched to suggestion 2 of 3"
🔊 (Press Alt+3) "Switched to suggestion 3 of 3"
```

---

## 6. Accepting Suggestion

```
┌─────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────┐ │
│  │ 👻 a mysterious forest where ancient spirits      │ │
│  │    dwell and guide lost travelers to safety.      │ │
│  │                                                    │ │
│  │              ✓ (Green glow)                       │ │
│  │                                                    │ │
│  │  [✓ Accept]  [↻ Regenerate]  [✕ Reject]         │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  [↶ Undo]                                               │
└─────────────────────────────────────────────────────────┘

Screen Reader Announces:
🔊 (Press Tab) "Suggestion accepted"
🔊 (Focus returns to editor)
🔊 (Tab to) "Undo last accepted suggestion, button"
```

---

## 7. Error State

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│              ╔═══════════════════╗                      │
│              ║   💀  ⚠️         ║                      │
│              ║                   ║                      │
│              ║  Connection to    ║                      │
│              ║  the ethereal     ║                      │
│              ║  realm lost       ║                      │
│              ║                   ║                      │
│              ║  Check your       ║                      │
│              ║  internet         ║                      │
│              ║  connection       ║                      │
│              ║                   ║                      │
│              ║  [↻ Retry]        ║                      │
│              ║  [✕ Dismiss]      ║                      │
│              ╚═══════════════════╝                      │
│                                                          │
└─────────────────────────────────────────────────────────┘

Screen Reader Announces:
🔊 "Error: Connection to the ethereal realm lost" (assertive)
🔊 "Check your internet connection and try again"
🔊 (Tab to) "Retry suggestion generation, button"
🔊 (Tab to) "Dismiss error message, button"
```

---

## 8. Offline Warning

```
┌─────────────────────────────────────────────────────────┐
│  👻 Ghost Writer                                        │
│                                                          │
│  ⚠️ 📡 You are currently offline. Ghost Writer         │
│     requires an internet connection.                    │
│                                                          │
│  [Writing Area]                                          │
└─────────────────────────────────────────────────────────┘

Screen Reader Announces:
🔊 "Network connection lost"
🔊 "You are currently offline. Ghost Writer requires..."
🔊 (When online) "Network connection restored"
```

---

## Focus Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  1. Page Load                                           │
│     ↓                                                    │
│  2. Header (Tab)                                        │
│     ↓                                                    │
│  3. Writing Area (Tab)                                  │
│     ↓                                                    │
│  4. Type & Double-Tab                                   │
│     ↓                                                    │
│  5. Loading Indicator                                   │
│     ↓                                                    │
│  6. Accept Button (Auto-focus) ←─────┐                 │
│     ↓                                 │                 │
│  7. Regenerate Button (Tab)           │                 │
│     ↓                                 │                 │
│  8. Reject Button (Tab)               │                 │
│     ↓                                 │                 │
│  9. Accept/Reject Action              │                 │
│     ↓                                 │                 │
│  10. Writing Area (Focus returns) ────┘                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Keyboard Shortcuts Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Primary Actions:                                       │
│  ┌──────────┐                                           │
│  │ Tab Tab  │ → Summon Ghost Writer                     │
│  └──────────┘                                           │
│                                                          │
│  Suggestion Actions:                                    │
│  ┌──────────┐                                           │
│  │   Tab    │ → Accept suggestion                       │
│  │  Enter   │ → Accept suggestion (alternative)         │
│  └──────────┘                                           │
│  ┌──────────┐                                           │
│  │   Esc    │ → Reject suggestion                       │
│  └──────────┘                                           │
│  ┌──────────┐                                           │
│  │ Ctrl + R │ → Regenerate suggestion                   │
│  └──────────┘                                           │
│                                                          │
│  Variant Navigation:                                    │
│  ┌──────────┐                                           │
│  │ Alt + 1  │ → Switch to variant 1                     │
│  │ Alt + 2  │ → Switch to variant 2                     │
│  │ Alt + 3  │ → Switch to variant 3                     │
│  └──────────┘                                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ARIA Structure

```
<div role="main" aria-label="Ghost Writer application">
  
  <div role="banner">
    <h1>Ghost Writer</h1>
    <p aria-label="Application tagline">...</p>
    <div role="complementary" aria-label="Keyboard shortcuts">
      ...
    </div>
  </div>
  
  <div role="region" aria-label="Writing area">
    
    <!-- Loading State -->
    <div role="status" aria-live="polite" aria-label="Loading AI suggestion">
      <div>Summoning spirits from beyond...</div>
      <button aria-label="Cancel suggestion generation">Cancel</button>
    </div>
    
    <!-- Suggestion State -->
    <div role="region" aria-label="AI suggestion panel">
      <div role="region" aria-live="polite" aria-label="AI writing suggestion">
        <p>Suggestion text...</p>
      </div>
      <div role="toolbar" aria-label="Suggestion actions">
        <button aria-label="Accept suggestion (Tab or Enter)">Accept</button>
        <button aria-label="Regenerate suggestion (Ctrl+R)">Regenerate</button>
        <button aria-label="Reject suggestion (Esc)">Reject</button>
      </div>
    </div>
    
    <!-- Error State -->
    <div role="alert" aria-live="assertive" aria-label="Error generating suggestion">
      <div>Error message...</div>
      <button aria-label="Retry suggestion generation">Retry</button>
      <button aria-label="Dismiss error message">Dismiss</button>
    </div>
    
    <!-- Undo -->
    <div role="complementary" aria-label="Undo action">
      <button aria-label="Undo last accepted suggestion">Undo</button>
    </div>
    
  </div>
  
</div>
```

---

## Testing Checklist Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Screen Reader Testing Checklist                        │
│                                                          │
│  Basic Functionality:                                   │
│  ☐ Page loads and announces correctly                   │
│  ☐ All text is readable                                 │
│  ☐ All buttons are accessible                           │
│  ☐ Tab order is logical                                 │
│                                                          │
│  State Announcements:                                   │
│  ☐ Loading state announced                              │
│  ☐ Suggestion ready announced                           │
│  ☐ Acceptance announced                                 │
│  ☐ Rejection announced                                  │
│  ☐ Errors announced immediately                         │
│                                                          │
│  Focus Management:                                      │
│  ☐ Focus moves to Accept button                         │
│  ☐ Focus returns to editor after actions                │
│  ☐ Focus trap works correctly                           │
│  ☐ Escape releases focus trap                           │
│                                                          │
│  Keyboard Navigation:                                   │
│  ☐ All shortcuts work                                   │
│  ☐ No keyboard traps                                    │
│  ☐ Focus is always visible                              │
│  ☐ Tab order makes sense                                │
│                                                          │
│  ARIA Implementation:                                   │
│  ☐ All regions labeled                                  │
│  ☐ All buttons labeled                                  │
│  ☐ Live regions work                                    │
│  ☐ Roles are appropriate                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Common Screen Reader Commands

### NVDA (Windows)

```
┌─────────────────────────────────────────────────────────┐
│  Insert + Down Arrow  → Read current line               │
│  Insert + Up Arrow    → Read from top                   │
│  Tab                  → Next element                    │
│  Shift + Tab          → Previous element                │
│  Insert + F7          → List all elements               │
│  Insert + Space       → Toggle focus/browse mode        │
└─────────────────────────────────────────────────────────┘
```

### VoiceOver (macOS)

```
┌─────────────────────────────────────────────────────────┐
│  VO + A               → Read all                        │
│  VO + Right Arrow     → Next element                    │
│  VO + Left Arrow      → Previous element                │
│  VO + Space           → Activate element                │
│  VO + U               → Open rotor                      │
│  Tab                  → Next focusable element          │
│                                                          │
│  (VO = Ctrl + Option)                                   │
└─────────────────────────────────────────────────────────┘
```

### JAWS (Windows)

```
┌─────────────────────────────────────────────────────────┐
│  Insert + Down Arrow  → Read current line               │
│  Insert + Up Arrow    → Read from top                   │
│  Tab                  → Next element                    │
│  Shift + Tab          → Previous element                │
│  Insert + F5          → List form fields                │
│  Insert + F6          → List headings                   │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Test Flow

```
1. Load Page
   ↓
   Listen: "Ghost Writer application"
   
2. Tab to Writing Area
   ↓
   Type: "Hello world"
   
3. Double-Tab
   ↓
   Listen: "Generating AI suggestion"
   
4. Wait for Suggestion
   ↓
   Listen: "Suggestion ready: ..."
   Focus on: Accept button
   
5. Press Tab
   ↓
   Listen: "Suggestion accepted"
   Focus returns to editor
   
6. Generate Another
   ↓
   Press Esc
   Listen: "Suggestion rejected"
   
7. Trigger Error
   ↓
   Listen: Error message (immediate)
   Tab to Retry button
   
✓ If all steps work, basic accessibility is functional!
```

---

## Issue Severity Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  🔴 CRITICAL                                            │
│     Blocks screen reader users completely               │
│     Example: No ARIA labels, keyboard trap              │
│                                                          │
│  🟠 HIGH                                                │
│     Major usability issue                               │
│     Example: Missing announcements, poor focus          │
│                                                          │
│  🟡 MEDIUM                                              │
│     Usability inconvenience                             │
│     Example: Unclear labels, suboptimal tab order       │
│                                                          │
│  🟢 LOW                                                 │
│     Minor polish issue                                  │
│     Example: Verbose announcements, timing issues       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Resources

- **Full Test Guide:** `SCREEN_READER_TEST_GUIDE.md`
- **Quick Reference:** `SCREEN_READER_QUICK_REFERENCE.md`
- **Summary:** `SCREEN_READER_TEST_SUMMARY.md`

---

*This visual guide complements the comprehensive testing documentation.*
