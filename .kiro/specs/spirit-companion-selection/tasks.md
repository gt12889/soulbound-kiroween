# Spirit Companion Selection - Implementation Tasks

## Phase 1: Foundation (Priority: High)

### Task 1.1: Create Companion Type Definitions
**Estimate**: 1 hour  
**Dependencies**: None

- [x] Create `src/types/companion.ts`





- [x] Define `CompanionType` enum



- [x] Define `EvolutionStage` interface






- [x] Define `CompanionDefinition` interface


- [x] Create `COMPANION_TYPES` constant with all 3 companions










- [x] Export types and constants

- [x] Add JSDoc documentation


**Acceptance Criteria**:
- All 3 companion types defined with complete evolution stages
- Type safety enforced
- Emojis and colors specified for each type

---

### Task 1.2: Update AppContext for Companion State
**Estimate**: 2 hours  

**Dependencies**: Task 1.1

- [x] Add `companionType` state to AppContext





- [x] Add `setCompanionType` function










- [x] Add `hasSelectedCompanion` computed property



- [x] Implement localStorage persistence

- [x] Implement Firebase persistence (authenticated users)




- [x] Add sync logic between localStorage and Firebase






- [x] Handle migration for existing users (default to 'shadow')


**Acceptance Criteria**:
- Companion type persists across sessions
- Authenticated users sync across devices
- Existing users default to 'shadow' type
- No breaking changes to existing context

---

### Task 1.3: Create Storage Service Functions
**Estimate**: 1.5 hours  
**Dependencies**: Task 1.1

- [x] Create `src/services/companionStorageService.ts`







- [x] Implement `saveCompanionType(type: CompanionType): Promise<void>`


- [x] Implement `loadCompanionType(): Promise<CompanionType | null>`


-

- [x] Implement `hasCompanionSelection(): boolean`






- [x] Add error handling and retry logic











- [x] Add validation for companion type




- [ ] Add unit tests







**Acceptance Criteria**:
- Functions work for both authenticated and local users
- Proper error handling
- Type validation prevents corruption
- 90%+ test coverage

---

## Phase 2: UI Components (Priority: High)

### Task 2.1: Create CompanionOption Component
**Estimate**: 3 hours  
**Dependencies**: Task 1.1

- [x] Create `src/components/spirit-companion/CompanionOption.tsx`




- [x] Create `src/components/spirit-companion/CompanionOption.module.css`



- [x] Implement card layout with emoji, name, description

-

- [x] Add evolution stage preview (mini icons)




- [x] Implement hover animations


- [x] Implement selection state visual





- [x] Add color theming based on companion type




- [x] Make component keyboard accessible









- [x] Add ARIA labels





**Acceptance Criteria**:
- Card displays all companion information
- Smooth hover and selection animations
- Keyboard navigable
- Responsive on mobile
- Matches design mockup

---

### Task 2.2: Create CompanionSelectionModal Component
**Estimate**: 4 hours  
**Dependencies**: Task 2.1
-

- [x] Create `src/components/spirit-companion/CompanionSelectionModal.tsx`



- [x] Create `src/components/spirit-companion/CompanionSelectionModal.module.css`



- [x] Create `src/components/spirit-companion/CompanionSelectionModal.module.css`


- [x] Implement fullscreen modal overlay







- [x] Add title and subtitle text




- [x] Render 3 CompanionOption components





- [x] Implement selection state management





- [x] Add "Choose Companion" confirmation button

- [x] Implement focus trap





- [x] Add keyboard navigation (Tab, Enter, Arrow keys)









- [-] Add loading state during save


- [x] Add error state with retry option


**Acceptance Criteria**:
- Modal is fullscreen and not dismissible
- All 3 companions displayed in grid
- Selection persists visually
- Confirmation button only enabled when companion selected
- Keyboard fully functional
- Loading and error states work correctly

---

### Task 2.3: Add Modal Animations
**Estimate**: 2 hours  
**Dependencies**: Task 2.2

- [ ] Add modal entrance animation (fade + scale)

- [ ] Add companion card staggered entrance


- [ ] Add emoji floating animation
- [ ] Add selection pulse animation

- [ ] Add confirmation button hover effects


- [ ] Optimize animations for performance
- [ ] Add `prefers-reduced-motion` support


**Acceptance Criteria**:
- Smooth, professional animations
- No jank or performance issues
- Respects user motion preferences
- Animations enhance UX without being distracting

---

