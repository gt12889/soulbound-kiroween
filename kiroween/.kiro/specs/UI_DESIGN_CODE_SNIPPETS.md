# UI Design Code Snippets

## Interactive Graveyard with Physics

### 1. Tombstone Wind Sway Animation

```css
/* Tombstone base styles with physics-ready transforms */
.tombstone {
  position: relative;
  transform-origin: bottom center;
  transition: transform 0.1s ease-out;
  will-change: transform;
}

/* Wind sway based on priority */
.tombstone.priority-high {
  animation: wind-sway-subtle 3s ease-in-out infinite;
  transform: rotate(0deg);
}

.tombstone.priority-medium {
  animation: wind-sway-moderate 2.5s ease-in-out infinite;
  transform: rotate(0deg);
}

.tombstone.priority-low {
  animation: wind-sway-pronounced 2s ease-in-out infinite;
  transform: rotate(0deg);
}

/* Wind animation keyframes */
@keyframes wind-sway-subtle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-2deg); }
}

@keyframes wind-sway-moderate {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-5deg); }
}

@keyframes wind-sway-pronounced {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(8deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-8deg); }
}

/* Random wind variation */
.tombstone::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  animation: wind-random 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes wind-random {
  0%, 100% { transform: rotate(0deg); }
  33% { transform: rotate(calc(var(--wind-offset, 0deg) + 1deg)); }
  66% { transform: rotate(calc(var(--wind-offset, 0deg) - 1deg)); }
}
```

### 2. Moon Phase Lighting System

```css
/* Graveyard container with moon lighting */
.graveyard-container {
  position: relative;
  min-height: 100vh;
  background: 
    radial-gradient(
      ellipse at var(--moon-x, 50%) var(--moon-y, 20%),
      rgba(255, 255, 255, var(--moon-glow, 0.1)) 0%,
      transparent 60%
    ),
    linear-gradient(
      to bottom,
      rgba(20, 20, 30, 0.95) 0%,
      rgba(10, 10, 15, 1) 100%
    );
  filter: 
    brightness(var(--moon-brightness, 0.5))
    hue-rotate(var(--moon-hue-rotate, 0deg));
  transition: filter 1s ease-in-out;
}

/* Moon phase specific lighting */
.graveyard-container[data-moon-phase="new"] {
  --moon-brightness: 0.1;
  --moon-hue-rotate: 220deg;
  --moon-glow: 0.05;
  --shadow-opacity: 0.9;
}

.graveyard-container[data-moon-phase="full"] {
  --moon-brightness: 1.0;
  --moon-hue-rotate: 0deg;
  --moon-glow: 0.3;
  --shadow-opacity: 0.2;
}

.graveyard-container[data-moon-phase="waxing-crescent"] {
  --moon-brightness: 0.25;
  --moon-hue-rotate: 200deg;
  --moon-glow: 0.1;
  --shadow-opacity: 0.75;
}

.graveyard-container[data-moon-phase="first-quarter"] {
  --moon-brightness: 0.5;
  --moon-hue-rotate: 180deg;
  --moon-glow: 0.15;
  --shadow-opacity: 0.6;
}

.graveyard-container[data-moon-phase="waxing-gibbous"] {
  --moon-brightness: 0.75;
  --moon-hue-rotate: 90deg;
  --moon-glow: 0.2;
  --shadow-opacity: 0.4;
}

/* Tombstone shadows based on moon phase */
.tombstone {
  filter: drop-shadow(
    var(--shadow-offset-x, -5px) 
    var(--shadow-offset-y, 5px) 
    var(--shadow-blur, 10px) 
    rgba(0, 0, 0, var(--shadow-opacity, 0.6))
  );
}

/* Shadow direction based on moon phase */
.graveyard-container[data-moon-phase="waxing-crescent"] .tombstone,
.graveyard-container[data-moon-phase="first-quarter"] .tombstone,
.graveyard-container[data-moon-phase="waxing-gibbous"] .tombstone {
  --shadow-offset-x: -8px;
}

.graveyard-container[data-moon-phase="waning-gibbous"] .tombstone,
.graveyard-container[data-moon-phase="last-quarter"] .tombstone,
.graveyard-container[data-moon-phase="waning-crescent"] .tombstone {
  --shadow-offset-x: 8px;
}
```

### 3. Ghostly Transparency Effect

```css
/* Completed tombstone ghostly effect */
.tombstone.completed {
  opacity: 0.3;
  animation: ghost-float 3s ease-in-out infinite, ghost-fade-in 2s ease-out;
  filter: blur(1px);
}

@keyframes ghost-fade-in {
  0% { 
    opacity: 1;
    filter: blur(0px);
  }
  50% { 
    opacity: 0.5;
    filter: blur(0.5px);
  }
  100% { 
    opacity: 0.3;
    filter: blur(1px);
  }
}

@keyframes ghost-float {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg);
  }
  50% { 
    transform: translateY(-5px) rotate(1deg);
  }
}

/* Ghostly glow effect */
.tombstone.completed::after {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(173, 216, 230, 0.2) 30%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(8px);
  z-index: -1;
  animation: ghost-glow 2s ease-in-out infinite;
}

@keyframes ghost-glow {
  0%, 100% { 
    opacity: 0.5;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.1);
  }
}
```

