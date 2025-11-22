# Forest Hub Navigation - Implementation Tasks

## Phase 1: Core Structure (Priority: High)

### Task 1.1: Create ForestHub Component
**File**: `src/components/forest-hub/ForestHub.tsx`

**Instructions for Kiro**:
1. Create functional component with TypeScript
2. Import required dependencies: React, useState, useEffect, useCallback
3. Define TreeSection interface matching design spec
4. Initialize tree sections array with all 5 sections
5. Set up state for: currentRoute, hoveredTree, showSidebar
6. Implement navigation handler that calls onNavigate prop
7. Add keyboard event listener for shortcuts (1-5, Escape)
8. Return JSX with forest container, trees, fog layers, sidebar
9. Export component as default

**Acceptance Criteria**:
- Component renders without errors
- Props are properly typed
- State management is functional
- Keyboard listeners are attached/cleaned up

### Task 1.2: Create Tree Component
**File**: `src/components/forest-hub/Tree.tsx`

**Instructions for Kiro**:
1. Create functional component accepting TreeProps
2. Use memo for performance optimization
3. Calculate position styles from section.position
4. Apply size class based on section.size
5. Add click handler that calls onClick prop
6. Add mouse enter/leave handlers for hover state
7. Apply active class when isActive is true
8. Add ARIA attributes for accessibility
9. Render tree icon and label
10. Export memoized component

**Acceptance Criteria**:
- Tree renders at correct position
- Click triggers navigation
- Hover triggers sidebar
- Active state shows pulse animation
- Accessible to screen readers

### Task 1.3: Create Sidebar Component
**File**: `src/components/forest-hub/Sidebar.tsx`

**Instructions for Kiro**:
1. Create functional component accepting SidebarProps
2. Return null if section is null
3. Apply visible class when isVisible is true
4. Position based on position prop (left/right)
5. Display section name as heading
6. Display section description
7. Map and display stats if available
8. Show keyboard shortcut hint
9. Add slide-in/out animation
10. Export component

**Acceptance Criteria**:
- Sidebar slides in smoothly
- Content displays correctly
- Animation timing matches spec (300ms)
- Hides when section is null

## Phase 2: Styling & Animations (Priority: High)

### Task 2.1: Create ForestHub Styles
**File**: `src/components/forest-hub/ForestHub.module.css`

**Instructions for Kiro**:
1. Create .forestHub container with full viewport height
2. Add forest background gradient from design spec
3. Position trees using absolute positioning
4. Create .tree base styles with transitions
5. Add .tree:hover styles with glow animation
6. Create .tree.active styles with pulse animation
7. Add size variants: .small, .medium, .large
8. Implement responsive breakpoints (desktop, tablet, mobile)
9. Add GPU acceleration properties (will-change, translateZ)
10. Export all classes

**Acceptance Criteria**:
- Forest fills viewport correctly
- Trees positioned per coordinate spec
- Hover animations are smooth
- Responsive layout works at all breakpoints
- Performance is 60fps

### Task 2.2: Create Tree Animations
**File**: `src/components/forest-hub/Tree.module.css`

**Instructions for Kiro**:
1. Define @keyframes treeGlow animation
2. Define @keyframes selectionPulse animation
3. Create .tree base class with transform origin center
4. Add .tree:hover with glow animation (2s infinite)
5. Add .tree.active with pulse animation (2s infinite)
6. Create glow color variants for each section
7. Add focus styles with visible outline
8. Implement reduced motion media query
9. Add transition for smooth state changes
10. Export all classes

**Acceptance Criteria**:
- Glow animation loops smoothly
- Pulse animation is visible on active trees
- Focus states are accessible
- Reduced motion is respected
- Transitions are smooth (300ms)

### Task 2.3: Create Fog Layer Component
**File**: `src/components/forest-hub/FogLayer.tsx`

**Instructions for Kiro**:
1. Create functional component with layer prop (1-3)
2. Apply different animation duration per layer
3. Use SVG or CSS gradient for fog effect
4. Add fogDrift animation from design spec
5. Set opacity based on layer number
6. Add blur filter for depth effect
7. Position absolutely to cover forest
8. Disable on mobile for performance
9. Add pointer-events: none
10. Export component

**Acceptance Criteria**:
- Three fog layers render
- Each layer has different timing
- Fog drifts smoothly
- No performance impact
- Disabled on mobile

## Phase 3: Interactivity (Priority: Medium)

### Task 3.1: Implement Keyboard Navigation
**File**: `src/components/forest-hub/useKeyboardNav.ts`

**Instructions for Kiro**:
1. Create custom hook accepting onNavigate callback
2. Define KEYBOARD_SHORTCUTS constant
3. Create handleKeyDown function
4. Map number keys (1-5) to tree routes
5. Handle Tab for focus navigation
6. Handle Enter/Space for selection
7. Handle Escape to close modals
8. Add event listener on mount
9. Clean up listener on unmount
10. Export hook

**Acceptance Criteria**:
- Number keys navigate to correct trees
- Tab cycles through trees
- Enter/Space selects focused tree
- Escape closes sidebar
- No memory leaks

### Task 3.2: Implement Hover Debouncing
**File**: `src/components/forest-hub/useHoverDebounce.ts`

