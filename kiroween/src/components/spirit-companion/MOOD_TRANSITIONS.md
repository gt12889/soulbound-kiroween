# Spirit Companion Mood Transitions

## Overview

The mood transition system provides smooth, expressive animations when a Spirit Companion's mood changes. Each transition reflects the emotional shift between mood states, creating a more lifelike and engaging experience.

## Architecture

### Components

1. **CSS Animations** (`moodTransitions.css`)
   - Defines keyframe animations for each transition type
   - Provides utility classes for applying animations
   - Includes reduced motion support

2. **React Hook** (`useMoodTransition.ts`)
   - Manages transition state and timing
   - Automatically triggers animations on mood changes
   - Provides callbacks for transition lifecycle

3. **Mood System** (`companionMood.ts`)
   - Calculates mood based on user activity
   - Determines appropriate transition animation
   - Tracks mood history

## Available Transitions

### Dramatic Transitions

#### Relief Celebration
**Trigger:** `concerned` → `happy`

A relieved sigh followed by joyful bounce. Represents the companion's relief when the user returns to productivity after being away.

```css
animation: relief-celebration 1.5s ease-in-out;
```

#### Energize
**Trigger:** `neutral` → `excited`

Sudden burst of energy with glow effect. Shows the companion getting excited about the user's productivity streak.

```css
animation: energize 1.2s ease-in-out;
```

### Mood-Specific Transitions

#### Fade Worried
**Trigger:** Any mood → `concerned`

Slow fade with slight shrinking. Companion becomes subdued when user has been inactive.

```css
animation: fade-worried 1.5s ease-in-out;
```

#### Bounce Excited
**Trigger:** Any mood → `excited`

Energetic bouncing with rotation. Pure excitement about achievements.

```css
animation: bounce-excited 1.8s ease-in-out;
```

#### Wiggle Playful
**Trigger:** Any mood → `playful`

Playful side-to-side wiggle. Companion is having fun with frequent interactions.

```css
animation: wiggle-playful 1.2s ease-in-out;
```

### Default Transition

#### Smooth Transition
**Trigger:** Any other mood change

Gentle fade and scale for standard mood changes.

```css
animation: smooth-transition 0.8s ease-in-out;
```

## Usage

### Basic Usage

```tsx
import { useMoodTransition, getCombinedMoodClasses } from '../../hooks/useMoodTransition';
import './moodTransitions.css';

function SpiritCompanion({ mood }) {
  const { transitionClass, isTransitioning } = useMoodTransition(mood);
  const className = getCombinedMoodClasses(mood, transitionClass);
  
  return (
    <div className={`companion ${className}`}>
      {/* Companion visual */}
    </div>
  );
}
```

### With Callbacks

```tsx
const { transitionClass } = useMoodTransition(mood, {
  transitionDuration: 2000,
  onTransitionStart: (from, to) => {
    console.log(`Transitioning from ${from} to ${to}`);
    playTransitionSound(from, to);
  },
  onTransitionEnd: (mood) => {
    console.log(`Now in ${mood} mood`);
    updateMoodIndicator(mood);
  }
});
```

### Manual Triggering

```tsx
const { triggerTransition } = useMoodTransition(mood);

// Manually trigger a transition (useful for testing or special events)
const handleSpecialEvent = () => {
  triggerTransition('neutral', 'excited');
};
```

## Mood State Classes

In addition to transitions, persistent mood state classes are available:

```css
.companion-mood--happy      /* Brighter, more saturated */
.companion-mood--excited    /* Brightest, with subtle pulse */
.companion-mood--energized  /* Bright and saturated */
.companion-mood--concerned  /* Dimmer, less saturated */
.companion-mood--neutral    /* Default appearance */
.companion-mood--proud      /* Bright with gentle glow */
.companion-mood--playful    /* Bright and saturated */
```

These classes can be combined with transition classes:

```tsx
<div className="companion companion-mood--happy companion-mood-transition--bounce-excited">
  {/* Companion will have happy appearance AND play bounce animation */}
</div>
```

## Accessibility

### Reduced Motion Support

