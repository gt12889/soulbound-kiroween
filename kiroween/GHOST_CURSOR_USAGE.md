# GhostCursor Implementation Guide

## Overview

The `GhostCursor` component adds a beautiful, smoky ghostly trail effect to page headers. It uses Three.js for WebGL rendering with bloom effects and film grain for a mystical appearance.

## Files Created

1. **`src/components/common/GhostCursor.tsx`** - Core Three.js cursor effect component
2. **`src/components/common/GhostCursor.css`** - Styles for the cursor container
3. **`src/components/common/PageHeader.tsx`** - Wrapper component with integrated cursor
4. **`src/components/common/PageHeader.module.css`** - Styles for page headers

## Quick Start

### Method 1: Using PageHeader Component (Recommended)

The easiest way to add the ghost cursor is to use the `PageHeader` component:

```tsx
import PageHeader from '../common/PageHeader';

// In your component:
<PageHeader 
  title="Your Page Title" 
  subtitle="Optional subtitle"
  cursorColor="#B19EEF"
  cursorBrightness={1}
>
  {/* Optional: header actions or other content */}
  <div className={styles.headerActions}>
    <button>Action Button</button>
  </div>
</PageHeader>
```

### Method 2: Using GhostCursor Directly

For more control, use the `GhostCursor` component directly:

```tsx
import GhostCursor from '../common/GhostCursor';

<header className={styles.header}>
  <GhostCursor
    color="#B19EEF"
    brightness={1}
    trailLength={50}
    bloomStrength={0.15}
    mixBlendMode="screen"
    zIndex={1}
  />
  <div className={styles.content}>
    <h1>Your Title</h1>
    <p>Your subtitle</p>
  </div>
</header>
```

## Example Implementation

### Before (GraveyardView):

```tsx
<header className={styles.header}>
  <h1 className={styles.title}>Graveyard Dashboard</h1>
  <p className={styles.subtitle}>Where tasks come to rest</p>
  <div className={styles.headerActions}>
    {/* buttons */}
  </div>
</header>
```

### After (GraveyardView):

```tsx
import PageHeader from '../common/PageHeader';

<PageHeader 
  title="Graveyard Dashboard" 
  subtitle="Where tasks come to rest"
  cursorColor="#B19EEF"
  className={styles.header}
>
  <div className={styles.headerActions}>
    {/* buttons */}
  </div>
</PageHeader>
```

## Customization Options

### PageHeader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Main heading text |
| `subtitle` | `string` | optional | Subtitle text below title |
| `className` | `string` | `''` | Additional CSS classes |
| `children` | `ReactNode` | optional | Content below subtitle (e.g., buttons) |
| `cursorColor` | `string` | `'#B19EEF'` | Color of the cursor trail |
| `cursorBrightness` | `number` | `1` | Brightness multiplier |
| `enableCursor` | `boolean` | `true` | Toggle cursor effect on/off |

### GhostCursor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | `'#B19EEF'` | Base color of the effect |
| `brightness` | `number` | `1` | Brightness multiplier |
| `trailLength` | `number` | `50` | Number of trail points |
| `inertia` | `number` | `0.5` | Momentum after pointer leaves |
| `grainIntensity` | `number` | `0.05` | Film grain intensity |
| `bloomStrength` | `number` | `0.1` | Bloom glow intensity |
| `bloomRadius` | `number` | `1.0` | Bloom radius |
| `bloomThreshold` | `number` | `0.025` | Bloom activation threshold |
| `mixBlendMode` | `string` | `'screen'` | CSS blend mode |
| `edgeIntensity` | `number` | `0` | Edge darkening (0-1) |
| `fadeDelayMs` | `number` | `1000` (desktop) | Delay before fade starts |
| `fadeDurationMs` | `number` | `1500` (desktop) | Fade out duration |
| `zIndex` | `number` | `10` | Z-index of the effect |

## Applying to Other Pages

### AchievementsPage

```tsx
import PageHeader from '../common/PageHeader';

<PageHeader 
  title="Achievements & Streaks" 
  subtitle="Track your dark productivity journey"
  cursorColor="#FFD700"
  cursorBrightness={1.2}
>
  {/* header content */}
</PageHeader>
```

### FocusedTimerPage

```tsx
import PageHeader from '../common/PageHeader';

<PageHeader 
  title="Focused Timer" 
  subtitle="Deep work sessions in the shadows"
  cursorColor="#8B0000"
  cursorBrightness={0.9}
>
  {/* timer controls */}
</PageHeader>
```

### GhostWriter (Notes)

```tsx
import PageHeader from '../common/PageHeader';

<PageHeader 
  title="Necronomicon Notes" 
  subtitle="Ancient knowledge preserved"
  cursorColor="#9932CC"
>
  {/* note actions */}
</PageHeader>
```

### CursedCalendar

```tsx
import PageHeader from '../common/PageHeader';

<PageHeader 
  title="Cursed Calendar" 
  subtitle="Events written in the void"
  cursorColor="#483D8B"
>
  {/* calendar controls */}
</PageHeader>
```

## Color Schemes by Theme

Match the cursor to your page theme:

- **Purple (Default)**: `#B19EEF` - Mystical, general purpose
- **Gold**: `#FFD700` - Achievements, rewards
- **Dark Red**: `#8B0000` - Focus, intensity
- **Deep Purple**: `#9932CC` - Notes, knowledge
- **Dark Slate**: `#483D8B` - Calendar, time
- **Teal**: `#008B8B` - Tasks, completion
- **Crimson**: `#DC143C` - Warnings, important

## Performance Notes

- **Auto-optimizes** for mobile devices (lower resolution, faster fade)
- **Stops rendering** when cursor is idle to save battery
- **Adaptive pixel ratio** based on screen size
- **Touch-friendly** with adjusted timings for mobile

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 15+)
- Mobile: ✅ Optimized performance

## Troubleshooting

### Effect not showing

1. Check parent element has `position: relative`
2. Verify Three.js is installed: `npm install three`
3. Check console for WebGL errors

### Performance issues

1. Reduce `trailLength` (try 30 instead of 50)
2. Increase `maxDevicePixelRatio` to 0.3
3. Lower `targetPixels` for mobile

### Cursor offset

The parent element's position affects the cursor tracking. Ensure the header has proper positioning.

## Migration Checklist

To add GhostCursor to an existing page:

- [ ] Install Three.js if not already: `npm install three`
- [ ] Import `PageHeader` component
- [ ] Replace `<header>` with `<PageHeader>`
- [ ] Move title text to `title` prop
- [ ] Move subtitle to `subtitle` prop  
- [ ] Move header actions inside `<PageHeader>` as children
- [ ] Choose appropriate `cursorColor` for your theme
- [ ] Test on mobile and desktop
- [ ] Verify no z-index conflicts

## Example: Full Page Component

```tsx
import React from 'react';
import PageHeader from '../common/PageHeader';
import styles from './MyPage.module.css';

export function MyPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="My Mystical Page"
        subtitle="Where magic happens"
        cursorColor="#B19EEF"
        cursorBrightness={1}
      >
        <div className={styles.actions}>
          <button>Action 1</button>
          <button>Action 2</button>
        </div>
      </PageHeader>

      <main className={styles.content}>
        {/* Page content */}
      </main>
    </div>
  );
}
```

## Next Steps

1. Update other page components to use `PageHeader`
2. Customize colors per page theme
3. Consider adding cursor to modals
4. Add cursor to dashboard widgets (optional)

## Support

For issues or customization help, refer to:
- Three.js docs: https://threejs.org/docs/
- Effect Composer: https://threejs.org/docs/#examples/en/postprocessing/EffectComposer

