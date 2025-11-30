# Spirit Companion Interactions - Design Document (Part 2)

## Architecture Overview

### System Components

```
Spirit Companion Interactions System
├── Core Components
│   ├── InteractiveCompanion (enhanced SpiritCompanion)
│   ├── CompanionDialogue (speech bubble system)
│   ├── CompanionStats (stats modal)
│   └── SpiritSummoning (companion switcher)
├── State Management
│   ├── CompanionContext (mood, skills, rituals)
│   ├── InteractionTracker (user actions)
│   └── SkillTreeManager (progression)
├── Services
│   ├── companionAudioService (sound effects)
│   ├── companionDialogueService (message generation)
│   ├── ritualDetectionService (ritual tracking)
│   └── contextAwarenessService (module/activity tracking)
└── Data Models
    ├── MoodState
    ├── SkillTree
    ├── Ritual
    └── InteractionHistory
```

### Data Flow

```
User Action (click, task complete, etc.)
    ↓
InteractionTracker captures event
    ↓
contextAwarenessService determines context
    ↓
CompanionContext updates mood/state
    ↓
companionDialogueService generates message
    ↓
InteractiveCompanion displays reaction
    ↓
companionAudioService plays sound
    ↓
ritualDetectionService checks for ritual completion
    ↓
SkillTreeManager awards experience
```

## Data Models

### Mood System

```typescript
export type MoodState = 
  | 'happy'       // Multiple tasks completed recently
  | 'excited'     // On a streak
  | 'energized'   // First task of day
  | 'concerned'   // No activity for days
  | 'neutral'     // Default state
  | 'proud'       // Major milestone achieved
  | 'playful';    // User interacting frequently

export interface CompanionMood {
  current: MoodState;
  lastUpdated: number;
  history: Array<{
    mood: MoodState;
    timestamp: number;
    trigger: string;
  }>;
}

// Mood calculation based on user activity
export function calculateMood(
  tasksCompletedToday: number,
  currentStreak: number,
  daysSinceLastTask: number,
  interactionsToday: number
): MoodState {
  if (daysSinceLastTask > 3) return 'concerned';
  if (currentStreak >= 7) return 'excited';
  if (tasksCompletedToday >= 5) return 'happy';
  if (tasksCompletedToday === 1) return 'energized';
  if (interactionsToday > 10) return 'playful';
  return 'neutral';
}
```

### Skill Tree System

```typescript
export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number; // Skill points required
  prerequisite?: string; // ID of required skill
  effect: SkillEffect;
}

export type SkillEffect =
  | { type: 'ghost_writer_hints'; value: number } // Enhanced suggestions
  | { type: 'task_prediction'; value: number }    // Better task recommendations
  | { type: 'animation_unlock'; value: string }   // New animation ID
  | { type: 'idle_behavior'; value: string }      // New idle animation
  | { type: 'dialogue_unlock'; value: string[] }  // New dialogue options
  | { type: 'xp_boost'; value: number };          // Faster leveling

export interface SkillTree {
  companionType: CompanionType;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  availablePoints: number;
  unlockedSkills: string[];
  branches: {
    power: Skill[];    // Productivity enhancements
    wisdom: Skill[];   // Insight and guidance
    charm: Skill[];    // Visual and audio enhancements
  };
}

// Example skill trees for each companion
export const SHADOW_SKILLS: SkillTree['branches'] = {
  power: [
    {
      id: 'shadow_whisper',
      name: 'Shadow Whisper',
      description: 'Provides subtle hints in Ghost Writer',
      icon: '🌑',
      cost: 1,
      effect: { type: 'ghost_writer_hints', value: 1 }
    },
    {
      id: 'dark_insight',
      name: 'Dark Insight',
      description: 'Predicts your next task with 80% accuracy',
      icon: '🔮',
      cost: 2,
      prerequisite: 'shadow_whisper',
      effect: { type: 'task_prediction', value: 80 }
    }
  ],
  wisdom: [
    {
      id: 'ethereal_guidance',
      name: 'Ethereal Guidance',
      description: 'Unlocks philosophical dialogue options',
      icon: '💭',
      cost: 1,
      effect: { type: 'dialogue_unlock', value: ['philosophical'] }
    }
  ],
  charm: [
    {
      id: 'phantom_dance',
      name: 'Phantom Dance',
      description: 'Unlocks graceful floating animation',
      icon: '👻',
      cost: 1,
      effect: { type: 'animation_unlock', value: 'phantom_dance' }
    }
  ]
};
```

