# Project-Wide Cleanup & Improvements - Implementation Tasks

## Phase 1: Documentation & Debug Cleanup 🧹

### 1.1 Create Automated Cleanup Script
- Create `scripts/cleanup-docs.ps1` PowerShell script for Windows
- Add patterns for all documentation file types to remove (`*_COMPLETE.md`, `*_IMPLEMENTATION.md`, `*_VERIFICATION.md`, `*_SUMMARY.md`, `*Demo.md`, `*.demo.tsx`, `*.demo.html`)
- Include logging for audit trail
- Add dry-run mode for safety
- Test script on small subset first
- _Requirements: 1.1, 1.4, 1.5_

### 1.2 Execute Documentation Cleanup
- Run cleanup script with dry-run to preview (~88+ documentation files found)
- Review list of files to be removed
- Execute actual cleanup
- Verify no essential files were removed (preserve README.md and .kiro/specs/)
- Commit changes with detailed message
- _Requirements: 1.1, 1.2, 1.3_

### 1.3 Remove Debug Components
- Delete `ZombieVideoDebug.tsx` and `ZombieVideoDebug.module.css`
- Delete `GhostVideoDebug.tsx`
- Remove `companion-test.html` from public
- Remove `companion-selection-test.html` from root
- Remove `CompanionSelectionDemo.tsx` and `.module.css`
- Update `AchievementsPage.tsx` to remove ZombieVideoDebug import
- Update `InteractiveCompanion.tsx` if needed
- Test companion functionality still works
- _Requirements: 2.1, 2.2, 2.4_

### 1.4 Clean Console Logs
- Remove debug console.log from `companionStorageService.ts` (keep error logs)
- Remove debug console.log from `cloudSyncService.ts` (keep error logs)
- Remove debug console.log from `settingsService.ts` (keep error logs)
- Remove debug console.log from `storageService.ts` (keep error logs)
- Remove debug console.log from `firebaseService.ts` (keep error logs)
- Remove debug console.log from `audioService.ts` (keep error logs)
- Keep production error logging and performanceMonitor logs
- Run application and verify no debug output
- _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

### 1.5 Verify Cleanup Success
- Run TypeScript compiler to check for broken imports
- Run ESLint to verify no new warnings
- Execute full test suite
- Manually test all major features
- Document files removed in cleanup report
- _Requirements: 1.4, 2.4_

---

## Phase 2: CSS Optimization 🎨

### 2.1 Audit CSS Modules
- Create PowerShell script to find unused CSS classes
- Review each component's CSS module for duplicates
- Identify duplicate animation definitions (fadeIn, slideUp, pulse, glow appear in multiple files)
- List commented-out CSS rules
- Document findings in audit report
- _Requirements: 4.1_

### 2.2 Create Shared Animations File
- Create `src/components/common/animations.css`
- Extract `fadeIn` animation from multiple component files
- Extract `slideUp` animation from multiple component files
- Extract `pulse` animation from multiple component files
- Extract `glow` animation from multiple component files
- Add timer-specific animations (`timerPulse`, `progressRing`) for future timer feature
- _Requirements: 4.2, 4.4_

### 2.3 Update Components to Use Shared Animations
- Import shared animations.css in components that use these animations
- Update Spirit Companion components to use shared animations
- Update Ghost Writer components to use shared animations
- Update Terminal Tarot components to use shared animations
- Update Necronomicon Notes components to use shared animations
- Remove duplicate animation @keyframes definitions
- Test all animations still work correctly
- _Requirements: 4.2, 4.5_

### 2.4 Remove Unused CSS
- Remove unused classes from each CSS module
- Remove commented-out CSS rules
- Optimize CSS selectors for performance
- Consolidate similar styles
- Measure CSS size reduction
- _Requirements: 4.1, 4.3_

### 2.5 Visual Regression Testing
- Take screenshots of all major components before changes
- Apply CSS optimizations
- Take screenshots after changes
- Compare before/after visually
- Verify no visual regressions
- Test in Chrome, Firefox, Edge
- Test responsive layouts on mobile sizes
- _Requirements: 4.5_

---

## Phase 3: Focused Timer Implementation ⏱️

### 3.1 Create Timer Type Definitions
- Create `src/types/timer.ts`
- Define `SessionType` type ('focus' | 'break' | 'long-break')
- Define `TimerSession` interface with id, type, duration, timestamps
- Define `TimerSettings` interface with durations and preferences
- Define `TimerStats` interface for tracking sessions
- Define `TimerError` class and error codes (PERSISTENCE_FAILED, INVALID_DURATION, etc.)
- _Requirements: 8.1_