### 4. Digging Animation

```css
/* Digging modal container */
.digging-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: modal-fade-in 0.3s ease-out;
}

@keyframes modal-fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Parchment-style modal content */
.digging-modal-content {
  background: 
    /* Paper texture */
    url('data:image/svg+xml,<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /></filter><rect width="100%" height="100%" filter="url(%23noise)" opacity="0.05"/></svg>'),
    /* Aged paper base */
    linear-gradient(
      to bottom,
      #f4e8d0 0%,
      #e8dcc0 50%,
      #d4c8b0 100%
    );
  border: 3px solid #8b7355;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: parchment-appear 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes parchment-appear {
  0% {
    transform: scale(0.8) translateY(20px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Torn edges effect */
.digging-modal-content::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      rgba(139, 115, 85, 0.3) 2px,
      rgba(139, 115, 85, 0.3) 4px
    );
  border-radius: 8px;
  z-index: -1;
}

/* Soil particles animation */
.soil-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.soil-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #8b7355;
  border-radius: 50%;
  animation: soil-fall 1s ease-out forwards;
}

@keyframes soil-fall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(100px) rotate(360deg);
  }
}

/* Tombstone digging animation */
.tombstone.digging {
  animation: tombstone-dig 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes tombstone-dig {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  30% {
    transform: translateY(0) rotate(-2deg);
  }
  60% {
    transform: translateY(10px) rotate(2deg);
  }
  100% {
    transform: translateY(10px) rotate(0deg);
  }
}
```

### 5. Particle Effects

```css
/* Particle container */
.particle-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 10;
}

/* Life energy particles (active tasks) */
.particle-life {
  position: absolute;
  width: 3px;
  height: 3px;
  background: radial-gradient(circle, #4ade80 0%, #60a5fa 100%);
  border-radius: 50%;
  animation: particle-rise 2s ease-out forwards;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.8);
}

@keyframes particle-rise {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-60px) translateX(calc(var(--drift, 0) * 20px)) scale(0.5);
  }
}

/* Spirit particles (completed tasks) */
.particle-spirit {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: particle-float 3s ease-in-out infinite;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.6);
}

@keyframes particle-float {
  0%, 100% {
    opacity: 0.6;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-30px) scale(1.2);
  }
}

/* Urgency particles (high priority) */
.particle-urgency {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #f87171 0%, #fb923c 100%);
  border-radius: 50%;
  animation: particle-burst 1s ease-out forwards;
  box-shadow: 0 0 8px rgba(248, 113, 113, 0.9);
}

@keyframes particle-burst {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.3) translateY(-80px) translateX(calc((var(--index, 0) - 5) * 15px));
  }
}

/* Hover particle trigger */
.tombstone:hover .particle-container {
  animation: particle-spawn 0.5s ease-out;
}

@keyframes particle-spawn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

### 6. HTML Structure for Graveyard

```html
<!-- Graveyard container with moon phase -->
<div 
  class="graveyard-container" 
  data-moon-phase="full"
  style="--moon-x: 50%; --moon-y: 20%; --moon-brightness: 1.0;"
>
  <!-- Moon lighting overlay -->
  <div class="moon-lighting"></div>
  
  <!-- Particle system -->
  <canvas class="particle-canvas"></canvas>
  
  <!-- Graveyard view -->
  <div class="graveyard-view">
    <!-- Tombstone with physics -->
    <button 
      class="tombstone priority-high"
      data-task-id="123"
      data-completed="false"
    >
      <div class="stone">
        <div class="cross">
          <div class="cross-vertical"></div>
          <div class="cross-horizontal"></div>
        </div>
        <div class="title">Task Title</div>
      </div>
      <div class="ground"></div>
      
      <!-- Particle container -->
      <div class="particle-container">
        <!-- Particles injected via JavaScript -->
      </div>
    </button>
  </div>
  
  <!-- Digging modal -->
  <div class="digging-modal" style="display: none;">
    <div class="digging-modal-content">
      <div class="soil-particles"></div>
      <h2>Task Details</h2>
      <p>Task description...</p>
    </div>
  </div>
</div>
```

---

## Cursed Typewriter Effect

### 1. Typewriter Character Animation

```css
/* Typewriter text container */
.typewriter-text {
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  color: #2d3748;
}

