# Necronomicon Notes Modern Enhancements - Tasks

## Phase 1: Block-Based Content Structure (Priority: High)

### Task 1.1: Create Block Data Model
**Estimate:** 2 hours  
**Dependencies:** None

- [ ] Define ContentBlock interface with all block types
- [ ] Define BlockProperties interface for block-specific data
- [ ] Define TextFormatting interface for inline styles
- [ ] Create block type constants and enums
- [ ] Add blocks field to Note interface
- [ ] Create migration utilities (contentToBlocks, blocksToContent)

**Files:**
- `src/types/index.ts` (modify)
- `src/utils/blockUtils.ts` (new)

### Task 1.2: Create Block Renderer Component
**Estimate:** 3 hours  
**Dependencies:** Task 1.1

- [ ] Create BlockRenderer component with props interface
- [ ] Implement block focus and selection handling
- [ ] Add keyboard event handlers (Enter, Backspace)
- [ ] Implement block split logic
- [ ] Implement block merge logic
- [ ] Add active block highlighting
- [ ] Create block wrapper with drag handle placeholder

**Files:**
- `src/components/necronomicon-notes/BlockRenderer.tsx` (new)
- `src/components/necronomicon-notes/BlockRenderer.module.css` (new)

### Task 1.3: Create Block Components
**Estimate:** 4 hours  
**Dependencies:** Task 1.1

- [ ] Create ParagraphBlock component
- [ ] Create HeadingBlock component (H1-H6)
- [ ] Create ListBlock component (bullet, numbered, checklist)
- [ ] Create CodeBlock component with language selector
- [ ] Create QuoteBlock component
- [ ] Create CalloutBlock component with color variants
- [ ] Create DividerBlock component
- [ ] Style all block components with gothic theme

**Files:**
- `src/components/necronomicon-notes/blocks/ParagraphBlock.tsx` (new)
- `src/components/necronomicon-notes/blocks/HeadingBlock.tsx` (new)
- `src/components/necronomicon-notes/blocks/ListBlock.tsx` (new)
- `src/components/necronomicon-notes/blocks/CodeBlock.tsx` (new)
- `src/components/necronomicon-notes/blocks/QuoteBlock.tsx` (new)
- `src/components/necronomicon-notes/blocks/CalloutBlock.tsx` (new)
- `src/components/necronomicon-notes/blocks/DividerBlock.tsx` (new)
- `src/components/necronomicon-notes/blocks/blocks.module.css` (new)

### Task 1.4: Create Enhanced Editor Core
**Estimate:** 3 hours  
**Dependencies:** Task 1.2, Task 1.3

- [ ] Create EnhancedEditor component
- [ ] Implement editor state management
- [ ] Add block array management (add, update, delete, reorder)
- [ ] Implement selection state tracking
- [ ] Add undo/redo history management
- [ ] Create editor context for child components
- [ ] Add auto-save with debouncing

**Files:**
- `src/components/necronomicon-notes/EnhancedEditor.tsx` (new)
- `src/components/necronomicon-notes/EnhancedEditor.module.css` (new)
- `src/hooks/useEditorState.ts` (new)

### Task 1.5: Integrate Enhanced Editor into NotePage
**Estimate:** 2 hours  
**Dependencies:** Task 1.4

- [ ] Update NotePage to use EnhancedEditor
- [ ] Add feature detection for progressive enhancement
- [ ] Keep legacy editor as fallback
- [ ] Migrate existing notes to block format on first load
- [ ] Test backward compatibility
- [ ] Ensure markdown mode still works

**Files:**
- `src/components/necronomicon-notes/NotePage.tsx` (modify)

## Phase 2: Slash Commands & Auto-Formatting (Priority: High)

### Task 2.1: Create Slash Command System
**Estimate:** 3 hours  
**Dependencies:** Task 1.4

- [ ] Define SlashCommand interface
- [ ] Create SLASH_COMMANDS array with all commands
- [ ] Implement slash trigger detection logic
- [ ] Create command filtering by search query
- [ ] Add command execution handlers
- [ ] Implement command categories

**Files:**
- `src/utils/slashCommands.ts` (new)

### Task 2.2: Create Slash Command Menu Component
**Estimate:** 3 hours  
**Dependencies:** Task 2.1

- [ ] Create SlashCommandMenu component
- [ ] Implement menu positioning logic
- [ ] Add keyboard navigation (Arrow keys, Enter, Escape)
- [ ] Create command item component with icon and description
- [ ] Add search filtering UI
- [ ] Style with ghostly purple theme
- [ ] Add fade-in animation

