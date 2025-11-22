# Spirit Companion Interactions - Implementation Tasks (Part 2)

## Phase 1: Core Data Models & Services (Priority: High)

### Task 1.1: Create Mood System
**Estimate:** 3 hours  
**Dependencies:** None

- [x] Create `src/types/companionMood.ts`

















- [ ] Define `MoodState` type and `CompanionMood` interface
- [ ] Implement `calculateMood()` function with activity-based logic
- [x] Add mood history tracking


- [x] Create mood transition animations





- [x] Write unit tests for mood calculation



- [ ] Document mood triggers and states

**Requirements:** 2.1-2.5

---

### Task 1.2: Create Skill Tree System
**Estimate:** 4 hours  
**Dependencies:** None

- [x] Create `src/types/skillTree.ts`



- [x] Define `Skill`, `SkillEffect`, and `SkillTree` interfaces

- [x] Create skill definitions for all 3 companion types

- [x] Implement experience and leveling logic





- [x] Add skill prerequisite validation

- [x] Create skill effect application system

- [x] Write unit tests for skill progression

- [x] Document all available skills



**Requirements:** 11.1-11.7

---

### Task 1.3: Create Ritual System
**Estimate:** 4 hours  
**Dependencies:** None

- [ ] Create `src/types/ritual.ts`
- [ ] Define `Ritual`, `RitualRequirement`, and `RitualProgress` interfaces
- [ ] Create ritual definitions (at least 5 per companion type)
- [ ] Implement ritual requirement matching logic
- [ ] Add ritual progress tracking
- [ ] Create ritual reward system
- [ ] Write unit tests for ritual detection
- [ ] Document all rituals and their rewards

**Requirements:** 12.1-12.6

---

### Task 1.4: Create Context Awareness Service
**Estimate:** 3 hours  
**Dependencies:** None

- [ ] Create `src/services/contextAwarenessService.ts`
- [ ] Implement `UserContext` interface
- [ ] Add module tracking (Ghost Writer, Necronomicon, etc.)
- [ ] Add activity tracking (writing, task-managing, etc.)
- [ ] Add time-in-activity tracking
- [ ] Integrate moon phase tracking
- [ ] Integrate theme tracking
- [ ] Write unit tests for context tracking

**Requirements:** 10.1-10.7

---

### Task 1.5: Create Companion Audio Service
**Estimate:** 3 hours  
**Dependencies:** None

- [ ] Create `src/services/companionAudioService.ts`
- [ ] Implement sound loading and caching
- [ ] Add companion-specific sound effects
- [ ] Implement volume control
- [ ] Add mute/unmute functionality
- [ ] Create sound sprite system for efficiency
- [ ] Add Web Audio API integration
- [ ] Write unit tests for audio service

**Requirements:** 7.1-7.5

---

### Task 1.6: Create Companion Dialogue Service
**Estimate:** 4 hours  
**Dependencies:** Task 1.4

- [ ] Create `src/services/companionDialogueService.ts`
- [ ] Create dialogue database structure
- [ ] Write dialogue content for all 3 companions
- [ ] Implement context-aware dialogue generation
- [ ] Add time-of-day specific greetings
- [ ] Add mood-specific messages
- [ ] Add module-specific dialogue
- [ ] Implement dialogue rotation to avoid repetition
- [ ] Write unit tests for dialogue generation

**Requirements:** 3.1-3.5, 9.1-9.5

---

### Task 1.7: Create Ritual Detection Service
**Estimate:** 3 hours  
**Dependencies:** Task 1.3

- [ ] Create `src/services/ritualDetectionService.ts`
- [ ] Implement action tracking system
- [ ] Add ritual requirement checking logic
- [ ] Implement progress calculation
- [ ] Add ritual completion detection
- [ ] Create ritual cooldown system
- [ ] Write unit tests for ritual detection

**Requirements:** 12.1-12.6

---

## Phase 2: State Management (Priority: High)

### Task 2.1: Create CompanionContext
**Estimate:** 4 hours  
**Dependencies:** Tasks 1.1, 1.2, 1.3, 1.4

- [x] Create `src/contexts/CompanionContext.tsx`



- [x] Define `CompanionContextType` interface



- [ ] Define `CompanionContextType` interface
- [ ] Implement state for mood, skills, rituals, context
- [x] Add localStorage persistence





- [x] Add Firebase persistence (authenticated users)


- [x] Implement experience and leveling logic

- [x] Add companion switching logic


- [x] Add custom naming logic


- [x] Write unit tests for context


- [ ] Write unit tests for context

