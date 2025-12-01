# Interactive Graveyard with Physics - Design Document

## Visual Design Elements

### 1. Tombstone Physics & Wind Effects

#### Visual States
```
Active Tombstone (High Priority):
- Sturdy appearance, minimal sway (±2-3 degrees)
- Dark stone texture with sharp edges
- Slight forward lean (determined, urgent)
- Shadow: Dark, defined

Active Tombstone (Medium Priority):
- Moderate sway (±5-7 degrees)
- Standard stone texture
- Upright position
- Shadow: Medium darkness

Active Tombstone (Low Priority):
- More pronounced sway (±8-10 degrees)
- Weathered stone texture
- Slight backward lean (relaxed)
- Shadow: Lighter, softer

Completed Tombstone:
- Ghostly transparency (30% opacity)
- Gentle, ethereal sway (±3-5 degrees)
- Upward float animation (0.5px/s)
- Glowing aura (white/blue, 2px blur)
- Faded shadow
```

#### Wind Patterns
- **Base Wind**: Continuous sine wave oscillation
- **Random Variation**: ±20% amplitude variation every 3-5 seconds
- **Gusts**: Random stronger winds (150% intensity) every 10-15 seconds
- **Time-based**: Wind stronger at night (120% intensity 8pm-6am)

#### Animation Curves
```css
/* Smooth, natural swaying */
wind-sway: cubic-bezier(0.4, 0.0, 0.2, 1.0);

/* Ghostly float */
ghost-float: ease-in-out;

/* Digging animation */
digging: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Bouncy */
```

### 2. Moon Phase Lighting System

#### Lighting Values by Phase

| Moon Phase | Brightness | Color Temperature | Shadow Intensity | Shadow Direction |
|------------|-----------|-------------------|------------------|------------------|
| New Moon 🌑 | 10% | 2000K (deep blue) | 90% | All directions (ambient) |
| Waxing Crescent 🌒 | 25% | 3000K (cool blue) | 75% | Left side |
| First Quarter 🌓 | 50% | 4000K (neutral) | 60% | Left side |
| Waxing Gibbous 🌔 | 75% | 5000K (warm) | 40% | Left side |
| Full Moon 🌕 | 100% | 6000K (silver-white) | 20% | Behind tombstones |
| Waning Gibbous 🌖 | 75% | 5000K (warm) | 40% | Right side |
| Last Quarter 🌗 | 50% | 4000K (neutral) | 60% | Right side |
| Waning Crescent 🌘 | 25% | 3000K (cool blue) | 75% | Right side |

#### CSS Implementation
```css
/* Base graveyard container */
.graveyard-container {
  position: relative;
  filter: brightness(var(--moon-brightness)) 
          hue-rotate(var(--moon-hue-rotate));
  background: radial-gradient(
    ellipse at var(--moon-position-x) var(--moon-position-y),
    rgba(255, 255, 255, var(--moon-glow-intensity)) 0%,
    transparent 70%
  );
}

/* Tombstone shadows */
.tombstone {
  filter: drop-shadow(
    var(--shadow-offset-x) 
    var(--shadow-offset-y) 
    var(--shadow-blur) 
    rgba(0, 0, 0, var(--shadow-opacity))
  );
}
```

### 3. Digging Animation Sequence

#### Animation Timeline (2.5 seconds total)

```
0.0s - 0.2s: Click detection, cursor changes to shovel
0.2s - 0.5s: Tombstone shakes slightly (anticipation)
0.5s - 1.0s: Soil particles appear and fall downward
1.0s - 1.5s: Tombstone sinks 10px into ground
1.5s - 2.0s: Modal fades in with parchment texture
2.0s - 2.5s: Task details fade in
```

#### Visual Elements
- **Soil Particles**: Brown/tan particles, 3-5px diameter, fall with gravity
- **Parchment Modal**: Aged paper texture, torn edges, sepia tones
- **Modal Background**: Dark overlay (80% opacity) with vignette effect
- **Task Details**: Handwritten-style font, ink splotches, wax seal decoration

### 4. Particle Effects

#### Particle Types

**Life Energy (Active Tasks)**
- Color: `#4ade80` (green) to `#60a5fa` (blue)
- Size: 2-4px
- Speed: 20-40px/s upward
- Lifespan: 1-2 seconds
- Count: 5-10 particles on hover

**Spirit Particles (Completed Tasks)**
- Color: `#ffffff` (white) with transparency
- Size: 1-3px
- Speed: 10-20px/s upward (slow, ethereal)
- Lifespan: 2-3 seconds
- Count: 3-5 particles continuously

**Urgency Particles (High Priority)**
- Color: `#f87171` (red) to `#fb923c` (orange)
- Size: 3-5px
- Speed: 30-50px/s (fast, energetic)
- Lifespan: 0.5-1 second
- Count: 8-12 particles on hover

#### Particle Behavior
- Spawn from tombstone base
- Rise upward with slight random horizontal drift
- Fade out as they rise
- Can be affected by wind (slight horizontal push)

### 5. Ghostly Transparency Effect

