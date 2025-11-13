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

- [x] 12. Final integration and testing












  - [x] 12.1 Test navigation and state preservation






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



- [x] 13. Build production bundle and deploy





  - [x] 13.1 Optimize production build

    - Run Vite build command
    - Verify all assets are bundled correctly
    - Test production build locally
    - _Requirements: 6.4_
  - [x] 13.2 Deploy to hosting platform
    - Set up deployment on Vercel, Netlify, or GitHub Pages
    - Configure caching headers
    - Verify deployment is accessible
    - Test all functionality in production
    - _Requirements: 6.4_
  - [x] 13.3 Create README and documentation
    - Document project setup and installation
    - Explain features and usage
    - Include screenshots or demo video
    - Add license information (OSI-approved)
    - Document Kiro usage for hackathon submission
    - _Requirements: All_


- [-] 14. Implement authentication system





  - [x] 14.1 Set up Firebase or Supabase project




    - Create Firebase/Supabase project
    - Configure authentication providers (Email, Google, GitHub)
    - Set up security rules for database
    - Install Firebase/Supabase SDK
    - _Requirements: 18.1, 18.8_

  - [x] 14.2 Build authentication service


    - Create authService.ts with login, register, logout functions
    - Implement password validation (8+ chars, uppercase, lowercase, number)
    - Add session token management
    - Implement password reset flow with email verification
    - Handle OAuth authentication flows
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.8_

  - [x] 14.3 Create AuthContext


    - Implement context for user state and authentication status
    - Add authentication state persistence
    - Handle session expiration and renewal
    - _Requirements: 18.3, 18.4_

  - [x] 14.4 Build LoginPage component





    - Create mystical portal-styled login form
    - Implement email/password input fields
    - Add form validation and error display
    - Style with gothic aesthetic
    - _Requirements: 18.3, 18.7_

  - [x] 14.5 Build RegisterPage component





    - Create registration form with email/password
    - Implement password strength indicator styled as mystical meter
    - Add terms of service checkbox
    - Implement automatic login after registration
    - _Requirements: 18.1, 18.2_

  - [x] 14.6 Build PasswordReset component





    - Create password reset request form
    - Implement verification code input styled as rune entry
    - Add new password form with confirmation
    - _Requirements: 18.5_

  - [x] 14.7 Build SocialAuthButtons component





    - Create OAuth buttons for Google and GitHub
    - Add mystical hover effects
    - Implement loading states during authentication
    - _Requirements: 18.8_

  - [x] 14.8 Implement protected routes










    - Add route guards for authenticated-only pages
    - Redirect unauthenticated users to login
    - Handle session expiration redirects
    - _Requirements: 18.3, 18.6_

- [-] 15. Implement cloud sync system







-

  - [x] 15.1 Build cloud sync service



    - Create cloudSyncService.ts for Firebase/Supabase integration
    - Implement real-time data synchronization
    - Add conflict resolution logic (last-write-wins)
    - Implement offline queue for pending changes

    - Add automatic retry with exponential backoff

    - _Requirements: 17.1, 17.3, 17.4_



  - [x] 15.2 Update data models for cloud storage


    - Add userId field to Task, Note, TarotReading interfaces
    - Update storage service to work with cloud backend
    - Implement data encryption for cloud storage
    - _Requirements: 17.4_

  - [x] 15.3 Create useCloudSync hook


    - Implement hook for subscribing to real-time updates
    - Add manual sync trigger function
    - Handle sync conflicts with user prompts
    - Monitor and expose sync status
    - _Requirements: 17.3, 17.6_

  - [x] 15.4 Build sync status indicator


    - Create UI component showing last sync time
    - Display syncing animation during active sync
    - Show error notifications for sync failures
    - Add manual sync button
    - _Requirements: 17.7_

  - [x] 15.5 Implement offline support




    - Queue changes when offline
    - Sync queued changes when connection restored
    - Display offline indicator in UI
    - _Requirements: 17.3_