**Requirements:** All requirements

---

### Task 2.2: Integrate Context with Existing Systems
**Estimate:** 2 hours  

**Dependencies:** Task 2.1



- [x] Update AppContext to include CompanionContext




- [-] Integrate with TasksContext for task completion tracking

- [ ] Integrate with NotesContext for writing tracking
- [ ] Integrate with ThemeContext for theme changes
- [ ] Add moon phase integration
- [ ] Test cross-context communication

**Requirements:** 10.1-10.7

---

## Phase 3: Core UI Components (Priority: High)

### Task 3.1: Enhance SpiritCompanion Component
**Estimate:** 5 hours  
**Dependencies:** Task 2.1

- [ ] Rename to `InteractiveCompanion.tsx`




- [ ] Add click interaction handler
- [ ] Add hover tooltip with mood display
- [ ] Implement idle animations based on mood
- [ ] Add celebration animation for task completion
- [ ] Add encouragement animation for inactivity
- [ ] Integrate audio service for sounds
- [ ] Add particle effects for special moments
- [ ] Make fully keyboard accessible
- [ ] Write component tests

**Requirements:** 1.1-1.5, 4.1-4.5

---

### Task 3.2: Create CompanionDialogue Component
**Estimate:** 3 hours  
**Dependencies:** Task 1.6

- [ ] Create `src/components/spirit-companion/CompanionDialogue.tsx`
- [ ] Create `CompanionDialogue.module.css`
- [ ] Implement speech bubble UI
- [ ] Add typewriter text effect
- [ ] Add auto-dismiss timer
- [ ] Add manual dismiss button
- [ ] Implement smart positioning (avoid screen edges)
- [ ] Add companion-colored styling
- [ ] Make accessible with ARIA labels
- [ ] Write component tests

**Requirements:** 3.1-3.5

---

### Task 3.3: Create CompanionStats Modal
**Estimate:** 4 hours  
**Dependencies:** Task 2.1

- [ ] Create `src/components/spirit-companion/CompanionStats.tsx`
- [ ] Create `CompanionStats.module.css`
- [ ] Display companion info (name, type, level, stage)
- [ ] Show experience progress bar
- [ ] Display current mood with icon
- [ ] Show bonding date and duration
- [ ] Display task statistics
- [ ] Add tabs for Stats/Skills/Achievements
- [ ] Make fully keyboard navigable
- [ ] Write component tests

**Requirements:** 5.1-5.5

---

### Task 3.4: Create SkillTree Component
**Estimate:** 5 hours  
**Dependencies:** Task 1.2, Task 2.1

- [ ] Create `src/components/spirit-companion/SkillTree.tsx`
- [ ] Create `SkillTree.module.css`
- [ ] Implement three-branch layout (Power, Wisdom, Charm)
- [ ] Display skills as connected nodes
- [ ] Show locked/unlocked states
- [ ] Highlight available skills
- [ ] Add skill hover tooltips
- [ ] Implement skill unlock interaction
- [ ] Add skill point counter
- [ ] Show prerequisite connections
- [ ] Make keyboard navigable
- [ ] Write component tests

**Requirements:** 11.1-11.7

---

### Task 3.5: Create SpiritSummoning Modal
**Estimate:** 4 hours  
**Dependencies:** Task 2.1

- [ ] Create `src/components/spirit-companion/SpiritSummoning.tsx`
- [ ] Create `SpiritSummoning.module.css`
- [ ] Display all unlocked companions
- [ ] Show preview animations for each
- [ ] Display personality descriptions
- [ ] Show current stats for each companion
- [ ] Highlight active companion
- [ ] Show unlock conditions for locked companions
- [ ] Implement companion switching
- [ ] Add smooth transition animations
- [ ] Make keyboard accessible
- [ ] Write component tests

**Requirements:** 14.1-14.7

---

## Phase 4: Advanced Features (Priority: Medium)

### Task 4.1: Implement Multi-Spirit Interactions
**Estimate:** 4 hours  
**Dependencies:** Task 2.1, Task 3.1

- [ ] Create `src/types/spiritInteraction.ts`
- [ ] Define spirit interaction data structure
- [ ] Create interaction dialogue content
- [ ] Implement interaction trigger system
- [ ] Add cooldown management
- [ ] Create multi-spirit dialogue display
- [ ] Add interaction animations
- [ ] Implement user preference toggle
- [ ] Write unit tests for interactions

**Requirements:** 13.1-13.6

---

### Task 4.2: Implement Companion Achievements
**Estimate:** 3 hours  
**Dependencies:** Task 2.1

