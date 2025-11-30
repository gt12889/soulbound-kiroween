# Ghost Writer UX Improvements - Design

## Architecture

### State Machine
```
IDLE → GENERATING → SUGGESTION_READY → ACCEPTING → ACCEPTED
  ↓         ↓              ↓              ↓
ERROR ← ─ ─ ┴ ─ ─ ─ ─ ─ ─ ┴ ─ ─ ─ ─ ─ ─ ┘
```

### Component Structure
```
GhostWriter
├── WritingEditor (main text area)
├── SuggestionOverlay (when generating/showing)
│   ├── LoadingIndicator
│   ├── SuggestionDisplay
│   └── ActionButtons
└── StatusBar (bottom feedback)
```

## Visual Design

### Loading State
**Animation: "Summoning Spirits"**
```css
- Ghostly particles floating upward
- Pulsing purple glow
- Rotating ethereal circle
- Text: "Summoning spirits from beyond..."
```

**Elements:**
- Semi-transparent overlay (rgba(0,0,0,0.7))
- Centered loading spinner with ghost icon
- Animated dots or mist effect
- Progress indicator (if available)
- Cancel button (subtle, bottom-right)

### Suggestion Display
**Visual Treatment:**
```css
- Background: rgba(139, 92, 246, 0.1) /* Purple tint */
- Border-left: 3px solid var(--accent-purple)
- Font-style: italic
- Opacity: 0.9
- Box-shadow: 0 0 20px rgba(139, 92, 246, 0.3)
```

**Animation: Fade-in + Slide**
```css
@keyframes ghostAppear {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 0.9;
    transform: translateY(0);
  }
}
```

### Action Buttons
**Layout:**
```
[✓ Accept] [↻ Regenerate] [✕ Reject]
```

**Styling:**
- Floating above suggestion
- Glassmorphism effect
- Hover: Glow + scale(1.05)
- Active: scale(0.95)
- Tooltips with keyboard shortcuts

**Button States:**
```css
Accept:
  - Default: Green glow
  - Hover: Brighter green + pulse
  - Shortcut: Tab or Enter

Regenerate:
  - Default: Purple glow
  - Hover: Spin icon + pulse
  - Shortcut: Ctrl+R

Reject:
  - Default: Red glow
  - Hover: Fade effect
  - Shortcut: Esc
```

### Accepting Animation
**Sequence:**
1. Button press → scale down
2. Suggestion glows bright (0.2s)
3. Text transitions to normal style (0.3s)
4. Brief success indicator (checkmark, 0.5s)
5. Fade to normal state

```css
@keyframes acceptSuggestion {
  0% {
    background: rgba(139, 92, 246, 0.1);
    border-left-color: var(--accent-purple);
  }
  50% {
    background: rgba(16, 185, 129, 0.2);
    border-left-color: #10b981;
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
  }
  100% {
    background: transparent;
    border-left-color: transparent;
  }
}
```

### Error State
**Visual:**
- Red tinted overlay
- Error icon (skull or warning)
- Friendly message
- Retry button (prominent)
- Dismiss button (subtle)

**Messages:**
- "The spirits are silent... Try again?"
- "Connection to the ethereal realm lost"
- "The ghost writer needs rest (rate limited)"
- "API key missing - check your settings"

## Interaction Patterns

### Keyboard Shortcuts
```
Tab / Enter    → Accept suggestion
Esc           → Reject suggestion
Ctrl+R        → Regenerate
Ctrl+Space    → Manual trigger
Alt+1/2/3     → Select suggestion variant
```

### Mouse Interactions
```
Click Accept   → Accept with animation
Click Reject   → Fade out suggestion
Click Regen    → Spin icon, fetch new
Hover buttons  → Show tooltip + glow
```

### Touch Interactions
```
Tap Accept     → Accept with haptic
Swipe Right    → Accept
Swipe Left     → Reject
Long Press     → Show options menu
```

## Component APIs