### Ritual System

```typescript
export interface Ritual {
  id: string;
  name: string;
  description: string;
  companionType: CompanionType | 'all';
  requirements: RitualRequirement[];
  reward: RitualReward;
  isSecret: boolean; // Hidden until discovered
}

export type RitualRequirement =
  | { type: 'keyword'; value: string; count: number }
  | { type: 'task_sequence'; value: string[]; timeLimit: number }
  | { type: 'note_length'; value: number }
  | { type: 'moon_phase'; value: MoonPhase }
  | { type: 'streak'; value: number }
  | { type: 'time_of_day'; value: 'morning' | 'afternoon' | 'evening' | 'night' };

export interface RitualReward {
  type: 'dialogue' | 'ability' | 'animation' | 'experience';
  value: string | number;
  duration?: number; // For temporary abilities
}

export interface RitualProgress {
  ritualId: string;
  progress: number;
  completed: boolean;
  completedAt?: number;
  active: boolean;
}

// Example rituals
export const RITUALS: Ritual[] = [
  {
    id: 'midnight_whisper',
    name: 'Midnight Whisper',
    description: 'Complete a task at midnight during a full moon',
    companionType: 'shadow',
    requirements: [
      { type: 'time_of_day', value: 'night' },
      { type: 'moon_phase', value: 'full' },
      { type: 'task_sequence', value: ['complete_task'], timeLimit: 3600000 }
    ],
    reward: {
      type: 'dialogue',
      value: 'midnight_secrets'
    },
    isSecret: true
  },
  {
    id: 'forest_meditation',
    name: 'Forest Meditation',
    description: 'Write a note of 500+ words about nature',
    companionType: 'forest',
    requirements: [
      { type: 'note_length', value: 500 },
      { type: 'keyword', value: 'nature', count: 3 }
    ],
    reward: {
      type: 'ability',
      value: 'enhanced_focus',
      duration: 3600000 // 1 hour
    },
    isSecret: false
  }
];
```

### Context Awareness

```typescript
export interface UserContext {
  currentModule: 'ghost-writer' | 'necronomicon' | 'graveyard' | 'tarot' | 'home';
  currentActivity: 'writing' | 'task-managing' | 'note-taking' | 'idle';
  timeInCurrentActivity: number;
  recentTasks: Array<{
    id: string;
    type: 'tombstone' | 'regular';
    completedAt: number;
  }>;
  currentMoonPhase: MoonPhase;
  currentTheme: string;
  writingSessionDuration: number;
}

export interface ContextualDialogue {
  context: Partial<UserContext>;
  companionType: CompanionType;
  mood: MoodState;
  messages: string[];
  priority: number; // Higher = more relevant
}

// Context-aware dialogue generation
export function generateContextualDialogue(
  context: UserContext,
  companion: CompanionType,
  mood: MoodState
): string {
  const dialogues = CONTEXTUAL_DIALOGUES
    .filter(d => matchesContext(d.context, context))
    .filter(d => d.companionType === companion)
    .filter(d => d.mood === mood)
    .sort((a, b) => b.priority - a.priority);
  
  if (dialogues.length === 0) return getDefaultDialogue(companion, mood);
  
  const dialogue = dialogues[0];
  return dialogue.messages[Math.floor(Math.random() * dialogue.messages.length)];
}
```

### Multi-Spirit Interactions