- [ ] Create `src/types/companionAchievement.ts`
- [ ] Define achievement structure
- [ ] Create achievement definitions (at least 10)
- [ ] Implement achievement tracking
- [ ] Add achievement unlock detection
- [ ] Create achievement notification
- [ ] Add achievement display in stats modal
- [ ] Show progress for locked achievements
- [ ] Write unit tests for achievements

**Requirements:** 8.1-8.5

---

### Task 4.3: Implement Custom Naming
**Estimate:** 2 hours  
**Dependencies:** Task 2.1

- [ ] Add name input field in stats modal
- [ ] Implement name validation (1-20 characters)
- [ ] Add name save functionality
- [ ] Update all UI to display custom name
- [ ] Add name change confirmation
- [ ] Persist names across sessions
- [ ] Sync names for authenticated users
- [ ] Write tests for naming system

**Requirements:** 6.1-6.5

---

### Task 4.4: Implement Ritual Completion Flow
**Estimate:** 3 hours  
**Dependencies:** Task 1.7, Task 3.2

- [ ] Integrate ritual detection with user actions
- [ ] Add ritual progress notifications
- [ ] Create ritual completion animation
- [ ] Display ritual reward
- [ ] Apply ritual effects (dialogue, abilities)
- [ ] Add ritual history tracking
- [ ] Create ritual hints system
- [ ] Write integration tests

**Requirements:** 12.1-12.6

---

## Phase 5: Integration & Polish (Priority: High)

### Task 5.1: Integrate with Ghost Writer
**Estimate:** 3 hours  
**Dependencies:** Task 2.1, Task 3.1

- [ ] Add companion reactions to writing start
- [ ] Track writing duration
- [ ] Show encouragement after 10 minutes
- [ ] Apply enhanced hints skill effect
- [ ] Add writing-specific dialogue
- [ ] Test Ghost Writer integration

**Requirements:** 10.1, 10.6, 11.4

---

### Task 5.2: Integrate with Task System
**Estimate:** 2 hours  
**Dependencies:** Task 2.1, Task 3.1

- [ ] Award experience on task completion
- [ ] Trigger celebration animation
- [ ] Track tombstone vs regular tasks
- [ ] Add task-specific dialogue
- [ ] Apply task prediction skill effect
- [ ] Test task system integration

**Requirements:** 10.3, 11.4

---

### Task 5.3: Integrate with Necronomicon Notes
**Estimate:** 2 hours  
**Dependencies:** Task 2.1, Task 3.1

- [ ] Track note-taking activity
- [ ] Add note-specific dialogue
- [ ] Track note length for rituals
- [ ] Show encouragement for long notes
- [ ] Test notes integration

**Requirements:** 10.2

---

### Task 5.4: Integrate with Theme System
**Estimate:** 1 hour  
**Dependencies:** Task 2.1, Task 3.1

- [ ] Track theme changes
- [ ] Add theme-specific dialogue
- [ ] Update companion colors with theme
- [ ] Test theme integration

**Requirements:** 10.5

---

### Task 5.5: Integrate with Moon Phase
**Estimate:** 1 hour  
**Dependencies:** Task 2.1, Task 3.1

- [ ] Track moon phase changes
- [ ] Add moon phase dialogue
- [ ] Enable moon phase rituals
- [ ] Test moon phase integration

**Requirements:** 10.4

---

### Task 5.6: Add Settings Panel
**Estimate:** 2 hours  
**Dependencies:** Task 2.1

- [ ] Create companion settings section
- [ ] Add audio volume slider
- [ ] Add audio mute toggle
- [ ] Add animation intensity selector
- [ ] Add multi-spirit interaction toggle
- [ ] Persist settings
- [ ] Test settings functionality

**Requirements:** 15.1-15.6

---

## Phase 6: Animations & Audio (Priority: Medium)

### Task 6.1: Create Idle Animation System
**Estimate:** 4 hours  
**Dependencies:** Task 3.1

- [ ] Define idle animation data structure
- [ ] Create animations for each companion type
- [ ] Implement mood-based animation selection
- [ ] Add evolution-stage specific animations
- [ ] Implement seamless looping
- [ ] Add animation pooling for performance
- [ ] Respect reduced motion preferences
- [ ] Test animations on various devices

**Requirements:** 4.1-4.5

---

### Task 6.2: Create Interaction Animations
**Estimate:** 3 hours  
**Dependencies:** Task 3.1

- [ ] Create click animations for each companion
- [ ] Create hover animations
- [ ] Create celebration animations
- [ ] Create encouragement animations
- [ ] Add particle effects
- [ ] Optimize animation performance
- [ ] Test on low-end devices

