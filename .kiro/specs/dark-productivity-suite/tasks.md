# Implementation Plan

- [x] 1. Set up project structure and core dependencies





  - Initialize Vite + React + TypeScript project
  - Install dependencies: isomorphic-git, CSS modules support
  - Create folder structure for components, contexts, services, hooks, utils, and types
  - Set up basic routing/navigation structure
  - Configure TypeScript with strict mode
  - _Requirements: 6.3, 6.4_

- [x] 2. Implement data models and storage service





  - [x] 2.1 Define TypeScript interfaces for Task, Note, TarotReading, TarotCard, CommitStats, GhostSuggestion


    - Create types/index.ts with all core data models
    - Export interfaces for use across application
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [x] 2.2 Build storage service with LocalStorage integration


    - Implement storageService.ts with get, set, remove, and clear methods
    - Add error handling for quota exceeded scenarios
    - Implement data serialization and deserialization
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [x] 2.3 Create custom useLocalStorage hook


    - Build hook that syncs state with LocalStorage
    - Implement automatic save on state changes within 1 second
    - Add error handling and fallback behavior
    - _Requirements: 7.2, 7.3_

- [x] 3. Build global state management and contexts





  - [x] 3.1 Create AppContext for global application state


    - Implement context for current module, settings, loading states
    - Add provider component wrapping entire application
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 3.2 Create NotesContext for note management


    - Implement CRUD operations for notes
    - Add search functionality
    - Integrate with storage service
    - _Requirements: 3.1, 3.2, 3.6, 7.2_
  - [x] 3.3 Create TasksContext for task management


    - Implement CRUD operations for tasks
    - Add task reordering and completion tracking
    - Integrate with storage service
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 7.3_
-

- [x] 4. Implement core UI components and navigation




  - [x] 4.1 Build Navigation component


    - Create sidebar or top navigation with module icons
    - Implement smooth transitions between modules
    - Style with gothic aesthetic
    - _Requirements: 6.1, 6.3_
  - [x] 4.2 Build LoadingTransition component


    - Create fog or shadow animation effect
    - Ensure minimum 500ms display time
    - Add smooth fade in/out
    - _Requirements: 6.5_
  - [x] 4.3 Set up CSS variables and global styles


    - Define color palette (blacks, purples, blues, reds)
    - Import and configure gothic fonts (Cinzel, Lora, Fira Code)
    - Create reusable animation keyframes
    - _Requirements: 6.3_
- [x] 5. Implement Terminal Tarot module




- [ ] 5. Implement Terminal Tarot module

  - [x] 5.1 Build git service for commit analysis


    - Integrate isomorphic-git library
    - Implement function to read commits from past 30 days
    - Extract commit frequency, timing, and message data
    - Add error handling for missing git repository
    - _Requirements: 1.1_

  - [x] 5.2 Create tarot service for reading generation

    - Implement algorithm to map commit patterns to tarot cards
    - Create tarot card database with ASCII art and meanings
    - Generate three-card spread (past, present, future)
    - Create interpretation text based on commit statistics
    - _Requirements: 1.2, 1.4, 1.5_

  - [x] 5.3 Build TarotCard component

    - Render ASCII art for tarot card
    - Display card name, position, and meaning
    - Implement flip animation on reveal
    - _Requirements: 1.3_
  - [x] 5.4 Build TarotReader component


    - Create UI for triggering tarot reading
    - Display three-card spread layout
    - Show commit statistics and interpretation
    - Style with terminal aesthetic
    - Handle loading and error states
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_


- [x] 6. Implement Ghost Writer module

  - [x] 6.1 Build WritingEditor component
    - Create contentEditable div for text input
    - Track cursor position in real-time
    - Implement text context extraction (current sentence/paragraph)
    - Style with dark theme and gothic fonts
    - _Requirements: 2.1_
  - [x] 6.2 Create AI service for suggestion generation
    - Set up OpenAI API integration or local LLM
    - Implement debouncing to limit API calls
    - Send text context and receive suggestions
    - Add error handling and retry logic
    - Cache recent suggestions
    - _Requirements: 2.1_
  - [x] 6.3 Build GhostSuggestion component
    - Render suggestion text with fade-in animation (0.5-1.0s)
    - Implement opacity change on hover (30% to 80%)
    - Position suggestion relative to cursor
    - Handle click to accept suggestion
    - Implement fade-out after 3 seconds if not accepted
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  - [x] 6.4 Add audio effects for Ghost Writer



    - Play subtle sound on suggestion appear
    - Play sound on suggestion disappear
    - Integrate with global audio controller
    - _Requirements: 2.6_

- [x] 7. Implement Necronomicon Notes module



  - [x] 7.1 Build NotePage component


    - Create parchment-styled page with torn edges
    - Render text in gothic font
    - Implement dripping ink border animation
    - Handle text input and editing
    - _Requirements: 3.1, 3.3, 3.4_
  - [x] 7.2 Build NotesBook component


    - Create book-like container layout
    - Implement page-turn animation (0.8-1.2s)
    - Manage current page state
    - Play page-rustling sound effect on navigation
    - _Requirements: 3.2, 3.5_
  - [x] 7.3 Build NotesList component


    - Display sidebar with all note titles
    - Show creation dates
    - Allow quick navigation between notes
    - _Requirements: 3.2_
  - [x] 7.4 Implement search functionality


    - Add search input with gothic styling
    - Highlight matching text with glow effect
    - Filter notes based on search query
    - _Requirements: 3.6_