/* Individual character animation */
.typewriter-char {
  display: inline-block;
  animation: char-appear 0.15s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes char-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Typing cursor */
.typewriter-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: #8b5cf6;
  margin-left: 2px;
  animation: cursor-blink 1s infinite;
  vertical-align: middle;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Space character styling */
.typewriter-char.space {
  width: 0.3em;
  display: inline-block;
}
```

### 2. Cursed Character Animation

```css
/* Cursed character container */
.cursed-character {
  display: inline-block;
  position: relative;
  animation: cursed-appear 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  font-size: 1.2em;
}

@keyframes cursed-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(-10deg);
    filter: brightness(1) drop-shadow(0 0 0px rgba(255, 0, 0, 0));
  }
  20% {
    opacity: 1;
    transform: scale(1.3) rotate(10deg);
    filter: brightness(1.8) drop-shadow(0 0 12px rgba(255, 0, 0, 1));
  }
  40% {
    transform: scale(1.1) rotate(-5deg);
    filter: brightness(1.4) drop-shadow(0 0 8px rgba(255, 0, 0, 0.8));
  }
  60% {
    transform: scale(1.0) rotate(0deg);
    filter: brightness(1.0) drop-shadow(0 0 4px rgba(255, 0, 0, 0.5));
  }
  80% {
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1.0) rotate(0deg);
    filter: brightness(1.0);
  }
}

/* Cursed character glow effect */
.cursed-character::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: radial-gradient(
    circle,
    rgba(255, 0, 0, 0.4) 0%,
    transparent 70%
  );
  border-radius: 50%;
  z-index: -1;
  animation: cursed-glow 0.5s ease-out;
}

@keyframes cursed-glow {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}
```

### 3. Ink Splotches

```css
/* Ink splotch container */
.ink-splotch-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

/* Individual ink splotch */
.ink-splotch {
  position: absolute;
  border-radius: 50% 40% 60% 30% / 50% 60% 40% 50%;
  background: radial-gradient(
    circle,
    rgba(58, 42, 26, 0.25) 0%,
    rgba(58, 42, 26, 0.15) 40%,
    rgba(58, 42, 26, 0.05) 70%,
    transparent 100%
  );
  animation: splotch-appear 0.8s ease-out;
  pointer-events: none;
}

/* Small splotch */
.ink-splotch.small {
  width: 15px;
  height: 15px;
}

/* Medium splotch */
.ink-splotch.medium {
  width: 30px;
  height: 30px;
}

/* Large splotch */
.ink-splotch.large {
  width: 50px;
  height: 50px;
}

@keyframes splotch-appear {
  0% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(180deg);
  }
  100% {
    opacity: 0.8;
    transform: scale(1) rotate(360deg);
  }
}
```

### 4. Paper Texture Background

```css
/* Paper texture container */
.paper-texture {
  position: relative;
  background: 
    /* Aged paper base */
    #f4e8d0,
    /* Paper grain */
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.03) 0px,
      transparent 1px,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 3px
    ),
    /* Horizontal lines */
    repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.02) 0px,
      transparent 1px,
      transparent 2px,
      rgba(0, 0, 0, 0.02) 3px
    ),
    /* Aged yellowing */
    radial-gradient(
      ellipse at top left,
      rgba(255, 240, 200, 0.3) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at bottom right,
      rgba(200, 180, 150, 0.2) 0%,
      transparent 50%
    );
  background-size: 
    100% 100%,
    4px 4px,
    4px 4px,
    100% 100%,
    100% 100%;
  
  /* Inner shadow for depth */
  box-shadow: 
    inset 0 0 30px rgba(0, 0, 0, 0.1),
    inset 0 0 60px rgba(0, 0, 0, 0.05);
  
  /* Torn edges effect */
  border: 2px solid transparent;
  position: relative;
}

/* Torn edge decoration */
.paper-texture::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 3px,
      rgba(139, 115, 85, 0.2) 3px,
      rgba(139, 115, 85, 0.2) 4px
    );
  z-index: -1;
  border-radius: 2px;
}

/* Paper texture overlay (noise) */
.paper-texture::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /></filter><rect width="100%" height="100%" filter="url(%23noise)" opacity="0.1"/></svg>');
  opacity: 0.3;
  pointer-events: none;
  mix-blend-mode: multiply;
}
```

### 5. Ghostly Hand Cursor

```css
/* Hide default cursor */
.typewriter-container {
  cursor: none;
}

/* Ghostly cursor element */
.ghostly-cursor {
  position: fixed;
  width: 24px;
  height: 24px;
  pointer-events: none;
  z-index: 9999;
  font-size: 24px;
  line-height: 1;
  transition: transform 0.1s ease-out;
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.8));
  user-select: none;
}

/* Default state - ghost emoji */
.ghostly-cursor.default::before {
  content: '👻';
}