## Phase 3: Integration (Priority: High)

### Task 3.1: Integrate Modal into AchievementsPage
**Estimate**: 2 hours  
**Dependencies**: Task 2.2, Task 1.2

- [ ] Import CompanionSelectionModal in AchievementsPage

- [ ] Add state for modal visibility



- [ ] Check `hasSelectedCompanion` on mount


- [ ] Show modal if no selection exists
- [ ] Implement `onSelect` handler
- [ ] Save companion type via AppContext
- [ ] Show success toast after selection

- [ ] Hide modal after successful selection


- [ ] Handle errors gracefully

**Acceptance Criteria**:
- Modal appears for new users only
- Selection saves correctly
- Success toast displays
- Modal closes after selection
- No errors in console

---

### Task 3.2: Update SpiritCompanion Component
**Estimate**: 3 hours  
**Dependencies**: Task 1.1, Task 3.1

- [ ] Add `companionType` prop to SpiritCompanion

- [ ] Update `getStageInfo()` to use companion type


- [ ] Load evolution stages from COMPANION_TYPES
- [ ] Apply companion-specific colors


- [ ] Update animations to match companion theme
- [ ] Ensure backward compatibility (default to 'shadow')
- [ ] Update prop types and documentation

**Acceptance Criteria**:
- Companion displays correct evolution for selected type
- Colors match companion theme
- All 3 companion types work correctly
- Existing users see Shadow Spirit
- No visual regressions

---

### Task 3.3: Update useSpiritCompanion Hook
**Estimate**: 1 hour  
**Dependencies**: Task 1.2

- [ ] Import companionType from AppContext


- [ ] Return companionType in hook result
- [ ] Ensure stats calculation works for all types
- [ ] Update hook documentation

**Acceptance Criteria**:
- Hook provides companionType
- Stats calculation unchanged
- No breaking changes

---

## Phase 4: Data Migration (Priority: Medium)

### Task 4.1: Create Migration Script
**Estimate**: 2 hours  
**Dependencies**: Task 1.2

- [ ] Create `src/utils/companionMigration.ts`
- [ ] Implement `migrateExistingUsers()` function
- [ ] Check for existing companion data
- [ ] Set 'shadow' type for users without selection
- [ ] Mark users as migrated
- [ ] Add logging for migration tracking
- [ ] Test migration with various user states

**Acceptance Criteria**:
- All existing users get 'shadow' type
- Migration runs only once per user
- No data loss
- Migration is idempotent

---

### Task 4.2: Integrate Migration into App Initialization
**Estimate**: 1 hour  
**Dependencies**: Task 4.1

- [ ] Call migration in App.tsx useEffect
- [ ] Run after auth state determined
- [ ] Handle migration errors gracefully
- [ ] Add telemetry for migration success/failure

**Acceptance Criteria**:
- Migration runs on app load
- Doesn't block app rendering
- Errors logged but don't crash app

---

## Phase 5: Testing (Priority: High)

### Task 5.1: Unit Tests
**Estimate**: 3 hours  
**Dependencies**: All Phase 1-3 tasks

- [x] Test companion type definitions

- [x] Test storage service functions

- [ ] Test CompanionOption component
- [ ] Test CompanionSelectionModal component
- [x] Test AppContext companion state

- [x] Test migration logic

- [x] Achieve 80%+ code coverage



**Acceptance Criteria**:
- All critical paths tested
- Edge cases covered
- Tests pass consistently
- Coverage meets threshold

---

### Task 5.2: Integration Tests
**Estimate**: 2 hours  
**Dependencies**: Task 5.1

- [ ] Test full selection flow
- [ ] Test localStorage persistence
- [ ] Test Firebase sync (authenticated)
- [ ] Test cross-device sync
- [ ] Test migration for existing users
- [ ] Test error scenarios

**Acceptance Criteria**:
- End-to-end flows work
- Storage mechanisms tested
- Sync verified
- Error handling validated

---

### Task 5.3: E2E Tests
**Estimate**: 2 hours  
**Dependencies**: Task 5.2

- [ ] Test new user first visit
- [ ] Test companion selection and persistence
- [ ] Test returning user (no modal)
- [ ] Test mobile responsive behavior
- [ ] Test keyboard navigation
- [ ] Test accessibility with screen reader

**Acceptance Criteria**:
- User flows work in real browser
- Mobile experience validated
- Accessibility verified
- No console errors

---

## Phase 6: Polish & Documentation (Priority: Medium)

