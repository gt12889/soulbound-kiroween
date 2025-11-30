# Spirit Companion Selection - Design Document

## Architecture Overview

### Component Structure
```
CompanionSelectionModal/
├── CompanionSelectionModal.tsx      # Main modal container
├── CompanionSelectionModal.module.css
├── CompanionOption.tsx              # Individual companion card
├── CompanionOption.module.css
└── companionTypes.ts                # Companion type definitions
```

### Data Flow
```
User visits Deeds & Decrees
    ↓
Check for existing companion selection
    ↓
No selection found → Show modal
    ↓
User selects companion
    ↓
Save to storage (Firebase + localStorage)
    ↓
Update app state
    ↓
Close modal & show companion
```

## Component Specifications

### 1. CompanionSelectionModal Component

#### Props
```typescript
interface CompanionSelectionModalProps {
  isOpen: boolean;
  onSelect: (companionType: CompanionType) => void;
  onClose?: () => void; // Optional, modal is not dismissible
}
```

#### State
```typescript
interface CompanionSelectionState {
  selectedType: CompanionType | null;
  isConfirming: boolean;
  error: string | null;
}
```

#### Behavior
- Renders fullscreen overlay with backdrop blur
- Displays title: "Choose Your Spirit Companion"
- Shows subtitle: "This choice is permanent and will shape your journey"
- Renders 3 CompanionOption components
- Handles selection and confirmation
- Focus trap for accessibility
- Keyboard navigation support

### 2. CompanionOption Component

#### Props
```typescript
interface CompanionOptionProps {
  companion: CompanionDefinition;
  isSelected: boolean;
  onSelect: () => void;
}
```

#### Visual Elements
- Large emoji preview (animated)
- Companion name (prominent)
- Personality description
- Evolution preview (mini stage icons)
- Color-coded border matching companion theme
- Hover effects and animations
- Selection indicator (checkmark or glow)

### 3. Companion Type Definitions

```typescript
export type CompanionType = 'shadow' | 'forest' | 'ember';

export interface EvolutionStage {
  name: string;
  emoji: string;
  description: string;
  requiredPoints: number;
}

export interface CompanionDefinition {
  type: CompanionType;
  name: string;
  personality: string;
  theme: string;
  colorPrimary: string;
  colorSecondary: string;
  stages: EvolutionStage[];
}

export const COMPANION_TYPES: Record<CompanionType, CompanionDefinition> = {
  shadow: {
    type: 'shadow',
    name: 'Shadow Spirit',
    personality: 'Mysterious and wise, dwelling in the spaces between light and dark',
    theme: 'Ethereal Shadows',
    colorPrimary: '#9d4edd',
    colorSecondary: '#240046',
    stages: [
      { name: 'Mysterious Egg', emoji: '🥚', description: 'Dormant potential', requiredPoints: 0 },
      { name: 'Spirit Wisp', emoji: '✨', description: 'First awakening', requiredPoints: 5 },
      { name: 'Shadow Sprite', emoji: '👻', description: 'Growing power', requiredPoints: 20 },
      { name: 'Phantom Guardian', emoji: '🦇', description: 'Protective force', requiredPoints: 50 },
      { name: 'Ancient Wraith', emoji: '🌙', description: 'Timeless wisdom', requiredPoints: 100 },
      { name: 'Celestial Entity', emoji: '⭐', description: 'Transcendent being', requiredPoints: 200 },
    ],
  },
  forest: {
    type: 'forest',
    name: 'Forest Familiar',
    personality: 'Patient and nurturing, rooted in the ancient wisdom of nature',
    theme: 'Woodland Magic',
    colorPrimary: '#10b981',
    colorSecondary: '#064e3b',
    stages: [
      { name: 'Ancient Seed', emoji: '🌰', description: 'Life waiting to bloom', requiredPoints: 0 },
      { name: 'Tender Sprout', emoji: '🌱', description: 'First growth', requiredPoints: 5 },
      { name: 'Young Sapling', emoji: '🌿', description: 'Reaching upward', requiredPoints: 20 },
      { name: 'Tree Spirit', emoji: '🌳', description: 'Guardian of the grove', requiredPoints: 50 },
      { name: 'Ancient Oak', emoji: '🌲', description: 'Centuries of wisdom', requiredPoints: 100 },
      { name: 'World Tree', emoji: '🌍', description: 'Cosmic connection', requiredPoints: 200 },
    ],
  },
  ember: {
    type: 'ember',
    name: 'Ember Phoenix',
    personality: 'Passionate and resilient, rising from challenges with renewed strength',
    theme: 'Eternal Flame',
    colorPrimary: '#f97316',
    colorSecondary: '#7c2d12',
    stages: [
      { name: 'Dormant Ash', emoji: '🪨', description: 'Potential for rebirth', requiredPoints: 0 },
      { name: 'First Spark', emoji: '🔥', description: 'Ignition of will', requiredPoints: 5 },
      { name: 'Dancing Flame', emoji: '🕯️', description: 'Growing intensity', requiredPoints: 20 },
      { name: 'Phoenix Rising', emoji: '🦅', description: 'Reborn in glory', requiredPoints: 50 },
      { name: 'Inferno Spirit', emoji: '🌋', description: 'Unstoppable force', requiredPoints: 100 },
      { name: 'Solar Deity', emoji: '☀️', description: 'Radiant perfection', requiredPoints: 200 },
    ],
  },
};
```

