# Spirit Companion - Gamification Feature Guide

## Overview
The Spirit Companion is a 3D animated pet that lives in your Graveyard Dashboard (Deeds and Decrees section). It evolves through different stages as you complete tasks and unlock achievements, providing a gamified experience that rewards productivity.

## Evolution Stages

### 1. **Mysterious Egg** 🥚
- **Starting Stage**: Your journey begins
- **Requirements**: 0-4 progress points
- **Description**: A dormant spirit awaits awakening
- **Animation**: Gentle wobbling motion
- **Color**: Purple (#9d4edd)

### 2. **Spirit Wisp** ✨
- **Requirements**: 5-19 progress points
- **Description**: A tiny spark of ethereal energy
- **Animation**: Sparkling and twinkling
- **Color**: Light purple (#c77dff)
- **Unlocked at**: First few tasks/achievements

### 3. **Shadow Sprite** 👻
- **Requirements**: 20-49 progress points
- **Description**: Growing stronger with each deed
- **Animation**: Hovering and floating
- **Color**: Lavender (#e0aaff)
- **Unlocked at**: Regular productivity

### 4. **Phantom Guardian** 🦇
- **Requirements**: 50-99 progress points
- **Description**: A powerful protector of your realm
- **Animation**: Majestic hovering with rotation
- **Color**: Deep purple (#7b2cbf)
- **Unlocked at**: Consistent achievement

### 5. **Ancient Wraith** 🌙
- **Requirements**: 100-199 progress points
- **Description**: Wisdom incarnate, master of shadows
- **Animation**: Ethereal floating with mystical aura
- **Color**: Dark purple (#5a189a)
- **Unlocked at**: Master level productivity

### 6. **Celestial Entity** ⭐
- **Requirements**: 200+ progress points
- **Description**: Transcended beyond mortal comprehension
- **Animation**: Radiant glow with full rotation
- **Color**: Deepest purple (#240046)
- **Unlocked at**: Ultimate achievement

## Progress System

### Point Calculation
- **Achievements**: 10 points each
- **Completed Tasks**: 1 point each
- **Total Progress** = (Achievements × 10) + Completed Tasks

### Example Progression
- Complete 5 tasks → Spirit Wisp (Hatchling)
- Unlock 2 achievements + 10 tasks → Shadow Sprite (Juvenile)
- Unlock 5 achievements + 20 tasks → Phantom Guardian (Adult)
- Unlock 10 achievements + 50 tasks → Ancient Wraith (Elder)
- Unlock 20 achievements + 100 tasks → Celestial Entity (Ascended)

## Features

### 3D Animations
- **Floating**: Continuous gentle up-and-down motion
- **Rotation**: 3D rotation on Y-axis for depth
- **Particles**: Floating mystical particles around the companion
- **Glow Effects**: Pulsing aura that matches evolution stage
- **Interaction**: Click to trigger bounce animation and receive messages

### Visual Effects
- **Evolution Animation**: Dramatic burst effect when evolving
- **Stage-Specific Colors**: Each stage has unique color scheme
- **Parallax Particles**: 8 floating particles with staggered timing
- **Glow Pulse**: Breathing glow effect that intensifies with stage
- **Shadow Effects**: Drop shadows that enhance 3D appearance

### Interactive Elements
- **Click Interaction**: Click the companion for acknowledgment
- **Toast Messages**: Random mystical messages on interaction
- **Hover Effects**: Scale up slightly on hover
- **Smooth Transitions**: All animations use easing functions

## Statistics Display

### Real-time Stats
- **Achievements Unlocked**: Total count of unlocked achievements
- **Tasks Completed**: Total completed tasks
- **Evolution Progress**: Percentage toward next stage
- **Progress Bar**: Visual indicator with stage-colored fill

### Milestone Tracker
Visual checklist showing:
- ✨ Hatchling (5 pts)
- 👻 Juvenile (20 pts)
- 🦇 Adult (50 pts)
- 🌙 Elder (100 pts)
- ⭐ Ascended (200 pts)

Unlocked milestones are highlighted with:
- Full color (no grayscale)
- Purple glow border
- Unlock animation on achievement

## Integration

### Location
- **Page**: Deeds & Decrees (Achievements Page)
- **Section**: Featured prominently at the top of the page
- **Position**: Between the page title and stats grid

### Data Sources
- **Achievements**: From `src/utils/achievements.ts`
- **Tasks**: From TasksContext
- **Notes**: From NotesContext (for achievement tracking)

### Hooks Used
- `useSpiritCompanion`: Calculates stats and progress
- `useToast`: Shows interaction messages
- `useTasks`: Tracks task completion
- `useNotes`: Tracks note creation

## Customization

### Adding New Stages
To add a new evolution stage:

1. Update the `EvolutionStage` type in `SpiritCompanion.tsx`
2. Add new case in `getStageInfo()` function
3. Add stage-specific CSS animations
4. Update progress thresholds in `useEffect`
5. Add milestone to the milestones section

### Modifying Point Values
Edit the calculation in `useSpiritCompanion.ts`:
```typescript
const totalProgress = achievementCount * 10 + taskCompletionCount;
```

### Changing Animations
All animations are in `SpiritCompanion.module.css`:
- `@keyframes float`: Main floating motion
- `@keyframes pulse`: Glow pulse effect
- `@keyframes particleFloat`: Particle animations
- Stage-specific: `eggWobble`, `sparkle`, `hover`, `ascendedGlow`

## Accessibility

- **Keyboard Accessible**: Can be focused and activated
- **Screen Reader**: Descriptive labels for all elements
- **Reduced Motion**: Consider adding `prefers-reduced-motion` support
- **Color Contrast**: All text meets WCAG standards

## Performance

### Optimizations
- **CSS Animations**: GPU-accelerated transforms
- **Memoization**: Stats calculated with `useMemo`
- **Conditional Rendering**: Evolution effect only when evolving
- **Efficient Updates**: Only re-renders on stat changes

### Best Practices
- Uses `transform` and `opacity` for animations
- Minimal DOM manipulation
- Debounced interaction handlers
- Lazy loading of particle effects

## Future Enhancements

### Potential Features
1. **Customization**: Choose companion appearance/theme
2. **Abilities**: Unlock special abilities at each stage
3. **Interactions**: More interaction types (feed, play, train)
4. **Achievements**: Companion-specific achievements
5. **Persistence**: Save companion state to cloud
6. **Multiple Companions**: Collect different spirit types
7. **Mini-games**: Interactive activities with companion
8. **Rewards**: Unlock themes/features through companion

### Advanced Ideas
- **Voice Lines**: Audio feedback on interaction
- **Seasonal Variants**: Special appearances for holidays
- **Social Features**: Share companion progress
- **Companion Quests**: Special challenges for evolution
- **Companion Shop**: Cosmetic items and accessories

## Troubleshooting

### Companion Not Evolving
- Check achievement count in stats
- Verify task completion count
- Ensure progress calculation is correct
- Check console for errors

### Animations Not Working
- Verify CSS module is imported
- Check browser compatibility
- Ensure no conflicting styles
- Test in different browsers

### Performance Issues
- Reduce particle count
- Simplify animations
- Check for memory leaks
- Profile with DevTools

## Technical Details

### File Structure
```
src/
├── components/
│   └── spirit-companion/
│       ├── SpiritCompanion.tsx       # Main component
│       └── SpiritCompanion.module.css # Styles & animations
├── hooks/
│   └── useSpiritCompanion.ts         # Stats calculation hook
└── utils/
    └── achievements.ts                # Achievement definitions
```

### Dependencies
- React (hooks: useState, useEffect, useMemo)
- Context API (TasksContext, NotesContext, ToastContext)
- CSS Modules for scoped styling
- TypeScript for type safety

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox
- CSS Animations and Transforms
- ES6+ JavaScript features

## Credits

Designed to enhance productivity through gamification while maintaining the dark, mystical theme of the Dark Productivity Suite.
