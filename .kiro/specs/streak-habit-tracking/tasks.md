# Streak & Habit Tracking - Implementation Tasks

## Phase 1: Core Streak System (Week 1)

### Task 1.1: Data Types & Interfaces
**Priority:** P0 | **Estimate:** 2h
- [x] Create `src/types/streak.ts` with all streak interfaces









 - [x] Define StreakData, StreakType, ActivityRecord types  b 




- [x] Add token system types



-

- [x] Add milestone configuration types


- [x] Export all types from index



- [x] Export all types from index



**Acceptance:**
- All TypeScript types compile without errors
- Types match design document structure
- JSDoc comments for complex types

---

### Task 1.2: Streak Service Logic
**Priority:** P0 | **Estimate:** 4h
- [x] Create `src/services/streakService.ts`





-

- [x] Implement `calculateStreak()` function


-

- [x] Implement `checkMissedDays()` function


- [x] Implement `shouldIncrementStreak()` logic









-

- [x] Add date utility functions (getDayDifference, isToday, etc.)

- [x] Handle timezone edge cases








**Acceptance:**
- Unit tests pass for all date calculations
- Correctly handles midnight rollover
- Handles timezone changes gracefully
- Edge cases covered (leap years, DST)

---

### Task 1.3: Streak Storage Service
**Priority:** P0 | **Estimate:** 3h
- [x] Create `src/services/streakStorageService.ts`






- [x] Implement localStorage read/write



- [x] Implement Firebase sync functions





- [x] Add debounced save (5 second delay)


-

- [x] Handle offline queue
- [x] Add conflict resolution (server wins)




**Acceptance:**
- Data persists across page refreshes
- Firebase sync works when online
- Offline changes queue and sync on reconnect
- No data loss on conflicts

---

### Task 1.4: Streak Context
**Priority:** P0 | **Estimate:** 4h
- [x] Create `src/contexts/StreakContext.tsx`












- [x] Implement state management




- [x] Add `recordActivity()` function




- [x] Add `checkStreaks()` function







- [x] Add `useRecoveryToken()` function

- [x] Integrate with storage service


- [x] Add loading states


**Acceptance:**
- Context provides all required functions
- State updates trigger re-renders correctly
- No unnecessary re-renders (use memo/callback)
- TypeScript types are correct

---

### Task 1.5: Basic Streak Display
**Priority:** P0 | **Estimate:** 3h
- [x] Create `src/components/streaks/StreakCard.tsx`





- [x] Display current streak number



- [x] Show streak type icon


- [ ] Add "longest streak" subtitle
- [x] Style with theme variables

- [x] Add pulse animation for active streaks



**Acceptance:**
- Card displays correct streak data
- Responsive on mobile
- Animations smooth (60fps)
- Accessible (keyboard + screen reader)

---

### Task 1.6: Integration with Existing Contexts
**Priority:** P0 | **Estimate:** 3h


- [x] Update TasksContext to call `recordActivity('task')`



- [x] Update NotesContext to call `recordActivity('note')`







-

- [x] Update TimerContext to call `recordActivity('focus')`







- [x] Add login tracking on App mount


- [x] Test all integration points










**Acceptance:**
- Completing task increments task streak
- Creating note increments note streak
- Focus session increments focus streak
- Login tracked on app open

---

## Phase 2: Activity Heatmap (Week 2)

### Task 2.1: Heatmap Data Processing



**Priority:** P1 | **Estimate:** 3h
- [x] Create `src/hooks/useActivityHeatmap.ts`








- [x] Implement activity level calculation








- [x] Generate 365-day data array



- [x] Add memoization for performance






- [x] Handle missing data gracefully







**Acceptance:**
- Generates correct activity levels (0-4)
- Handles sparse data efficiently
- Memoization prevents unnecessary recalculations
- Works with partial year data

---

### Task 2.2: Heatmap Component
**P-iority:** P1 | **Estimate:** 5h

- [x] Create `src/components/streaks/ActivityHeatmap.tsx`

-

- [x] Implement CSS Grid layout (7×53)






- [x] Create `HeatmapDay.tsx` cell component









- [x] Add hover tooltips with day details
- [x] Style with theme-aware colors
- [x] Add month labels

**Acceptance:**
- Displays 365 days correctly
- Hover shows accurate data
- Colors match theme
- Grid layout responsive

