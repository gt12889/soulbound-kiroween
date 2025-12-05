# StreakTokens Component

A visual component that displays recovery tokens in a ●●○ style format with tooltip explanation and milestone tracking.

## Features

- **Visual Token Display**: Shows tokens as filled (●) or empty (○) circles
- **Tooltip Explanation**: Hover-activated tooltip with detailed information
- **Milestone Tracking**: Shows progress toward earning next token
- **Animations**: Pulse effect on available tokens
- **Accessibility**: Full ARIA support and keyboard navigation
- **Responsive**: Mobile-optimized layout
- **Theme-Aware**: Uses CSS variables for consistent theming

## Usage

### Basic Usage

```tsx
import { StreakTokens } from './components/streaks/StreakTokens';

function MyComponent() {
  return <StreakTokens availableTokens={2} />;
}
```

### With Milestone Tracking

```tsx
<StreakTokens 
  availableTokens={1}
  nextTokenMilestone={30}
  daysUntilNextToken={7}
/>
```

### With Custom Styling

```tsx
<StreakTokens 
  availableTokens={3}
  className="my-custom-class"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `availableTokens` | `number` | Yes | - | Number of available tokens (0-3) |
| `nextTokenMilestone` | `number` | No | - | Next milestone to earn a token (30 or 100) |
| `daysUntilNextToken` | `number` | No | - | Days remaining until next milestone |
| `className` | `string` | No | `''` | Custom CSS class name |

## Token System

### Earning Tokens
- **30-day streak**: Earn 1 token
- **100-day streak**: Earn 2 tokens
- **Maximum**: 3 tokens total

### Using Tokens
- Tokens can restore a broken streak
- Must be used within 48 hours of breaking streak
- Each use consumes 1 token

## Visual States

### Available Tokens (●)
- Filled circle
- Accent color with glow effect
- Pulse animation

### Empty Tokens (○)
- Empty circle
- Muted color
- No animation

## Tooltip Content

The tooltip displays:
1. **Explanation**: What recovery tokens are
2. **How to Earn**: Milestone requirements
3. **Next Token** (optional): Progress toward next milestone

## Accessibility

### ARIA Support
- `role="img"` on token display with descriptive label
- `role="tooltip"` on tooltip content
- `aria-hidden="true"` on decorative elements

### Keyboard Support
- Tooltip appears on hover (CSS-based)
- All content accessible via keyboard navigation

### Screen Reader Support
- Meaningful labels: "2 of 3 recovery tokens available"
- Hidden decorative emojis
- Semantic HTML structure

### Visual Accessibility
- High contrast mode support
- Reduced motion support
- Color-blind friendly design

## Responsive Design

### Desktop (>768px)
- Full tooltip with all information
- Inline milestone info visible
- Larger token icons

### Mobile (≤768px)
- Compact layout
- Inline milestone info hidden
- Tooltip repositioned for better visibility
- Touch-friendly sizing

## Styling

The component uses CSS modules with theme-aware variables:

```css
--bg-secondary: Background color
--bg-tertiary: Tooltip background
--border-color: Border color
--accent-color: Token color
--accent-rgb: Token glow effect
--text-primary: Primary text
--text-secondary: Secondary text
--text-muted: Muted text
```

## Animation

### Pulse Animation
Available tokens pulse with a glow effect:
- Duration: 2 seconds
- Easing: ease-in-out
- Infinite loop
- Respects `prefers-reduced-motion`

## Integration

### With StreakContext

```tsx
import { useStreak } from '../../contexts/StreakContext';
import { StreakTokens } from './StreakTokens';

function StreakDashboard() {
  const { streaks } = useStreak();
  const availableTokens = streaks?.tokens.available ?? 0;
  
  // Calculate next milestone
  const currentStreak = streaks?.loginStreak.current ?? 0;
  const nextMilestone = currentStreak < 30 ? 30 : 100;
  const daysUntil = nextMilestone - currentStreak;
  
  return (
    <StreakTokens 
      availableTokens={availableTokens}
      nextTokenMilestone={nextMilestone}
      daysUntilNextToken={daysUntil}
    />
  );
}
```

## Testing

The component has comprehensive test coverage:
- Token display rendering
- Tooltip content
- Accessibility features
- Custom styling
- Visual states
- Edge cases

Run tests:
```bash
npm test -- StreakTokens.test.tsx
```

## Examples

See `StreakTokens.example.tsx` for interactive examples demonstrating:
- Different token counts (0-3)
- Milestone tracking
- Custom styling
- Dashboard integration
- Multiple displays

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid support required
- CSS custom properties support required
- Hover support (desktop)
- Touch support (mobile)

## Performance

- Lightweight component (~2KB gzipped)
- No JavaScript for tooltip (CSS-based)
- Minimal re-renders
- Optimized animations

## Related Components

- `StreakRecoveryModal`: Uses tokens to recover streaks
- `StreakCard`: Displays individual streak information
- `StreakDashboard`: Main dashboard showing all streaks

## Requirements

Implements Task 3.3 from the Streak & Habit Tracking spec:
- ✅ Show token count (●●○ style)
- ✅ Add tooltip explaining tokens
- ✅ Show next token milestone
- ✅ Animate token earning

## License

Part of the Kiroween project.
