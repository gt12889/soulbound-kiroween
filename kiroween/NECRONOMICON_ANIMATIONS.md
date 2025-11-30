# Necronomicon Notes - Theme Animations

## Overview
Added mystical, ancient library-themed animations to enhance the Necronomicon Notes experience.

## Animations Added

### NotePage.module.css

#### 1. **Floating Mystical Particles**
- Subtle purple particle effects that float across the page background
- Creates an ethereal, magical atmosphere
- 20-second infinite loop with varying opacity

#### 2. **Parchment Appearance**
- Smooth fade-in and slide-up animation when page loads
- Includes subtle 3D rotation effect
- Duration: 0.8s

#### 3. **Subtle Float Animation**
- Gentle up-and-down floating motion on the parchment
- 6-second infinite loop
- Creates a sense of the page being suspended in air

#### 4. **Candle Flicker Effect**
- Ambient warm glow that simulates candlelight
- Radial gradient with flickering opacity and scale
- 4-second infinite loop with varying intensity

#### 5. **Title Fade-In**
- Note title appears with smooth fade and slide animation
- Duration: 1s

#### 6. **Title Glow on Focus**
- Purple mystical glow when editing the title
- Pulsing effect that intensifies and fades
- 2-second infinite loop

#### 7. **Content Fade-In**
- Note content appears with slight delay after title
- Smooth fade and slide-up animation
- Duration: 1.2s with 0.2s delay

#### 8. **Enhanced Ink Drip**
- Improved ink drip animation with blur effects
- Simulates ink slowly dripping and dispersing
- Variable timing for each drip (4s cycle)

#### 9. **Empty Message Animation**
- Gentle fade and float effect for empty state message
- Rotating mystical rune symbols (✦) on either side
- 3-second fade cycle, 8-second rotation cycle

### NotesList.module.css

#### 1. **Sidebar Slide-In**
- Entire notes list slides in from the left on load
- Duration: 0.6s

#### 2. **Mystical Shimmer**
- Vertical shimmer effect that travels down the sidebar
- Purple gradient overlay
- 8-second infinite loop

#### 3. **Header Fade-In**
- Header section fades in and slides down
- Duration: 0.8s

#### 4. **Title Pulse**
- "Necronomicon" title has pulsing glow effect
- Text shadow intensifies and fades
- 3-second infinite loop

#### 5. **Note Item Staggered Fade-In**
- Each note item fades in with slight delay
- Creates cascading appearance effect
- Delays: 0.1s, 0.15s, 0.2s, 0.25s, 0.3s, 0.35s

#### 6. **Note Item Hover Enhancement**
- Slides slightly to the right on hover
- Purple glow shadow effect
- Smooth 0.3s transition

#### 7. **Selected Note Glow**
- Active note has pulsing glow effect
- Shadow intensifies and fades
- 2-second infinite loop

#### 8. **Create Button Pulse**
- "+" button has subtle pulsing glow
- Purple shadow effect
- 2-second infinite loop

#### 9. **Empty State Animation**
- Empty state message fades in and out
- Hint text floats up and down
- 2-second fade cycle, 3-second float cycle

## Theme Consistency

All animations maintain the ancient library/mystical theme:
- **Purple/violet** color scheme (rgba(157, 78, 221, ...))
- **Warm candlelight** effects (rgba(255, 200, 100, ...))
- **Subtle movements** - nothing jarring or distracting
- **Mystical symbols** - runes and decorative elements
- **Parchment aesthetic** - aged paper feel with ink effects

## Performance Considerations

- All animations use `transform` and `opacity` for GPU acceleration
- `will-change` property used sparingly on critical animations
- Infinite loops use `ease-in-out` timing for smooth transitions
- Particle effects use pseudo-elements to avoid extra DOM nodes

## Accessibility

- Animations are purely decorative and don't affect functionality
- All interactive elements maintain proper focus states
- Text remains readable throughout all animation states
- Users with `prefers-reduced-motion` can disable via CSS media query (future enhancement)