### SuggestionOverlay Props
```typescript
interface SuggestionOverlayProps {
  state: 'loading' | 'ready' | 'accepting' | 'error';
  suggestion: string | null;
  alternatives?: string[];
  onAccept: () => void;
  onReject: () => void;
  onRegenerate: () => void;
  error?: string;
  estimatedTime?: number;
}
```

### LoadingIndicator Props
```typescript
interface LoadingIndicatorProps {
  message?: string;
  progress?: number; // 0-100
  onCancel?: () => void;
  showCancel?: boolean;
}
```

### ActionButtons Props
```typescript
interface ActionButtonsProps {
  onAccept: () => void;
  onReject: () => void;
  onRegenerate: () => void;
  disabled?: boolean;
  showShortcuts?: boolean;
}
```

## Animation Timings

```typescript
const TIMINGS = {
  FADE_IN: 300,           // Suggestion appears
  FADE_OUT: 200,          // Suggestion disappears
  ACCEPT_GLOW: 500,       // Success feedback
  BUTTON_HOVER: 150,      // Button hover effect
  LOADING_PULSE: 2000,    // Loading animation cycle
  ERROR_SHAKE: 400,       // Error shake animation
  TYPING_DELAY: 30,       // Per character (if typing effect)
};
```

## Responsive Behavior

### Desktop (>1024px)
- Buttons float above suggestion
- Tooltips on hover
- Full keyboard shortcuts

### Tablet (768-1024px)
- Buttons below suggestion
- Larger touch targets
- Simplified tooltips

### Mobile (<768px)
- Full-width buttons
- Swipe gestures enabled
- Bottom sheet for options
- Haptic feedback

## Accessibility

### ARIA Labels
```html
<div role="region" aria-label="AI Writing Suggestion">
  <div role="status" aria-live="polite">
    Generating suggestion...
  </div>
  <button aria-label="Accept suggestion (Tab)">
    Accept
  </button>
</div>
```

### Focus Management
1. When suggestion appears → Focus on Accept button
2. On accept → Focus returns to editor
3. On reject → Focus returns to editor
4. Keyboard trap within suggestion overlay

### Screen Reader Announcements
- "Generating AI suggestion"
- "Suggestion ready: [first 50 chars]..."
- "Suggestion accepted"
- "Suggestion rejected"
- "Error: [error message]"

## Performance Optimizations

### CSS Animations
- Use `transform` and `opacity` only
- Enable `will-change` for animated elements
- Use `contain: layout` for isolated components

### React Optimizations
- Memoize suggestion components
- Debounce regenerate button (1s)
- Cancel pending requests on unmount
- Lazy load animation components

### Loading Strategy
- Show loading after 200ms delay (avoid flash)
- Optimistic UI for fast responses
- Cache recent suggestions
- Preload next suggestion in background

## Theme Integration

### Color Palette
```css
--suggestion-bg: rgba(139, 92, 246, 0.1);
--suggestion-border: var(--accent-purple);
--suggestion-glow: rgba(139, 92, 246, 0.3);
--accept-color: #10b981;
--reject-color: #ef4444;
--loading-color: var(--accent-purple-light);
```

### Typography
```css
.suggestion-text {
  font-family: var(--font-body);
  font-style: italic;
  font-size: 1rem;
  line-height: 1.6;
  letter-spacing: 0.01em;
}
```

## Error Recovery

### Retry Strategy
1. First failure → Immediate retry button
2. Second failure → Wait 5s, show retry
3. Third failure → Suggest checking settings
4. Network error → Show offline message

### Fallback Behavior
- If API fails → Show local suggestions
- If timeout → Cancel and notify
- If rate limited → Show cooldown timer
- If invalid key → Link to settings

## Testing Scenarios

### Happy Path
1. User types text
2. Pauses for 1s
3. Loading appears
4. Suggestion appears after 2s
5. User accepts with Tab
6. Text integrates smoothly

### Error Path
1. User types text
2. API fails
3. Error message appears
4. User clicks retry
5. Success on second attempt

### Edge Cases
- Very long suggestions (>500 chars)
- Multiple rapid requests
- Offline mode
- Slow network (>10s)
- Empty suggestions
- Special characters in text
