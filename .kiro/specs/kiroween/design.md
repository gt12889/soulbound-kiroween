# Design Document

## Overview

The Dark Productivity Suite is a single-page web application built with modern web technologies. The application features four main modules (Terminal Tarot, Ghost Writer, Necronomicon Notes, and Graveyard Dashboard with Moon Phase Calendar) unified by a dark, gothic aesthetic. The architecture emphasizes client-side processing, cloud-based data persistence with local caching, user authentication, rich animations, and extensive customization options including keyboard shortcuts, multiple themes, markdown support, and a pomodoro timer to create an immersive and productive user experience.

## Architecture

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: CSS Modules with CSS animations and transitions
- **State Management**: React Context API for global state, local component state for module-specific data
- **Data Persistence**: Browser LocalStorage API (local) + Cloud storage (Firebase/Supabase)
- **Authentication**: Firebase Auth or Supabase Auth (email/password, Google, GitHub OAuth)
- **Git Integration**: Simple Git library (isomorphic-git) for browser-based git operations
- **AI Integration**: OpenAI API or local LLM for Ghost Writer suggestions
- **Audio**: Web Audio API for ambient sounds and effects
- **Markdown**: react-markdown or marked.js for markdown rendering
- **Keyboard Shortcuts**: react-hotkeys-hook or custom event listeners
- **Build Tool**: Vite for fast development and optimized production builds
- **Backend**: Firebase/Supabase for authentication, cloud storage, and real-time sync

### Application Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Navigation.tsx
│   │   ├── LoadingTransition.tsx
│   │   ├── AudioController.tsx
│   │   ├── KeyboardShortcutsPanel.tsx
│   │   ├── ThemeSelector.tsx
│   │   ├── QuickCapture.tsx
│   │   └── SettingsPanel.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── PasswordReset.tsx
│   │   └── SocialAuthButtons.tsx
│   ├── terminal-tarot/
│   │   ├── TarotReader.tsx
│   │   ├── TarotCard.tsx
│   │   └── CommitAnalyzer.tsx
│   ├── ghost-writer/
│   │   ├── WritingEditor.tsx
│   │   ├── GhostSuggestion.tsx
│   │   └── AIService.ts
│   ├── necronomicon-notes/
│   │   ├── NotesBook.tsx
│   │   ├── NotePage.tsx
│   │   ├── NotesList.tsx
│   │   ├── MarkdownEditor.tsx
│   │   ├── MarkdownPreview.tsx
│   │   └── TagManager.tsx
│   ├── graveyard-dashboard/
│   │   ├── GraveyardView.tsx
│   │   ├── Tombstone.tsx
│   │   ├── MoonPhaseCalendar.tsx
│   │   ├── MoonIcon.tsx
│   │   ├── ArchiveView.tsx
│   │   └── PomodoroTimer.tsx
│   └── import-export/
│       ├── ImportDialog.tsx
│       ├── ExportDialog.tsx
│       └── DataPreview.tsx
├── contexts/
│   ├── AppContext.tsx
│   ├── AuthContext.tsx
│   ├── NotesContext.tsx
│   ├── TasksContext.tsx
│   ├── ThemeContext.tsx
│   └── KeyboardContext.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useAudio.ts
│   ├── useMoonPhase.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useCloudSync.ts
│   └── usePomodoro.ts
├── services/
│   ├── authService.ts
│   ├── cloudSyncService.ts
│   ├── gitService.ts
│   ├── storageService.ts
│   ├── tarotService.ts
│   ├── moonPhaseService.ts
│   ├── importService.ts
│   └── exportService.ts
├── utils/
│   ├── animations.ts
│   ├── audioFiles.ts
│   ├── keyboardShortcuts.ts
│   ├── markdownUtils.ts
│   └── themeUtils.ts
├── themes/
│   ├── defaultDark.ts
│   ├── bloodMoon.ts
│   └── midnightForest.ts
├── types/
│   └── index.ts
└── App.tsx
```

## Components and Interfaces

### Core Data Models

```typescript
interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'email' | 'google' | 'github';
  createdAt: Date;
  lastLogin: Date;
}

interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  archived: boolean;
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
  archivedAt?: Date;
}

interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  markdown: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface TarotReading {
  id: string;
  userId: string;
  date: Date;
  cards: TarotCard[];
  interpretation: string;
  commitStats: CommitStats;
}

interface TarotCard {
  name: string;
  position: 'past' | 'present' | 'future';
  asciiArt: string;
  meaning: string;
}

interface CommitStats {
  totalCommits: number;
  averageCommitsPerDay: number;
  mostActiveHour: number;
  sentimentScore: number;
  topKeywords: string[];
}

interface GhostSuggestion {
  id: string;
  text: string;
  position: number;
  confidence: number;
}

interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentSecondary: string;
    highlight: string;
    warning: string;
  };
}

interface KeyboardShortcut {
  id: string;
  action: string;
  keys: string[];
  description: string;
  customizable: boolean;
}

interface PomodoroSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  type: 'work' | 'break';
  completed: boolean;
}

interface ImportData {
  notes?: Note[];
  tasks?: Task[];
  version: string;
  exportedAt: Date;
}

interface SyncStatus {
  lastSync: Date;
  syncing: boolean;
  error?: string;
  pendingChanges: number;
}
```

### Module Components

#### Terminal Tarot Module

**TarotReader Component**
- Manages the tarot reading flow
- Triggers git commit analysis
- Displays three-card spread with ASCII art
- Shows interpretation and commit statistics

**CommitAnalyzer Service**
- Uses isomorphic-git to read local repository
- Analyzes commits from past 30 days
- Extracts patterns: frequency, timing, message sentiment
- Maps patterns to tarot card selections

**TarotCard Component**
- Renders individual tarot card with ASCII art
- Displays card name, position, and meaning
- Animates card reveal with flip effect

#### Ghost Writer Module

**WritingEditor Component**
- Rich text editor with contentEditable div
- Tracks cursor position and current context
- Manages ghost suggestion overlay positioning
- Handles suggestion acceptance and dismissal

**GhostSuggestion Component**
- Renders AI suggestion with fade-in/fade-out animations
- Manages opacity transitions on hover
- Plays spectral sound effects
- Positions suggestion relative to cursor

**AIService**
- Integrates with OpenAI API or local LLM
- Sends current text context for suggestion generation
- Implements debouncing to avoid excessive API calls
- Caches recent suggestions for performance

#### Necronomicon Notes Module

**NotesBook Component**
- Container for all notes with book-like layout
- Manages current page state
- Handles page-turn animations
- Provides search functionality

**NotePage Component**
- Renders individual note with parchment styling
- Implements dripping ink border animation
- Uses gothic font rendering
- Handles text input and formatting

**NotesList Component**
- Sidebar showing all note titles
- Allows quick navigation between notes
- Displays note creation dates

#### Graveyard Dashboard Module

**GraveyardView Component**
- Container for tombstone grid layout
- Manages task creation and deletion
- Handles drag-and-drop reordering
- Integrates with MoonPhaseCalendar

**Tombstone Component**
- Renders task as gravestone with engraved text
- Implements rise/sink animations
- Displays priority through size/prominence
- Shows task details on hover with ghostly tooltip

**MoonPhaseCalendar Component**
- Displays month view with moon icons
- Calculates accurate lunar phases
- Handles date selection and navigation
- Shows event indicators on moon icons

**MoonIcon Component**
- Renders moon in specific phase
- Implements glow effect on selection
- Displays tooltip with date and events

### Navigation and Layout

**Navigation Component**
- Persistent sidebar or top bar navigation
- Icons for each module with gothic styling
- Smooth transitions between modules
- Preserves module state during navigation

**LoadingTransition Component**
- Fog or shadow animation during module loading
- Ensures smooth visual transitions
- Displays for minimum 500ms for consistency

**AudioController Component**
- Global audio controls for ambient sounds
- Volume slider with gothic styling
- Toggle for enabling/disabling sounds
- Manages Web Audio API context

### Authentication System

**LoginPage Component**
- Email/password login form styled as mystical portal
- Social auth buttons (Google, GitHub) with gothic styling
- Link to registration and password reset
- Form validation and error handling

**RegisterPage Component**
- User registration form with email/password
- Password strength indicator styled as mystical meter
- Terms of service acceptance
- Automatic login after successful registration

**PasswordReset Component**
- Email-based password reset flow
- Verification code input styled as rune entry
- New password form with confirmation

**SocialAuthButtons Component**
- OAuth buttons for Google and GitHub
- Mystical hover effects
- Loading states during authentication

**AuthService**
- Firebase/Supabase authentication integration
- Session management with secure tokens
- Password validation and hashing
- OAuth provider configuration

### Keyboard Shortcuts System

**KeyboardShortcutsPanel Component**
- Modal displaying all available shortcuts
- Organized by category (navigation, actions, etc.)
- Visual representation of key combinations
- Customization interface for editable shortcuts

**KeyboardContext**
- Global keyboard event listener
- Shortcut registration and execution
- Conflict detection for duplicate shortcuts
- Persistence of custom shortcuts

**useKeyboardShortcuts Hook**
- Register shortcuts for specific components
- Handle shortcut execution with callbacks
- Automatic cleanup on component unmount

**Default Shortcuts**
- Navigation: Ctrl+1-4 (modules), Ctrl+H (home)
- Actions: Ctrl+N (new note), Ctrl+T (new task), Ctrl+K (quick capture)
- Search: Ctrl+F (search current module)
- Help: Ctrl+? (shortcuts panel)

### Theme System

**ThemeSelector Component**
- Visual theme previews with color swatches
- Smooth theme transition animations
- Theme persistence to user preferences
- Real-time preview on hover

**ThemeContext**
- Current theme state
- Theme switching logic
- CSS variable injection
- Theme persistence to cloud and local storage

**Available Themes**
- Default Dark: Original purple/black aesthetic
- Blood Moon: Deep reds and crimson tones
- Midnight Forest: Dark greens and earth tones
- Each theme includes custom color palettes for all UI elements

### Quick Capture System

**QuickCapture Component**
- Floating modal activated by global shortcut
- Type selector (note vs task)
- Minimal input form with gothic styling
- Auto-focus on input field
- Escape key to cancel

**Quick Capture Flow**
1. User presses Ctrl+K anywhere in app
2. Modal appears with fade-in animation
3. User types content and selects type
4. Item is created and saved
5. Brief confirmation animation
6. Modal closes automatically

### Tag Management System

**TagManager Component**
- Tag input with autocomplete suggestions
- Tag cloud visualization with usage counts
- Tag filtering interface
- Tag editing and deletion

**Tag Features**
- Mystical symbol icons for common tags
- Color coding by category
- Multi-tag filtering (AND/OR logic)
- Tag suggestions based on content analysis

### Archive System

**ArchiveView Component**
- Separate view for archived tasks
- Weathered, moss-covered tombstone styling
- Restore functionality with rise animation
- Permanent deletion option
- Filter and search within archive

**Archive Logic**
- Auto-suggest archiving for tasks completed >30 days
- Manual archive action from context menu
- Archived tasks excluded from active views
- Archive statistics and insights

### Pomodoro Timer

**PomodoroTimer Component**
- Hourglass visualization with flowing souls/sand
- Configurable work and break durations
- Start, pause, resume, reset controls
- Visual and audio notifications on completion
- Session counter and statistics

**Pomodoro Features**
- Animated souls flowing during work intervals
- Mystical chime sound on interval completion
- Session history tracking
- Integration with task list (optional task linking)
- Persistent timer state across page refreshes

### Markdown Support

**MarkdownEditor Component**
- Split view: raw markdown and live preview
- Toolbar with formatting shortcuts
- Syntax highlighting for code blocks
- Gothic-styled markdown rendering

**MarkdownPreview Component**
- Real-time rendering of markdown
- Custom CSS for gothic aesthetic
- Support for headers, lists, links, code, images
- Smooth scroll sync with editor

**Markdown Features**
- Toggle between edit, preview, and split modes
- Keyboard shortcuts for common formatting
- Preserve markdown in export/import
- Render markdown in search results

### Import/Export System

**ImportDialog Component**
- File upload interface with drag-and-drop
- Format validation and error display
- Data preview before import
- Merge strategy selection (replace/merge)

**ExportDialog Component**
- Format selection (JSON, Markdown, CSV)
- Date range filtering
- Include/exclude options (notes, tasks, settings)
- Download trigger with mystical animation

**ImportService**
- JSON parsing and validation
- Plain text to note conversion
- Duplicate detection
- Error handling and reporting

**ExportService**
- Data serialization to multiple formats
- File generation and download
- Backup creation with timestamp
- Encryption option for sensitive data

### Cloud Sync System

**CloudSyncService**
- Real-time synchronization with Firebase/Supabase
- Conflict resolution (last-write-wins or manual)
- Offline queue for pending changes
- Automatic retry on connection restore

**Sync Features**
- Visual sync status indicator
- Manual sync trigger
- Sync error notifications
- Bandwidth-efficient delta syncing
- End-to-end encryption for cloud data

**useCloudSync Hook**
- Subscribe to real-time updates
- Trigger manual sync
- Handle sync conflicts
- Monitor sync status

## Data Models

### Storage Schema

All data stored in LocalStorage with the following keys:

```typescript
// LocalStorage Keys (for offline/cache)
'darkprod_user': User
'darkprod_notes': Note[]
'darkprod_tasks': Task[]
'darkprod_tarot_readings': TarotReading[]
'darkprod_settings': {
  audioEnabled: boolean;
  audioVolume: number;
  lastModule: string;
  theme: string;
  keyboardShortcuts: KeyboardShortcut[];
}
'darkprod_pomodoro': PomodoroSession[]
'darkprod_sync_queue': any[]
'darkprod_last_sync': Date

