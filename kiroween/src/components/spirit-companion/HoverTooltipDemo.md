# Hover Tooltip Demo

## Visual Demonstration

This document demonstrates the hover tooltip functionality for the Interactive Companion.

## How It Works

### 1. Default State (No Hover)
```
┌─────────────────────┐
│                     │
│                     │
│        🥚          │  ← Companion (Egg stage)
│                     │
│                     │
└─────────────────────┘
```

### 2. Hover State (Tooltip Visible)
```
     ┌──────────────────┐
     │ Mysterious Egg   │  ← Tooltip with name
     │ Mood: Neutral    │  ← Tooltip with mood
     └────────▼─────────┘
           ▼ (tail)
┌─────────────────────┐
│                     │
│        🥚          │  ← Companion (hovered)
│                     │
└─────────────────────┘
```

### 3. With Custom Name
```
     ┌──────────────────┐
     │ Whisper          │  ← Custom name
     │ Mood: Happy      │  ← Current mood
     └────────▼─────────┘
           ▼
┌─────────────────────┐
│                     │
│        👻          │  ← Companion (Juvenile)
│                     │
└─────────────────────┘
```

## Mood States Display

The tooltip displays different mood states:

- **Neutral** - Default state
- **Happy** - Multiple tasks completed
- **Excited** - On a productivity streak
- **Energized** - First task of the day
- **Concerned** - No activity for days
- **Proud** - Major milestone achieved
- **Playful** - Frequent interactions

## Animation Sequence

```
1. Mouse enters companion area
   ↓
2. showTooltip state set to true
   ↓
3. Tooltip fades in (0.2s animation)
   ↓
4. Tooltip visible with name + mood
   ↓
5. Mouse leaves companion area
   ↓
6. showTooltip state set to false
   ↓
7. Tooltip removed from DOM
```

## CSS Animation

```css
@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
```

## Accessibility Features

1. **ARIA Role:** `role="tooltip"`
2. **Screen Reader:** Announces tooltip content
3. **Keyboard:** Tooltip also shows on focus
4. **Non-Interactive:** `pointer-events: none`

## Styling Details

### Colors
- Background: `rgba(0, 0, 0, 0.9)` - Semi-transparent black
- Border: `var(--accent-purple)` - Purple accent
- Text (Name): `var(--accent-purple-light)` - Light purple
- Text (Mood): `var(--text-secondary)` - Secondary text color

### Positioning
- Position: `absolute`
- Top: `-60px` (above companion)
- Left: `50%` with `translateX(-50%)` (centered)
- Z-index: `1000` (above other elements)

### Shadow
- Box shadow: `0 4px 12px rgba(157, 78, 221, 0.3)` - Purple glow

## Example Usage

```tsx
<InteractiveCompanion
  achievementCount={5}
  taskCompletionCount={10}
  onInteract={() => console.log('Companion clicked!')}
/>
```

When user hovers:
- Shows: "Mysterious Egg" (or custom name)
- Shows: "Mood: Neutral" (or current mood)

## Integration with CompanionContext

The tooltip reads from CompanionContext:
- `customNames[activeCompanion]` - Custom name or undefined
- `mood` - Current mood state
- `activeCompanion` - Which companion is active

## Responsive Behavior

On mobile devices:
- Tooltip still works on hover (if supported)
- Also accessible via focus for touch devices
- Positioned to avoid screen edges

## Testing

Run tests with:
```bash
npm test InteractiveCompanion.test.tsx
```

Tests verify:
- ✅ Tooltip appears on hover
- ✅ Tooltip disappears on mouse leave
- ✅ Displays correct name
- ✅ Displays correct mood
- ✅ Proper accessibility

---

**Status:** ✅ Fully Implemented and Tested
