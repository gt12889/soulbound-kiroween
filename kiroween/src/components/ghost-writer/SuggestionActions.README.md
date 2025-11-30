# SuggestionActions Component

Action buttons for AI-generated writing suggestions with mystical styling and animations.

## Features

- ✓ **Accept Button** - Green glow effect for accepting suggestions
- ↻ **Regenerate Button** - Purple glow with spinning icon animation
- ✕ **Reject Button** - Red glow with shake animation
- 🎨 **Glassmorphism** - Semi-transparent background with blur effect
- ⌨️ **Keyboard Shortcuts** - Visual hints for keyboard navigation
- 📱 **Responsive** - Adapts to mobile, tablet, and desktop
- ♿ **Accessible** - ARIA labels and keyboard navigation support

## Usage

```tsx
import SuggestionActions from './SuggestionActions';

function MyComponent() {
  const handleAccept = () => {
    // Insert suggestion into editor
    console.log('Accepted!');
  };

  const handleReject = () => {
    // Clear suggestion
    console.log('Rejected!');
  };

  const handleRegenerate = () => {
    // Request new suggestion
    console.log('Regenerating...');
  };

  return (
    <SuggestionActions
      onAccept={handleAccept}
      onReject={handleReject}
      onRegenerate={handleRegenerate}
      showShortcuts={true}
      disabled={false}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onAccept` | `() => void` | Required | Callback when Accept button is clicked |
| `onReject` | `() => void` | Required | Callback when Reject button is clicked |
| `onRegenerate` | `() => void` | Required | Callback when Regenerate button is clicked |
| `disabled` | `boolean` | `false` | Disables all buttons |
| `showShortcuts` | `boolean` | `true` | Shows keyboard shortcut hints |

## Keyboard Shortcuts

The component displays hints for these shortcuts (actual implementation should be in parent):

- **Tab** or **Enter** - Accept suggestion
- **Esc** - Reject suggestion
- **Ctrl+R** - Regenerate suggestion

## Styling

### Color Scheme

- **Accept**: Green (`#10b981`) - Success, positive action
- **Regenerate**: Purple (`#8b5cf6`) - Mystical, creative action
- **Reject**: Red (`#ef4444`) - Dismissal, negative action

### Animations

- **Accept**: Pulsing icon on hover
- **Regenerate**: Spinning icon on hover
- **Reject**: Shaking icon on hover
- **All buttons**: Scale up on hover (1.05x), scale down on click (0.95x)

### Responsive Behavior

#### Desktop (>1024px)
- Horizontal layout
- All buttons in a row
- Keyboard shortcuts visible

#### Tablet (768-1024px)
- Horizontal layout
- Slightly smaller buttons
- Keyboard shortcuts visible

#### Mobile (<768px)
- Vertical layout (stacked)
- Full-width buttons
- Keyboard shortcuts hidden
- Larger touch targets

## Accessibility

### ARIA Labels

Each button includes descriptive ARIA labels:
- `aria-label="Accept suggestion (Tab or Enter)"`
- `aria-label="Regenerate suggestion (Ctrl+R)"`
- `aria-label="Reject suggestion (Esc)"`

### Keyboard Navigation

- Buttons are focusable with Tab key
- Focus indicators with colored outlines
- Disabled state prevents interaction

### Screen Reader Support

- Container has `role="toolbar"`
- Container has `aria-label="Suggestion actions"`
- Icons are marked `aria-hidden="true"`

## Integration Example

```tsx
import React, { useState } from 'react';
import SuggestionDisplay from './SuggestionDisplay';
import SuggestionActions from './SuggestionActions';

function GhostWriter() {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAccept = () => {
    if (suggestion) {
      // Insert into editor
      insertText(suggestion);
      setSuggestion(null);
    }
  };

  const handleReject = () => {
    setSuggestion(null);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const newSuggestion = await generateSuggestion();
      setSuggestion(newSuggestion);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {suggestion && (
        <>
          <SuggestionDisplay suggestion={suggestion} />
          <SuggestionActions
            onAccept={handleAccept}
            onReject={handleReject}
            onRegenerate={handleRegenerate}
            disabled={isGenerating}
          />
        </>
      )}
    </div>
  );
}
```

## Design Specifications

Based on Ghost Writer UX Design Document:

### Visual Treatment
- Glassmorphism with `backdrop-filter: blur(10px)`
- Semi-transparent background: `rgba(0, 0, 0, 0.4)`
- Border with purple tint: `rgba(139, 92, 246, 0.3)`
- Shadow with purple glow

### Button States
- **Default**: Colored border with glow
- **Hover**: Brighter glow + scale(1.05) + icon animation
- **Active**: scale(0.95)
- **Disabled**: 50% opacity, no interaction

### Animation Timings
- Hover transition: 150ms
- Icon animations: 400-1000ms
- Scale transitions: 150ms

## Browser Support

- Modern browsers with CSS Grid and Flexbox
- Backdrop filter support (fallback to solid background)
- CSS animations (graceful degradation with `prefers-reduced-motion`)

## Performance

- CSS-only animations (no JavaScript)
- Hardware-accelerated transforms
- Minimal repaints and reflows
- Optimized for 60fps

## Testing

See `SuggestionActions.example.tsx` for interactive examples.

## Related Components

- `SuggestionDisplay` - Displays the suggestion text
- `GhostLoadingIndicator` - Shows loading state
- `GhostWriter` - Main container component
