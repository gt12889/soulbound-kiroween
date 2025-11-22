# Necronomicon Notes Modern Enhancements - Requirements

## Introduction

Upgrade the Necronomicon Notes with modern writing interactions inspired by Notion, Obsidian, and Evernote while maintaining the gothic, mystical aesthetic. The goal is to provide a best-in-class writing experience with slash commands, keyboard shortcuts, floating toolbars, and drag-to-reorder functionality, all wrapped in the dark, enchanted theme of Kiroween.

## Glossary

- **Slash Command**: A command triggered by typing "/" that opens a menu of formatting and content options
- **Floating Toolbar**: A context-sensitive toolbar that appears near selected text
- **Block**: A discrete unit of content (paragraph, heading, list item, etc.)
- **Quick Format**: Markdown-style shortcuts that auto-format as you type (e.g., `**bold**` → **bold**)
- **Drag Handle**: A visual indicator that allows users to reorder content blocks
- **Command Palette**: A searchable menu of all available commands (Cmd/Ctrl+K)

## Problem Statement

Current Necronomicon Notes implementation:
- Lacks modern writing interactions found in popular note-taking apps
- Requires manual toolbar clicks for formatting
- No slash commands or quick formatting shortcuts
- Cannot reorder content blocks via drag-and-drop
- Limited keyboard-first workflow
- Markdown mode is separate from rich text mode

## Goals

1. Implement Notion-style slash commands for quick content insertion
2. Add floating toolbar for text selection formatting
3. Enable drag-and-drop reordering of content blocks
4. Implement auto-formatting shortcuts (Markdown-style)
5. Add command palette for keyboard-first workflow
6. Maintain clean, distraction-free writing experience
7. Preserve gothic aesthetic with subtle mystical enhancements
8. Keep all existing features functional

## User Stories

### US-1: Slash Commands
**As a** writer  
**I want** to type "/" to open a command menu  
**So that** I can quickly insert formatted content without leaving the keyboard

**Acceptance Criteria:**
1. WHEN the user types "/" at the start of a line or after a space THEN the system SHALL display a command menu
2. WHEN the command menu is open THEN the system SHALL filter commands as the user types
3. WHEN a command is selected THEN the system SHALL insert the appropriate content block and remove the "/" trigger
4. WHEN the user presses Escape THEN the system SHALL close the command menu without inserting content
5. THE system SHALL support commands for: headings (H1-H6), lists (bullet, numbered, checklist), code blocks, quotes, dividers, tables, and callouts

### US-2: Floating Toolbar
**As a** writer  
**I want** a toolbar to appear when I select text  
**So that** I can quickly format selected content without moving my cursor

**Acceptance Criteria:**
1. WHEN the user selects text THEN the system SHALL display a floating toolbar above the selection
2. WHEN the toolbar is displayed THEN the system SHALL include buttons for: bold, italic, underline, strikethrough, code, link, and highlight
3. WHEN a formatting button is clicked THEN the system SHALL apply the formatting to the selected text
4. WHEN the selection is cleared THEN the system SHALL hide the floating toolbar after 200ms
5. THE floating toolbar SHALL have a ghostly appearance with purple glow effects

### US-3: Auto-Formatting Shortcuts
**As a** writer  
**I want** Markdown-style shortcuts to auto-format as I type  
**So that** I can format text without interrupting my writing flow

**Acceptance Criteria:**
1. WHEN the user types `**text**` and presses space THEN the system SHALL convert it to bold text
2. WHEN the user types `*text*` and presses space THEN the system SHALL convert it to italic text
3. WHEN the user types `~~text~~` and presses space THEN the system SHALL convert it to strikethrough text
4. WHEN the user types `` `text` `` and presses space THEN the system SHALL convert it to inline code
5. WHEN the user types `#` followed by space at line start THEN the system SHALL convert the line to a heading
6. WHEN the user types `-` or `*` followed by space at line start THEN the system SHALL convert the line to a bullet list
7. WHEN the user types `1.` followed by space at line start THEN the system SHALL convert the line to a numbered list
8. WHEN the user types `[]` followed by space at line start THEN the system SHALL convert the line to a checklist item
9. WHEN the user types `>` followed by space at line start THEN the system SHALL convert the line to a blockquote
10. WHEN the user types `---` on a line and presses Enter THEN the system SHALL insert a horizontal divider

### US-4: Drag-to-Reorder Blocks
**As a** writer  
**I want** to drag content blocks to reorder them  
**So that** I can reorganize my notes without cut-and-paste

**Acceptance Criteria:**
1. WHEN the user hovers over a content block THEN the system SHALL display a drag handle on the left side
2. WHEN the user clicks and drags the handle THEN the system SHALL allow the block to be moved
3. WHEN dragging a block THEN the system SHALL show a visual indicator of the drop position
4. WHEN the block is dropped THEN the system SHALL reorder the content and update the note
5. THE drag handle SHALL have a ghostly appearance that fades in on hover

### US-5: Command Palette
**As a** writer  
**I want** to press Cmd/Ctrl+K to open a searchable command palette  
**So that** I can access all features via keyboard

**Acceptance Criteria:**
1. WHEN the user presses Cmd/Ctrl+K THEN the system SHALL open the command palette overlay
2. WHEN the palette is open THEN the system SHALL display all available commands with descriptions
3. WHEN the user types in the search field THEN the system SHALL filter commands by name and description
4. WHEN a command is selected THEN the system SHALL execute the command and close the palette
5. WHEN the user presses Escape THEN the system SHALL close the command palette
6. THE command palette SHALL include: formatting commands, navigation commands, view toggles, and AI features

