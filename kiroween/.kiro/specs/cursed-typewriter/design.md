# Cursed Typewriter Effect - Design Document

## Visual Design Elements

### 1. Typewriter Animation

#### Character Appearance
```
Timing: Each character appears 50-100ms after typing
Animation: Fade in + slight scale up
Easing: ease-out
Duration: 150ms per character
```

#### Visual States
```css
/* Character appearing */
@keyframes typewriter-char {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Current typing position */
.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: var(--accent-purple);
  animation: blink-cursor 1s infinite;
  margin-left: 2px;
}

@keyframes blink-cursor {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

#### Sound Design
- **Base Type Sound**: Mechanical typewriter key press
- **Pitch Variation**: ±5% random variation per character
- **Space Bar**: Slightly different sound (thud)
- **Enter Key**: Carriage return + bell ding
- **Backspace**: Eraser sound or paper tear

### 2. Cursed Characters

#### Character Set
```
Primary Cursed Characters:
☠️ 💀 👻 ⚰️ 🕷️ 🦇 🕯️ 🔮 ⚡ 🌙

Secondary (Less Common):
🦴 🕸️ 🪦 🪔 🧙 🧛 🧟
```

#### Appearance Animation
```
Timeline (500ms total):
0ms - 50ms: Cursed character fades in (scale 0.8 → 1.2)
50ms - 200ms: Cursed character glows (brightness 150%)
200ms - 300ms: Cursed character shakes slightly
300ms - 450ms: Transform to correct character (morph)
450ms - 500ms: Correct character settles (scale 1.2 → 1.0)
```

#### Visual Effects
```css
.cursed-character {
  display: inline-block;
  animation: cursed-appear 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  filter: drop-shadow(0 0 8px rgba(255, 0, 0, 0.8));
}

@keyframes cursed-appear {
  0% {
    transform: scale(0.8) rotate(-5deg);
    opacity: 0;
  }
  20% {
    transform: scale(1.2) rotate(5deg);
    opacity: 1;
    filter: brightness(1.5) drop-shadow(0 0 12px rgba(255, 0, 0, 1));
  }
  40% {
    transform: scale(1.1) rotate(-3deg);
  }
  60% {
    transform: scale(1.0) rotate(0deg);
    filter: brightness(1.0);
  }
  100% {
    transform: scale(1.0);
    opacity: 1;
  }
}
```

### 3. Ink Splotches

#### Splotch Types
```
Small Splotch (Common):
- Size: 10-20px diameter
- Opacity: 0.1-0.2
- Color: Dark brown/black (#3a2a1a)
- Position: Random, near text

Medium Splotch (Less Common):
- Size: 20-40px diameter
- Opacity: 0.15-0.25
- Color: Dark brown/black
- Position: Random, can overlap text slightly

Large Splotch (Rare):
- Size: 40-60px diameter
- Opacity: 0.2-0.3
- Color: Dark brown/black
- Position: Edge of paper, away from text
```

#### Animation
```css
@keyframes ink-splotch {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: var(--splotch-opacity);
    transform: scale(1.1);
  }
  100% {
    opacity: var(--splotch-opacity);
    transform: scale(1);
  }
}

.ink-splotch {
  position: absolute;
  border-radius: 50% 40% 60% 30%;
  background: radial-gradient(
    circle,
    rgba(58, 42, 26, 0.3) 0%,
    rgba(58, 42, 26, 0.1) 50%,
    transparent 100%
  );
  animation: ink-splotch 0.8s ease-out;
  pointer-events: none;
  z-index: 1;
}
```

### 4. Paper Texture

#### Texture Layers
```
Base Layer:
- Background: Aged paper color (#f4e8d0)
- Pattern: Subtle paper fiber texture (SVG pattern or image)
- Opacity: 100%

Overlay Layer:
- Texture: Paper grain/noise
- Blend mode: multiply
- Opacity: 20-30%

Edge Wear:
- Border: Torn/aged edges
- Shadow: Inner shadow for depth
- Color variation: Slight yellowing
```

#### CSS Implementation
```css
.paper-texture {
  background: 
    /* Paper base */
    #f4e8d0,
    /* Paper grain */
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.03) 0px,
      transparent 1px,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 3px
    ),
    /* Aged yellowing */
    radial-gradient(
      ellipse at top left,
      rgba(255, 240, 200, 0.3) 0%,
      transparent 50%
    );
  background-size: 100% 100%, 4px 4px, 100% 100%;
  
  /* Torn edges */
  border: 2px solid transparent;
  border-image: url('data:image/svg+xml,...') 30 round;
  
  /* Inner shadow for depth */
  box-shadow: 
    inset 0 0 20px rgba(0, 0, 0, 0.1),
    inset 0 0 40px rgba(0, 0, 0, 0.05);
}
```

### 5. Ghostly Hand Cursor

#### Cursor States
```
Default State:
- Icon: 👻 or skeletal hand
- Size: 24x24px
- Glow: Subtle white glow
- Lag: 50ms behind mouse