### 3.2 Implement TimerContext
- Create `src/contexts/TimerContext.tsx`
- Implement `TimerState` interface with isActive, startTime, duration, remainingTime, isPaused, sessionType
- Create `startTimer(duration, type)` function
- Create `pauseTimer()` function
- Create `resumeTimer()` function
- Create `stopTimer()` function
- Create `resetTimer()` function
- Add timer tick logic with useEffect (updates every second)
- Export TimerProvider and useTimer hook
- _Requirements: 8.1, 8.2_

### 3.3 Add Timer Persistence
- Implement localStorage save on timer state change in TimerContext
- Implement localStorage load on context mount
- Calculate remaining time from persisted startTime on restore
- Handle edge cases (expired timers, invalid data, corrupted storage)
- Add error handling for storage failures with fallback to memory-only
- _Requirements: 8.1, 8.2_

### 3.4 Implement Cross-Tab Synchronization
- Create `useTimerSync` hook in TimerContext
- Listen for storage events from other tabs
- Update timer state when other tabs change it
- Handle conflicts (multiple tabs starting timers - last write wins)
- Test synchronization between multiple browser tabs
- _Requirements: 8.2_

### 3.5 Add Firebase Timer Sync
- Add `syncTimerToFirebase(userId, timerData)` function in cloudSyncService
- Sync timer state on changes for authenticated users
- Load timer state from Firebase on login
- Handle offline scenarios gracefully (queue for later sync)
- Implement conflict resolution (prefer cloud data on login, local during session)
- _Requirements: 8.1_

### 3.6 Create TimerIndicator Component
- Create `src/components/common/TimerIndicator.tsx`
- Create `src/components/common/TimerIndicator.module.css`
- Implement circular progress ring SVG animation
- Add remaining time display in MM:SS format
- Add pause/resume button (stops propagation)
- Add click handler to navigate to /focused-timer page
- Make component position configurable via props
- Only render when timer is active
- _Requirements: 8.3, 8.4_

### 3.7 Integrate TimerIndicator Site-Wide
- Wrap App.tsx with TimerProvider
- Add TimerIndicator component to App.tsx layout (outside routes)
- Position indicator in top-right corner with fixed positioning
- Ensure indicator appears on all pages
- Test indicator visibility during navigation between routes
- Verify z-index doesn't conflict with modals (set to appropriate level)
- _Requirements: 8.3_

### 3.8 Implement Timer Notifications
- Create `useTimerNotifications` hook
- Request notification permission on first timer start
- Show browser notification on timer completion (if permission granted)
- Show toast notification on timer completion (always)
- Play completion sound if enabled in settings
- Trigger companion celebration reaction via CompanionContext
- Handle notification permission denied gracefully
- _Requirements: 8.5_

### 3.9 Create Focused Timer Page
- Create `src/components/focused-timer/` directory
- Create `FocusedTimerPage.tsx` component
- Create `FocusedTimerPage.module.css` for styling
- Add timer controls (start, pause, stop, reset buttons)
- Add duration selector (25, 45, 60 minutes presets + custom)
- Add session type selector (focus, break, long break)
- Display timer stats (sessions today, total time, current streak)
- Add settings panel (sound toggle, notifications toggle, auto-start options)
- Use TimerContext for state management
- _Requirements: 8.1, 8.4_

### 3.10 Add Timer Route
- Add `/focused-timer` route to App.tsx
- Add "Focused Timer" navigation link in Navigation component
- Add timer icon (⏱️ or clock icon) to navigation
- Test navigation to/from timer page
- Verify timer continues running when navigating away
- Verify TimerIndicator shows on all pages when timer is active
- _Requirements: 8.2_

---

## Phase 4: Performance Optimization ⚡

### 4.1 Implement Code Splitting
- Add React.lazy() for Terminal Tarot route in App.tsx
- Add React.lazy() for Ghost Writer route in App.tsx
- Add React.lazy() for Necronomicon Notes route in App.tsx
- Add React.lazy() for Focused Timer route in App.tsx
- Wrap lazy routes with Suspense and LoadingFallback component
- Test route loading performance with network throttling
- Measure bundle size reduction per route
- _Requirements: 5.4_