- [x] 8. Implement Graveyard Dashboard module


  - [x] 8.1 Build Tombstone component


    - Render task as gravestone with engraved title
    - Implement rise animation on creation (1.0-1.5s)
    - Implement sink animation on completion
    - Apply weathered texture to completed tombstones
    - Size tombstone based on priority
    - Display task details in ghostly tooltip on hover
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 8.2 Build GraveyardView component


    - Create grid layout for tombstones
    - Implement drag-and-drop for task reordering
    - Handle task creation and deletion
    - Organize tombstones by priority
    - _Requirements: 4.1, 4.6_
  - [x] 8.3 Create moon phase calculation service


    - Implement algorithm to calculate lunar phase for any date
    - Use astronomical formulas for accuracy
    - Return phase as percentage and visual representation
    - _Requirements: 5.3_
  - [x] 8.4 Build MoonIcon component


    - Render moon in specific phase (new, crescent, quarter, gibbous, full)
    - Implement glow effect on selection
    - Display tooltip with date and events on hover
    - Show event indicator when events exist
    - _Requirements: 5.1, 5.2, 5.4, 5.6_
  - [x] 8.5 Build MoonPhaseCalendar component


    - Display month view with moon icons for each day
    - Calculate and render accurate lunar phases
    - Handle date selection with highlighting
    - Implement month navigation with waxing/waning animation
    - Integrate with tasks to show event indicators
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 9. Implement audio system




  - [x] 9.1 Set up Web Audio API integration


    - Initialize audio context
    - Load sound files (ambient, UI effects)
    - Implement play, pause, and volume control
    - Handle browser audio policy restrictions
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [x] 9.2 Build AudioController component


    - Create UI controls for audio toggle and volume
    - Style with gothic aesthetic
    - Persist settings to LocalStorage
    - _Requirements: 8.2, 8.3_
  - [x] 9.3 Create useAudio hook

    - Provide interface for playing sound effects
    - Manage audio state and volume
    - Ensure effects don't exceed 500ms
    - _Requirements: 8.5_
  - [x] 9.4 Add sound effects throughout application


    - Page turns in Necronomicon Notes
    - Ghost appearances in Ghost Writer
    - Tombstone movements in Graveyard Dashboard
    - UI interactions (clicks, hovers)
    - _Requirements: 2.6, 3.5, 8.4_
- [x] 10. Implement data export functionality



- [ ] 10. Implement data export functionality

  - [x] 10.1 Build export service


    - Create function to serialize all user data to JSON
    - Generate downloadable file
    - Include notes, tasks, settings, and tarot readings
    - _Requirements: 7.5_
  - [x] 10.2 Add export button to UI


    - Place in settings or navigation area
    - Style with gothic aesthetic
    - Trigger download on click

    - _Requirements: 7.5_



- [x] 11. Polish animations and visual effects


  - [x] 11.1 Refine all transition animations


    - Ensure ease-in-out timing on all animations
    - Verify hover effects respond within 100ms
    - Test page transitions (800-1200ms)
    - Optimize micro-interactions (200-300ms)
    - _Requirements: 6.5_
  - [x] 11.2 Add ambient animations

    - Implement continuous dripping ink effect
    - Add fog or mist effects to backgrounds
    - Create subtle shadow movements
    - Ensure 60fps performance
    - _Requirements: 3.4_

  - [x] 11.3 Implement responsive design

    - Test on desktop, tablet, and mobile
    - Adjust layouts for different screen sizes
    - Simplify animations on smaller devices
    - Ensure minimum 320px width support
    - _Requirements: 6.4_

- [-] 12. Final integration and testing







  - [ ] 12.1 Test navigation and state preservation



    - Verify switching modules preserves unsaved work
    - Test all navigation paths
    - Ensure loading states display correctly
    - _Requirements: 6.2, 6.4_
  - [ ] 12.2 Test data persistence
    - Verify all CRUD operations save within 1 second
    - Test data restoration on app reload
    - Verify export functionality
    - Test LocalStorage error handling
    - _Requirements: 7.2, 7.3, 7.4, 7.5_
  - [ ] 12.3 Performance testing
    - Measure module load times (target < 2 seconds)
    - Test with large datasets (100+ notes, 100+ tasks)
    - Verify animation frame rates
    - Optimize bundle size
    - _Requirements: 6.4_
  - [ ] 12.4 Cross-browser testing
    - Test in Chrome, Firefox, Safari, Edge
    - Verify audio functionality across browsers
    - Test LocalStorage compatibility
    - Ensure consistent visual rendering
    - _Requirements: 8.1_



- [ ] 13. Build production bundle and deploy

  - [ ] 13.1 Optimize production build
    - Run Vite build command
    - Verify all assets are bundled correctly
    - Test production build locally
    - _Requirements: 6.4_
  - [ ] 13.2 Deploy to hosting platform
    - Set up deployment on Vercel, Netlify, or GitHub Pages
    - Configure caching headers
    - Verify deployment is accessible
    - Test all functionality in production
    - _Requirements: 6.4_
  - [ ] 13.3 Create README and documentation
    - Document project setup and installation
    - Explain features and usage
    - Include screenshots or demo video
    - Add license information (OSI-approved)
    - Document Kiro usage for hackathon submission
    - _Requirements: All_
