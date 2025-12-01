# Feature Specifications Summary

## Overview
This document provides a quick reference for the two major visual enhancement features:
1. **Interactive Graveyard with Physics**
2. **Cursed Typewriter Effect**

## Quick Links

### Interactive Graveyard with Physics
- [Requirements](./interactive-graveyard-physics/requirements.md)
- [Design Document](./interactive-graveyard-physics/design.md)

### Cursed Typewriter Effect
- [Requirements](./cursed-typewriter/requirements.md)
- [Design Document](./cursed-typewriter/design.md)

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. **Cursed Typewriter Effect** - Core typewriter animation
   - Letter-by-letter rendering
   - Basic sound effects
   - Paper texture background
   - Estimated: 3-4 days

2. **Interactive Graveyard** - Basic physics
   - Tombstone swaying with wind
   - Moon phase lighting
   - Estimated: 4-5 days

### Phase 2: Enhancement (Week 2)
3. **Cursed Typewriter** - Advanced features
   - Cursed characters
   - Ink splotches
   - Ghostly cursor
   - Carriage return animation
   - Estimated: 3-4 days

4. **Interactive Graveyard** - Advanced features
   - Digging animation
   - Particle effects
   - Ghostly transparency
   - Estimated: 3-4 days

### Phase 3: Polish (Week 3)
5. Performance optimization
6. Accessibility improvements
7. Settings integration
8. Testing and bug fixes
   - Estimated: 2-3 days

## Key Dependencies

### Interactive Graveyard
- `matter-js` - Physics engine (or similar lightweight alternative)
- `moonPhaseService.ts` - Existing moon phase calculations
- `GraveyardView.tsx` - Existing component to enhance
- `Tombstone.tsx` - Existing component to enhance

### Cursed Typewriter
- `GhostWriter.tsx` - Existing component to enhance
- `NecronomiconNotes.tsx` - Existing component to enhance
- `WritingEditor.tsx` - Existing editor component
- Web Audio API - For sound effects

## Visual Element Quick Reference

### Graveyard Physics
- **Wind Sway**: ±2-10 degrees based on priority
- **Moon Lighting**: 10-100% brightness, color temperature 2000K-6000K
- **Particles**: Green/blue (active), white (completed), red/orange (high priority)
- **Ghostly Effect**: 30% opacity, upward float, glowing aura

### Typewriter Effect
- **Typing Speed**: 50-100ms per character
- **Cursed Characters**: 1-2% probability, 500ms animation
- **Ink Splotches**: Every 50-100 characters, 10-60px diameter
- **Cursor**: Ghostly hand, 24-28px, follows mouse with lag
- **Carriage Return**: 400ms animation, bell ding sound

## Performance Targets

### Graveyard Physics
- 60fps with 50 tombstones
- < 100MB memory for physics engine
- Adaptive quality based on FPS

### Typewriter Effect
- 60fps typing animation
- < 5ms sound latency
- < 10MB memory for sound buffers
- < 5% CPU when typing

## Accessibility Checklist

- [ ] Respect `prefers-reduced-motion`
- [ ] Keyboard navigation support
- [ ] Screen reader announcements
- [ ] High contrast mode support
- [ ] Settings to disable all effects

## Testing Checklist

### Graveyard Physics
- [ ] Physics simulation at 60fps
- [ ] Moon lighting updates correctly
- [ ] Particle effects don't impact performance
- [ ] Digging animation works smoothly
- [ ] Ghostly transparency animates correctly

### Typewriter Effect
- [ ] Typing animation matches user speed
- [ ] Sound effects play correctly
- [ ] Cursed characters appear and transform
- [ ] Ink splotches don't obscure text
- [ ] Cursor follows mouse smoothly
- [ ] Carriage return animation works

## Next Steps

1. Review specifications with team
2. Set up development environment
3. Install dependencies (matter-js, etc.)
4. Create feature branches
5. Begin Phase 1 implementation



