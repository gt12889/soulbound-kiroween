# Milestone Celebration - Companion Integration

## Overview

The MilestoneCelebration component now integrates with the Spirit Companion system to provide a more immersive and rewarding experience when users reach streak milestones.

## Features

### 1. Automatic XP Rewards

When a milestone celebration is triggered, the companion automatically receives XP based on the milestone significance:

- **3 days**: 10 XP
- **7 days**: 15 XP
- **14 days**: 25 XP
- **30 days**: 50 XP
- **60 days**: 100 XP
- **100 days**: 200 XP
- **365 days**: 500 XP

### 2. Companion Interaction

The celebration automatically triggers a companion interaction, which:
- Increments the interaction counter
- Updates the companion's mood
- Contributes to the companion's daily interaction stats

### 3. Companion-Specific Particles

The celebration includes companion-themed particle effects that mirror the companion's own particle system:

#### Companion Burst Particles
- 16 radial particles that expand outward
- Color-matched to the streak type
- Animated with staggered delays for a burst effect

#### Companion Hearts
- 8 purple hearts that float outward in a circular pattern
- Matches the companion's encouragement heart animation
- Provides a warm, supportive visual

#### Companion Message
- Displays an encouraging message from the companion's perspective
- Message varies based on milestone significance
- Appears with a smooth fade-in animation after the main celebration

### 4. Companion Messages by Milestone

The companion provides contextual encouragement based on the milestone reached:

- **3 days**: "Keep up the great work! 💪"
- **7 days**: "One week streak! You're on fire! ⚡"
- **14 days**: "Two weeks of consistency! 🔥"
- **30 days**: "One month milestone! Incredible! 🎉"
- **60 days**: "Two months strong! Keep it up! ✨"
- **100 days**: "A century of commitment! Amazing! 💫"
- **365 days**: "Your dedication is legendary! 🌟"

## Usage

The integration is automatic. Simply use the MilestoneCelebration component as before:

```tsx
<MilestoneCelebration
  streakType="taskStreak"
  milestoneDay={30}
  show={true}
  onComplete={() => console.log('Celebration complete')}
/>
```

The component will automatically:
1. Award XP to the companion
2. Trigger a companion interaction
3. Display companion-themed particles
4. Show an encouraging message

## Technical Implementation

### XP Calculation

```typescript
function calculateMilestoneXP(milestoneDay: number): number {
  if (milestoneDay >= 365) return 500;
  if (milestoneDay >= 100) return 200;
  if (milestoneDay >= 60) return 100;
  if (milestoneDay >= 30) return 50;
  if (milestoneDay >= 14) return 25;
  if (milestoneDay >= 7) return 15;
  if (milestoneDay >= 3) return 10;
  return 5;
}
```

### Companion Integration

The component uses the `useCompanion` hook to access companion functionality:

```typescript
const { addExperience, interact } = useCompanion();

useEffect(() => {
  if (show) {
    const xpReward = calculateMilestoneXP(milestoneDay);
    addExperience(xpReward);
    interact();
  }
}, [show, milestoneDay, addExperience, interact]);
```

### Particle System

The companion particles are rendered alongside the main celebration particles:

```tsx
<div className={styles.companionCelebration}>
  {/* Companion burst particles */}
  <div className={styles.companionBurst}>
    {[...Array(16)].map((_, i) => (
      <div className={styles.companionBurstParticle} />
    ))}
  </div>
  
  {/* Companion hearts */}
  <div className={styles.companionHearts}>
    {[...Array(8)].map((_, i) => (
      <div className={styles.companionHeart}>💜</div>
    ))}
  </div>
  
  {/* Companion message */}
  <div className={styles.companionMessage}>
    {getCompanionMessage()}
  </div>
</div>
```

## CSS Animations

### Companion Burst Particles

```css
@keyframes companionBurstExpand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(-50% + var(--burst-distance) * cos(var(--burst-angle))),
      calc(-50% + var(--burst-distance) * sin(var(--burst-angle)))
    ) scale(1.5);
    opacity: 0;
  }
}
```

### Companion Hearts

```css
@keyframes companionHeartFloat {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(-50% + var(--heart-distance) * cos(var(--heart-angle))),
      calc(-50% + var(--heart-distance) * sin(var(--heart-angle)))
    ) scale(1.2) rotate(360deg);
    opacity: 0;
  }
}
```

### Companion Message

```css
@keyframes companionMessageAppear {
  0% {
    transform: translateX(-50%) translateY(20px) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) translateY(0) scale(1);
    opacity: 1;
  }
}
```

## Testing

The integration is fully tested with 13 test cases covering:

- XP award on milestone celebration
- Companion interaction trigger
- Correct XP amounts for different milestones
- Companion particle rendering
- Companion message display
- Color matching for different streak types
- Single XP award per celebration
- All celebration elements rendering together

Run tests with:

```bash
npm test -- MilestoneCelebration.companion.test.tsx
```

## Accessibility

The companion integration maintains all accessibility features:

- Reduced motion support (animations disabled when preferred)
- Screen reader announcements for milestone achievements
- Keyboard navigation support
- High contrast mode compatibility

## Performance

The companion integration is optimized for performance:

- Particles use CSS transforms for GPU acceleration
- Animations are hardware-accelerated
- Component only re-renders when necessary
- XP is awarded only once per celebration

## Future Enhancements

Potential future improvements:

1. **Companion-Specific Celebrations**: Different particle effects based on active companion type
2. **Audio Integration**: Companion-specific sound effects for milestones
3. **Dialogue Integration**: Show companion dialogue bubbles during celebration
4. **Skill Tree Integration**: Unlock special celebration effects through skill tree
5. **Ritual Integration**: Special celebrations for ritual completions

## Requirements Satisfied

This integration satisfies the following requirements from Task 4.3:

- ✅ Create celebration animation component
- ✅ Integrate with companion particles
- ✅ Celebration feels rewarding
- ✅ Companion reacts appropriately
- ✅ XP awarded correctly
- ✅ Achievement recorded (via companion interaction)

## Related Files

- `MilestoneCelebration.tsx` - Main component
- `MilestoneCelebration.module.css` - Styles and animations
- `MilestoneCelebration.companion.test.tsx` - Integration tests
- `CompanionContext.tsx` - Companion state management
- `InteractiveCompanion.tsx` - Companion particle system reference