/* Hover state - pointing finger */
.ghostly-cursor.hover::before {
  content: '👆';
  font-size: 28px;
}

/* Typing state - typing hand */
.ghostly-cursor.typing::before {
  content: '✍️';
  animation: typing-hand 0.5s ease-in-out infinite;
}

@keyframes typing-hand {
  0%, 100% { 
    transform: translateY(0px) scale(1);
  }
  50% { 
    transform: translateY(-2px) scale(1.1);
  }
}

/* Cursor glow effect */
.ghostly-cursor::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.3) 0%,
    transparent 70%
  );
  border-radius: 50%;
  z-index: -1;
  animation: cursor-glow 2s ease-in-out infinite;
}

@keyframes cursor-glow {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.2);
  }
}
```

### 6. Carriage Return Animation

```css
/* Typewriter container */
.typewriter-container {
  position: relative;
  overflow: hidden;
}

/* Carriage return animation */
.typewriter-container.carriage-return {
  animation: carriage-return 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes carriage-return {
  0% {
    transform: translateX(0px);
  }
  25% {
    transform: translateX(20px);
  }
  50% {
    transform: translateX(20px);
  }
  75% {
    transform: translateX(0px);
  }
  100% {
    transform: translateX(0px);
  }
}

/* Bell ding indicator */
.carriage-bell {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  animation: bell-ding 0.3s ease-out;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
}

@keyframes bell-ding {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.3) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 0.8;
  }
}

/* Line break indicator */
.line-break-indicator {
  display: block;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(139, 92, 246, 0.5),
    transparent
  );
  margin: 0.5em 0;
  animation: line-break-appear 0.3s ease-out;
}

@keyframes line-break-appear {
  0% {
    width: 0;
    opacity: 0;
  }
  100% {
    width: 100%;
    opacity: 1;
  }
}
```

### 7. HTML Structure for Typewriter

```html
<!-- Typewriter container -->
<div class="typewriter-container paper-texture">
  <!-- Ghostly cursor (positioned via JavaScript) -->
  <div class="ghostly-cursor default"></div>
  
  <!-- Ink splotch container -->
  <div class="ink-splotch-container">
    <!-- Ink splotches injected via JavaScript -->
  </div>
  
  <!-- Typewriter text area -->
  <div class="typewriter-text" contenteditable="true">
    <!-- Characters injected via JavaScript -->
    <span class="typewriter-char">H</span>
    <span class="typewriter-char">e</span>
    <span class="typewriter-char">l</span>
    <span class="typewriter-char">l</span>
    <span class="typewriter-char">o</span>
    <span class="typewriter-char space"> </span>
    <span class="typewriter-cursor"></span>
  </div>
  
  <!-- Carriage bell (shown on Enter) -->
  <div class="carriage-bell" style="display: none;"></div>
</div>
```

### 8. Reduced Motion Support

```css
/* Accessibility: Reduced motion */
@media (prefers-reduced-motion: reduce) {
  /* Disable all animations */
  .tombstone,
  .typewriter-char,
  .cursed-character,
  .ink-splotch,
  .ghostly-cursor,
  .particle-life,
  .particle-spirit,
  .particle-urgency {
    animation: none !important;
    transition: none !important;
  }
  
  /* Show text immediately */
  .typewriter-char {
    opacity: 1 !important;
    transform: none !important;
  }
  
  /* Hide particles */
  .particle-container,
  .ink-splotch-container {
    display: none !important;
  }
  
  /* Hide cursor */
  .ghostly-cursor {
    display: none !important;
  }
  
  /* Restore default cursor */
  .typewriter-container {
    cursor: text !important;
  }
}
```

---

## CSS Variables for Theming

```css
:root {
  /* Graveyard Physics */
  --wind-intensity: 1;
  --moon-brightness: 0.5;
  --moon-hue-rotate: 0deg;
  --shadow-opacity: 0.6;
  --shadow-offset-x: -5px;
  --shadow-offset-y: 5px;
  --shadow-blur: 10px;
  
  /* Typewriter */
  --typing-speed: 50ms;
  --cursed-probability: 0.02;
  --splotch-frequency: 75;
  --paper-texture-opacity: 0.3;
  
  /* Colors */
  --accent-purple: #8b5cf6;
  --paper-color: #f4e8d0;
  --ink-color: #3a2a1a;
  --ghost-glow: rgba(255, 255, 255, 0.5);
}
```

---

## Usage Notes

1. **Graveyard Physics**: Apply moon phase data attribute to container, use CSS variables for dynamic lighting
2. **Typewriter**: Inject characters via JavaScript with staggered delays, use `will-change` for performance
3. **Particles**: Use Canvas API or CSS animations, limit particle count for performance
4. **Accessibility**: Always include reduced motion media query
5. **Performance**: Use `transform` and `opacity` for animations (GPU-accelerated)



