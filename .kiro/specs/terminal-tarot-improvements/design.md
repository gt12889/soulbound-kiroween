# Terminal Tarot - Design Document

## Architecture

### Component Structure
```
terminal-tarot/
├── TerminalTarot.tsx          # Lazy loading wrapper
├── TarotReader.tsx             # Main component (NEEDS CLEANUP)
├── TarotCard.tsx               # Individual card component
├── TarotReader.module.css      # Main styles
└── TarotCard.module.css        # Card styles
```

### State Management
- Local state for reading, loading, error
- No global state needed
- Consider adding reading history context

## Cleanup Tasks

### Files to Review/Remove
1. **Debug Code**
   - Remove console.log from TarotReader.tsx lines with `🔮 TAROT:`
   - Remove console.log from card rendering loop

2. **Unused CSS**
   - Review `.card.revealed` class (appears unused)
   - Check for duplicate animation definitions

3. **Documentation**
   - Consolidate any duplicate README files
   - Remove temporary implementation notes

### Code Improvements

#### 1. Remove Debug Logs
```typescript
// REMOVE these lines from TarotReader.tsx:
console.log('🔮 TAROT: Starting demo reading, setting loading=true');
console.log(`🔮 Tarot Card ${i}: delay=${i * 0.25}s, zIndex=${5 - i}`);
console.log('🔮 TAROT: Demo reading complete, setting loading=false');
console.error('🔮 TAROT ERROR:', err);
```

#### 2. Optimize Card Rendering
```typescript
// Current: Inline calculations in JSX
// Better: Pre-calculate positions
const cardPositions = useMemo(() => 
  Array.from({ length: 5 }, (_, i) => ({
    offsetX: (i - 2) * 15,
    offsetY: (i - 2) * 8,
    rotation: (i - 2) * 3,
    delay: i * 0.25,
    zIndex: 5 - i
  })), []
);
```

#### 3. Extract Animation Constants
```typescript
// Create constants file
export const ANIMATION_TIMINGS = {
  CARD_SHUFFLE_DURATION: 1500,
  CARD_DEAL_DELAY: 800,
  CARD_FLIP_DURATION: 800,
  SHUFFLE_CARD_DELAY: 250
};
```

## Animation Improvements

### 1. Card Reveal Sequence
```css
/* Staggered reveal animation */
@keyframes cardReveal {
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card {
  animation: cardReveal 0.6s ease-out forwards;
}
```

### 2. Hover Interactions
```css
.card:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 12px 24px rgba(157, 78, 221, 0.6);
  transition: all 0.3s ease;
}
```

### 3. Click Interaction
```typescript
const [selectedCard, setSelectedCard] = useState<number | null>(null);

const handleCardClick = (index: number) => {
  setSelectedCard(selectedCard === index ? null : index);
  // Show detailed modal or expand card
};
```

## Performance Optimizations

### 1. Memoization
```typescript
const TarotCard = memo(({ card, delay }: TarotCardProps) => {
  // Component implementation
}, (prev, next) => 
  prev.card.name === next.card.name && 
  prev.delay === next.delay
);
```

### 2. Animation Performance
```css
/* Use transform and opacity only for animations */
.shufflingCard {
  will-change: transform, opacity;
  /* Remove will-change after animation completes */
}
```

### 3. Lazy Loading
```typescript
// Already implemented in TerminalTarot.tsx
const TarotReader = lazy(() => import('./TarotReader'));
```

## UX Enhancements

### 1. Loading States
```typescript
// Add progress indicator
const [progress, setProgress] = useState(0);

// Simulate progress during AI generation
useEffect(() => {
  if (loading) {
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 90));
    }, 200);
    return () => clearInterval(interval);
  }
}, [loading]);
```

### 2. Error Handling
```typescript
// Better error messages
const ERROR_MESSAGES = {
  NETWORK: 'Unable to connect. Check your internet connection.',
  RATE_LIMIT: 'Too many readings. Please wait a moment.',
  INVALID_URL: 'Invalid GitHub URL. Format: https://github.com/user/repo',
  NO_COMMITS: 'No recent commits found. Try a more active repository.'
};
```

### 3. Reading History
```typescript
interface ReadingHistory {
  id: string;
  timestamp: number;
  cards: TarotCard[];
  interpretation: string;
  isDemoMode: boolean;
}

// Save to localStorage
const saveReading = (reading: TarotReading) => {
  const history = JSON.parse(localStorage.getItem('tarot-history') || '[]');
  history.unshift({
    id: Date.now().toString(),
    timestamp: Date.now(),
    ...reading
  });
  localStorage.setItem('tarot-history', JSON.stringify(history.slice(0, 10)));
};
```

## Accessibility

### ARIA Labels
```typescript
<div 
  className={styles.card}
  role="button"
  tabIndex={0}
  aria-label={`${card.position} card: ${card.name}`}
  aria-expanded={selectedCard === index}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCardClick(index);
    }
  }}
>
```

### Keyboard Navigation
```typescript
// Add keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key >= '1' && e.key <= '3') {
      const index = parseInt(e.key) - 1;
      handleCardClick(index);
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

## Testing Strategy

### Unit Tests
- Card rendering with different states
- Animation timing calculations
- Error handling scenarios
- LocalStorage operations

### Integration Tests
- Full reading flow
- GitHub URL validation
- Demo mode functionality
- Card interactions

### Visual Regression
- Card animations
- Layout responsiveness
- Theme compatibility

## Migration Plan

### Phase 1: Cleanup (1-2 hours)
1. Remove debug console logs
2. Clean up unused CSS
3. Remove temporary files
4. Update documentation

### Phase 2: Animations (2-3 hours)
1. Implement staggered reveals
2. Add hover effects
3. Improve transitions
4. Test performance

### Phase 3: Interactions (2-3 hours)
1. Add card click handlers
2. Implement detail view
3. Add keyboard navigation
4. Test accessibility

### Phase 4: Polish (1-2 hours)
1. Add loading progress
2. Improve error messages
3. Add reading history
4. Final testing

## Dependencies
- No new dependencies required
- Consider adding `framer-motion` for advanced animations (optional)

## Risks & Mitigation
- **Risk**: Animation performance on low-end devices
  - **Mitigation**: Use CSS transforms, add reduced-motion support
- **Risk**: Breaking existing functionality during cleanup
  - **Mitigation**: Incremental changes with testing
- **Risk**: Increased bundle size
  - **Mitigation**: Code splitting, lazy loading
