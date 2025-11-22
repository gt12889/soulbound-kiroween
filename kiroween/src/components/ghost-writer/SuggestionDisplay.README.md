# SuggestionDisplay Component

## Overview

The `SuggestionDisplay` component is a mystical UI element that displays AI-generated writing suggestions with ghostly styling and smooth animations. It's part of the Ghost Writer UX improvements (Task 3.1).

## Features

### ✅ Implemented

1. **Ghostly Styling**
   - Purple tint background: `rgba(139, 92, 246, 0.1)`
   - 3px solid purple left border for visual distinction
   - Box shadow with purple glow effect
   - Glassmorphism with backdrop blur

2. **Fade-in Animation**
   - Smooth 0.5s entrance animation
   - Combines opacity transition with scale effect
   - Initial state: hidden (opacity 0, translateY 10px)
   - Final state: visible (opacity 0.9, translateY 0)

3. **Slide-up Entrance Effect**
   - Integrated with fade-in animation
   - Starts 10px below final position
   - Smooth ease-out timing function
   - Slight overshoot effect for natural feel

4. **Italic Text Styling**
   - Font-style: italic for distinction from user text
   - Proper typography with 1.6 line-height
   - Optimized text rendering
   - Word wrapping for long text

5. **Long Suggestion Handling**
   - Scrollable container with max-height: 300px
   - Custom styled scrollbar (purple theme)
   - Smooth scrolling behavior
   - Responsive max-height on mobile

## Component API

```typescript
interface SuggestionDisplayProps {
  suggestion: GhostSuggestionType;
  cursorPosition?: { x: number; y: number };
  isAccepting?: boolean;
}
```

### Props

- `suggestion` (required): The AI suggestion object containing id, text, position, and confidence
- `cursorPosition` (optional): Absolute positioning coordinates for the suggestion
- `isAccepting` (optional): Triggers the acceptance animation with green glow

## Visual Design

### Colors
- Background: `rgba(139, 92, 246, 0.1)` (purple tint)
- Border: `var(--accent-purple, #8b5cf6)`
- Text: `rgba(224, 224, 224, 0.95)`
- Glow: `rgba(139, 92, 246, 0.3)`

### Animations
- **ghostAppear**: 0.5s fade-in with slide-up
- **pulseGlow**: 3s infinite pulsing glow effect
- **floatGhost**: 3s infinite floating ghost indicator
- **acceptGlow**: 0.5s green glow transition when accepting

### Layout
- Max-width: 600px (desktop), 90vw (mobile)
- Min-width: 300px (desktop), 200px (mobile)
- Padding: 1rem 1.5rem
- Border-radius: 8px
- Z-index: 1000

## Accessibility

- ARIA role: "region"
- ARIA label: "AI writing suggestion"
- ARIA live: "polite" for screen reader announcements
- Keyboard navigation support (via parent component)
- High contrast mode support
- Reduced motion support

## Responsive Design

### Desktop (>768px)
- Full width up to 600px
- Standard padding and font sizes
- Max-height: 300px for scrolling

### Tablet (≤768px)
- Max-width: 90vw
- Slightly reduced padding
- Font-size: 0.9375rem
- Max-height: 200px

### Mobile (≤480px)
- Max-width: 95vw
- Compact padding
- Font-size: 0.875rem
- Max-height: 150px
- Smaller ghost indicator

## Testing

Comprehensive test suite with 14 tests covering:
- ✅ Rendering suggestion text
- ✅ Ghost indicator display
- ✅ ARIA attributes
- ✅ Visibility animation
- ✅ Accepting state
- ✅ Cursor positioning
- ✅ Long text scrolling
- ✅ Italic styling
- ✅ Purple tint background
- ✅ Left border styling
- ✅ Glow effect layer
- ✅ Ghost indicator styling
- ✅ Empty text handling
- ✅ Z-index layering

All tests passing ✓

## Usage Example

```tsx
import SuggestionDisplay from './SuggestionDisplay';

const suggestion = {
  id: 'suggestion-1',
  text: 'The spirits whisper ancient wisdom...',
  position: 42,
  confidence: 0.85,
};

const cursorPos = { x: 100, y: 200 };

<SuggestionDisplay
  suggestion={suggestion}
  cursorPosition={cursorPos}
  isAccepting={false}
/>
```

## Files Created

- `SuggestionDisplay.tsx` - Component implementation
- `SuggestionDisplay.module.css` - Styling and animations
- `SuggestionDisplay.test.tsx` - Test suite
- `SuggestionDisplay.README.md` - This documentation

## Next Steps

This component is ready for integration with:
- Task 3.2: Action Buttons Component (Accept, Regenerate, Reject)
- Task 3.3: Integration with GhostWriter main component
- Task 4.1: Accept Animation enhancements

## Design Compliance

✅ Matches design document specifications:
- Purple tint background (rgba(139, 92, 246, 0.1))
- 3px solid left border
- Italic font styling
- 0.9 opacity
- Purple glow box-shadow
- Fade-in + slide-up animation (0.3-0.5s)
- Scrollable for long content
- Responsive design
- Accessibility features