- [x] 16. Implement keyboard shortcuts system














  - [x] 16.1 Create keyboard shortcuts utility


    - Build keyboardShortcuts.ts with shortcut definitions
    - Define default shortcuts for all actions
    - Implement key combination parser
    - Add conflict detection logic
    - _Requirements: 9.1, 9.2, 9.3, 9.6_

  - [x] 16.2 Create KeyboardContext


    - Implement global keyboard event listener
    - Add shortcut registration and execution system
    - Handle shortcut customization
    - Persist custom shortcuts to storage
    - _Requirements: 9.5_



  - [x] 16.3 Create useKeyboardShortcuts hook

    - Build hook for component-level shortcut registration
    - Implement automatic cleanup on unmount
    - Handle shortcut execution with callbacks


    - _Requirements: 9.6_

  - [x] 16.4 Build KeyboardShortcutsPanel component

    - Create modal displaying all shortcuts
    - Organize shortcuts by category
    - Show visual key combination representations


    - Add customization interface for editable shortcuts
    - Style with gothic aesthetic
    - _Requirements: 9.4, 9.5_

  - [x] 16.5 Integrate shortcuts throughout application

    - Add navigation shortcuts (Ctrl+1-4 for modules)
    - Add action shortcuts (Ctrl+N, Ctrl+T, Ctrl+K)
    - Add search shortcut (Ctrl+F)
    - Add help shortcut (Ctrl+?) to open shortcuts panel
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 17. Implement theme system





  - [x] 17.1 Create theme definitions











    - Build theme files: defaultDark.ts, bloodMoon.ts, midnightForest.ts
    - Define color palettes for each theme
    - Create theme interface with all required colors
    - _Requirements: 10.1_


  - [x] 17.2 Create ThemeContext






    - Implement context for current theme state
    - Add theme switching function
    - Implement CSS variable injection for theme colors
    - Persist theme selection to storage and cloud
    - _Requirements: 10.3, 10.4_

  - [x] 17.3 Build ThemeSelector component


    - Create theme selector UI with visual previews
    - Show color swatches for each theme
    - Implement smooth theme transition animations
    - Add real-time preview on hover
    - Style with gothic aesthetic
    - _Requirements: 10.1, 10.2, 10.5_

  - [x] 17.4 Apply themes across all components


    - Update all components to use theme CSS variables
    - Ensure consistent theming across modules
    - Test theme transitions for smoothness
    - _Requirements: 10.2_

- [x] 18. Implement quick capture system















  - [x] 18.1 Build QuickCapture component


    - Create floating modal with minimal input form
    - Add type selector (note vs task)
    - Implement auto-focus on input field
    - Add Escape key to cancel
    - Style with gothic aesthetic and mystical animations
    - _Requirements: 13.2, 13.3, 13.6_




  - [x] 18.2 Integrate quick capture with keyboard shortcuts


    - Register Ctrl+K global shortcut
    - Open quick capture modal on shortcut press
    - Handle modal visibility state
    - _Requirements: 13.1_


  - [x] 18.3 Implement quick capture submission





    - Save captured item (note or task) to storage
    - Display brief confirmation animation
    - Close modal automatically after submission
    - _Requirements: 13.4, 13.5_

- [x] 19. Implement tag management system
























  - [x] 19.1 Update data models for tags




    - Add tags array to Task and Note interfaces
    - Update storage service to handle tags
    - Implement tag persistence
    - _Requirements: 14.1_


  - [x] 19.2 Build TagManager component


    - Create tag input with autocomplete suggestions
    - Implement tag addition and removal
    - Style tags with mystical symbols and gothic labels
    - Add tag editing functionality
    - _Requirements: 14.1, 14.2, 14.3_


  - [x] 19.3 Implement tag filtering


    - Add tag filter UI to notes and tasks views
    - Implement multi-tag filtering with AND/OR logic
    - Update search to include tag-based filtering

    - _Requirements: 14.4, 14.6_

  - [x] 19.4 Build tag cloud visualization


    - Create tag cloud component showing all tags
    - Display usage counts for each tag
    - Make tags clickable to filter by tag
    - Style with gothic aesthetic
    - _Requirements: 14.5, 14.6_