Hovering Text Area:
- Icon: Pointing finger 👆
- Size: 28x28px
- Glow: Stronger purple glow
- Lag: 30ms (more responsive)

Typing State:
- Icon: Typing hand (fingers on keys)
- Size: 24x24px
- Glow: Pulsing purple
- Lag: 20ms (very responsive)
```

#### Animation
```css
.ghostly-cursor {
  position: fixed;
  width: 24px;
  height: 24px;
  pointer-events: none;
  z-index: 9999;
  transition: transform 0.1s ease-out;
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.8));
}

.ghostly-cursor.typing {
  animation: typing-hand 0.5s ease-in-out infinite;
}

@keyframes typing-hand {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-2px) scale(1.1); }
}
```

### 6. Carriage Return Animation

#### Animation Sequence
```
Timeline (400ms total):
0ms - 100ms: Text area shifts right 20px (carriage moving)
100ms - 200ms: Bell ding sound plays
200ms - 300ms: Text area returns to left (carriage return)
300ms - 400ms: New line appears, cursor blinks
```

#### Visual Effects
```css
@keyframes carriage-return {
  0% {
    transform: translateX(0px);
  }
  25% {
    transform: translateX(20px);
  }
  75% {
    transform: translateX(0px);
  }
  100% {
    transform: translateX(0px);
  }
}