### US-6: Block-Based Content Structure
**As a** writer  
**I want** my content organized into discrete blocks  
**So that** I can manipulate individual sections independently

**Acceptance Criteria:**
1. WHEN the user creates content THEN the system SHALL organize it into blocks (paragraphs, headings, lists, etc.)
2. WHEN the user presses Enter THEN the system SHALL create a new block
3. WHEN the user presses Backspace at the start of an empty block THEN the system SHALL delete the block
4. WHEN the user presses Backspace at the start of a non-empty block THEN the system SHALL merge with the previous block
5. WHEN a block is focused THEN the system SHALL highlight it with a subtle glow

### US-7: Enhanced Keyboard Shortcuts
**As a** writer  
**I want** comprehensive keyboard shortcuts for all actions  
**So that** I can work efficiently without using the mouse

**Acceptance Criteria:**
1. THE system SHALL support Cmd/Ctrl+B for bold
2. THE system SHALL support Cmd/Ctrl+I for italic
3. THE system SHALL support Cmd/Ctrl+U for underline
4. THE system SHALL support Cmd/Ctrl+Shift+S for strikethrough
5. THE system SHALL support Cmd/Ctrl+E for inline code
6. THE system SHALL support Cmd/Ctrl+K for link insertion
7. THE system SHALL support Cmd/Ctrl+Shift+H for highlight
8. THE system SHALL support Cmd/Ctrl+/ to toggle slash command menu
9. THE system SHALL support Cmd/Ctrl+Shift+K to open command palette
10. THE system SHALL support Cmd/Ctrl+Alt+1-6 for heading levels

### US-8: Inline Mentions and Links
**As a** writer  
**I want** to type "@" to mention other notes or "[[" to create wiki-style links  
**So that** I can connect related notes together

**Acceptance Criteria:**
1. WHEN the user types "@" THEN the system SHALL display a menu of existing notes
2. WHEN a note is selected from the @ menu THEN the system SHALL insert a link to that note
3. WHEN the user types "[[" THEN the system SHALL display a menu of existing notes
4. WHEN a note is selected from the [[ menu THEN the system SHALL insert a wiki-style link
5. WHEN the user types "[[new note]]" THEN the system SHALL create a new note with that title

### US-9: Hover Tooltips and Previews
**As a** writer  
**I want** to see tooltips and previews when hovering over elements  
**So that** I can understand features and preview linked content

**Acceptance Criteria:**
1. WHEN the user hovers over a toolbar button THEN the system SHALL display a tooltip with the action name and keyboard shortcut
2. WHEN the user hovers over a note link THEN the system SHALL display a preview of the linked note content
3. WHEN the user hovers over a slash command THEN the system SHALL display a description of what it does
4. THE tooltips SHALL have a ghostly appearance with fade-in animation

### US-10: Improved Visual Hierarchy
**As a** writer  
**I want** clear visual distinction between content types  
**So that** I can scan and navigate my notes easily

**Acceptance Criteria:**
1. WHEN content includes headings THEN the system SHALL display them with distinct sizes and weights
2. WHEN content includes code blocks THEN the system SHALL display them with syntax highlighting
3. WHEN content includes quotes THEN the system SHALL display them with a left border and indentation
4. WHEN content includes lists THEN the system SHALL display them with proper indentation and bullets
5. WHEN content includes callouts THEN the system SHALL display them with colored backgrounds and icons

## Non-Functional Requirements

### Performance
- Slash command menu appears within 50ms of typing "/"
- Floating toolbar appears within 100ms of text selection
- Drag-and-drop operations feel smooth at 60fps
- Auto-formatting applies instantly without lag
- Command palette search filters results within 50ms

### Accessibility
- All features accessible via keyboard
- Screen reader announcements for all actions
- Focus management for modals and menus
- High contrast mode support
- ARIA labels for all interactive elements

### Visual Design
- Maintain gothic/mystical aesthetic
- Subtle purple/green glows for interactive elements
- Smooth animations (200-300ms)
- Ghostly transparency effects
- Ink drip and parchment textures preserved

### Compatibility
- Works in all modern browsers
- Touch-friendly for tablets
- Responsive design for mobile
- Preserves existing note data
- Backward compatible with current notes

## Technical Constraints
- Must work with existing NotesContext
- Must preserve all current features
- Must maintain performance with large notes (10,000+ words)
- Must support undo/redo for all operations
- Must auto-save changes

## Success Metrics
- User engagement with notes increases by 40%
- Time to format content decreases by 60%
- Keyboard-only workflow adoption increases by 50%
- User satisfaction scores improve
- Note creation rate increases by 30%

## Out of Scope
- Real-time collaboration
- Version history beyond undo/redo
- Export to external formats (already exists)
- Mobile app development
- Voice input
- AI-powered content generation (separate feature)

## Priority

**High Priority:**
- Slash commands (US-1)
- Floating toolbar (US-2)
- Auto-formatting shortcuts (US-3)
- Block-based structure (US-6)
- Enhanced keyboard shortcuts (US-7)

**Medium Priority:**
- Drag-to-reorder (US-4)
- Command palette (US-5)
- Hover tooltips (US-9)
- Visual hierarchy (US-10)

**Low Priority:**
- Inline mentions (US-8)
- Wiki-style links (US-8)