- [x] 20. Implement archive system





  - [x] 20.1 Update Task model for archiving







    - Add archived and archivedAt fields to Task interface
    - Update TasksContext to handle archived tasks
    - Implement archive/unarchive functions
    - _Requirements: 15.1, 15.3_


  - [x] 20.2 Build ArchiveView component





    - Create separate view for archived tasks
    - Style archived tombstones as weathered and moss-covered
    - Implement filter and search within archive
    - Add restore functionality with rise animation
    - Add permanent deletion option
    - _Requirements: 15.4, 15.5_

  - [x] 20.3 Implement archive animations


    - Create deeper sink animation for archiving (1.5-2.0s)
    - Implement rise animation for restoring
    - Add weathering effects to archived tombstones
    - _Requirements: 15.2_

  - [x] 20.4 Add auto-archive suggestions


    - Implement logic to detect tasks completed >30 days
    - Display archive suggestions to user
    - Add option to auto-archive or dismiss
    - _Requirements: 15.6_

- [-] 21. Implement pomodoro timer



  - [x] 21.1 Create pomodoro service and hook


    - Build usePomodoro hook with timer logic
    - Implement configurable work/break durations
    - Add start, pause, resume, reset functions
    - Track completed sessions
    - Persist timer state across refreshes
    - _Requirements: 12.2, 12.3, 12.7_

  - [x] 21.2 Build PomodoroTimer component


    - Create hourglass visualization
    - Implement flowing souls/sand animation during work intervals
    - Add duration configuration controls
    - Add start/pause/resume/reset buttons
    - Style with gothic aesthetic
    - _Requirements: 12.1, 12.5_

  - [x] 21.3 Implement pomodoro notifications


    - Play mystical chime sound on interval completion
    - Display notification when timer completes
    - Add visual indicator for timer state
    - _Requirements: 12.4_

  - [-] 21.4 Add pomodoro statistics

    - Track and display completed sessions
    - Show session history
    - Display productivity statistics
    - _Requirements: 12.6_

- [ ] 22. Implement markdown support



  - [ ] 22.1 Install markdown dependencies

    - Add react-markdown or marked.js library
    - Install syntax highlighting library for code blocks
    - Configure markdown parser options
    - _Requirements: 16.1_


  - [ ] 22.2 Build MarkdownEditor component
    - Create split-view editor (raw + preview)
    - Add toolbar with formatting shortcuts
    - Implement syntax highlighting for code
    - Add keyboard shortcuts for common formatting
    - _Requirements: 16.2, 16.4, 16.5_


  - [ ] 22.3 Build MarkdownPreview component
    - Implement real-time markdown rendering
    - Apply gothic-styled CSS to rendered markdown
    - Support headers, lists, links, code blocks, images
    - Implement smooth scroll sync with editor
    - _Requirements: 16.1, 16.3_


  - [ ] 22.4 Integrate markdown into notes
    - Add markdown toggle to NotePage component
    - Update Note interface with markdown boolean flag
    - Preserve markdown syntax in storage
    - Update search to work with markdown content
    - _Requirements: 16.1, 16.6_

- [ ] 23. Implement import system



  - [ ] 23.1 Build import service
    - Create importService.ts with JSON parsing
    - Implement data validation logic
    - Add plain text to note conversion
    - Implement duplicate detection
    - Add error handling and reporting
    - _Requirements: 11.1, 11.2, 11.5_

  - [ ] 23.2 Build ImportDialog component
    - Create file upload interface with drag-and-drop
    - Add format validation and error display
    - Implement data preview before import
    - Add merge strategy selection (replace/merge)
    - Style with gothic aesthetic
    - _Requirements: 11.3, 11.4, 11.6_

  - [ ] 23.3 Integrate import with existing data
    - Implement merge logic to avoid duplicates
    - Handle import conflicts
    - Update UI after successful import
    - _Requirements: 11.3_

- [ ] 24. Enhance export system

  - [ ] 24.1 Extend export service
    - Add support for multiple formats (JSON, Markdown, CSV)
    - Implement date range filtering
    - Add include/exclude options for data types
    - Implement encryption option for sensitive data
    - _Requirements: 7.5_

  - [ ] 24.2 Build ExportDialog component
    - Create export configuration UI
    - Add format selection dropdown
    - Implement date range picker
    - Add checkboxes for data type selection
    - Add download trigger with mystical animation
    - Style with gothic aesthetic
    - _Requirements: 7.5_

