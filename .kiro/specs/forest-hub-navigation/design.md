# Forest Hub Navigation - Design Specification

## Visual Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         Moon Phase                          │
│                                                             │
│                                                             │
│         🌲              🌲              🌲                  │
│      Graveyard      Necronomicon    Ghost Writer           │
│                                                             │
│                                                             │
│              🌲                    🌲                       │
│           Terminal              Séance                      │
│             Tarot              Chamber                      │
│                                                             │
│                    ≈≈≈ Fog Layer ≈≈≈                      │
└─────────────────────────────────────────────────────────────┘
```

### Tree Coordinates (1920x1080 viewport)

```javascript
const TREE_POSITIONS = {
  graveyard: { x: 25, y: 30, size: 'large' },      // Top-left
  necronomicon: { x: 50, y: 25, size: 'large' },   // Top-center
  ghostWriter: { x: 75, y: 30, size: 'large' },    // Top-right
  terminalTarot: { x: 35, y: 60, size: 'medium' }, // Bottom-left
  seanceChamber: { x: 65, y: 60, size: 'medium' }  // Bottom-right
};
```

Coordinates are in percentages for responsive scaling.

### Color Palette

```css
/* Tree Glow Colors */
--glow-graveyard: rgba(138, 43, 226, 0.6);    /* Purple */
--glow-necronomicon: rgba(65, 105, 225, 0.6); /* Royal Blue */
--glow-ghost-writer: rgba(46, 204, 113, 0.6); /* Emerald */
--glow-tarot: rgba(230, 126, 34, 0.6);        /* Orange */
--glow-seance: rgba(231, 76, 60, 0.6);        /* Red */

/* Fog Layers */
--fog-primary: rgba(200, 200, 220, 0.15);
--fog-secondary: rgba(180, 180, 200, 0.1);
--fog-tertiary: rgba(160, 160, 180, 0.05);
```

### Typography

```css
/* Tree Labels */
font-family: 'Cinzel', serif;
font-size: 1.2rem;
font-weight: 600;
text-shadow: 0 0 10px currentColor;

/* Sidebar Content */
font-family: 'Lora', serif;
font-size: 1rem;
line-height: 1.6;
```

## Component Architecture

### ForestHub Component

```typescript
interface ForestHubProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  showAmbientEffects?: boolean;
}

interface TreeSection {
  id: string;
  name: string;
  route: string;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  glowColor: string;
  icon: ReactNode;
  description: string;
  stats?: {
    label: string;
    value: string | number;
  }[];
}
```

### Tree Component

```typescript
interface TreeProps {
  section: TreeSection;
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}
```

### Sidebar Component

```typescript
interface SidebarProps {
  section: TreeSection | null;
  isVisible: boolean;
  position: 'left' | 'right';
}
```

## Animation Specifications

### Tree Hover Animation

```css
@keyframes treeGlow {
  0%, 100% {
    filter: drop-shadow(0 0 20px var(--glow-color));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 40px var(--glow-color));
    transform: scale(1.05);
  }
}

.tree:hover {
  animation: treeGlow 2s ease-in-out infinite;
  cursor: pointer;
}
```

### Fog Layer Animation

```css
@keyframes fogDrift {
  0% {
    transform: translateX(-10%) translateY(0);
    opacity: 0.15;
  }
  50% {
    transform: translateX(10%) translateY(-5%);
    opacity: 0.25;
  }
  100% {
    transform: translateX(-10%) translateY(0);
    opacity: 0.15;
  }
}

.fogLayer {
  animation: fogDrift 30s ease-in-out infinite;
}

.fogLayer:nth-child(2) {
  animation-duration: 45s;
  animation-delay: -15s;
}