```typescript
export interface SpiritInteraction {
  id: string;
  participants: CompanionType[];
  trigger: InteractionTrigger;
  dialogue: SpiritDialogueLine[];
  cooldown: number; // Minimum time between same interaction
}

export interface SpiritDialogueLine {
  speaker: CompanionType;
  message: string;
  animation?: string;
  delay: number; // Delay before this line
}

export type InteractionTrigger =
  | { type: 'task_complete'; count: number }
  | { type: 'user_idle'; duration: number }
  | { type: 'achievement_unlock'; id: string }
  | { type: 'random'; probability: number };

// Example multi-spirit interaction
export const SPIRIT_INTERACTIONS: SpiritInteraction[] = [
  {
    id: 'shadow_forest_debate',
    participants: ['shadow', 'forest'],
    trigger: { type: 'task_complete', count: 5 },
    dialogue: [
      {
        speaker: 'shadow',
        message: 'Impressive productivity... but are you truly present in each moment?',
        animation: 'thoughtful',
        delay: 0
      },
      {
        speaker: 'forest',
        message: 'Growth takes time, Shadow. Each task is a seed planted.',
        animation: 'wise',
        delay: 2000
      },
      {
        speaker: 'shadow',
        message: 'Perhaps you\'re both right. Balance is key.',
        animation: 'nod',
        delay: 4000
      }
    ],
    cooldown: 3600000 // 1 hour
  }
];
```

## Component Specifications

### 1. InteractiveCompanion Component

Enhanced version of SpiritCompanion with interaction capabilities.

```typescript
interface InteractiveCompanionProps {
  companionType: CompanionType;
  mood: MoodState;
  level: number;
  experience: number;
  customName?: string;
  onInteract: () => void;
  onStatsClick: () => void;
  showDialogue: boolean;
  dialogueMessage?: string;
  position?: { x: number; y: number };
  size?: 'small' | 'medium' | 'large';
}

interface InteractiveCompanionState {
  isHovered: boolean;
  isAnimating: boolean;
  currentAnimation: string;
  idleAnimationIndex: number;
}
```

**Features:**
- Click interaction with animation and sound
- Hover tooltip showing mood and name
- Idle animations that vary by mood and evolution
- Dialogue speech bubble display
- Smooth transitions between states
- Particle effects for special moments

### 2. CompanionDialogue Component

Speech bubble system for companion messages.

```typescript
interface CompanionDialogueProps {
  message: string;
  companionType: CompanionType;
  position: 'top' | 'bottom' | 'left' | 'right';
  duration?: number; // Auto-dismiss after duration
  onDismiss?: () => void;
  showTail?: boolean; // Speech bubble tail
}
```

**Visual Design:**
- Semi-transparent bubble with companion-colored border
- Animated entrance (fade + scale)
- Typewriter effect for message appearance
- Auto-dismiss after 5 seconds (configurable)
- Tail pointing to companion
- Responsive positioning to avoid screen edges

### 3. CompanionStats Modal

Detailed statistics and information display.

```typescript
interface CompanionStatsProps {
  isOpen: boolean;
  onClose: () => void;
  companion: {
    type: CompanionType;
    customName?: string;
    level: number;
    experience: number;
    mood: MoodState;
    evolutionStage: number;
    bondedSince: number;
  };
  stats: {
    totalTasks: number;
    currentStreak: number;
    longestStreak: number;
    totalInteractions: number;
    ritualsCompleted: number;
  };
  skills: SkillTree;
  achievements: CompanionAchievement[];
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│  [X]                                    │
│                                         │
│         🥚 Shadow Spirit                │
│         "Whisper" (Custom Name)         │
│         Level 12 • Phantom Stage        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ XP: ████████░░ 850/1000         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Current Mood: 😊 Happy                │
│  Bonded: 45 days ago                   │
│                                         │
│  ┌─ Stats ──────────────────────────┐  │
│  │ Tasks Completed: 234              │  │
│  │ Current Streak: 7 days            │  │
│  │ Longest Streak: 14 days           │  │
│  │ Total Interactions: 1,234         │  │
│  │ Rituals Completed: 3/12           │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [View Skills] [View Achievements]      │
│                                         │
└─────────────────────────────────────────┘
```

### 4. SkillTree Component

Interactive skill tree interface.

```typescript
interface SkillTreeProps {
  skillTree: SkillTree;
  onSkillUnlock: (skillId: string) => void;
  onSkillHover: (skill: Skill) => void;
}
```

**Visual Design:**
- Three branches radiating from center (Power, Wisdom, Charm)
- Skills as nodes connected by lines
- Locked skills shown as silhouettes
- Available skills highlighted
- Prerequisite connections clearly shown
- Skill point counter at top
- Hover shows detailed tooltip