- [ ] 25. Update existing features for new requirements

  - [ ] 25.1 Update NotesContext for tags and markdown
    - Add tag filtering to notes
    - Add markdown mode support
    - Update CRUD operations to handle new fields
    - _Requirements: 14.1, 16.1_

  - [ ] 25.2 Update TasksContext for tags and archiving
    - Add tag filtering to tasks
    - Add archive management functions
    - Update CRUD operations to handle new fields
    - _Requirements: 14.1, 15.1_

  - [ ] 25.3 Update storage service for cloud sync
    - Modify storage service to work with both local and cloud
    - Implement data migration for existing users
    - Add encryption/decryption functions
    - _Requirements: 17.1, 17.4_

  - [ ] 25.4 Update Navigation for new features
    - Add settings button for theme/shortcuts/account
    - Add sync status indicator
    - Add quick capture button
    - Update styling to accommodate new elements
    - _Requirements: 9.1, 10.5, 13.1, 17.7_

- [ ] 26. Build settings panel

  - [ ] 26.1 Create SettingsPanel component
    - Build tabbed settings interface
    - Add account settings tab (profile, password, logout)
    - Add appearance tab (theme selector)
    - Add keyboard shortcuts tab
    - Add audio settings tab
    - Add data management tab (import/export/sync)
    - Style with gothic aesthetic
    - _Requirements: 9.4, 9.5, 10.5, 18.6_

  - [ ] 26.2 Implement settings persistence
    - Save all settings to local storage and cloud
    - Load settings on app initialization
    - Sync settings across devices
    - _Requirements: 10.3, 17.3_

- [ ] 27. Testing for new features

  - [ ] 27.1 Test authentication flows
    - Test registration with valid/invalid inputs
    - Test login with correct/incorrect credentials
    - Test password reset flow
    - Test OAuth authentication
    - Test session expiration handling
    - _Requirements: 18.1, 18.2, 18.3, 18.5, 18.8_

  - [ ] 27.2 Test cloud sync functionality
    - Test real-time sync across multiple devices
    - Test offline queue and sync on reconnect
    - Test conflict resolution
    - Test sync error handling
    - _Requirements: 17.1, 17.3, 17.6_

  - [ ] 27.3 Test keyboard shortcuts
    - Test all default shortcuts
    - Test shortcut customization
    - Test conflict detection
    - Test shortcuts across different modules
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [ ] 27.4 Test theme switching
    - Test all three themes
    - Test theme persistence
    - Test smooth transitions
    - Test theme consistency across modules
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 27.5 Test import/export functionality
    - Test JSON import with valid/invalid data
    - Test plain text import
    - Test export in multiple formats
    - Test data integrity after import/export
    - _Requirements: 11.1, 11.2, 11.5, 7.5_

  - [ ] 27.6 Test tag system
    - Test tag creation and deletion
    - Test tag filtering
    - Test tag autocomplete
    - Test tag persistence
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ] 27.7 Test archive system
    - Test archiving and restoring tasks
    - Test archive animations
    - Test auto-archive suggestions
    - Test archive filtering and search
    - _Requirements: 15.1, 15.2, 15.4, 15.6_

  - [ ] 27.8 Test pomodoro timer
    - Test timer start/pause/resume/reset
    - Test work and break intervals
    - Test notifications and sounds
    - Test session tracking
    - Test timer persistence
    - _Requirements: 12.2, 12.3, 12.4, 12.6, 12.7_

  - [ ] 27.9 Test markdown support
    - Test markdown rendering
    - Test split-view editor
    - Test markdown toolbar
    - Test markdown in search
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [ ] 28. Final deployment with new features

  - [ ] 28.1 Configure backend services
    - Set up Firebase/Supabase production environment
    - Configure authentication providers
    - Set up database security rules
    - Configure cloud storage
    - _Requirements: 18.1, 17.1_

  - [ ] 28.2 Update environment variables
    - Add Firebase/Supabase API keys
    - Add OAuth client IDs and secrets
    - Configure production URLs
    - _Requirements: 18.8_

  - [ ] 28.3 Build and deploy updated application
    - Run production build with all new features
    - Test build locally
    - Deploy to hosting platform
    - Verify all features work in production
    - _Requirements: All_

  - [ ] 28.4 Update documentation
    - Document new authentication flow
    - Document keyboard shortcuts
    - Document theme system
    - Document import/export functionality
    - Document all new features
    - _Requirements: All_