---

### Task 2.3: Heatmap Mobile Optimization
**Priority:** P1 | **Estimate:** 3h
- [x] Implement virtualization for mobile






















- [x] Show last 90 days on small screens






- [x] Show last 90 days on small screens
- [x] Add horizontal scroll












- [x] Optimize touch interactions












- [x] Test on various screen sizes

**Acceptance:**
- Smooth scrolling on mobile
- No performance issues
- Touch targets ≥44px
- Works on iOS and Android

---

### Task 2.4: Heatmap Interactions
**Priority:** P2 | **Estimate:** 3h
- [x] Add click handler to show day details





- [x] Create day detail modal/popover



- [ ] Create day detail modal/popover
- [x] Add filter by activity type





- [x] Implement keyboard navigation


- [x] Add screen reader descriptions



- [ ] Add screen reader descriptions


**Acceptance:**
- Click shows detailed breakdown
- Keyboard navigation works (arrow keys)
- Screen reader announces day info
- Filter updates heatmap colors

---

## Phase 3: Token System & Recovery (Week 3)

### Task 3.1: Token Economy Logic
- [x] Implement token earning rules


- [x] Implement token earning rules

- [x] Add milestone detection




- [x] Implement token usage validation








-

- [x] Add 48-hour recovery window check



- [x] Enforce 3-token maximum

**Acceptance:**
- Tokens earned at correct milestones
- Can't use token after 48 hours
- Can't exceed 3 tokens
- All edge cases handled

---

### Task 3.2: Streak Recovery Modal
**Priority:** P1 | **Estimate:** 4h
- [x] Create `src/components/streaks/StreakRecoveryModal.tsx`





- [x] Show broken streak info



- [x] Display available tokens




- [x] Add confiyrmation flow



- [x] Show success/error states





- [x] Style with mystical theme










**Acceptance:**
- Modal appears when streak broken
- Clear explanation of token system
- Confirmation prevents accidental use
- Success state shows updated streak

---

### Task 3.3: Token Display UI
**Priority:** P1 | **Estimate:** 2h
- [x] Create `src/components/streaks/StreakTokens.tsx`




- [x] Show token count (●●○ style)



-

- [x] Add tooltip explaining tokens


-

- [x] Show next token milestone



- [x] Animate token earning





**Acceptance:**
- Visual representation clear
- Tooltip explains system
- Animation celebratory
- Updates in real-time

---

### Task 3.4: Notification System
**P-iority:** P1 | **Estimate:** 4h

- [x] Create `src/hooks/useStreakNotifications.ts`





-

- [x] Implement warning notifications (8pm)



- [x] Add milestone notifications
- [x] Add weekly summary
- [x] Integrate with companion dialogue
- [x] Add notification settings

**Acceptance:**
- Notifications fire at correct times
- Can be disabled in settings
- Companion shows relevant dialogue
- No spam (max 1 per type per day)

---

## Phase 4: Dashboard & Polish (Week 4)

### Task 4.1: Streak Dashboard Page
**Priority:** P1 | **Estimate:** 4h
- [x] Create `src/components/streaks/StreakDashboard.tsx`





- [x] Layout all streak cards



-

- [x] Add activity heatmap







- [x] Show token display




-

- [x] Add milestone progress








-

- [x] Create navigation route





**Acceptance:**
- All components integrated
- Layout responsive
- Navigation works
- Loads quickly (<1s)

---

### Task 4.2: Streak Indicator in Nav
**P-iority:** P2 | **Estimate:** 2h

- [x] Create `src/components/common/StreakIndicator.tsx`




- [x] Show mini fire icon with number






- [x] Add tooltip with all streaks





- [x] Pulse animation when at risk








-

- [x] Link to dashboard





**Acceptance:**
- Visible in navigation bar
- Doesn't clutter UI
- Quick glance shows status
- Click navigates to dashboard

---

### Task 4.3: Milestone Celebrations
- [x] Create celebration animation component



- [ ] Create celebration animation component

- [ ] Integrate with companion particles
















- [ ] Add special dialogue for milestones
- [ ] Award XP bonuses



- [ ] Show achievement unlock

**Acceptance:**
- Celebration feels rewarding
- Companion reacts appropriately



- XP awarded correctly








- Achievement recorded

---