### 5. SpiritSummoning Modal

Interface for switching active companions.

```typescript
interface SpiritSummoningProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedCompanions: CompanionType[];
  activeCompanion: CompanionType;
  onSwitchCompanion: (type: CompanionType) => void;
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│         Spirit Summoning Circle         │
│                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │  🥚  │  │  🌰  │  │  🪨  │         │
│  │Shadow│  │Forest│  │Ember │         │
│  │ Lvl12│  │ Lvl 8│  │🔒Lock│         │
│  │ACTIVE│  │      │  │      │         │
│  └──────┘  └──────┘  └──────┘         │
│                                         │
│  Shadow Spirit                          │
│  "The mysterious guide of twilight"    │
│  Current Mood: Happy                    │
│  Evolution: Phantom (Stage 4/6)         │
│                                         │
│  [Switch to Shadow Spirit]              │
│                                         │
└─────────────────────────────────────────┘
```

## Services

### 1. companionAudioService

```typescript
interface CompanionAudioService {
  playInteractionSound(companionType: CompanionType): void;
  playEvolutionSound(companionType: CompanionType): void;
  playCelebrationSound(companionType: CompanionType): void;
  playAmbientSound(companionType: CompanionType, mood: MoodState): void;
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;
}

// Sound mapping
const COMPANION_SOUNDS = {
  shadow: {
    interaction: '/sounds/shadow-whisper.mp3',
    evolution: '/sounds/shadow-transform.mp3',
    celebration: '/sounds/shadow-cheer.mp3',
    ambient: {
      happy: '/sounds/shadow-happy-ambient.mp3',
      excited: '/sounds/shadow-excited-ambient.mp3'
    }
  },
  forest: {
    interaction: '/sounds/forest-rustle.mp3',
    evolution: '/sounds/forest-grow.mp3',
    celebration: '/sounds/forest-bloom.mp3'
  },
  ember: {
    interaction: '/sounds/ember-crackle.mp3',
    evolution: '/sounds/ember-ignite.mp3',
    celebration: '/sounds/ember-blaze.mp3'
  }
};
```

### 2. companionDialogueService

```typescript
interface CompanionDialogueService {
  generateDialogue(
    context: UserContext,
    companion: CompanionType,
    mood: MoodState,
    timeOfDay: TimeOfDay
  ): string;
  
  getGreeting(companion: CompanionType, timeOfDay: TimeOfDay): string;
  getCelebration(companion: CompanionType, achievement: string): string;
  getEncouragement(companion: CompanionType, daysSinceTask: number): string;
  getRandomIdle(companion: CompanionType, mood: MoodState): string;
}

// Dialogue database structure
const DIALOGUE_DATABASE = {
  shadow: {
    greetings: {
      morning: [
        'The shadows recede... a new day begins.',
        'Dawn breaks, but mysteries remain.',
        'Good morning. What secrets will today reveal?'
      ],
      afternoon: [
        'The sun is high, but I remain in the shadows.',
        'Afternoon already? Time flows like mist.'
      ],
      evening: [
        'Twilight approaches. My favorite time.',
        'The veil between worlds grows thin...'
      ],
      night: [
        'Ah, the darkness. Now we can truly work.',
        'The night is ours. What shall we accomplish?'
      ]
    },
    contextual: {
      'ghost-writer': [
        'Your words carry weight. Choose them wisely.',
        'I sense creativity flowing through you.',
        'The blank page holds infinite possibilities.'
      ],
      'necronomicon': [
        'Knowledge is power. Record it well.',
        'Your notes will outlast memory.',
        'Wisdom preserved is wisdom multiplied.'
      ]
    },
    mood: {
      happy: [
        'Your progress pleases me.',
        'Well done. The shadows smile upon you.',
        'Excellent work. You\'re mastering the balance.'
      ],
      concerned: [
        'I sense your absence. All is well?',
        'The path grows cold. Shall we continue?',
        'Even shadows need light to exist. Return to your work.'
      ]
    }
  }
  // ... similar for forest and ember
};
```

### 3. ritualDetectionService

