# GhostLoadingIndicator Component

A mystical loading indicator component for the Ghost Writer feature, displaying ethereal animations while AI generates suggestions.

## Features

✨ **Ghostly Particle Animation** - 12 floating particles with random drift patterns  
🌟 **Pulsing Glow Effect** - Dynamic purple glow that pulses with the loading state  
🔄 **Rotating Ethereal Rings** - Three concentric rings rotating at different speeds  
👻 **Floating Ghost Icon** - Central ghost emoji with gentle floating animation  
💬 **Customizable Message** - Thematic loading message (default: "Summoning spirits...")  
📊 **Optional Progress Bar** - Visual progress indicator with shimmer effect  
❌ **Cancel Button** - Optional cancellation with hover effects  
📱 **Fully Responsive** - Adapts to mobile, tablet, and desktop screens  
♿ **Accessible** - ARIA labels, screen reader support, and keyboard navigation  
🎨 **Theme Consistent** - Matches the gothic/mystical aesthetic of Kiroween

## Props

```typescript
interface GhostLoadingIndicatorProps {
  message?: string;        // Loading message (default: "Summoning spirits...")
  progress?: number;       // Progress value 0-100 (optional)
  onCancel?: () => void;   // Cancel callback (optional)
  showCancel?: boolean;    // Show cancel button (default: true)
}
```

## Usage

### Basic Usage

```tsx
import GhostLoadingIndicator from './GhostLoadingIndicator';

<GhostLoadingIndicator />
```

### With Custom Message

```tsx
<GhostLoadingIndicator message="Channeling ethereal wisdom..." />
```

### With Progress

```tsx
<GhostLoadingIndicator 
  message="Summoning spirits..." 
  progress={50}
/>
```

### With Cancel Button

```tsx
<GhostLoadingIndicator 
  message="Summoning spirits..." 
  onCancel={() => console.log('Cancelled')}
  showCancel={true}
/>
```

### Full Featured

```tsx
<GhostLoadingIndicator 
  message="Channeling ethereal wisdom from beyond..." 
  progress={75}
  onCancel={handleCancel}
  showCancel={true}
/>
```

## Integration with Ghost Writer

The component is designed to be used as an overlay in the Ghost Writer component:

```tsx
const GhostWriter: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className={styles.editorWrapper}>
      <WritingEditor />
      
      {isGenerating && (
        <GhostLoadingIndicator 
          message="Summoning spirits..." 
          onCancel={() => setIsGenerating(false)}
        />
      )}
    </div>
  );
};
```

## Animations

### Particle Animation
- 12 particles float upward from bottom to top
- Random horizontal drift for organic movement
- Fade in/out for smooth appearance
- Staggered animation delays for natural flow

### Spinner Animation
- Three concentric rings rotating at different speeds
- Pulsing glow effect (2s cycle)
- Central ghost icon with gentle float (2s cycle)
- Purple and blue color scheme

### Progress Bar
- Shimmer effect moving across the bar
- Smooth width transitions
- Glowing shadow effect

### Cancel Button
- Hover: Lift effect with enhanced glow
- Active: Press down effect
- Focus: Visible outline for keyboard navigation

## Accessibility

- **ARIA Attributes**: `role="status"`, `aria-live="polite"`, `aria-label`
- **Progress Bar**: Proper `progressbar` role with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- **Keyboard Navigation**: Cancel button is keyboard accessible
- **Screen Readers**: Status updates announced to screen readers
- **Reduced Motion**: Respects `prefers-reduced-motion` media query

## Responsive Design

### Desktop (>1024px)
- Full-size spinner (120px)
- All 12 particles visible
- Large ghost icon (2.5rem)

### Tablet (768-1024px)
- Medium spinner (100px)
- All particles visible
- Medium ghost icon (2rem)

### Mobile (<768px)
- Smaller spinner (80px)
- Reduced particles (6 visible)
- Small ghost icon (1.5rem)
- Optimized for performance

## Performance

- **CSS-only animations** - No JavaScript animation loops
- **GPU acceleration** - Uses `transform` and `opacity` for smooth 60fps
- **Reduced particles on mobile** - Only 6 particles on small screens
- **Reduced motion support** - Disables animations when requested
- **Efficient rendering** - Minimal DOM updates

## Styling

The component uses CSS modules for scoped styling and follows the Kiroween theme:

- **Colors**: Purple (`#8b5cf6`), Blue (`#3d5a80`), Dark backgrounds
- **Fonts**: 'Lora' for text, matching the gothic aesthetic
- **Effects**: Backdrop blur, drop shadows, glows
- **Transitions**: Smooth 0.2-0.3s transitions

## Testing

Comprehensive test suite included:

- ✅ Renders with default message
- ✅ Renders with custom message
- ✅ Cancel button functionality
- ✅ Progress bar rendering and clamping
- ✅ ARIA attributes
- ✅ Particle count
- ✅ Ghost icon presence

Run tests:
```bash
npm test GhostLoadingIndicator.test.tsx
```

## Files

- `GhostLoadingIndicator.tsx` - Component implementation
- `GhostLoadingIndicator.module.css` - Scoped styles and animations
- `GhostLoadingIndicator.test.tsx` - Test suite
- `GhostLoadingIndicator.example.tsx` - Usage examples
- `GhostLoadingIndicator.README.md` - This documentation

## Design Alignment

This component implements the design specifications from:
- **Design Document**: `.kiro/specs/ghost-writer-ux/design.md`
- **Requirements**: `.kiro/specs/ghost-writer-ux/requirements.md`
- **Task**: Phase 2, Task 2.1

### Design Requirements Met

✅ Ghostly particle animation (CSS)  
✅ Pulsing glow effect  
✅ "Summoning spirits..." message  
✅ Cancel button  
✅ Responsive design  
✅ Semi-transparent overlay (rgba(0,0,0,0.7))  
✅ Centered loading spinner with ghost icon  
✅ Animated dots/mist effect (particles)  
✅ Progress indicator (optional)  
✅ Subtle cancel button (bottom-right)  

## Future Enhancements

Potential improvements for future iterations:

- [ ] Estimated time display
- [ ] Multiple message variations
- [ ] Sound effects (optional)
- [ ] Haptic feedback on mobile
- [ ] Animation intensity settings
- [ ] Custom particle count
- [ ] Theme color customization

## License

Part of the Kiroween project.