**Files:**
- `src/components/necronomicon-notes/SlashCommandMenu.tsx` (new)
- `src/components/necronomicon-notes/SlashCommandMenu.module.css` (new)

### Task 2.3: Integrate Slash Commands into Editor
**Estimate:** 2 hours  
**Dependencies:** Task 1.4, Task 2.2

- [ ] Add slash menu state to editor
- [ ] Detect "/" trigger in editor input
- [ ] Show/hide menu based on trigger
- [ ] Handle command selection
- [ ] Remove "/" and insert selected block
- [ ] Test all slash commands
- [ ] Add screen reader announcements

**Files:**
- `src/components/necronomicon-notes/EnhancedEditor.tsx` (modify)

### Task 2.4: Implement Auto-Formatting Rules
**Estimate:** 3 hours  
**Dependencies:** Task 1.4

- [ ] Define AutoFormatRule interface
- [ ] Create AUTO_FORMAT_RULES array
- [ ] Implement inline formatting rules (**bold**, *italic*, etc.)
- [ ] Implement block formatting rules (#heading, -list, etc.)
- [ ] Create pattern matching logic
- [ ] Add format application handlers
- [ ] Test all auto-format patterns

**Files:**
- `src/utils/autoFormat.ts` (new)

### Task 2.5: Integrate Auto-Formatting into Editor
**Estimate:** 2 hours  
**Dependencies:** Task 1.4, Task 2.4

- [ ] Detect auto-format triggers (space, enter)
- [ ] Apply formatting rules on trigger
- [ ] Update block type or add inline formatting
- [ ] Handle undo for auto-formatting
- [ ] Test with various input patterns
- [ ] Add option to disable auto-formatting

**Files:**
- `src/components/necronomicon-notes/EnhancedEditor.tsx` (modify)

## Phase 3: Floating Toolbar & Keyboard Shortcuts (Priority: High)

### Task 3.1: Create Floating Toolbar Component
**Estimate:** 3 hours  
**Dependencies:** Task 1.4

- [ ] Create FloatingToolbar component
- [ ] Add formatting buttons (Bold, Italic, Underline, etc.)
- [ ] Implement toolbar positioning logic
- [ ] Add button hover effects with purple glow
- [ ] Create link insertion dialog
- [ ] Style with ghostly theme
- [ ] Add slide-in animation

**Files:**
- `src/components/necronomicon-notes/FloatingToolbar.tsx` (new)
- `src/components/necronomicon-notes/FloatingToolbar.module.css` (new)

### Task 3.2: Integrate Floating Toolbar
**Estimate:** 2 hours  
**Dependencies:** Task 1.4, Task 3.1

- [ ] Detect text selection in editor
- [ ] Calculate toolbar position above selection
- [ ] Show/hide toolbar based on selection
- [ ] Handle formatting button clicks
- [ ] Apply inline formatting to selected text
- [ ] Update block properties
- [ ] Test with various selection scenarios

**Files:**
- `src/components/necronomicon-notes/EnhancedEditor.tsx` (modify)

### Task 3.3: Implement Comprehensive Keyboard Shortcuts
**Estimate:** 3 hours  
**Dependencies:** Task 1.4

- [ ] Create useEditorShortcuts hook
- [ ] Implement Cmd/Ctrl+B for bold
- [ ] Implement Cmd/Ctrl+I for italic
- [ ] Implement Cmd/Ctrl+U for underline
- [ ] Implement Cmd/Ctrl+Shift+S for strikethrough
- [ ] Implement Cmd/Ctrl+E for inline code
- [ ] Implement Cmd/Ctrl+K for link
- [ ] Implement Cmd/Ctrl+Shift+H for highlight
- [ ] Implement Cmd/Ctrl+/ for slash menu
- [ ] Implement Cmd/Ctrl+Alt+1-6 for headings
- [ ] Add shortcut hints to UI

**Files:**
- `src/hooks/useEditorShortcuts.ts` (new)
- `src/components/necronomicon-notes/EnhancedEditor.tsx` (modify)

### Task 3.4: Create Link Insertion Dialog
**Estimate:** 2 hours  
**Dependencies:** Task 3.1

- [ ] Create LinkDialog component
- [ ] Add URL input field
- [ ] Add text input field (optional)
- [ ] Implement insert/update logic
- [ ] Add remove link option
- [ ] Style with gothic theme
- [ ] Add keyboard shortcuts (Enter to confirm, Escape to cancel)

**Files:**
- `src/components/necronomicon-notes/LinkDialog.tsx` (new)
- `src/components/necronomicon-notes/LinkDialog.module.css` (new)

## Phase 4: Drag-to-Reorder Blocks (Priority: Medium)

### Task 4.1: Create Drag Handle Component
**Estimate:** 2 hours  
**Dependencies:** Task 1.2

- [ ] Create DragHandle component
- [ ] Add six-dot icon SVG
- [ ] Implement visibility on block hover
- [ ] Add ghostly fade-in animation
- [ ] Style with purple glow on hover
- [ ] Make draggable
- [ ] Add ARIA labels

**Files:**
- `src/components/necronomicon-notes/DragHandle.tsx` (new)
- `src/components/necronomicon-notes/DragHandle.module.css` (new)

### Task 4.2: Implement Drag and Drop Logic
**Estimate:** 3 hours  
**Dependencies:** Task 1.4, Task 4.1

- [ ] Create useDragAndDrop hook
- [ ] Implement onDragStart handler
- [ ] Implement onDragOver handler
- [ ] Implement onDrop handler
- [ ] Add visual drop indicator
- [ ] Update block order on drop
- [ ] Add dragging state styling
- [ ] Test reordering various block types

**Files:**
- `src/hooks/useDragAndDrop.ts` (new)
- `src/components/necronomicon-notes/EnhancedEditor.tsx` (modify)

### Task 4.3: Add Drag Visual Feedback
**Estimate:** 2 hours  
**Dependencies:** Task 4.2

- [ ] Add dragging opacity effect
- [ ] Create drop target indicator line
- [ ] Add purple glow to drop target
- [ ] Implement smooth transitions
- [ ] Test on different screen sizes
- [ ] Add touch support for tablets

**Files:**
- `src/components/necronomicon-notes/EnhancedEditor.module.css` (modify)
- `src/components/necronomicon-notes/BlockRenderer.module.css` (modify)

## Phase 5: Command Palette (Priority: Medium)

### Task 5.1: Create Command System
**Estimate:** 2 hours  
**Dependencies:** None

- [ ] Define Command interface
- [ ] Create COMMANDS array with all commands
- [ ] Organize commands by category
- [ ] Add command icons and descriptions
- [ ] Implement command search/filter logic
- [ ] Add keyboard shortcuts to commands

**Files:**
- `src/utils/commands.ts` (new)

### Task 5.2: Create Command Palette Component
**Estimate:** 3 hours  
**Dependencies:** Task 5.1

- [ ] Create CommandPalette component
- [ ] Add search input with auto-focus
- [ ] Implement command list with filtering
- [ ] Add keyboard navigation (Arrow keys, Enter, Escape)
- [ ] Create command item with icon, name, description, shortcut
- [ ] Style with gothic overlay and purple glow
- [ ] Add slide-down animation

**Files:**
- `src/components/necronomicon-notes/CommandPalette.tsx` (new)
- `src/components/necronomicon-notes/CommandPalette.module.css` (new)

### Task 5.3: Integrate Command Palette
**Estimate:** 2 hours  
**Dependencies:** Task 1.4, Task 5.2

- [ ] Add Cmd/Ctrl+K shortcut to open palette
- [ ] Add command palette state to editor
- [ ] Implement command execution
- [ ] Connect commands to editor actions
- [ ] Test all command categories
- [ ] Add screen reader support

**Files:**
- `src/components/necronomicon-notes/EnhancedEditor.tsx` (modify)
- `src/hooks/useEditorShortcuts.ts` (modify)

## Phase 6: Mentions, Links & Tooltips (Priority: Low)

### Task 6.1: Implement Mention Detection
**Estimate:** 2 hours  
**Dependencies:** Task 1.4

- [ ] Create mention detection logic for "@"
- [ ] Create wiki link detection logic for "[["
- [ ] Implement trigger position tracking
- [ ] Add query extraction from trigger
- [ ] Create MentionTrigger interface

**Files:**
- `src/utils/mentionDetection.ts` (new)

### Task 6.2: Create Mention Menu Component
**Estimate:** 3 hours  
**Dependencies:** Task 6.1

- [ ] Create MentionMenu component
- [ ] Filter notes by search query
- [ ] Add keyboard navigation
- [ ] Display note titles with icons
- [ ] Implement note selection
- [ ] Style with ghostly theme
- [ ] Add fade-in animation

**Files:**
- `src/components/necronomicon-notes/MentionMenu.tsx` (new)
- `src/components/necronomicon-notes/MentionMenu.module.css` (new)

### Task 6.3: Integrate Mentions into Editor
**Estimate:** 2 hours  
**Dependencies:** Task 1.4, Task 6.2

- [ ] Detect @ and [[ triggers in editor
- [ ] Show mention menu on trigger
- [ ] Insert note link on selection
- [ ] Create new note for [[new note]] syntax
- [ ] Test mention workflow
- [ ] Add undo support

**Files:**
- `src/components/necronomicon-notes/EnhancedEditor.tsx` (modify)

### Task 6.4: Create Tooltip System
**Estimate:** 2 hours  
**Dependencies:** None

- [ ] Create Tooltip component
- [ ] Implement tooltip positioning logic
- [ ] Add fade-in animation
- [ ] Style with ghostly theme
- [ ] Create useTooltip hook
- [ ] Add keyboard shortcut display

**Files:**
- `src/components/necronomicon-notes/Tooltip.tsx` (new)
- `src/components/necronomicon-notes/Tooltip.module.css` (new)
- `src/hooks/useTooltip.ts` (new)

### Task 6.5: Create Note Preview Component
**Estimate:** 2 hours  
**Dependencies:** Task 6.4

- [ ] Create NotePreview component
- [ ] Show note title and content preview
- [ ] Display note tags
- [ ] Implement hover delay (500ms)
- [ ] Style with gothic theme
- [ ] Add slide-in animation

**Files:**
- `src/components/necronomicon-notes/NotePreview.tsx` (new)
- `src/components/necronomicon-notes/NotePreview.module.css` (new)

### Task 6.6: Add Tooltips Throughout UI
**Estimate:** 2 hours  
**Dependencies:** Task 6.4

- [ ] Add tooltips to toolbar buttons
- [ ] Add tooltips to slash commands
- [ ] Add tooltips to command palette items
- [ ] Add note previews to links
- [ ] Test tooltip positioning
- [ ] Ensure tooltips don't block interaction

**Files:**
- `src/components/necronomicon-notes/FloatingToolbar.tsx` (modify)
- `src/components/necronomicon-notes/SlashCommandMenu.tsx` (modify)
- `src/components/necronomicon-notes/CommandPalette.tsx` (modify)

## Phase 7: Performance & Optimization (Priority: High)

### Task 7.1: Implement Virtual Scrolling
**Estimate:** 3 hours  
**Dependencies:** Task 1.4

- [ ] Create useVirtualBlocks hook
- [ ] Calculate visible block range based on scroll
- [ ] Render only visible blocks + buffer
- [ ] Add scroll event handler
- [ ] Test with large notes (1000+ blocks)
- [ ] Optimize scroll performance

**Files:**
- `src/hooks/useVirtualBlocks.ts` (new)
- `src/components/necronomicon-notes/EnhancedEditor.tsx` (modify)

### Task 7.2: Optimize Block Rendering
**Estimate:** 2 hours  
**Dependencies:** Task 1.2

- [ ] Memoize BlockRenderer component
- [ ] Add shouldComponentUpdate logic
- [ ] Optimize re-render conditions
- [ ] Use React.memo for block components
- [ ] Profile rendering performance
- [ ] Reduce unnecessary re-renders

**Files:**
- `src/components/necronomicon-notes/BlockRenderer.tsx` (modify)
- `src/components/necronomicon-notes/blocks/*.tsx` (modify)

### Task 7.3: Implement Debounced Auto-Save
**Estimate:** 1 hour  
**Dependencies:** Task 1.4

- [ ] Create useAutoSave hook
- [ ] Debounce save operations (1 second)
- [ ] Convert blocks to content for backward compatibility
- [ ] Update note in context
- [ ] Add save indicator
- [ ] Test save reliability

**Files:**
- `src/hooks/useAutoSave.ts` (new)
- `src/components/necronomicon-notes/EnhancedEditor.tsx` (modify)

### Task 7.4: Optimize Selection and Formatting
**Estimate:** 2 hours  
**Dependencies:** Task 3.1

- [ ] Cache selection state
- [ ] Debounce floating toolbar positioning
- [ ] Optimize format application
- [ ] Reduce DOM manipulations
- [ ] Profile formatting performance
- [ ] Test with large selections

**Files:**
- `src/components/necronomicon-notes/FloatingToolbar.tsx` (modify)
- `src/utils/formatting.ts` (new)

## Phase 8: Accessibility & Polish (Priority: Medium)

### Task 8.1: Add ARIA Labels and Roles
**Estimate:** 2 hours  
**Dependencies:** All component tasks

- [ ] Add role="textbox" to editor
- [ ] Add aria-label to all interactive elements
- [ ] Add aria-describedby for help text
- [ ] Add aria-live regions for announcements
- [ ] Add aria-activedescendant for menus
- [ ] Test with screen reader
- [ ] Validate ARIA implementation

**Files:**
- All component files (modify)

### Task 8.2: Implement Screen Reader Announcements
**Estimate:** 2 hours  
**Dependencies:** Task 8.1

- [ ] Create useScreenReaderAnnouncements hook
- [ ] Announce block type changes
- [ ] Announce formatting applications
- [ ] Announce block reordering
- [ ] Announce command execution
- [ ] Test with NVDA/JAWS
- [ ] Ensure announcements are clear

**Files:**
- `src/hooks/useScreenReaderAnnouncements.ts` (new)
- All component files (modify)

### Task 8.3: Implement Focus Management
**Estimate:** 2 hours  
**Dependencies:** Task 1.4

- [ ] Create useFocusManagement hook
- [ ] Manage focus on block creation
- [ ] Manage focus on block deletion
- [ ] Manage focus in menus
- [ ] Implement focus trap for modals
- [ ] Test keyboard-only navigation
- [ ] Ensure focus is always visible

**Files:**
- `src/hooks/useFocusManagement.ts` (new)
- All component files (modify)

### Task 8.4: Add High Contrast Mode Support
**Estimate:** 1 hour  
**Dependencies:** All styling tasks

- [ ] Test in high contrast mode
- [ ] Ensure borders are visible
- [ ] Adjust colors for contrast
- [ ] Test focus indicators
- [ ] Validate with accessibility tools
- [ ] Document contrast ratios

**Files:**
- All CSS files (modify)

### Task 8.5: Polish Animations and Transitions
**Estimate:** 2 hours  
**Dependencies:** All component tasks

- [ ] Ensure all animations are smooth (60fps)
- [ ] Add prefers-reduced-motion support
- [ ] Optimize animation performance
- [ ] Test on low-end devices
- [ ] Add subtle ghostly effects
- [ ] Ensure animations don't distract

**Files:**
- All CSS files (modify)

### Task 8.6: Add Loading States
**Estimate:** 1 hour  
**Dependencies:** Task 1.4

- [ ] Add loading indicator for note loading
- [ ] Add skeleton loaders for blocks
- [ ] Show loading state during migration
- [ ] Add error boundaries
- [ ] Test with slow connections
- [ ] Ensure graceful degradation

**Files:**
- `src/components/necronomicon-notes/EnhancedEditor.tsx` (modify)
- `src/components/necronomicon-notes/LoadingState.tsx` (new)

## Phase 9: Testing & Documentation (Priority: High)

### Task 9.1: Write Unit Tests
**Estimate:** 4 hours  
**Dependencies:** All implementation tasks

- [ ] Test block operations (split, merge, reorder)
- [ ] Test auto-formatting rules
- [ ] Test slash command detection
- [ ] Test mention detection
- [ ] Test formatting application
- [ ] Test keyboard shortcuts
- [ ] Achieve 80%+ code coverage

**Files:**
- `src/utils/__tests__/blockUtils.test.ts` (new)
- `src/utils/__tests__/autoFormat.test.ts` (new)
- `src/utils/__tests__/slashCommands.test.ts` (new)
- `src/utils/__tests__/mentionDetection.test.ts` (new)

### Task 9.2: Write Integration Tests
**Estimate:** 4 hours  
**Dependencies:** All implementation tasks

- [ ] Test slash command workflow
- [ ] Test drag and drop reordering
- [ ] Test floating toolbar workflow
- [ ] Test command palette workflow
- [ ] Test mention insertion workflow
- [ ] Test auto-formatting workflow
- [ ] Test keyboard navigation

**Files:**
- `src/components/necronomicon-notes/__tests__/EnhancedEditor.integration.test.tsx` (new)
- `src/components/necronomicon-notes/__tests__/SlashCommands.integration.test.tsx` (new)
- `src/components/necronomicon-notes/__tests__/DragAndDrop.integration.test.tsx` (new)

### Task 9.3: Write Accessibility Tests
**Estimate:** 2 hours  
**Dependencies:** Task 8.1, Task 8.2

- [ ] Test ARIA labels
- [ ] Test keyboard navigation
- [ ] Test screen reader announcements
- [ ] Test focus management
- [ ] Run axe accessibility tests
- [ ] Validate WCAG 2.1 AA compliance

**Files:**
- `src/components/necronomicon-notes/__tests__/Accessibility.test.tsx` (new)

### Task 9.4: Create User Documentation
**Estimate:** 2 hours  
**Dependencies:** All implementation tasks

- [ ] Document slash commands
- [ ] Document keyboard shortcuts
- [ ] Document auto-formatting shortcuts
- [ ] Document drag and drop
- [ ] Document mentions and links
- [ ] Create quick reference guide
- [ ] Add screenshots/GIFs

**Files:**
- `NECRONOMICON_GUIDE.md` (new)
- `KEYBOARD_SHORTCUTS.md` (update)

### Task 9.5: Create Developer Documentation
**Estimate:** 2 hours  
**Dependencies:** All implementation tasks

- [ ] Document block data model
- [ ] Document component architecture
- [ ] Document state management
- [ ] Document extension points
- [ ] Add JSDoc comments
- [ ] Create architecture diagrams

**Files:**
- `src/components/necronomicon-notes/README.md` (new)
- All component files (add JSDoc)

### Task 9.6: Performance Testing
**Estimate:** 2 hours  
**Dependencies:** Task 7.1, Task 7.2

- [ ] Test with 100 blocks
- [ ] Test with 1000 blocks
- [ ] Test with 10,000 blocks
- [ ] Measure render time
- [ ] Measure memory usage
- [ ] Profile with React DevTools
- [ ] Optimize bottlenecks

**Files:**
- `src/components/necronomicon-notes/__tests__/Performance.test.tsx` (new)

## Summary

**Total Estimated Time:** 95 hours

**Priority Breakdown:**
- High Priority: 52 hours (Phases 1-3, 7, 9)
- Medium Priority: 28 hours (Phases 4-5, 8)
- Low Priority: 15 hours (Phase 6)

**Phase Summary:**
1. **Phase 1**: Block-Based Structure (14 hours) - Foundation
2. **Phase 2**: Slash Commands & Auto-Formatting (13 hours) - Quick content insertion
3. **Phase 3**: Floating Toolbar & Shortcuts (10 hours) - Text formatting
4. **Phase 4**: Drag-to-Reorder (7 hours) - Content organization
5. **Phase 5**: Command Palette (7 hours) - Keyboard-first workflow
6. **Phase 6**: Mentions, Links & Tooltips (13 hours) - Note connections
7. **Phase 7**: Performance & Optimization (8 hours) - Speed and efficiency
8. **Phase 8**: Accessibility & Polish (10 hours) - Inclusivity and refinement
9. **Phase 9**: Testing & Documentation (16 hours) - Quality assurance

**Recommended Implementation Order:**
1. Phase 1 (Block structure) - Must be first, foundation for everything
2. Phase 2 (Slash commands) - High user value, builds on blocks
3. Phase 3 (Floating toolbar) - High user value, independent feature
4. Phase 7 (Performance) - Ensure scalability early
5. Phase 4 (Drag-and-drop) - Polish feature, builds on blocks
6. Phase 5 (Command palette) - Keyboard workflow enhancement
7. Phase 6 (Mentions/links) - Advanced features
8. Phase 8 (Accessibility) - Ensure inclusivity
9. Phase 9 (Testing) - Validate everything works

**Key Milestones:**
- **Milestone 1** (Phase 1 complete): Block-based editor functional
- **Milestone 2** (Phases 1-2 complete): Slash commands working
- **Milestone 3** (Phases 1-3 complete): Full formatting capabilities
- **Milestone 4** (Phases 1-5 complete): Complete keyboard-first workflow
- **Milestone 5** (All phases complete): Production-ready modern editor

**Dependencies:**
- All phases depend on Phase 1 (Block structure)
- Phase 2-6 can be developed in parallel after Phase 1
- Phase 7 should be done before Phase 9
- Phase 8 should be done before final release
- Phase 9 validates all previous phases

**Risk Mitigation:**
- Start with Phase 1 to validate architecture
- Keep legacy editor as fallback
- Implement progressive enhancement
- Test backward compatibility continuously
- Profile performance early (Phase 7)
- Validate accessibility throughout (Phase 8)

This implementation plan transforms Necronomicon Notes into a modern, Notion-like writing experience while preserving the gothic aesthetic and all existing features.