## State Management

### Option 1: Extend AppContext (Recommended)
```typescript
interface AppContextType {
  // ... existing properties
  companionType: CompanionType | null;
  setCompanionType: (type: CompanionType) => void;
  hasSelectedCompanion: boolean;
}
```

### Option 2: New CompanionContext
```typescript
interface CompanionContextType {
  companionType: CompanionType | null;
  selectCompanion: (type: CompanionType) => Promise<void>;
  hasSelectedCompanion: boolean;
  isLoading: boolean;
  error: string | null;
}
```

## Storage Strategy

### LocalStorage
```typescript
const STORAGE_KEY = 'dark-productivity-companion-type';

// Save
localStorage.setItem(STORAGE_KEY, companionType);

// Load
const savedType = localStorage.getItem(STORAGE_KEY) as CompanionType | null;
```

### Firebase (Authenticated Users)
```typescript
// Firestore path
users/{userId}/companion/type

// Save
await setDoc(doc(db, 'users', userId, 'companion', 'type'), {
  type: companionType,
  selectedAt: serverTimestamp(),
});

// Load
const docSnap = await getDoc(doc(db, 'users', userId, 'companion', 'type'));
const companionType = docSnap.data()?.type;
```

### Sync Strategy
1. On app load: Check Firebase first (if authenticated)
2. Fallback to localStorage
3. On selection: Save to both simultaneously
4. On auth state change: Sync from Firebase to localStorage

## UI/UX Design

### Modal Layout
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         Choose Your Spirit Companion                │
│    This choice is permanent and shapes your journey │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │          │  │          │  │          │        │
│  │    🥚    │  │    🌰    │  │    🪨    │        │
│  │          │  │          │  │          │        │
│  │  Shadow  │  │  Forest  │  │  Ember   │        │
│  │  Spirit  │  │ Familiar │  │ Phoenix  │        │
│  │          │  │          │  │          │        │
│  │ Mystical │  │ Patient  │  │Passionate│        │
│  │          │  │          │  │          │        │
│  │ 🥚✨👻🦇🌙⭐│  │🌰🌱🌿🌳🌲🌍│  │🪨🔥🕯️🦅🌋☀️│        │
│  │          │  │          │  │          │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                     │
│              [Choose Companion]                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Companion Card Design
- **Dimensions**: 280px × 400px
- **Border**: 3px solid with companion color
- **Background**: Semi-transparent dark with gradient
- **Hover**: Scale 1.05, enhanced glow
- **Selected**: Thicker border, checkmark overlay, pulsing glow
- **Animation**: Gentle floating motion, emoji rotation

### Color Schemes
```css
/* Shadow Spirit */
--shadow-primary: #9d4edd;
--shadow-secondary: #240046;
--shadow-glow: rgba(157, 78, 221, 0.5);

/* Forest Familiar */
--forest-primary: #10b981;
--forest-secondary: #064e3b;
--forest-glow: rgba(16, 185, 129, 0.5);

/* Ember Phoenix */
--ember-primary: #f97316;
--ember-secondary: #7c2d12;
--ember-glow: rgba(249, 115, 22, 0.5);
```