```typescript
interface RitualDetectionService {
  trackAction(action: UserAction): void;
  checkRitualProgress(ritualId: string): RitualProgress;
  getAllActiveRituals(): RitualProgress[];
  completeRitual(ritualId: string): void;
  resetRitual(ritualId: string): void;
}

class RitualDetector {
  private actionHistory: UserAction[] = [];
  private ritualProgress: Map<string, RitualProgress> = new Map();
  
  trackAction(action: UserAction): void {
    this.actionHistory.push(action);
    
    // Check all active rituals
    RITUALS.forEach(ritual => {
      if (this.checkRequirements(ritual, action)) {
        this.updateProgress(ritual.id);
      }
    });
  }
  
  private checkRequirements(ritual: Ritual, action: UserAction): boolean {
    // Complex logic to match action against ritual requirements
    // Returns true if action contributes to ritual progress
  }
}
```

### 4. contextAwarenessService

```typescript
interface ContextAwarenessService {
  getCurrentContext(): UserContext;
  trackModuleChange(module: string): void;
  trackActivityStart(activity: string): void;
  trackActivityEnd(activity: string): void;
  getActivityDuration(activity: string): number;
}

class ContextTracker {
  private context: UserContext;
  private activityStartTimes: Map<string, number> = new Map();
  
  constructor() {
    this.context = {
      currentModule: 'home',
      currentActivity: 'idle',
      timeInCurrentActivity: 0,
      recentTasks: [],
      currentMoonPhase: getCurrentMoonPhase(),
      currentTheme: 'default',
      writingSessionDuration: 0
    };
    
    // Update context every second
    setInterval(() => this.updateContext(), 1000);
  }
  
  private updateContext(): void {
    // Update time-based context properties
    if (this.activityStartTimes.has(this.context.currentActivity)) {
      const startTime = this.activityStartTimes.get(this.context.currentActivity)!;
      this.context.timeInCurrentActivity = Date.now() - startTime;
    }
  }
}
```

## Animation System

### Idle Animations

```typescript
interface IdleAnimation {
  name: string;
  keyframes: Keyframe[];
  duration: number;
  mood: MoodState[];
  evolutionStages: number[];
}

const SHADOW_IDLE_ANIMATIONS: IdleAnimation[] = [
  {
    name: 'float',
    keyframes: [
      { transform: 'translateY(0px)', offset: 0 },
      { transform: 'translateY(-10px)', offset: 0.5 },
      { transform: 'translateY(0px)', offset: 1 }
    ],
    duration: 3000,
    mood: ['neutral', 'happy'],
    evolutionStages: [0, 1, 2, 3, 4, 5]
  },
  {
    name: 'pulse',
    keyframes: [
      { opacity: 1, transform: 'scale(1)', offset: 0 },
      { opacity: 0.7, transform: 'scale(1.1)', offset: 0.5 },
      { opacity: 1, transform: 'scale(1)', offset: 1 }
    ],
    duration: 2000,
    mood: ['excited', 'playful'],
    evolutionStages: [2, 3, 4, 5]
  },
  {
    name: 'fade',
    keyframes: [
      { opacity: 1, offset: 0 },
      { opacity: 0.3, offset: 0.5 },
      { opacity: 1, offset: 1 }
    ],
    duration: 4000,
    mood: ['concerned'],
    evolutionStages: [0, 1, 2, 3, 4, 5]
  }
];
```

### Interaction Animations

```typescript
const INTERACTION_ANIMATIONS = {
  click: {
    shadow: 'spin-fade',
    forest: 'grow-shrink',
    ember: 'flare'
  },
  hover: {
    shadow: 'glow',
    forest: 'sway',
    ember: 'flicker'
  },
  celebration: {
    shadow: 'spiral-up',
    forest: 'bloom',
    ember: 'burst'
  }
};
```

## State Management

### CompanionContext