**Instructions for Kiro**:
1. Create custom hook accepting delay (default 150ms)
2. Import lodash debounce or create custom
3. Create debounced callback with useMemo
4. Return debounced function
5. Clean up on unmount
6. Handle rapid hover changes
7. Cancel pending calls on unmount
8. Type properly with TypeScript
9. Add JSDoc comments
10. Export hook

**Acceptance Criteria**:
- Hover is debounced by 150ms
- Rapid hovers don't cause flicker
- Cleanup prevents memory leaks
- TypeScript types are correct
- Performance is optimal

### Task 3.3: Implement Route Integration
**File**: `src/components/forest-hub/ForestHub.tsx` (update)

**Instructions for Kiro**:
1. Import useNavigate from react-router-dom
2. Import useLocation to get current route
3. Update onNavigate to use navigate()
4. Determine active tree from current location
5. Add route change effect to update active state
6. Handle route parameters if needed
7. Add loading state during navigation
8. Implement error boundary for failed navigation
9. Add transition animation between routes
10. Test all navigation paths

**Acceptance Criteria**:
- Clicking tree navigates to route
- Active tree matches current route
- Browser back/forward works
- Route changes are smooth
- Error handling works

## Phase 4: Polish & Optimization (Priority: Low)

### Task 4.1: Add Particle Effects
**File**: `src/components/forest-hub/ParticleEffect.tsx`

**Instructions for Kiro**:
1. Create functional component for particles
2. Generate random particle positions
3. Animate particles (fireflies, leaves)
4. Use CSS animations for movement
5. Limit particle count (max 20)
6. Add random delays for natural feel
7. Disable on mobile/low-end devices
8. Use requestAnimationFrame for smooth animation
9. Clean up particles on unmount
10. Export component

**Acceptance Criteria**:
- Particles animate smoothly
- Performance stays above 55fps
- Disabled on mobile
- Natural, random movement
- No memory leaks

### Task 4.2: Add Sound Effects (Optional)
**File**: `src/components/forest-hub/useSoundEffects.ts`

**Instructions for Kiro**:
1. Create custom hook for sound management
2. Load ambient forest sounds
3. Add tree click sound effect
4. Add hover sound effect (subtle)
5. Implement volume control
6. Add mute toggle
7. Respect user preferences
8. Preload sounds on mount
9. Clean up audio on unmount
10. Export hook

**Acceptance Criteria**:
- Sounds play on interaction
- Volume is adjustable
- Mute toggle works
- No audio lag
- Respects user preferences

### Task 4.3: Add Loading States
**File**: `src/components/forest-hub/ForestHubSkeleton.tsx`

**Instructions for Kiro**:
1. Create skeleton component for loading
2. Show placeholder trees
3. Add shimmer animation
4. Match forest layout
5. Display while assets load
6. Fade out when ready
7. Handle slow connections
8. Add timeout fallback
9. Show error state if needed
10. Export component

**Acceptance Criteria**:
- Skeleton shows during load
- Shimmer animation is smooth
- Fades out gracefully
- Handles errors
- Timeout works correctly

## Phase 5: Testing & Documentation (Priority: Medium)

### Task 5.1: Write Unit Tests
**File**: `src/components/forest-hub/__tests__/ForestHub.test.tsx`

**Instructions for Kiro**:
1. Set up test file with React Testing Library
2. Test component renders correctly
3. Test tree click navigation
4. Test keyboard shortcuts
5. Test hover shows sidebar
6. Test active state highlighting
7. Test responsive layout
8. Test accessibility features
9. Mock navigation hooks
10. Achieve 80%+ coverage

**Acceptance Criteria**:
- All tests pass
- Coverage above 80%
- Edge cases handled
- Mocks work correctly
- Tests are maintainable

### Task 5.2: Write Integration Tests
**File**: `src/components/forest-hub/__tests__/ForestHub.integration.test.tsx`

**Instructions for Kiro**:
1. Set up integration test environment
2. Test full navigation flow
3. Test route changes update active tree
4. Test keyboard navigation end-to-end
5. Test sidebar interactions
6. Test animation completion
7. Test error scenarios
8. Test browser back/forward
9. Test accessibility with axe
10. Document test scenarios

**Acceptance Criteria**:
- Integration tests pass
- Full user flows tested
- Accessibility validated
- Error handling verified
- Documentation complete

### Task 5.3: Create Component Documentation
**File**: `src/components/forest-hub/README.md`

**Instructions for Kiro**:
1. Document component purpose
2. List all props with types
3. Show usage examples
4. Document keyboard shortcuts
5. Explain tree configuration
6. Show customization options
7. List accessibility features
8. Add troubleshooting section
9. Include performance tips
10. Add visual examples

**Acceptance Criteria**:
- Documentation is complete
- Examples are clear
- Props are documented
- Accessibility noted
- Easy to understand

## Implementation Order

1. **Week 1**: Phase 1 (Core Structure)
2. **Week 2**: Phase 2 (Styling & Animations)
3. **Week 3**: Phase 3 (Interactivity)
4. **Week 4**: Phase 4 (Polish) + Phase 5 (Testing)

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.5.0",
    "vitest": "^1.0.0"
  }
}
```

## Success Metrics

- [ ] All trees navigate correctly
- [ ] Keyboard shortcuts work
- [ ] Animations run at 60fps
- [ ] Sidebar reveals smoothly
- [ ] Responsive on all devices
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Test coverage > 80%
- [ ] No console errors
- [ ] Load time < 2s
- [ ] User feedback positive
