# Particle Effects Demo

## Overview

The Spirit Companion now features three types of particle effects for special moments:

## 1. Click Particles

**Trigger**: User clicks on the companion
**Visual**: 12 cyan particles burst outward in a circular pattern
**Duration**: 800ms

```
     *
  *     *
*    🥚    *
  *     *
     *
```

## 2. Evolution Particles

**Trigger**: Companion evolves to a new stage
**Visual**: 20 purple particles explode radially with varying sizes
**Duration**: 1500ms

```
   * * *
 *   ✨   *
*    🦇    *
 *   ⭐   *
   * * *
```

## 3. Celebration Particles

**Trigger**: User completes a task
**Visual**: 20 colorful confetti + 8 stars
**Duration**: 1800ms

```
  ⭐ * * ⭐
 *  🎊  *
⭐  👻  ⭐
 *  🎉  *
  ⭐ * * ⭐
```

## CSS Variables Used

- `--particle-delay`: Stagger timing
- `--particle-angle`: Radial position
- `--particle-distance`: Distance from center
- `--confetti-color`: Random HSL color

## Accessibility

All effects respect `prefers-reduced-motion: reduce`
