# Interactive Graveyard with Physics - Requirements

## Overview
Transform the Graveyard Dashboard into an immersive, physics-based experience where tasks are represented as tombstones that respond to environmental forces, moon phases, and user interactions.

## User Stories

### US-1: Wind Physics
**As a user**, I want tombstones to sway naturally in the wind so the graveyard feels alive and atmospheric.

**Acceptance Criteria:**
- Tombstones sway continuously with subtle, random wind patterns
- Wind intensity varies based on time of day (stronger at night)
- High-priority tasks have sturdier tombstones that sway less
- Completed tasks sway more gently (ghostly, ethereal movement)
- Wind can be paused/disabled in settings

### US-2: Interactive Digging
**As a user**, I want to click on tombstones to "dig up" and view task details in an immersive way.

**Acceptance Criteria:**
- Clicking a tombstone triggers a digging animation
- Task details appear in a "dug up" modal with earth/soil texture
- Modal has parchment-style background with aged paper texture
- Animation shows soil particles falling away
- Sound effects: digging sounds, soil falling, parchment rustling
- Can close modal by clicking outside or pressing Escape

### US-3: Ghostly Transparency
**As a user**, I want completed tasks to fade to ghostly transparency so I can visually distinguish them.

**Acceptance Criteria:**
- Completed tombstones gradually fade to 30% opacity over 2 seconds
- Ghostly glow effect around completed tombstones
- Slight upward float animation (rising spirits)
- Can toggle visibility of completed tasks
- Ghostly particles emanate from completed tombstones

### US-4: Moon Phase Lighting
**As a user**, I want the graveyard lighting to change based on moon phases for atmospheric immersion.

**Acceptance Criteria:**
- New Moon: Very dark, minimal lighting, blue-tinted shadows
- Waxing Crescent: Slight illumination from one side
- First Quarter: Half-lit, dramatic shadows
- Waxing Gibbous: Bright, clear lighting
- Full Moon: Maximum brightness, silver-white glow, long shadows
- Waning phases mirror waxing phases
- Lighting affects tombstone visibility and shadow direction
- Real-time updates based on current moon phase

### US-5: Particle Effects
**As a user**, I want particle effects on hover to enhance the mystical atmosphere.

**Acceptance Criteria:**
- Hovering over tombstones triggers particle effects
- Active tasks: Green/blue particles (life energy)
- Completed tasks: White/transparent particles (spirits)
- High priority: Red/orange particles (urgency)
- Particles fade out naturally
- Performance optimized (max 50 particles per tombstone)
- Can be disabled for low-end devices

## Technical Requirements

### TR-1: Physics Engine
- Use Matter.js or similar lightweight physics library
- 2D physics simulation for tombstone swaying
- Wind force applied as continuous force vector
- Tombstone mass/rigidity based on priority
- Performance: 60fps with up to 100 tombstones

### TR-2: Moon Phase Integration
- Integrate with existing `moonPhaseService.ts`
- Calculate lighting values based on moon phase
- Apply CSS filters and gradients for lighting effects
- Update lighting in real-time (check every hour)

### TR-3: Particle System
- Custom particle system using Canvas API or WebGL
- Particle pool for performance (reuse particles)
- Configurable particle count, speed, lifespan
- GPU-accelerated where possible

### TR-4: Animation System
- CSS animations for digging effect
- JavaScript animations for particle effects
- Smooth transitions between states
- Respect `prefers-reduced-motion` accessibility setting

### TR-5: Performance
- Lazy load physics engine
- Virtual scrolling for large task lists
- Debounce particle effects
- Frame rate monitoring and adaptive quality

## Integration Points

### Existing Components
- `GraveyardView.tsx` - Main container component
- `Tombstone.tsx` - Individual tombstone component
- `MoonPhaseCalendar.tsx` - Moon phase data source
- `moonPhaseService.ts` - Moon phase calculations

### New Components Needed
- `PhysicsGraveyard.tsx` - Physics-enabled graveyard container
- `TombstonePhysics.tsx` - Physics-enabled tombstone wrapper
- `DiggingModal.tsx` - Task details modal with digging animation
- `ParticleSystem.tsx` - Reusable particle effect component
- `MoonLighting.tsx` - Moon phase lighting controller

## Accessibility

### A11Y-1: Reduced Motion
- Respect `prefers-reduced-motion` media query
- Disable physics animations when reduced motion is preferred
- Provide static fallback layout

### A11Y-2: Keyboard Navigation
- Tab through tombstones
- Enter/Space to "dig up" task details
- Escape to close modals
- Arrow keys for navigation

### A11Y-3: Screen Readers
- Announce tombstone state changes
- Describe particle effects (optional, can be disabled)
- Provide text alternatives for visual effects

## Performance Targets

- Initial load: < 2 seconds
- Physics simulation: 60fps with 50 tombstones
- Particle effects: 60fps with 20 active particles
- Memory usage: < 100MB for physics engine
- Battery impact: Minimize CPU usage when tab is inactive

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may need WebKit prefixes)
- Mobile browsers: Simplified physics (reduced particle count)

## Settings

### User Preferences
- Enable/disable physics
- Wind intensity slider (0-100%)
- Particle effect intensity (0-100%)
- Moon lighting intensity (0-100%)
- Performance mode (reduced effects for low-end devices)