.typewriter-container.carriage-return {
  animation: carriage-return 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## Component Architecture

### Component Hierarchy
```
GhostWriter / NecronomiconNotes
└── TypewriterEffect (new wrapper)
    ├── PaperTexture (new background)
    ├── GhostlyCursor (new cursor)
    └── WritingEditor (enhanced)
        ├── TypewriterText (new text renderer)
        ├── CursedCharacter (new, conditional)
        ├── InkSplotch (new, multiple instances)
        └── CarriageReturn (new, on Enter)
```

### State Management

```typescript
interface TypewriterEffectState {
  // Animation
  isTyping: boolean;
  currentText: string;
  displayedText: string; // What's currently shown
  typingSpeed: number; // ms per character
  
  // Cursed characters
  cursedCharacterProbability: number; // 0-1
  nextCursedIndex: number | null; // Where next cursed char will appear
  
  // Ink splotches
  splotches: InkSplotch[];
  lastSplotchTime: number;
  splotchFrequency: number; // characters between splotches
  
  // Cursor
  cursorPosition: { x: number; y: number };
  cursorState: 'default' | 'hover' | 'typing';
  
  // Carriage return
  isCarriageReturning: boolean;
  
  // Settings
  enabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
}
```

## Technical Implementation

### Typewriter Animation Engine

```typescript
class TypewriterEffect {
  private displayedText: string = '';
  private targetText: string = '';
  private animationFrame: number | null = null;
  private typingSpeed: number = 50; // ms per character
  
  typeText(newText: string) {
    this.targetText = newText;
    this.startAnimation();
  }
  
  private startAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    const startTime = performance.now();
    const startLength = this.displayedText.length;
    const targetLength = this.targetText.length;
    const diff = targetLength - startLength;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const charsToShow = Math.floor(elapsed / this.typingSpeed);
      const newLength = Math.min(
        startLength + charsToShow,
        targetLength
      );
      
      this.displayedText = this.targetText.slice(0, newLength);
      this.render();
      
      if (newLength < targetLength) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animationFrame = null;
      }
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  private render() {
    // Render displayedText with character-by-character animation
    // Insert cursed characters at random positions
    // Add ink splotches periodically
  }
}
```

### Cursed Character System

```typescript
const CURSED_CHARACTERS = ['☠️', '💀', '👻', '⚰️', '🕷️', '🦇', '🕯️'];

function injectCursedCharacter(
  text: string, 
  index: number, 
  probability: number
): string | null {
  if (Math.random() > probability) return null;
  
  const cursedChar = CURSED_CHARACTERS[
    Math.floor(Math.random() * CURSED_CHARACTERS.length)
  ];
  
  // Replace character at index with cursed character
  // Character will transform back after animation
  return text.slice(0, index) + cursedChar + text.slice(index + 1);
}
```

### Sound System

```typescript
class TypewriterSoundSystem {
  private audioContext: AudioContext;
  private soundBuffers: Map<string, AudioBuffer> = new Map();
  
  async loadSounds() {
    const sounds = [
      'type-key',
      'type-space',
      'carriage-return',
      'bell-ding',
      'cursed-chime'
    ];
    
    for (const sound of sounds) {
      const buffer = await this.loadSound(`/sounds/${sound}.mp3`);
      this.soundBuffers.set(sound, buffer);
    }
  }
  
  playSound(name: string, pitch: number = 1.0) {
    const buffer = this.soundBuffers.get(name);
    if (!buffer) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitch;
    source.connect(this.audioContext.destination);
    source.start();
  }
  
  playTypeSound() {
    // Random pitch variation
    const pitch = 1.0 + (Math.random() - 0.5) * 0.1;
    this.playSound('type-key', pitch);
  }
}
```

### Cursor System

```typescript
class GhostlyCursor {
  private cursorElement: HTMLElement;
  private targetPosition = { x: 0, y: 0 };
  private currentPosition = { x: 0, y: 0 };
  private lag = 50; // ms
  
  constructor() {
    this.cursorElement = document.createElement('div');
    this.cursorElement.className = 'ghostly-cursor';
    document.body.appendChild(this.cursorElement);
    
    document.addEventListener('mousemove', (e) => {
      this.targetPosition = { x: e.clientX, y: e.clientY };
    });
    
    this.animate();
  }
  
  private animate() {
    const dx = this.targetPosition.x - this.currentPosition.x;
    const dy = this.targetPosition.y - this.currentPosition.y;
    
    // Smooth interpolation
    this.currentPosition.x += dx * 0.1;
    this.currentPosition.y += dy * 0.1;
    
    this.cursorElement.style.left = `${this.currentPosition.x}px`;
    this.cursorElement.style.top = `${this.currentPosition.y}px`;
    
    requestAnimationFrame(() => this.animate());
  }
  
  setState(state: 'default' | 'hover' | 'typing') {
    this.cursorElement.className = `ghostly-cursor ${state}`;
  }
}
```

## Performance Optimization

### Text Rendering
- Use `will-change: transform` for animated characters
- Batch DOM updates (update every 16ms, not every character)
- Virtualize long text (only render visible portion)

### Sound Optimization
- Preload sound buffers
- Reuse audio sources (pool pattern)
- Limit concurrent sounds (max 3-5)

### Cursor Optimization
- Use CSS transforms (GPU-accelerated)
- Throttle mouse move events (60fps max)
- Hide cursor when not moving (after 2 seconds)

## Accessibility

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .typewriter-effect {
    animation: none !important;
  }
  
  .cursed-character {
    display: none !important;
  }
  
  .ghostly-cursor {
    display: none !important;
  }
  
  /* Show text immediately */
  .typewriter-text {
    opacity: 1 !important;
  }
}
```

### Keyboard Navigation
- Cursor follows keyboard focus
- All animations work with keyboard input
- No mouse-dependent features

### Screen Reader Support
- Announce text as it appears (optional, can be disabled)
- Don't announce cursed characters (visual only)
- Provide text alternative: "Cursed character appeared"