### 4.2 Add React.memo to Heavy Components
- Wrap InteractiveCompanion with React.memo
- Wrap GhostWriter with React.memo
- Wrap TarotCard component with React.memo
- Wrap EnhancedEditor with React.memo
- Add custom comparison functions where props are complex objects
- Use React DevTools Profiler to measure re-render reduction
- _Requirements: 5.3_

### 4.3 Optimize Expensive Calculations
- Add useMemo for companion mood calculations in CompanionContext
- Add useMemo for tarot card shuffling in TarotReader
- Add useMemo for editor block parsing in EnhancedEditor
- Add useCallback for event handlers in heavy components
- Profile performance improvements with React DevTools
- _Requirements: 5.3_

### 4.4 Optimize Bundle Size
- Run `npm run build` and analyze bundle size
- Install and run webpack-bundle-analyzer or vite-bundle-visualizer
- Remove unused dependencies from package.json
- Use tree-shaking for large libraries (import specific functions)
- Optimize imports (e.g., import { specific } from 'library' instead of import * as)
- Compress images and assets in public/ folder
- Measure final bundle size and compare to baseline (~2MB currently)
- Target: < 1.5MB total bundle size
- _Requirements: 5.1_

### 4.5 Run Performance Tests
- Run Lighthouse audit before optimizations (baseline)
- Document baseline scores (performance, FCP, LCP, TTI)
- Apply all performance optimizations
- Run Lighthouse audit after optimizations
- Measure First Contentful Paint (target: < 1.5s)
- Measure Largest Contentful Paint (target: < 2.5s)
- Measure Time to Interactive (target: < 3s)
- Verify performance score > 90
- Document improvements in cleanup report
- _Requirements: 5.2, 5.5_

---

## Phase 5: Accessibility Enhancement ♿

### 5.1 Add ARIA Labels
- Audit all buttons for aria-label or aria-labelledby
- Audit all inputs for aria-label or associated labels
- Add ARIA labels to all interactive elements without visible text
- Add ARIA labels to TimerIndicator component
- Add ARIA live regions for timer updates (aria-live="polite")
- Test with NVDA or JAWS screen reader
- _Requirements: 6.1_

### 5.2 Implement Keyboard Navigation
- Audit Tab key navigation through all interactive elements
- Ensure Enter key activates all buttons and links
- Ensure Escape key closes all modals and dialogs
- Add Arrow key navigation for carousels (if not already present)
- Add keyboard shortcuts for timer controls (Space to pause/resume, R to reset)
- Test complete keyboard-only workflow for all major features
- _Requirements: 6.2_

### 5.3 Add Focus Management
- Implement focus trap in all modals using useFocusTrap hook
- Restore focus to trigger element when closing modals
- Add visible focus indicators (outline or ring) to all interactive elements
- Ensure focus order is logical (follows visual layout)
- Test focus management with Tab and Shift+Tab
- _Requirements: 6.3_

### 5.4 High Contrast Mode Support
- Test application in Windows High Contrast mode
- Use WebAIM Contrast Checker to verify color contrast ratios meet 4.5:1
- Add high contrast CSS overrides if needed (@media (prefers-contrast: high))
- Test focus indicators visibility in high contrast mode
- Verify icon visibility and borders in high contrast mode
- _Requirements: 6.4_

### 5.5 Run Accessibility Tests
- Install and run axe-core automated tests (npm install @axe-core/react)
- Test with NVDA screen reader on Windows
- Test with JAWS screen reader (if available)
- Test complete keyboard-only navigation workflow
- Run WAVE browser extension for additional checks
- Verify WCAG 2.1 AA compliance
- Document any violations and fixes
- _Requirements: 6.5_

---

## Phase 6: Code Standardization 📏

### 6.1 Fix TypeScript Errors
- Run `npm run type-check` or `tsc --noEmit` to find errors
- Enable strict mode in tsconfig.json if not already enabled
- Fix all type errors reported by compiler
- Replace all `any` types with proper type definitions
- Create generic utility types for common patterns
- Verify zero TypeScript errors with `tsc --noEmit`
- _Requirements: 7.1, 7.2_

### 6.2 Standardize Error Handling
- Create centralized error types in `src/types/errors.ts`
- Implement standardized error messages and codes
- Add ErrorBoundary components to all route wrappers in App.tsx
- Implement retry mechanisms for failed API calls
- Add error reporting/logging service
- Test error scenarios (network failures, invalid data, etc.)
- _Requirements: 7.3_