**Requirements:** 1.1, 1.3, 1.4

---

### Task 6.3: Implement Sound Effects
**Estimate:** 3 hours  
**Dependencies:** Task 1.5

- [ ] Source or create sound files
- [ ] Implement sound loading
- [ ] Add interaction sounds
- [ ] Add evolution sounds
- [ ] Add celebration sounds
- [ ] Add ambient mood sounds
- [ ] Test audio on various browsers
- [ ] Optimize audio file sizes

**Requirements:** 7.1-7.5

---

## Phase 7: Testing & Optimization (Priority: High)

### Task 7.1: Unit Tests
**Estimate:** 4 hours  
**Dependencies:** All Phase 1-4 tasks

- [ ] Test mood calculation
- [ ] Test skill tree logic
- [ ] Test ritual detection
- [ ] Test dialogue generation
- [ ] Test context tracking
- [ ] Test audio service
- [ ] Achieve 80%+ code coverage

**All requirements**

---

### Task 7.2: Integration Tests
**Estimate:** 3 hours  
**Dependencies:** All Phase 5 tasks

- [ ] Test complete interaction flow
- [ ] Test skill unlocking flow
- [ ] Test ritual completion flow
- [ ] Test multi-spirit interactions
- [ ] Test cross-module integration
- [ ] Test persistence and sync

**All requirements**

---

### Task 7.3: E2E Tests
**Estimate:** 3 hours  
**Dependencies:** Task 7.2

- [ ] Test user journey with companion
- [ ] Test skill tree navigation
- [ ] Test ritual discovery
- [ ] Test companion switching
- [ ] Test settings changes
- [ ] Test mobile experience

**All requirements**

---

### Task 7.4: Performance Optimization
**Estimate:** 3 hours  
**Dependencies:** All Phase 6 tasks

- [ ] Profile animation performance
- [ ] Optimize re-renders
- [ ] Implement animation pooling
- [ ] Lazy load audio files
- [ ] Optimize bundle size
- [ ] Test on low-end devices
- [ ] Ensure 60fps animations

**NFR: Performance**

---

### Task 7.5: Accessibility Audit
**Estimate:** 2 hours  
**Dependencies:** All Phase 3 tasks

- [ ] Run axe DevTools audit
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Verify ARIA labels
- [ ] Check color contrast
- [ ] Test reduced motion
- [ ] Fix any issues found

**NFR: Accessibility**

---

## Phase 8: Additional UI Improvements (Priority: Medium)

### Task 8.1: Reduce Necronomicon Notebook Size
**Estimate:** 2 hours  
**Dependencies:** None

- [ ] Reduce notebook tab size in Necronomicon
- [ ] Optimize tag display area
- [ ] Reduce spacing in notes list
- [ ] Make notebook more compact overall
- [ ] Ensure readability is maintained
- [ ] Test on various screen sizes
- [ ] Update responsive breakpoints if needed

**Note:** This is a separate UI improvement for the Necronomicon module

---

## Summary

### Total Estimated Time
- Phase 1: 24 hours (Core data & services)
- Phase 2: 6 hours (State management)
- Phase 3: 21 hours (UI components)
- Phase 4: 12 hours (Advanced features)
- Phase 5: 11 hours (Integration)
- Phase 6: 10 hours (Animations & audio)
- Phase 7: 15 hours (Testing & optimization)
- Phase 8: 2 hours (Additional UI)
- **Total: ~101 hours (~2.5 weeks for 1 developer)**

### Critical Path
1. Phase 1 (Data models & services)
2. Phase 2 (State management)
3. Phase 3 (Core UI)
4. Phase 5 (Integration)
5. Phase 7 (Testing)
6. Phase 8 (Deployment)

### Parallel Work Opportunities
- Tasks 1.1-1.7 can be done in parallel
- Phase 4 can overlap with Phase 5
- Phase 6 can overlap with Phase 3-5
- Phase 8 can start during Phase 7

### Risk Areas
- Animation performance on low-end devices
- Audio loading and playback across browsers
- Ritual detection complexity
- Multi-spirit interaction timing
- Bundle size increase

### Success Criteria
- ✅ All tasks completed
- ✅ Tests passing (80%+ coverage)
- ✅ Performance targets met (60fps animations)
- ✅ Accessibility compliant (WCAG 2.1 AA)
- ✅ Documentation complete
- ✅ Feature deployed successfully
- ✅ Users engaging with companion features
- ✅ No critical bugs

