# Cursed Typewriter Effect - Requirements

## Overview
Transform the writing experience in Ghost Writer and Necronomicon Notes with a supernatural typewriter effect that adds atmosphere, character, and an unforgettable typing experience.

## User Stories

### US-1: Letter-by-Letter Animation
**As a user**, I want text to appear letter-by-letter with typewriter sound effects so writing feels immersive and atmospheric.

**Acceptance Criteria:**
- Text appears character-by-character as user types
- Typewriter sound plays for each character (configurable)
- Sound pitch varies slightly for realism
- Typing speed matches user's actual typing speed
- Can be disabled in settings

### US-2: Cursed Characters
**As a user**, I want occasional "cursed" characters to appear briefly for a spooky surprise element.

**Acceptance Criteria:**
- Random cursed characters appear 1-2% of the time
- Cursed characters: ☠️ 💀 👻 ⚰️ 🕷️ 🦇 🕯️
- Characters appear for 200-500ms then transform to correct character
- Sound effect: Mystical chime or whisper
- Can be disabled in settings

### US-3: Ink Splotches & Paper Texture
**As a user**, I want the writing surface to look like aged paper with ink splotches for authenticity.

**Acceptance Criteria:**
- Paper texture background (subtle, non-distracting)
- Random ink splotches appear occasionally (every 50-100 characters)
- Splotches fade in/out naturally
- Splotches don't obscure text
- Texture intensity adjustable in settings

### US-4: Ghostly Hand Cursor
**As a user**, I want a ghostly hand cursor that follows my mouse for an immersive experience.

**Acceptance Criteria:**
- Custom cursor: Ghostly hand or skeletal finger
- Cursor follows mouse with slight lag (ethereal effect)
- Cursor changes to "typing" state when over text area
- Cursor glows slightly in dark themes
- Can be disabled in settings

### US-5: Carriage Return Animation
**As a user**, I want to see the typewriter carriage return animation when pressing Enter.

**Acceptance Criteria:**
- Pressing Enter triggers carriage return animation
- Sound effect: Mechanical "ding" and carriage return sound
- Visual: Text area shifts slightly, carriage "returns"
- Animation duration: 300-500ms
- Smooth, satisfying animation

## Technical Requirements

### TR-1: Typewriter Animation Engine
- Character-by-character rendering system
- Queue-based character display
- Smooth animation (no jank)
- Performance: Handle 100+ characters/second typing speed

### TR-2: Sound System
- Web Audio API for sound effects
- Sound pool for performance (reuse audio buffers)
- Volume control integration
- Respect system mute/silent mode

### US-3: Cursed Character System
- Random character injection system
- Character transformation animation
- Configurable probability
- Performance: Minimal overhead

### TR-4: Visual Effects
- CSS animations for ink splotches
- Canvas or CSS for paper texture
- GPU-accelerated where possible
- Respect `prefers-reduced-motion`

### TR-5: Cursor System
- Custom cursor using CSS or Canvas
- Mouse tracking with requestAnimationFrame
- Smooth interpolation
- Performance: 60fps cursor movement

## Integration Points

### Existing Components
- `GhostWriter.tsx` - Main writing component
- `WritingEditor.tsx` - Text editor component
- `NecronomiconNotes.tsx` - Notes component
- `EnhancedEditor.tsx` - Rich text editor

### New Components Needed
- `TypewriterEffect.tsx` - Core typewriter animation
- `CursedCharacter.tsx` - Cursed character display
- `InkSplotch.tsx` - Ink splotch component
- `PaperTexture.tsx` - Paper texture background
- `GhostlyCursor.tsx` - Custom cursor component
- `CarriageReturn.tsx` - Carriage return animation

## Accessibility

### A11Y-1: Reduced Motion
- Disable typewriter effect when `prefers-reduced-motion`
- Show text immediately (no animation delay)
- Disable cursor animation
- Disable cursed characters

### A11Y-2: Screen Readers
- Announce text as it appears (optional)
- Don't announce cursed characters (they're visual only)
- Provide text alternative for ink splotches

### A11Y-3: Keyboard Users
- All functionality works with keyboard
- Cursor follows focus, not just mouse
- No mouse-dependent features

## Performance Targets

- Typewriter animation: 60fps
- Sound playback: < 5ms latency
- Cursor movement: 60fps
- Memory: < 10MB for sound buffers
- CPU: < 5% when typing

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may need WebKit prefixes)
- Mobile: Simplified effects (no cursor, reduced sounds)

## Settings

### User Preferences
- Enable/disable typewriter effect
- Typing speed multiplier (0.5x - 2x)
- Sound volume (0-100%)
- Cursed character probability (0-5%)
- Ink splotch frequency (0-100%)
- Cursor style (ghostly hand, skeletal finger, default)
- Paper texture intensity (0-100%)