### Animations
```css
/* Card entrance */
@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Emoji float */
@keyframes emojiFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

/* Selection pulse */
@keyframes selectionPulse {
  0%, 100% {
    box-shadow: 0 0 20px var(--companion-glow);
  }
  50% {
    box-shadow: 0 0 40px var(--companion-glow);
  }
}
```

## Integration Points

### 1. AchievementsPage Integration
```typescript
// In AchievementsPage.tsx
const { companionType, hasSelectedCompanion } = useApp();
const [showSelectionModal, setShowSelectionModal] = useState(!hasSelectedCompanion);

const handleCompanionSelect = async (type: CompanionType) => {
  await setCompanionType(type);
  setShowSelectionModal(false);
  showToast({
    message: `Your ${COMPANION_TYPES[type].name} has bonded with you!`,
    type: 'success'
  });
};

return (
  <>
    <CompanionSelectionModal
      isOpen={showSelectionModal}
      onSelect={handleCompanionSelect}
    />
    {hasSelectedCompanion && (
      <SpiritCompanion
        companionType={companionType}
        // ... other props
      />
    )}
  </>
);
```

### 2. SpiritCompanion Component Updates
```typescript
// Update SpiritCompanion to accept companionType prop
interface SpiritCompanionProps {
  companionType: CompanionType;
  achievementCount: number;
  taskCompletionCount: number;
  onInteract?: () => void;
}

// Use companionType to determine evolution stages and colors
const companion = COMPANION_TYPES[companionType];
const currentStage = companion.stages.find(/* ... */);
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate between companion options
- **Enter/Space**: Select highlighted companion
- **Escape**: (Disabled - modal not dismissible)
- **Arrow Keys**: Navigate between options

### Screen Reader Support
```html
<div role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description">
  <h2 id="modal-title">Choose Your Spirit Companion</h2>
  <p id="modal-description">Select one companion to be your permanent guide</p>
  
  <button
    role="radio"
    aria-checked={isSelected}
    aria-label={`${companion.name}: ${companion.personality}`}
  >
    <!-- Companion card content -->
  </button>
</div>
```

### Focus Management
- Focus trap within modal
- Initial focus on first companion option
- Clear focus indicators
- Focus returns to trigger element after close (if applicable)

## Error Handling

### Save Failure
```typescript
try {
  await saveCompanionType(type);
} catch (error) {
  showToast({
    message: 'Failed to save your companion choice. Please try again.',
    type: 'error'
  });
  // Keep modal open, allow retry
}
```

### Data Corruption
```typescript
// Validate loaded companion type
const isValidType = (type: string): type is CompanionType => {
  return ['shadow', 'forest', 'ember'].includes(type);
};

if (!isValidType(loadedType)) {
  console.warn('Invalid companion type, defaulting to shadow');
  companionType = 'shadow';
}
```

## Testing Strategy

### Unit Tests
- CompanionSelectionModal rendering
- CompanionOption selection logic
- Storage save/load functions
- Type validation

### Integration Tests
- Full selection flow
- Firebase sync for authenticated users
- LocalStorage fallback
- Cross-device sync

### E2E Tests
- New user sees modal
- Companion selection persists
- Existing users don't see modal
- Mobile responsive behavior

## Performance Considerations

### Optimization
- Lazy load modal component
- Preload companion emojis
- Debounce selection confirmation
- Minimize re-renders with React.memo

### Bundle Size
- Companion definitions: ~2KB
- Modal component: ~5KB
- CSS: ~3KB
- Total addition: ~10KB

## Migration Plan

### Phase 1: Existing Users
- Add migration script to set `companionType: 'shadow'` for all existing users
- Run on app initialization
- Mark as migrated in user profile

### Phase 2: New Users
- Show selection modal on first Deeds & Decrees visit
- Save selection immediately
- No migration needed

### Phase 3: Rollout
- Feature flag for gradual rollout
- Monitor selection completion rates
- Gather user feedback
- Iterate on design if needed

## Future Enhancements

### Phase 2 Features
- Companion stats page
- Evolution celebration animations
- Companion interaction mini-games
- Achievement badges for companion milestones

### Phase 3 Features
- Seasonal companion variants
- Companion accessories/customization
- Companion abilities (productivity boosts)
- Social features (show off companion)