All animations respect the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  .companion-mood-transition {
    animation: simple-fade 0.3s ease-in-out;
  }
}
```

Users who prefer reduced motion will see a simple fade instead of complex animations.

### Screen Reader Support

Mood changes should be announced to screen readers:

```tsx
const { transitionClass } = useMoodTransition(mood, {
  onTransitionStart: (from, to) => {
    announceToScreenReader(`Companion mood changed to ${to}`);
  }
});
```

## Performance Considerations

### Animation Performance

All animations use only `transform` and `opacity` properties for optimal performance:

```css
/* Good - GPU accelerated */
transform: translateY(-10px) scale(1.1) rotate(5deg);
opacity: 0.8;

/* Avoid - causes repaints */
width: 110px;
height: 110px;
```

### Transition Timing

Default transition duration is 2 seconds to accommodate the longest animation (bounce-excited at 1.8s). Adjust if needed:

```tsx
useMoodTransition(mood, {
  transitionDuration: 1500 // Shorter duration
});
```

### Cleanup

The hook automatically cleans up timeouts on unmount to prevent memory leaks.

## Testing

### Unit Tests

```tsx
import { renderHook, act } from '@testing-library/react';
import { useMoodTransition } from './useMoodTransition';

test('triggers transition on mood change', () => {
  const { result, rerender } = renderHook(
    ({ mood }) => useMoodTransition(mood),
    { initialProps: { mood: 'neutral' } }
  );
  
  act(() => {
    rerender({ mood: 'happy' });
  });
  
  expect(result.current.isTransitioning).toBe(true);
  expect(result.current.transitionClass).toContain('companion-mood-transition');
});
```

### Visual Testing

Use the `MoodTransitionExample` component to visually test all transitions:

```tsx
import MoodTransitionExample from './MoodTransitionExample';

<MoodTransitionExample 
  initialMood="neutral"
  companionType="shadow"
/>
```

## Integration with Companion System

### With CompanionContext

```tsx
function InteractiveCompanion() {
  const { mood, companionType } = useCompanion();
  const { transitionClass } = useMoodTransition(mood);
  
  return (
    <div className={`companion companion-${companionType} ${transitionClass}`}>
      <CompanionVisual type={companionType} mood={mood} />
    </div>
  );
}
```

### With Audio

Combine transitions with sound effects:

```tsx
const { transitionClass } = useMoodTransition(mood, {
  onTransitionStart: (from, to) => {
    const sound = getMoodTransitionSound(from, to);
    companionAudioService.play(sound);
  }
});
```

### With Particles

Add particle effects during dramatic transitions:

```tsx
const { transitionClass, isTransitioning } = useMoodTransition(mood, {
  onTransitionStart: (from, to) => {
    if (to === 'excited' || to === 'happy') {
      triggerParticleEffect('celebration');
    }
  }
});
```

## Future Enhancements

### Planned Features

1. **Custom Transitions**
   - Allow users to define custom transition animations
   - Per-companion-type transition variations

2. **Transition Chains**
   - Support for multi-stage transitions
   - Mood "journeys" with multiple steps

3. **Context-Aware Transitions**
   - Different transitions based on time of day
   - Special transitions for achievements

4. **Transition Intensity**
   - User preference for subtle vs. dramatic transitions
   - Adaptive intensity based on device performance

## Troubleshooting

### Transitions Not Playing

1. Ensure CSS file is imported:
   ```tsx
   import './moodTransitions.css';
   ```

2. Check that mood is actually changing:
   ```tsx
   console.log('Previous:', previousMood, 'Current:', currentMood);
   ```

3. Verify transition duration is sufficient:
   ```tsx
   useMoodTransition(mood, { transitionDuration: 2000 });
   ```

### Janky Animations

1. Check for layout thrashing:
   - Avoid reading layout properties during animation
   - Use `transform` instead of `top`/`left`

2. Enable GPU acceleration:
   ```css
   .companion {
     will-change: transform, opacity;
   }
   ```

3. Reduce animation complexity on low-end devices:
   ```tsx
   const complexity = getDevicePerformance();
   if (complexity === 'low') {
     // Use simpler animations
   }
   ```

### Multiple Transitions Overlapping

The hook automatically cancels previous transitions when a new one starts. If you need to queue transitions:

```tsx
const queueTransition = async (mood: MoodState) => {
  await waitForTransitionEnd();
  setMood(mood);
};
```

## References

- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [CSS Animation Performance](https://web.dev/animations-guide/)
- [Reduced Motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [React Animation Best Practices](https://react.dev/learn/adding-interactivity#animations)