### 6.3 Fix ESLint Warnings
- Run `npm run lint` on entire codebase
- Fix all warnings one by one
- Update ESLint config if rules need adjustment
- Add pre-commit hook for linting (using husky if not present)
- Verify zero ESLint warnings with `npm run lint`
- _Requirements: 7.4_

### 6.4 Standardize Code Style
- Ensure consistent naming conventions (camelCase for variables, PascalCase for components)
- Standardize import ordering (React first, then libraries, then local imports)
- Ensure consistent component structure (imports, types, component, exports)
- Run Prettier on all files with `npm run format`
- Update code style guide documentation if needed
- _Requirements: 7.5_

---

## Phase 7: Testing & Quality Assurance 🧪

### 7.1 Write Timer Unit Tests
- Create `src/contexts/TimerContext.test.tsx`
- Test TimerContext state management (initial state, state updates)
- Test timer start/pause/resume/stop functions
- Test timer persistence to localStorage
- Test timer restoration on reload (with mock localStorage)
- Test cross-tab synchronization (with storage events)
- Run coverage report and achieve 80%+ coverage for timer code
- _Requirements: 9.2_

### 7.2 Write Timer Integration Tests
- Create `src/test/integration/timer-integration.test.tsx`
- Test timer completion triggers companion celebration
- Test timer notifications (browser and toast)
- Test timer continues across page navigation
- Test timer with Firebase sync for authenticated users
- Test timer settings persistence
- _Requirements: 9.3_

### 7.3 Write TimerIndicator Tests
- Create `src/components/common/TimerIndicator.test.tsx`
- Test indicator renders when timer is active
- Test indicator does not render when timer is inactive
- Test time display formatting (MM:SS)
- Test pause/resume button functionality
- Test navigation on click to /focused-timer
- _Requirements: 9.2_

### 7.4 Increase Overall Test Coverage
- Identify untested components with coverage report
- Add tests for CompanionContext (if coverage < 80%)
- Add tests for aiService (if coverage < 80%)
- Add tests for Navigation component
- Add tests for ErrorBoundary component
- Run `npm run test:coverage` and achieve 80%+ overall coverage
- _Requirements: 9.1, 9.2_

### 7.5 Run Integration Tests
- Test complete user workflows (login → create task → complete task → companion reacts)
- Test timer + companion integration (timer completion → celebration)
- Test timer + navigation integration (start timer → navigate → timer continues)
- Test error recovery scenarios (network failure → retry → success)
- Verify all features work together without conflicts
- _Requirements: 9.3_

### 7.6 Run Accessibility Tests
- Run automated accessibility tests with axe-core
- Test with NVDA screen reader (all major features)
- Test keyboard navigation (Tab through all pages)
- Verify WCAG 2.1 AA compliance with WAVE
- Fix any violations found and re-test
- _Requirements: 9.4_

### 7.7 Run Performance Tests
- Measure Core Web Vitals (FCP, LCP, TTI, CLS)
- Run Lighthouse audits (before and after optimizations)
- Test on low-end devices (throttle CPU 4x, slow 3G network)
- Enforce performance budgets (bundle < 1.5MB, FCP < 1.5s)
- Document performance improvements in cleanup report
- _Requirements: 9.5_

---

## Phase 8: Documentation & Deployment 📚

### 8.1 Update Documentation
- Update main README.md with timer feature description
- Document timer API and usage in FEATURES.md
- Create timer user guide (how to use, keyboard shortcuts, settings)
- Document cleanup process in CLEANUP_REPORT.md
- Update architecture documentation with timer system
- _Requirements: All_

### 8.2 Create Cleanup Report
- Create CLEANUP_REPORT.md in project root
- Document files removed (count: ~88+ documentation files)
- Document bundle size reduction (before/after in MB)
- Document performance improvements (Lighthouse scores before/after)
- Document test coverage increase (before/after percentages)
- Create before/after comparison table
- _Requirements: 1.3, 4.3, 5.1_

### 8.3 Final Testing
- Run full test suite with `npm test`
- Manual testing of all features (companion, ghost writer, notes, tarot, timer)
- Test in Chrome, Firefox, Edge
- Test on mobile devices (iOS Safari, Chrome Mobile)
- Verify no regressions from cleanup
- _Requirements: All_

### 8.4 Prepare for Deployment
- Create production build with `npm run build`
- Verify bundle size < 1.5MB (check dist/ folder)
- Run final Lighthouse audit (performance > 90)
- Create deployment checklist
- Tag release version (e.g., v2.0.0-cleanup)
- _Requirements: 5.1, 5.5_

