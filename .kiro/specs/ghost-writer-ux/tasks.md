# Ghost Writer UX Improvements - Tasks

## Phase 1: Core State Management (Priority: High)

### Task 1.1: Create State Machine Hook
**Estimate:** 2 hours  
**Dependencies:** None

- [x] Create `useGhostWriterState` hook





- [x] Implement state transitions (IDLE → GENERATING → READY → ACCEPTING)




- [x] Add error state handling





- [x] Add state change callbacks





-

- [x] Write unit tests for state machine



**Files:**
- `src/hooks/useGhostWriterState.ts` (new)
- `src/hooks/useGhostWriterState.test.ts` (new)

### Task 1.2: Update AI Service with State Callbacks
**Estimate:** 1 hour  
**Dependencies:** Task 1.1

- [x] Add `onStateChange` callback to AI service




- [x] Emit loading state when request starts




- [x] Emit ready state when response received






- [x] Emit error state on failures





- [x] Add request cancellation support










**Files:**
- `src/services/aiService.ts` (modify)

## Phase 2: Loading State UI (Priority: High)

### Task 2.1: Create Loading Indicator Component
**Estimate:** 3 hours  
**Dependencies:** None


- [x] Create `GhostLoadingIndicator` component



- [x] Add ghostly particle animation (CSS)



- [x] Add pulsing glow effect
- [x] Add "Summoning spirits..." message
- [x] Add cancel button
- [x] Make responsive




**Files:**
- `src/components/ghost-writer/GhostLoadingIndicator.tsx` (new)
- `src/components/ghost-writer/GhostLoadingIndicator.module.css` (new)

### Task 2.2: Integrate Loading State
**Estimate:** 1 hour  
**Dependencies:** Task 1.1, Task 2.1

- [x] Show loading indicator when state is GENERATING





- [x] Position overlay correctly





- [ ] Handle cancel action




- [x] Add ARIA announcements



-

- [x] Test with slow network




**Files:**
- `src/components/ghost-writer/GhostWriter.tsx` (modify)

## Phase 3: Suggestion Display (Priority: High)

### Task 3.1: Create Suggestion Display Component
**Estimate:** 3 hours  
**Dependencies:** None

- [x] Create `SuggestionDisplay` component









- [x] Add ghostly styling (purple tint, glow)






-

- [x] Implement fade-in animation




- [x] Add slide-up entrance effect




- [x] Make text italic with proper styling








- [x] Handle long suggestions (scrolling)








**Files:**
- `src/components/ghost-writer/SuggestionDisplay.tsx` (new)
- `src/components/ghost-writer/SuggestionDisplay.module.css` (new)

### Task 3.2: Create Action Buttons Component
**Estimate:** 2 hours  
**Dependencies:** None

- [x] Create `SuggestionActions` component





- [x] Add Accept button (green glow)



- [x] Add Regenerate button (purple glow)










- [x] Add Reject button (red glow)





- [x] Add hover effects and animations



- [x] Add tooltips with keyboard shortcuts


- [ ] Make responsive

**Files:**
- `src/components/ghost-writer/SuggestionActions.tsx` (new)
- `src/components/ghost-writer/SuggestionActions.module.css` (new)

### Task 3.3: Integrate Suggestion Display
**Estimate:** 2 hours  
**Dependencies:** Task 1.1, Task 3.1, Task 3.2

- [ ] Show suggestion when state is READY








- [x] Position action buttons correctly




- [x] Wire up button callbacks





- [x] Add keyboard shortcuts (Tab, Esc, Ctrl+R)







-

- [x] Test with various suggestion lengths










**Files:**
- `src/components/ghost-writer/GhostWriter.tsx` (modify)

## Phase 4: Accepting Animation (Priority: Medium)


### Task 4.1: Create Accept Animation
**Estimate:** 2 hours  
**Dependencies:** Task 3.1


- [x] Create CSS animation for acceptance


- [x] Add glow effect (green)










- [x] Add transition to normal text













- [x] Add success checkmark indicator





- [x] Implement smooth state transition


- [x] Test animation timing



**Files:**
- `src/components/ghost-writer/SuggestionDisplay.module.css` (modify)
- `src/components/ghost-writer/animations.css` (new)

### Task 4.2: Implement Accept Logic
**Estimate:** 1 hour  
**Dependencies:** Task 1.1, Task 4.1

- [x] Trigger ACCEPTING state on accept




- [x] Play animation

- [x] Insert text into editor

- [x] Return to IDLE state

- [x] Add undo option (brief)



**Files:**
- `src/components/ghost-writer/GhostWriter.tsx` (modify)

## Phase 5: Error Handling UI (Priority: Medium)

### Task 5.1: Create Error Display Component
**Estimate:** 2 hours  
**Dependencies:** None

- [x] Create `GhostErrorDisplay` component




- [x] Add error icon (skull/warning)






- [x] Add friendly error messages



- [x] Add retry button



- [x] Add dismiss button




- [x] Add shake animation for errors







**Files:**
- `src/components/ghost-writer/GhostErrorDisplay.tsx` (new)
- `src/components/ghost-writer/GhostErrorDisplay.module.css` (new)

### Task 5.2: Integrate Error Handling
**Estimate:** 1 hour  
**Dependencies:** Task 1.1, Task 5.1


- [ ] Show error display when state is ERROR


- [x] Map error types to friendly messages





