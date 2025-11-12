# Design Document

## Overview

The Dark Productivity Suite is a single-page web application built with modern web technologies. The application features four main modules (Terminal Tarot, Ghost Writer, Necronomicon Notes, and Graveyard Dashboard with Moon Phase Calendar) unified by a dark, gothic aesthetic. The architecture emphasizes client-side processing, local data persistence, and rich animations to create an immersive user experience.

## Architecture

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: CSS Modules with CSS animations and transitions
- **State Management**: React Context API for global state, local component state for module-specific data
- **Data Persistence**: Browser LocalStorage API
- **Git Integration**: Simple Git library (isomorphic-git) for browser-based git operations
- **AI Integration**: OpenAI API or local LLM for Ghost Writer suggestions
- **Audio**: Web Audio API for ambient sounds and effects
- **Build Tool**: Vite for fast development and optimized production builds

### Application Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Navigation.tsx
│   │   ├── LoadingTransition.tsx
│   │   └── AudioController.tsx
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
│   │   └── NotesList.tsx
│   └── graveyard-dashboard/
│       ├── GraveyardView.tsx
│       ├── Tombstone.tsx
│       ├── MoonPhaseCalendar.tsx
│       └── MoonIcon.tsx
├── contexts/
│   ├── AppContext.tsx
│   ├── NotesContext.tsx
│   └── TasksContext.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useAudio.ts
│   └── useMoonPhase.ts
├── services/
│   ├── gitService.ts
│   ├── storageService.ts
│   ├── tarotService.ts
│   └── moonPhaseService.ts
├── utils/
│   ├── animations.ts
│   └── audioFiles.ts
├── types/
│   └── index.ts
└── App.tsx
```

## Components and Interfaces

### Core Data Models

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TarotReading {
  id: string;
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

## Data Models

### Storage Schema

All data stored in LocalStorage with the following keys:

```typescript
// LocalStorage Keys
'darkprod_notes': Note[]
'darkprod_tasks': Task[]
'darkprod_tarot_readings': TarotReading[]
'darkprod_settings': {
  audioEnabled: boolean;
  audioVolume: number;
  lastModule: string;
}
```

### State Management

**AppContext**
- Current active module
- Global settings (audio, theme)
- Loading states

**NotesContext**
- All notes array
- Current note ID
- CRUD operations for notes
- Search functionality

**TasksContext**
- All tasks array
- CRUD operations for tasks
- Task reordering logic
- Completion tracking

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

### Color Palette

- Background: Deep blacks (#0a0a0a, #1a1a1a)
- Accents: Dark purples (#2d1b4e, #4a2d6e)
- Text: Off-whites and grays (#e0e0e0, #b0b0b0)
- Highlights: Ethereal blues and greens (#3d5a80, #2d4a3e)
- Warnings/Priority: Deep reds (#4a1a1a, #6e2d2d)

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
- Deploy to static hosting (Vercel, Netlify, GitHub Pages)
- Ensure all assets (fonts, sounds, images) are bundled
- Configure proper caching headers for performance
- Set up CI/CD for automated deployments

## Future Enhancements

- Cloud sync for notes and tasks across devices
- Collaborative features for shared notes
- More tarot spreads and reading types
- Customizable themes and color schemes
- Export notes as PDF with gothic styling
- Integration with external calendar services
- Voice input for Ghost Writer
- More ambient sound options