.fogLayer:nth-child(3) {
  animation-duration: 60s;
  animation-delay: -30s;
}
```

### Sidebar Reveal

```css
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.sidebar.visible {
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Tree Selection Pulse

```css
@keyframes selectionPulse {
  0%, 100% {
    box-shadow: 0 0 20px var(--glow-color);
  }
  50% {
    box-shadow: 0 0 40px var(--glow-color),
                0 0 60px var(--glow-color);
  }
}

.tree.active {
  animation: selectionPulse 2s ease-in-out infinite;
}
```

## Interaction States

### Tree States

1. **Default**: Subtle glow, normal size
2. **Hover**: Increased glow, scale 1.05, show sidebar
3. **Active**: Continuous pulse animation, brightest glow
4. **Disabled**: Grayscale filter, reduced opacity (0.5)

### Sidebar States

1. **Hidden**: translateX(100%), opacity 0
2. **Revealing**: Slide-in animation (300ms)
3. **Visible**: translateX(0), opacity 1
4. **Hiding**: Slide-out animation (200ms)

## Responsive Breakpoints

### Desktop (1200px+)
- Full forest layout with all trees visible
- Sidebar width: 320px
- Tree size: large (180px), medium (140px)

### Tablet (768px - 1199px)
- Compact forest layout
- Sidebar width: 280px
- Tree size: medium (120px), small (90px)
- Reduced fog layers (2 instead of 3)

### Mobile (< 768px)
- Vertical list layout
- No sidebar (info shown inline)
- Tree icons only (60px)
- No fog animations (performance)

## Accessibility Features

### Keyboard Navigation

```typescript
const KEYBOARD_SHORTCUTS = {
  '1': 'graveyard',
  '2': 'necronomicon',
  '3': 'ghostWriter',
  '4': 'terminalTarot',
  '5': 'seanceChamber',
  'Escape': 'closeModal',
  'Tab': 'nextTree',
  'Shift+Tab': 'previousTree',
  'Enter': 'selectTree',
  'Space': 'selectTree'
};
```

### ARIA Labels

```html
<button
  role="navigation"
  aria-label="Navigate to Graveyard Dashboard"
  aria-current={isActive ? "page" : undefined}
  aria-describedby="graveyard-description"
>
  <TreeIcon />
  <span id="graveyard-description" className="sr-only">
    Task management with tombstone visualization
  </span>
</button>
```

### Focus Management

- Visible focus rings with high contrast
- Focus trap within sidebar when open
- Return focus to tree after sidebar closes
- Skip navigation link for screen readers

## Performance Optimizations

### Lazy Loading

```typescript
const TreeIcon = lazy(() => import('./TreeIcon'));
const FogLayer = lazy(() => import('./FogLayer'));
```

### Memoization

```typescript
const MemoizedTree = memo(Tree, (prev, next) => {
  return prev.isActive === next.isActive &&
         prev.isHovered === next.isHovered;
});
```

### Debouncing

```typescript
const debouncedHover = useMemo(
  () => debounce((hovered: boolean) => {
    setShowSidebar(hovered);
  }, 150),
  []
);
```

### GPU Acceleration

```css
.tree, .fogLayer, .sidebar {
  will-change: transform, opacity;
  transform: translateZ(0);
}
```

## Theme Integration

### Dark Mode (Default)

```css
--forest-bg: linear-gradient(180deg, #0a0e1a 0%, #1a1f2e 100%);
--tree-base: #2a3f2a;
--tree-highlight: #3d5a3d;
```

### Light Mode (Optional)

```css
--forest-bg: linear-gradient(180deg, #e8f4f8 0%, #d0e8f0 100%);
--tree-base: #4a6f4a;
--tree-highlight: #5d8f5d;
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  .tree {
    border: 3px solid currentColor;
  }
  .tree:focus {
    outline: 4px solid var(--focus-color);
    outline-offset: 4px;
  }
}
```

## Testing Requirements

### Visual Regression Tests
- Screenshot comparison for each tree state
- Sidebar reveal/hide animations
- Responsive layout at all breakpoints

### Interaction Tests
- Click navigation works for all trees
- Keyboard shortcuts trigger correct routes
- Hover shows/hides sidebar correctly
- Focus management follows accessibility guidelines

### Performance Tests
- Animation frame rate stays above 55fps
- Initial render under 100ms
- Interaction response under 16ms