- [x] Wire up retry button



- [x] Add error recovery logic




- [x] Test various error scenarios




**Files:**
- `src/components/ghost-writer/GhostWriter.tsx` (modify)

## Phase 6: Multiple Suggestions (Priority: Low)

### Task 6.1: Update AI Service for Multiple Suggestions
**Estimate:** 2 hours  
**Dependencies:** Task 1.2

- [x] Modify API to request 2-3 alternatives



- [x] Parse multiple responses







- [x] Cache all suggestions




- [x] Add selection logic






**Files:**
- `src/services/aiService.ts` (modify)

### Task 6.2: Create Suggestion Carousel
**Estimate:** 3 hours  
**Dependencies:** Task 3.1, Task 6.1

- [x] Add navigation arrows





-

- [x] Add indicator dots


- [x] Implement swipe gestures (mobile)





- [x] Add keyboard navigation (arrows)

- [x] Animate transitions between suggestions




- [ ] Animate transitions between suggestions


**Files:**
- `src/components/ghost-writer/SuggestionCarousel.tsx` (new)
- `src/components/ghost-writer/SuggestionCarousel.module.css` (new)

## Phase 7: Polish & Accessibility (Priority: Medium)

### Task 7.1: Add Keyboard Shortcuts
**Estimate:** 2 hours  
**Dependencies:** Task 3.3


- [x] Implement Tab/Enter for accept



- [x] Implement Esc for reject


- [x] Implement Ctrl+R for regenerate




- [x] Implement Alt+1/2/3 for variants




- [x] Add shortcut hints in UI



- [ ] Add shortcut hints in UI

- [x] Test keyboard navigation






**Files:**
- `src/components/ghost-writer/GhostWriter.tsx` (modify)
- `src/hooks/useGhostWriterShortcuts.ts` (new)

### Task 7.2: Improve Accessibility
**Estimate:** 2 hours  
**Dependencies:** All Phase 2-5 tasks

- [x] Add ARIA labels to all components





- [x] Implement focus management


- [x] Add screen reader announcements




- [x] Test with screen reader




- [x] Add high contrast mode support



-

- [x] Ensure keyboard-only navigation works







**Files:**
- All Ghost Writer components (modify)

### Task 7.3: Add Haptic Feedback
**Estimate:** 1 hour  
**Dependencies:** Task 4.2

- [x] Add vibration on accept (mobile)






- [x] Add vibration on error











- [x] Check browser support
- [ ] Make optional in settings
















**Files:**
- `src/utils/haptics.ts` (new)
- `src/components/ghost-writer/GhostWriter.tsx` (modify)







## Phase 8: Performance & Testing (Priority: High)

### Task 8.1: Optimize Animations
**Estimate:** 2 hours  
**Dependencies:** All animation tasks

- [x] Use transform/opacity only


- [x] Add will-change hints
- [x] Test on low-end devices



- [x] Reduce animation complexity if needed
- [x] Add performance monitoring

**Files:**
- All CSS files with animations (modify)

### Task 8.2: Add Loading Optimizations
**Estimate:** 1 hour  
**Dependencies:** Task 2.2

- [x] Delay loading indicator (200ms)







- [x] Implement optimistic UI






- [x] Add request cancellation








- [x] Cache recent suggestions



- [x] Test with various network speeds



**Files:**
- `src/services/aiService.ts` (modify)
- `src/components/ghost-writer/GhostWriter.tsx` (modify)

### Task 8.3: Write Integration Tests
**Estimate:** 3 hours  
**Dependencies:** All implementation tasks


- [x] Test happy path (generate → accept)



- [ ] Test error path (fail → retry)
- [ ] Test rejection flow
- [ ] Test regeneration
- [ ] Test keyboard shortcuts
- [ ] Test accessibility features

**Files:**
- `src/test/integration/ghost-writer-ux.test.tsx` (new)

## Phase 9: Documentation (Priority: Low)

### Task 9.1: Update User Documentation
**Estimate:** 1 hour  
**Dependencies:** All tasks

- [ ] Document new keyboard shortcuts
- [ ] Add screenshots of new UI
- [ ] Explain loading states
- [ ] Document error messages
- [ ] Update FAQ

**Files:**
- `GHOST_WRITER_GUIDE.md` (modify)
- `KEYBOARD_SHORTCUTS.md` (modify)

### Task 9.2: Add Code Documentation
**Estimate:** 1 hour  
**Dependencies:** All tasks

- [ ] Add JSDoc comments to new components
- [ ] Document state machine
- [ ] Add inline comments for complex logic
- [ ] Update component README

**Files:**
- All new component files (modify)

## Summary

**Total Estimated Time:** 35 hours

**Priority Breakdown:**
- High Priority: 20 hours (Phases 1-3, 8)
- Medium Priority: 9 hours (Phases 4-5, 7)
- Low Priority: 6 hours (Phases 6, 9)

**Recommended Order:**
1. Phase 1 (State Management) - Foundation
2. Phase 2 (Loading) - Immediate user feedback
3. Phase 3 (Suggestions) - Core feature
4. Phase 8 (Testing) - Ensure quality
5. Phase 4 (Accepting) - Polish
6. Phase 5 (Errors) - Robustness
7. Phase 7 (Accessibility) - Inclusivity
8. Phase 6 (Multiple) - Enhancement
9. Phase 9 (Docs) - Knowledge transfer