#### Visual Progression
```
Task Completed:
1. Instant: Opacity drops to 80%
2. 0.5s: Opacity drops to 50%, glow appears
3. 1.0s: Opacity drops to 30%, float animation starts
4. 2.0s: Final state - 30% opacity, continuous float
```

#### Glow Effect
```css
.completed-tombstone {
  opacity: 0.3;
  filter: blur(1px);
  box-shadow: 
    0 0 10px rgba(255, 255, 255, 0.5),
    0 0 20px rgba(173, 216, 230, 0.3);
  animation: ghost-float 3s ease-in-out infinite;
}

@keyframes ghost-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}
```

## Component Architecture

### Component Hierarchy
```
GraveyardDashboard
└── PhysicsGraveyard (new)
    ├── MoonLighting (new)
    ├── ParticleSystem (new)
    └── GraveyardView (enhanced)
        └── TombstonePhysics (new wrapper)
            └── Tombstone (existing, enhanced)
                └── DiggingModal (new, on click)
```

### State Management

```typescript
interface PhysicsGraveyardState {
  // Physics
  windIntensity: number; // 0-100
  windDirection: number; // radians
  windSpeed: number; // m/s
  
  // Moon lighting
  moonPhase: MoonPhase;
  lightingIntensity: number; // 0-100
  shadowDirection: number; // radians
  
  // Particles
  particleSystemEnabled: boolean;
  activeParticles: Particle[];
  
  // Interactions
  diggingTombstoneId: string | null;
  hoveredTombstoneId: string | null;
  
  // Performance
  performanceMode: 'high' | 'medium' | 'low';
}
```

## Technical Implementation

### Physics Engine Setup (Matter.js)

```typescript
import Matter from 'matter-js';

// Create physics world
const engine = Matter.Engine.create();
const world = engine.world;

// Wind force application
function applyWind(body: Matter.Body, windIntensity: number) {
  const windForce = {
    x: Math.sin(Date.now() / 1000) * windIntensity * 0.001,
    y: 0
  };
  Matter.Body.applyForce(body, body.position, windForce);
}

// Tombstone body creation
function createTombstoneBody(
  x: number, 
  y: number, 
  priority: 'low' | 'medium' | 'high'
) {
  const mass = priority === 'high' ? 10 : priority === 'medium' ? 5 : 2;
  
  return Matter.Bodies.rectangle(x, y, 80, 120, {
    mass,
    frictionAir: 0.1,
    restitution: 0.3,
    chamfer: { radius: 5 }
  });
}
```

### Moon Lighting Calculation

```typescript
function calculateMoonLighting(moonPhase: MoonPhase) {
  const phase = moonPhase.phase; // 0-1
  
  return {
    brightness: Math.sin(phase * Math.PI) * 0.9 + 0.1, // 10-100%
    colorTemperature: 2000 + (phase * 4000), // 2000K-6000K
    shadowIntensity: 1 - (Math.sin(phase * Math.PI) * 0.8), // 20-100%
    shadowDirection: phase < 0.5 
      ? (phase * Math.PI) // Left side (waxing)
      : ((1 - phase) * Math.PI) // Right side (waning)
  };
}
```

### Particle System

```typescript
class ParticleSystem {
  private particles: Particle[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  spawnParticle(
    x: number, 
    y: number, 
    type: 'life' | 'spirit' | 'urgency'
  ) {
    const config = PARTICLE_CONFIGS[type];
    this.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * config.speed,
      vy: -Math.random() * config.speed,
      life: config.lifespan,
      maxLife: config.lifespan,
      color: config.color,
      size: config.size
    });
  }
  
  update(deltaTime: number) {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.life -= deltaTime;
      return particle.life > 0;
    });
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      this.ctx.fillStyle = `${particle.color}${Math.floor(alpha * 255).toString(16)}`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
}
```

## Performance Optimization

### Level of Detail (LOD) System
- **High Detail**: Visible tombstones (viewport + 200px margin)
- **Medium Detail**: Nearby tombstones (200-500px from viewport)
- **Low Detail**: Distant tombstones (500px+ from viewport)

### Adaptive Quality
```typescript
function getPerformanceMode(fps: number): 'high' | 'medium' | 'low' {
  if (fps > 55) return 'high';
  if (fps > 30) return 'medium';
  return 'low';
}

// Adjust based on performance
if (performanceMode === 'low') {
  particleCount = Math.floor(particleCount * 0.5);
  physicsUpdateRate = 30; // Instead of 60
  disableWindEffects = true;
}
```

## Accessibility Considerations

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .tombstone {
    animation: none !important;
    transform: none !important;
  }
  
  .particle-system {
    display: none;
  }
}
```

### Keyboard Navigation
- Tab: Focus next tombstone
- Shift+Tab: Focus previous tombstone
- Enter/Space: Dig up focused tombstone
- Arrow keys: Navigate between tombstones in grid

### Screen Reader Support
```typescript
// Announce state changes
function announceTombstoneState(task: Task) {
  const message = task.completed
    ? `${task.title} completed, now ghostly`
    : `${task.title}, ${task.priority} priority`;
  announce(message);
}
```