```typescript
interface CompanionContextType {
  // Core state
  activeCompanion: CompanionType;
  unlockedCompanions: CompanionType[];
  customNames: Record<CompanionType, string | undefined>;
  
  // Mood and interaction
  mood: MoodState;
  lastInteraction: number;
  interactionCount: number;
  
  // Progression
  level: number;
  experience: number;
  skillTree: SkillTree;
  
  // Rituals
  ritualProgress: RitualProgress[];
  completedRituals: string[];
  
  // Context
  currentContext: UserContext;
  
  // Actions
  interact: () => void;
  switchCompanion: (type: CompanionType) => void;
  setCustomName: (type: CompanionType, name: string) => void;
  unlockSkill: (skillId: string) => void;
  addExperience: (amount: number) => void;
  
  // Settings
  audioEnabled: boolean;
  audioVolume: number;
  animationIntensity: 'full' | 'reduced' | 'minimal';
  multiSpiritInteractions: boolean;
}
```

## Integration Points

### 1. Ghost Writer Integration

```typescript
// In GhostWriter component
const { activeCompanion, skillTree } = useCompanion();

// Check for enhanced hints skill
const hasEnhancedHints = skillTree.unlockedSkills.includes('shadow_whisper');

// Modify suggestion generation
if (hasEnhancedHints) {
  // Provide more detailed or frequent suggestions
}

// Companion reacts to writing
useEffect(() => {
  if (writingDuration > 600000) { // 10 minutes
    showCompanionDialogue('Keep going! Your words flow beautifully.');
  }
}, [writingDuration]);
```

### 2. Task System Integration

```typescript
// In TasksContext
const { addExperience, mood, activeCompanion } = useCompanion();

const completeTask = (taskId: string) => {
  // ... existing task completion logic
  
  // Award companion experience
  const xpAmount = task.type === 'tombstone' ? 20 : 10;
  addExperience(xpAmount);
  
  // Trigger companion celebration
  triggerCompanionReaction('celebration');
  
  // Track for rituals
  ritualDetectionService.trackAction({
    type: 'task_complete',
    taskId,
    timestamp: Date.now()
  });
};
```

### 3. Theme System Integration

```typescript
// In ThemeContext
const { currentContext, updateContext } = useCompanion();

const setTheme = (themeName: string) => {
  // ... existing theme logic
  
  // Update companion context
  updateContext({ currentTheme: themeName });
  
  // Companion reacts to theme change
  if (themeName === 'bloodMoon') {
    showCompanionDialogue('Ah, the crimson moon rises. How fitting.');
  }
};
```

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate between companion, stats button, summoning button
- **Enter/Space**: Interact with companion
- **S**: Open stats modal
- **C**: Open summoning modal
- **Escape**: Close modals

### Screen Reader Support
```html
<div 
  role="button"
  aria-label="Shadow Spirit companion, Level 12, Happy mood. Click to interact."
  aria-describedby="companion-tooltip"
  tabindex="0"
>
  <!-- Companion visual -->
</div>

<div 
  id="companion-tooltip"
  role="tooltip"
  aria-live="polite"
>
  {dialogueMessage}
</div>
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .companion {
    animation: none !important;
    transition: opacity 0.2s ease;
  }
  
  .companion-dialogue {
    animation: fadeIn 0.2s ease;
  }
}
```

## Performance Optimization

### Animation Performance
- Use `transform` and `opacity` only
- Enable `will-change` for animated elements
- Use CSS animations over JavaScript when possible
- Implement animation pooling for particles

### Sound Loading
- Lazy load sound files
- Preload interaction sounds
- Use Web Audio API for better control
- Implement sound sprite sheets

### State Updates
- Debounce context updates (1 second)
- Memoize dialogue generation
- Use React.memo for companion components
- Batch ritual progress checks

## Testing Strategy

### Unit Tests
- Mood calculation logic
- Dialogue generation
- Ritual detection
- Skill tree progression
- Context tracking

### Integration Tests
- Companion interaction flow
- Multi-spirit interactions
- Ritual completion
- Skill unlocking
- Cross-module context awareness

### E2E Tests
- Complete user journey with companion
- Skill tree navigation
- Ritual discovery and completion
- Companion switching
- Audio/animation settings

## Future Enhancements

### Phase 3 Features
- Companion journal (diary of journey together)
- Seasonal events and limited-time rituals
- Companion photo mode (capture moments)
- Social features (share companion stats)
- Advanced AI dialogue (GPT integration)
- Companion mini-games
- Multiple active companions simultaneously