### Task 6.1: Accessibility Audit
**Estimate**: 2 hours  
**Dependencies**: All Phase 2-3 tasks

- [ ] Run axe DevTools audit
- [ ] Test with keyboard only
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Verify ARIA labels
- [ ] Check color contrast ratios
- [ ] Fix any accessibility issues found

**Acceptance Criteria**:
- No critical accessibility issues
- WCAG 2.1 AA compliance
- Keyboard navigation perfect
- Screen reader friendly

---

### Task 6.2: Performance Optimization
**Estimate**: 2 hours  
**Dependencies**: All Phase 2-3 tasks

- [ ] Lazy load modal component
- [ ] Optimize animations (GPU acceleration)
- [ ] Minimize bundle size
- [ ] Add React.memo where appropriate
- [ ] Profile with React DevTools
- [ ] Ensure <100ms interaction latency

**Acceptance Criteria**:
- Modal loads quickly
- Animations smooth (60fps)
- No unnecessary re-renders
- Bundle size acceptable

---

### Task 6.3: Update Documentation
**Estimate**: 2 hours  
**Dependencies**: All previous tasks

- [ ] Update SPIRIT_COMPANION_GUIDE.md
- [ ] Add companion selection section
- [ ] Document all 3 companion types
- [ ] Add troubleshooting section
- [ ] Update FEATURES.md
- [ ] Add screenshots/GIFs
- [ ] Update CHANGELOG.md

**Acceptance Criteria**:
- Documentation complete and accurate
- Examples provided
- Screenshots included
- Easy to understand

---

### Task 6.4: User Feedback Collection
**Estimate**: 1 hour  
**Dependencies**: Task 6.3

- [ ] Add analytics events for selection
- [ ] Track selection completion rate
- [ ] Track time to selection
- [ ] Track companion type distribution
- [ ] Add optional feedback form after selection

**Acceptance Criteria**:
- Analytics implemented
- Data collection privacy-compliant
- Insights actionable

---

## Phase 7: Deployment (Priority: High)

### Task 7.1: Feature Flag Setup
**Estimate**: 1 hour  
**Dependencies**: All Phase 1-6 tasks

- [ ] Add feature flag for companion selection
- [ ] Implement flag check in AchievementsPage
- [ ] Test with flag enabled/disabled
- [ ] Document flag usage

**Acceptance Criteria**:
- Feature can be toggled
- No errors when disabled
- Easy to enable for rollout

---

### Task 7.2: Staged Rollout
**Estimate**: 2 hours  
**Dependencies**: Task 7.1

- [ ] Deploy to staging environment
- [ ] Test with real data
- [ ] Enable for 10% of users
- [ ] Monitor metrics and errors
- [ ] Gradually increase to 100%

**Acceptance Criteria**:
- Smooth rollout
- No critical issues
- Metrics look healthy
- User feedback positive

---

### Task 7.3: Post-Launch Monitoring
**Estimate**: Ongoing  
**Dependencies**: Task 7.2

- [ ] Monitor error rates
- [ ] Track selection completion
- [ ] Review user feedback
- [ ] Fix any issues quickly
- [ ] Iterate based on data

**Acceptance Criteria**:
- <1% error rate
- >95% selection completion
- Positive user sentiment
- Quick issue resolution

---

## Summary

### Total Estimated Time
- Phase 1: 4.5 hours
- Phase 2: 9 hours
- Phase 3: 6 hours
- Phase 4: 3 hours
- Phase 5: 7 hours
- Phase 6: 7 hours
- Phase 7: 3 hours
- **Total: ~39.5 hours (~1 week for 1 developer)**

### Critical Path
1. Task 1.1 → Task 1.2 → Task 2.1 → Task 2.2 → Task 3.1 → Task 3.2 → Task 5.1 → Task 7.2

### Parallel Work Opportunities
- Tasks 1.3 and 2.1 can be done in parallel
- Tasks 2.3 and 3.3 can be done in parallel
- Phase 4 can overlap with Phase 5
- Phase 6 can overlap with Phase 7

### Risk Areas
- Firebase sync complexity (Task 1.2)
- Animation performance (Task 2.3)
- Migration for existing users (Task 4.1)
- Cross-device sync testing (Task 5.2)

### Success Criteria
- ✅ All tasks completed
- ✅ Tests passing
- ✅ Documentation updated
- ✅ Feature deployed
- ✅ Users successfully selecting companions
- ✅ No critical bugs
