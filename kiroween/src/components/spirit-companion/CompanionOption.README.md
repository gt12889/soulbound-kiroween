# CompanionOption Component

A selectable card component for choosing a Spirit Companion during the initial selection process.

## Visual Design

```
┌─────────────────────────────────────┐
│                              ✓      │  ← Selection indicator (when selected)
│                                     │
│            🥚                       │  ← Large animated emoji
│         (floating)                  │
│                                     │
│       Shadow Spirit                 │  ← Companion name (colored)
│     Ethereal Shadows                │  ← Theme (italic)
│                                     │
│  Mysterious and wise, dwelling      │  ← Personality description
│  in the spaces between light        │
│  and dark                           │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│      Evolution Path:                │  ← Evolution preview label
│   🥚 ✨ 👻 🦇 🌙 ⭐                 │  ← Mini stage emojis
│                                     │
└─────────────────────────────────────┘
```

## States

### Default State
- 3px border in companion color
- Subtle glow
- Floating emoji animation

### Hover State
- Scale 1.05
- Enhanced glow
- Faster emoji animation

### Selected State
- 4px border
- Pulsing glow animation
- Checkmark indicator in top-right
- Brighter colors

## Color Themes

### Shadow Spirit (Purple)
- Primary: `#9d4edd`
- Secondary: `#240046`
- Glow: Purple radial gradient

### Forest Familiar (Green)
- Primary: `#10b981`
- Secondary: `#064e3b`
- Glow: Green radial gradient

### Ember Phoenix (Orange)
- Primary: `#f97316`
- Secondary: `#7c2d12`
- Glow: Orange radial gradient

## Animations

1. **Card Entrance** (0.6s)
   - Fade in from 0 to 1 opacity
   - Slide up 30px
   - Scale from 0.9 to 1
   - Staggered delay (0.1s, 0.2s, 0.3s)

2. **Emoji Float** (4s loop)
   - Gentle up/down motion (-10px)
   - Slight rotation (±5deg)
   - Smooth ease-in-out

3. **Hover Emoji** (2s loop)
   - Enhanced motion (-15px)
   - Larger rotation (±10deg)
   - Scale 1.1

4. **Selection Pulse** (2s loop)
   - Glow intensity varies
   - Box shadow 40px to 60px
   - Smooth ease-in-out

5. **Checkmark Appear** (0.4s)
   - Scale from 0 to 1.2 to 1
   - Rotate from -180deg to 0deg
   - Bounce effect

## Accessibility

### Keyboard Navigation
- **Tab**: Focus on card
- **Enter/Space**: Select companion
- **Shift+Tab**: Focus previous card

### Screen Reader
- Role: `radio`
- Label: `"[Name]: [Personality]"`
- State: `aria-checked="true/false"`

### Focus Indicators
- 3px outline in companion color
- 4px offset from card
- High contrast

## Responsive Design

### Desktop (>768px)
- Width: 280px
- Height: 400px
- Emoji: 6rem
- Name: 1.5rem

### Mobile (≤768px)
- Width: 240px
- Height: 360px
- Emoji: 5rem
- Name: 1.3rem

### Small Mobile (≤480px)
- Width: 100% (max 280px)
- Maintains aspect ratio

## Usage

```tsx
import { CompanionOption } from './CompanionOption';
import { COMPANION_TYPES } from '../../types/companion';

function SelectionModal() {
  const [selected, setSelected] = useState<CompanionType | null>(null);

  return (
    <div>
      {Object.values(COMPANION_TYPES).map((companion) => (
        <CompanionOption
          key={companion.type}
          companion={companion}
          isSelected={selected === companion.type}
          onSelect={() => setSelected(companion.type)}
        />
      ))}
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `companion` | `CompanionDefinition` | Yes | Companion data including name, emoji, stages |
| `isSelected` | `boolean` | Yes | Whether this option is currently selected |
| `onSelect` | `() => void` | Yes | Callback when card is clicked/selected |

## CSS Variables

The component uses these CSS variables for theming:

```css
--companion-primary: /* Set via inline style */
--companion-secondary: /* Set via inline style */
--font-header: /* From theme */
--font-body: /* From theme */
--text-primary: /* From theme */
--text-secondary: /* From theme */
--accent-purple: /* Fallback color */
--accent-purple-light: /* Fallback color */
```

## Performance

- Lightweight: ~2KB component + ~3KB styles
- GPU-accelerated animations
- No JavaScript animations (CSS only)
- Optimized for 60fps

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Reduced Motion

Respects `prefers-reduced-motion` media query:
- Disables floating animations
- Simplifies entrance animation
- Removes pulsing effects
- Maintains functionality

## Testing

Comprehensive test coverage includes:
- Rendering all companion information
- Evolution preview display
- Click interactions
- Selection state changes
- ARIA attributes
- Keyboard accessibility
- All three companion types
- CSS variable application

Run tests:
```bash
npm test CompanionOption.test.tsx
```

## Demo

View the interactive demo:
```tsx
import { CompanionOptionDemo } from './CompanionOption.demo';
```

The demo shows all three companions side-by-side with interactive selection.