### Task 4.4: Streak Settings
**Priority:** P2 | **Estimate:** 3h
- [ ] Add streak section to settings page



- [ ] Toggle notifications on/off
- [ ] Set custom streak goals

- [ ] Choose notification time

- [ ] Reset streak option (with confirmation)

**Acceptance:**
- All settings persist
- Changes take effect immediately
- Reset requires confirmation
- Clear explanations for each setting

---

### Task 4.5: Streak Statistics
**Priority:** P2 | **Estimate:** 3h
- [ ] Create `src/components/streaks/StreakStats.tsx`
- [ ] Show total days active
- [ ] Calculate average streak length
- [ ] Show best day of week
- [ ] Display activity trends
- [ ] Add export data button

**Acceptance:**
- Statistics accurate
- Visualizations clear
- Export works (JSON/CSV)
- Insights actionable

---

### Task 4.6: Performance Optimization
**Priority:** P1 | **Estimate:** 3h
- [ ] Profile component render times
- [ ] Add React.memo where needed
- [ ] Optimize heatmap calculations
- [ ] Lazy load dashboard components
- [ ] Reduce Firebase reads

**Acceptance:**
- Dashboard loads <1 second
- Heatmap renders <500ms
- No jank on interactions
- Firebase costs minimal

---

### Task 4.7: Accessibility Audit
**Priority:** P1 | **Estimate:** 3h
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Verify keyboard navigation
- [ ] Check color contrast ratios
- [ ] Add ARIA labels where needed
- [ ] Test with reduced motion

**Acceptance:**
- WCAG 2.1 AA compliant
- Full keyboard navigation
- Screen reader friendly
- Reduced motion respected

---

## Phase 5: Testing & Documentation (Week 5)

### Task 5.1: Unit Tests
**Priority:** P0 | **Estimate:** 4h
- [ ] Test streak calculation logic
- [ ] Test token earning/usage
- [ ] Test activity level calculation
- [ ] Test date utilities
- [ ] Achieve 80%+ coverage

**Acceptance:**
- All tests pass
- Edge cases covered
- Coverage ≥80%
- Tests run quickly (<5s)

---

### Task 5.2: Integration Tests
**Priority:** P1 | **Estimate:** 4h
- [ ] Test task completion → streak update
- [ ] Test midnight rollover
- [ ] Test token recovery flow
- [ ] Test Firebase sync
- [ ] Test offline behavior

**Acceptance:**
- All integration points tested
- Tests reliable (no flakiness)
- Covers happy and error paths
- Runs in CI/CD

---

### Task 5.3: E2E Tests
**Priority:** P2 | **Estimate:** 3h
- [ ] Test complete user journey
- [ ] Test streak breaking and recovery
- [ ] Test milestone achievement
- [ ] Test notification flow
- [ ] Test mobile experience

**Acceptance:**
- Critical paths covered
- Tests run in real browser
- Screenshots on failure
- Runs nightly

---

### Task 5.4: Documentation
**Priority:** P1 | **Estimate:** 3h
- [ ] Write user guide for streaks
- [ ] Document token system
- [ ] Add FAQ section
- [ ] Create developer docs
- [ ] Add inline code comments

**Acceptance:**
- User guide clear and concise
- FAQ answers common questions
- Developer docs explain architecture
- Code comments helpful

---

### Task 5.5: Migration & Rollout
**Priority:** P0 | **Estimate:** 2h
- [ ] Create migration script for existing users
- [ ] Add feature flag for gradual rollout
- [ ] Monitor error rates
- [ ] Prepare rollback plan
- [ ] Announce feature to users

**Acceptance:**
- Existing users data preserved
- No errors on rollout
- Feature flag works
- Rollback tested

---

## Summary

**Total Estimated Time:** ~80 hours (4 weeks)

**Priority Breakdown:**
- P0 (Critical): 24 hours
- P1 (High): 42 hours  
- P2 (Medium): 14 hours

**Phase Breakdown:**
- Phase 1 (Core): 19 hours
- Phase 2 (Heatmap): 14 hours
- Phase 3 (Tokens): 13 hours
- Phase 4 (Polish): 18 hours
- Phase 5 (Testing): 16 hours

**Dependencies:**
- Must complete Phase 1 before others
- Phase 2 and 3 can be parallel
- Phase 4 requires Phase 2 and 3
- Phase 5 throughout all phases