// Cloud Storage Schema (Firebase/Supabase)
users/
  {userId}/
    profile: User
    notes/
      {noteId}: Note
    tasks/
      {taskId}: Task
    tarot_readings/
      {readingId}: TarotReading
    pomodoro_sessions/
      {sessionId}: PomodoroSession
    settings: UserSettings
```

### State Management

**AppContext**
- Current active module
- Global settings (audio, theme)
- Loading states
- Quick capture state

**AuthContext**
- Current user state
- Authentication status
- Login/logout functions
- Session management

**NotesContext**
- All notes array
- Current note ID
- CRUD operations for notes
- Search functionality
- Tag filtering
- Markdown mode toggle

**TasksContext**
- All tasks array (active and archived)
- CRUD operations for tasks
- Task reordering logic
- Completion tracking
- Archive management
- Tag filtering

**ThemeContext**
- Current theme
- Available themes
- Theme switching function
- Theme persistence

**KeyboardContext**
- Registered shortcuts
- Shortcut execution
- Customization state
- Conflict detection

## Error Handling

### Git Integration Errors

- If no git repository detected, display friendly message in Terminal Tarot
- Provide option to use demo data for tarot reading
- Log errors to console for debugging

### AI Service Errors

- If API call fails, show ghost icon with error message
- Implement retry logic with exponential backoff
- Fall back to local suggestion patterns if API unavailable

### Storage Errors

- Catch LocalStorage quota exceeded errors
- Prompt user to export data and clear old entries
- Provide graceful degradation if storage unavailable

### Audio Errors

- Silently fail if Web Audio API unavailable
- Disable audio controls if browser doesn't support audio
- Provide visual-only experience as fallback

### Authentication Errors

- Display user-friendly error messages for failed login/registration
- Implement rate limiting for authentication attempts
- Handle expired sessions with automatic redirect to login
- Provide clear feedback for OAuth failures

### Cloud Sync Errors

- Queue changes locally when offline
- Display sync status and error notifications
- Implement conflict resolution UI for simultaneous edits
- Retry failed syncs with exponential backoff
- Provide manual sync trigger as fallback

### Import Errors

- Validate file format before processing
- Display detailed error messages for invalid data
- Provide partial import option if some data is valid
- Log import errors for debugging

## Testing Strategy

### Unit Tests

- Test tarot card selection algorithm with mock commit data
- Test moon phase calculation accuracy
- Test storage service CRUD operations
- Test AI suggestion debouncing logic

### Integration Tests

- Test navigation between modules preserves state
- Test task creation and completion flow
- Test note creation, editing, and search
- Test tarot reading generation end-to-end

### Visual Regression Tests

- Capture screenshots of each module
- Test animations complete correctly
- Verify responsive layout on different screen sizes
- Test dark theme consistency across modules

### Performance Tests

- Measure module load times (target < 2 seconds)
- Test animation frame rates (target 60fps)
- Verify LocalStorage operations complete within 1 second
- Test with large datasets (100+ notes, 100+ tasks)

## UI/UX Design Details

### Color Palettes

**Default Dark Theme**
- Background: Deep blacks (#0a0a0a, #1a1a1a)
- Accents: Dark purples (#2d1b4e, #4a2d6e)
- Text: Off-whites and grays (#e0e0e0, #b0b0b0)
- Highlights: Ethereal blues and greens (#3d5a80, #2d4a3e)
- Warnings/Priority: Deep reds (#4a1a1a, #6e2d2d)

**Blood Moon Theme**
- Background: Deep blacks with red tint (#0a0505, #1a0a0a)
- Accents: Crimson and blood red (#4a0000, #6e1a1a)
- Text: Pale reds and grays (#e0c0c0, #b08080)
- Highlights: Dark oranges and reds (#803d3d, #4a2d2d)
- Warnings/Priority: Bright reds (#8a0000, #a01a1a)

**Midnight Forest Theme**
- Background: Deep blacks with green tint (#050a05, #0a1a0a)
- Accents: Dark greens and teals (#1a4a2d, #2d6e4a)
- Text: Pale greens and grays (#c0e0c0, #80b080)
- Highlights: Forest greens and blues (#2d4a3d, #3d5a4a)
- Warnings/Priority: Amber and gold (#4a3a1a, #6e5a2d)

### Typography

- Headers: "Cinzel" or "Crimson Text" (serif, gothic feel)
- Body: "Lora" or "Merriweather" (readable serif)
- Monospace: "Fira Code" or "Source Code Pro" (for Terminal Tarot)

### Animation Principles

- All animations use ease-in-out timing
- Hover effects respond within 100ms
- Page transitions last 800-1200ms
- Micro-interactions (button clicks) last 200-300ms
- Ambient animations (dripping ink, fog) loop continuously

### Responsive Design

- Desktop-first approach (primary use case)
- Tablet: Simplified layout, reduced animations
- Mobile: Stack modules vertically, simplified interactions
- Minimum supported width: 320px

## Deployment

- Build optimized production bundle with Vite
- Deploy frontend to static hosting (Vercel, Netlify, GitHub Pages)
- Configure Firebase/Supabase project for backend services
- Set up authentication providers (Google, GitHub OAuth)
- Configure cloud storage security rules
- Ensure all assets (fonts, sounds, images) are bundled
- Configure proper caching headers for performance
- Set up CI/CD for automated deployments
- Configure environment variables for API keys
- Set up monitoring and error tracking (Sentry)

## Security Considerations

### Authentication Security
- Passwords hashed with bcrypt or similar
- Secure session tokens with expiration
- HTTPS-only in production
- CSRF protection for forms
- Rate limiting on authentication endpoints

### Data Security
- End-to-end encryption for cloud-stored data
- Secure API key storage (environment variables)
- Input sanitization to prevent XSS
- Content Security Policy headers
- Regular security audits

### Privacy
- Clear privacy policy and terms of service
- User data deletion capability
- No tracking without consent
- GDPR compliance considerations
- Secure OAuth token handling

## Future Enhancements

- Collaborative features for shared notes
- More tarot spreads and reading types
- Additional theme options (user-created themes)
- Export notes as PDF with gothic styling
- Integration with external calendar services (Google Calendar, Outlook)
- Voice input for Ghost Writer
- More ambient sound options and soundscapes
- Mobile native apps (React Native)
- Browser extension for quick capture
- API for third-party integrations
- Advanced analytics and productivity insights
- Habit tracking integration
- Team/workspace features for collaboration
