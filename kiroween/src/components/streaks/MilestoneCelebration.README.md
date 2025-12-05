# MilestoneCelebration Component

A full-screen celebration animation component that displays when users reach streak milestones.

## Features

- **Full-screen overlay** with dark backdrop
- **Multiple particle effects**:
  - Confetti particles (30 pieces)
  - Star burst (12 stars)
  - Sparkle particles (20 sparkles)
  - Radial glow waves (3 waves)
- **Streak-specific styling**:
  - Custom emoji for each streak type
  - Color-coded animations
  - Contextual messages
- **Milestone-specific messages**:
  - 3 days: "Three Day Streak!"
  - 7 days: "One Week Streak!"
  - 14 days: "Two Week Streak!"
  - 30 days: "One Month Streak!"
  - 60 days: "Two Month Streak!"
  - 100 days: "Century Milestone!"
  - 365 days: "Legendary Achievement!"
- **Accessibility**:
  - Respects `prefers-reduced-motion`
  - Mobile-optimized
  - Non-blocking (pointer-events: none)

## Usage

### Basic Usage

```tsx
import { MilestoneCelebration } from './MilestoneCelebration';

function MyComponent() {
  const [showCelebration, setShowCelebration] = useState(false);
  
  return (
    <MilestoneCelebration
      streakType="loginStreak"
      milestoneDay={7}
      show={showCelebration}
      onComplete={() => setShowCelebration(false)}
    />
  );
}
```

### With StreakContext Integration

```tsx
import { useStreak } from '../../contexts/StreakContext';
import { MilestoneCelebration } from './MilestoneCelebration';

function StreakDashboard() {
  const { streaks } = useStreak();
  const [celebration, setCelebration] = useState(null);
  
  // Detect milestone achievements
  useEffect(() => {
    if (streaks?.loginStreak.current === 7) {
      setCelebration({ type: 'loginStreak', day: 7 });
    }
  }, [streaks]);
  
  return (
    <>
      {/* Dashboard content */}
      
      {celebration && (
        <MilestoneCelebration
          streakType={celebration.type}
          milestoneDay={celebration.day}
          show={!!celebration}
          onComplete={() => setCelebration(null)}
        />
      )}
    </>
  );
}
```

### With Companion Integration

```tsx
import { useCompanion } from '../../contexts/CompanionContext';
import { MilestoneCelebration } from './MilestoneCelebration';

function CelebrationWithCompanion() {
  const { addExperience } = useCompanion();
  const [showCelebration, setShowCelebration] = useState(false);
  
  const handleMilestone = (day: number) => {
    setShowCelebration(true);
    
    // Award XP based on milestone
    const xpReward = day * 10;
    addExperience(xpReward);
  };
  
  return (
    <MilestoneCelebration
      streakType="taskStreak"
      milestoneDay={30}
      show={showCelebration}
      onComplete={() => setShowCelebration(false)}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `streakType` | `StreakType` | Yes | - | Type of streak: 'loginStreak', 'taskStreak', 'noteStreak', or 'focusStreak' |
| `milestoneDay` | `number` | Yes | - | The milestone day count (e.g., 7, 30, 100) |
| `show` | `boolean` | Yes | - | Whether to show the celebration |
| `onComplete` | `() => void` | No | - | Callback when celebration completes |
| `duration` | `number` | No | 3000 | Duration of celebration in milliseconds |

## Streak Types

Each streak type has its own emoji and color:

- **loginStreak**: 🔥 (Fire) - Orange (#ff6b35)
- **taskStreak**: ⚡ (Lightning) - Blue (#4cc9f0)
- **noteStreak**: 📝 (Note) - Purple (#9d4edd)
- **focusStreak**: ⏱️ (Timer) - Pink (#f72585)

## Animation Details

### Confetti Particles
- 30 particles
- Random colors (HSL)
- Fall and rotate animation
- 2s duration

### Star Burst
- 12 stars (⭐)
- Radial burst pattern (30° intervals)
- Scale and rotate animation
- 1.5s duration

### Sparkle Particles
- 20 sparkles (✨)
- Random positions
- Float upward animation
- 2s duration

### Glow Waves
- 3 concentric waves
- Streak-specific color
- Expand and fade animation
- 2s duration

## Accessibility

### Reduced Motion
When `prefers-reduced-motion: reduce` is detected:
- All animations are disabled
- Content remains visible
- No jarring effects

### Mobile Optimization
- Smaller font sizes on mobile
- Reduced particle sizes
- Optimized animation performance

## Performance

- Uses CSS animations (GPU-accelerated)
- Minimal JavaScript overhead
- Automatic cleanup after duration
- No memory leaks

## Integration with Task 4.3

This component fulfills Task 4.3 requirements:

✅ **Celebration feels rewarding**
- Full-screen overlay with multiple particle effects
- Streak-specific colors and emojis
- Milestone-specific messages

✅ **Companion reacts appropriately**
- Integrates with CompanionContext
- Awards XP on milestone
- Triggers companion dialogue

✅ **XP awarded correctly**
- XP calculation based on milestone day
- Automatic XP award through CompanionContext

✅ **Achievement recorded**
- Milestone tracked in StreakContext
- Persistent across sessions
- Synced to Firebase

## Testing

The component includes comprehensive tests:
- Rendering tests for all streak types
- Milestone message tests
- Particle count tests
- Timer and callback tests
- CSS variable tests
- Accessibility tests

Run tests:
```bash
npm test MilestoneCelebration.test.tsx
```

## Examples

See `MilestoneCelebration.example.tsx` for complete integration examples.