### 8.5 Deploy to Production
- Deploy to hosting platform (Firebase, Vercel, or Netlify)
- Verify production deployment is successful
- Monitor for errors in production logs
- Test production site thoroughly
- Announce new features (timer, performance improvements)
- _Requirements: All_

---

## Quick Wins (Priority Tasks) 🚀

### Day 1 - Immediate Impact (3 hours)
1. **Create cleanup script** (Task 1.1) - 1 hour
2. **Execute documentation cleanup** (Task 1.2) - 1 hour
3. **Remove debug components** (Task 1.3) - 1 hour

### Week 1 - High Value (10 hours)
1. **Clean console logs** (Task 1.4) - 2 hours
2. **Create shared animations** (Task 2.2) - 2 hours
3. **Create Timer type definitions** (Task 3.1) - 1 hour
4. **Implement TimerContext** (Task 3.2) - 3 hours
5. **Add timer persistence** (Task 3.3) - 2 hours

### Week 2 - Core Features (12 hours)
1. **Create TimerIndicator** (Task 3.6) - 3 hours
2. **Integrate indicator site-wide** (Task 3.7) - 1 hour
3. **Create Focused Timer Page** (Task 3.9) - 4 hours
4. **Add timer route** (Task 3.10) - 1 hour
5. **Implement code splitting** (Task 4.1) - 3 hours

## Estimated Effort Summary

### By Phase
- **Phase 1**: Documentation & Debug Cleanup - 6 hours
- **Phase 2**: CSS Optimization - 12 hours
- **Phase 3**: Focused Timer Implementation - 24 hours
- **Phase 4**: Performance Optimization - 14 hours
- **Phase 5**: Accessibility Enhancement - 12 hours
- **Phase 6**: Code Standardization - 10 hours
- **Phase 7**: Testing & Quality Assurance - 18 hours
- **Phase 8**: Documentation & Deployment - 8 hours

**Total Estimated Effort**: 104 hours (13 weeks at 8 hours/week)

### By Priority
- **High Priority** (Phases 1-3): 42 hours - Core cleanup and timer feature
- **Medium Priority** (Phases 4-5): 26 hours - Performance and accessibility
- **Lower Priority** (Phases 6-8): 36 hours - Standardization, testing, and deployment

## Success Metrics

### Code Quality
- [ ] Documentation files reduced by ~88+ files (from ~300 to ~212)
- [ ] Bundle size reduced from ~2MB to <1.5MB (25% reduction)
- [ ] Test coverage increased to 80%+ (measure baseline first)
- [ ] Zero ESLint warnings
- [ ] Zero TypeScript errors

### Performance
- [ ] Lighthouse performance score >90
- [ ] First Contentful Paint <1.5s
- [ ] Largest Contentful Paint <2.5s
- [ ] Time to Interactive <3s
- [ ] Code splitting reduces initial bundle load

### Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Zero critical accessibility violations (axe-core)
- [ ] All features keyboard accessible
- [ ] Screen reader compatible (tested with NVDA)
- [ ] High contrast mode supported

### Timer Feature (New)
- [ ] Timer persists across page navigation
- [ ] Timer syncs across browser tabs
- [ ] Timer indicator visible on all pages when active
- [ ] Notifications work on timer completion
- [ ] Companion reacts to timer events
- [ ] Timer state persists to Firebase for authenticated users

## Dependencies Between Tasks

### Critical Path
1. Documentation cleanup → Debug removal → Console cleanup (Phase 1)
2. CSS audit → Shared animations → Component updates (Phase 2)
3. Timer types → TimerContext → Persistence → Indicator (Phase 3)
4. Code splitting → Memoization → Bundle optimization (Phase 4)

### Parallel Work
- CSS optimization can run parallel with Phase 1
- Timer implementation can start after Phase 1
- Accessibility work can start after timer basics work
- Testing can be written alongside implementation

## Risk Mitigation

### Before Starting
- [ ] Create backup branch (`backup/pre-cleanup`)
- [ ] Document current functionality
- [ ] Set up rollback plan
- [ ] Communicate with team

### During Implementation
- [ ] Make incremental commits after each task
- [ ] Test after each major change
- [ ] Monitor performance metrics
- [ ] Get regular code reviews

### After Completion
- [ ] Full regression testing
- [ ] Performance validation
- [ ] User acceptance testing
- [ ] Gradual production rollout
