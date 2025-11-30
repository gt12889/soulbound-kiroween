# Theme System - Design Specification

## Architecture

### Theme Context Structure

```typescript
interface ThemeContextValue {
  currentTheme: Theme;
  availableThemes: Theme[];
  setTheme: (themeId: string) => void;
  createCustomTheme: (theme: Partial<Theme>) => void;
  updateCustomTheme: (themeId: string, updates: Partial<Theme>) => void;
  deleteCustomTheme: (themeId: string) => void;
  exportTheme: (themeId: string) => string;
  importTheme: (themeJson: string) => void;
  resetToDefault: () => void;
  isTransitioning: boolean;
}
```

### CSS Variable Mapping

```css
:root {
  /* Background Colors */
  --bg-primary: var(--theme-bg-primary);
  --bg-secondary: var(--theme-bg-secondary);
  --bg-tertiary: var(--theme-bg-tertiary);
  
  /* Text Colors */
  --text-primary: var(--theme-text-primary);
  --text-secondary: var(--theme-text-secondary);
  --text-tertiary: var(--theme-text-tertiary);
  
  /* Accent Colors */
  --accent-purple: var(--theme-accent-purple);
  --accent-purple-light: var(--theme-accent-purple-light);
  --accent-blue: var(--theme-accent-blue);
  --accent-green: var(--theme-accent-green);
  --accent-orange: var(--theme-accent-orange);
  --accent-red: var(--theme-accent-red);
  
  /* UI Elements */
  --border-primary: var(--theme-border-primary);
  --border-secondary: var(--theme-border-secondary);
  --shadow-light: var(--theme-shadow-light);
  --shadow-medium: var(--theme-shadow-medium);
  --shadow-heavy: var(--theme-shadow-heavy);
  
  /* Glow Effects */
  --glow-purple: var(--theme-glow-purple);
  --glow-blue: var(--theme-glow-blue);
  --glow-green: var(--theme-glow-green);
  --glow-orange: var(--theme-glow-orange);
  --glow-red: var(--theme-glow-red);
  
  /* Typography */
  --font-primary: var(--theme-font-primary);
  --font-secondary: var(--theme-font-secondary);
  --font-mono: var(--theme-font-mono);
  
  /* Spacing */
  --spacing-unit: var(--theme-spacing-unit);
  --spacing-xs: calc(var(--spacing-unit) * 0.5);
  --spacing-sm: var(--spacing-unit);
  --spacing-md: calc(var(--spacing-unit) * 2);
  --spacing-lg: calc(var(--spacing-unit) * 3);
  --spacing-xl: calc(var(--spacing-unit) * 4);
  
  /* Border Radius */
  --radius-sm: var(--theme-radius-sm);
  --radius-md: var(--theme-radius-md);
  --radius-lg: var(--theme-radius-lg);
  
  /* Transitions */
  --transition-fast: var(--theme-transition-fast);
  --transition-medium: var(--theme-transition-medium);
  --transition-slow: var(--theme-transition-slow);
}
```

## Theme Definitions

### Midnight Forest Theme

```typescript
export const midnightForest: Theme = {
  id: 'midnight-forest',
  name: 'Midnight Forest',
  type: 'dark',
  colors: {
    bgPrimary: '#0a0e1a',
    bgSecondary: '#1a1f2e',
    bgTertiary: '#2a2f3e',
    
    textPrimary: '#e0e0e0',
    textSecondary: '#b0b0b0',
    textTertiary: '#808080',
    
    accentPurple: '#8a2be2',
    accentPurpleLight: '#9d4edd',
    accentBlue: '#4169e1',
    accentGreen: '#2ecc71',
    accentOrange: '#e67e22',
    accentRed: '#e74c3c',
    
    borderPrimary: '#3a3f4e',
    borderSecondary: '#2a2f3e',
    shadowLight: 'rgba(0, 0, 0, 0.1)',
    shadowMedium: 'rgba(0, 0, 0, 0.3)',
    shadowHeavy: 'rgba(0, 0, 0, 0.5)',
    
    glowPurple: 'rgba(138, 43, 226, 0.5)',
    glowBlue: 'rgba(65, 105, 225, 0.5)',
    glowGreen: 'rgba(46, 204, 113, 0.5)',
    glowOrange: 'rgba(230, 126, 34, 0.5)',
    glowRed: 'rgba(231, 76, 60, 0.5)',
  },
  fonts: {
    primary: "'Cinzel', serif",
    secondary: "'Lora', serif",
    mono: "'Fira Code', monospace",
  },
  spacing: {
    unit: 8,
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  transitions: {
    fast: '150ms ease-in-out',
    medium: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
};
```

### Crimson Dusk Theme

```typescript
export const crimsonDusk: Theme = {
  id: 'crimson-dusk',
  name: 'Crimson Dusk',
  type: 'dark',
  colors: {
    bgPrimary: '#1a0a0a',
    bgSecondary: '#2a1a1a',
    bgTertiary: '#3a2a2a',
    
    textPrimary: '#f0e0e0',
    textSecondary: '#c0b0b0',
    textTertiary: '#908080',
    
    accentPurple: '#c41e3a',
    accentPurpleLight: '#d63447',
    accentBlue: '#8b4789',
    accentGreen: '#d4af37',
    accentOrange: '#ff6b35',
    accentRed: '#dc143c',
    
    borderPrimary: '#4a3a3a',
    borderSecondary: '#3a2a2a',
    shadowLight: 'rgba(20, 0, 0, 0.2)',
    shadowMedium: 'rgba(20, 0, 0, 0.4)',
    shadowHeavy: 'rgba(20, 0, 0, 0.6)',
    
    glowPurple: 'rgba(196, 30, 58, 0.5)',
    glowBlue: 'rgba(139, 71, 137, 0.5)',
    glowGreen: 'rgba(212, 175, 55, 0.5)',
    glowOrange: 'rgba(255, 107, 53, 0.5)',
    glowRed: 'rgba(220, 20, 60, 0.5)',
  },
  fonts: {
    primary: "'Cinzel', serif",
    secondary: "'Lora', serif",
    mono: "'Fira Code', monospace",
  },
  spacing: {
    unit: 8,
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  transitions: {
    fast: '150ms ease-in-out',
    medium: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
};
```

### Ethereal Mist Theme

```typescript
export const etherealMist: Theme = {
  id: 'ethereal-mist',
  name: 'Ethereal Mist',
  type: 'light',
  colors: {
    bgPrimary: '#f8f9fa',
    bgSecondary: '#e9ecef',
    bgTertiary: '#dee2e6',
    
    textPrimary: '#212529',
    textSecondary: '#495057',
    textTertiary: '#6c757d',
    
    accentPurple: '#6f42c1',
    accentPurpleLight: '#8357d5',
    accentBlue: '#0d6efd',
    accentGreen: '#198754',
    accentOrange: '#fd7e14',
    accentRed: '#dc3545',
    
    borderPrimary: '#ced4da',
    borderSecondary: '#dee2e6',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowMedium: 'rgba(0, 0, 0, 0.1)',
    shadowHeavy: 'rgba(0, 0, 0, 0.15)',
    
    glowPurple: 'rgba(111, 66, 193, 0.3)',
    glowBlue: 'rgba(13, 110, 253, 0.3)',
    glowGreen: 'rgba(25, 135, 84, 0.3)',
    glowOrange: 'rgba(253, 126, 20, 0.3)',
    glowRed: 'rgba(220, 53, 69, 0.3)',
  },
  fonts: {
    primary: "'Cinzel', serif",
    secondary: "'Lora', serif",
    mono: "'Fira Code', monospace",
  },
  spacing: {
    unit: 8,
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  transitions: {
    fast: '150ms ease-in-out',
    medium: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
};
```

## Theme Transition Animation

```css
/* Smooth theme transition */
@keyframes themeTransition {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

body.theme-transitioning {
  animation: themeTransition 500ms ease-in-out;
}

/* Transition all color properties */
* {
  transition: 
    background-color var(--transition-medium),
    color var(--transition-medium),
    border-color var(--transition-medium),
    box-shadow var(--transition-medium);
}

/* Disable transitions during theme change for instant update */
body.theme-changing * {
  transition: none !important;
}
```

## Theme Selector Component

```typescript
interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const { currentTheme, availableThemes, setTheme } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.themeSelector}>
        <h2>Choose Your Theme</h2>
        
        <div className={styles.themeGrid}>
          {availableThemes.map(theme => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme.id === theme.id}
              onSelect={() => setTheme(theme.id)}
              onPreview={() => setPreviewTheme(theme.id)}
            />
          ))}
        </div>
        
        <div className={styles.actions}>
          <button onClick={() => /* open custom theme creator */}>
            Create Custom Theme
          </button>
          <button onClick={() => /* open import dialog */}>
            Import Theme
          </button>
        </div>
      </div>
    </Modal>
  );
};
```

## Theme Card Component

```typescript
interface ThemeCardProps {
  theme: Theme;
  isActive: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  isActive,
  onSelect,
  onPreview,
}) => {
  return (
    <div
      className={`${styles.themeCard} ${isActive ? styles.active : ''}`}
      onMouseEnter={onPreview}
      onClick={onSelect}
    >
      <div className={styles.preview}>
        <div
          className={styles.colorSwatch}
          style={{ backgroundColor: theme.colors.bgPrimary }}
        />
        <div
          className={styles.colorSwatch}
          style={{ backgroundColor: theme.colors.accentPurple }}
        />
        <div
          className={styles.colorSwatch}
          style={{ backgroundColor: theme.colors.accentBlue }}
        />
      </div>
      
      <div className={styles.info}>
        <h3>{theme.name}</h3>
        <span className={styles.type}>{theme.type}</span>
      </div>
      
      {isActive && (
        <div className={styles.activeIndicator}>
          <CheckIcon />
        </div>
      )}
    </div>
  );
};
```

## System Theme Detection

```typescript
const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return systemTheme;
};
```

## Theme Persistence

```typescript
const THEME_STORAGE_KEY = 'dark-productivity-theme';
const THEME_VERSION = '1.0.0';

interface StoredTheme {
  version: string;
  themeId: string;
  customThemes: Theme[];
  lastUpdated: string;
}

const saveThemePreference = (themeId: string, customThemes: Theme[]) => {
  const data: StoredTheme = {
    version: THEME_VERSION,
    themeId,
    customThemes,
    lastUpdated: new Date().toISOString(),
  };
  
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(data));
};

const loadThemePreference = (): StoredTheme | null => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (!stored) return null;
    
    const data: StoredTheme = JSON.parse(stored);
    
    // Version migration logic here
    if (data.version !== THEME_VERSION) {
      return migrateThemeData(data);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load theme preference:', error);
    return null;
  }
};
```

## Accessibility Considerations

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --bg-primary: #000000;
    --bg-secondary: #1a1a1a;
    --text-primary: #ffffff;
    --border-primary: #ffffff;
  }
  
  * {
    border-width: 2px !important;
  }
  
  button, a {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast Ratios

All theme combinations must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

## Performance Optimizations

### CSS Variable Updates

```typescript
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  // Batch DOM updates
  requestAnimationFrame(() => {
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${kebabCase(key)}`, value);
    });
  });
};
```

### Theme Preloading

```typescript
const preloadTheme = (theme: Theme) => {
  // Create hidden div with theme applied
  const preloader = document.createElement('div');
  preloader.style.cssText = `
    position: absolute;
    opacity: 0;
    pointer-events: none;
  `;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    preloader.style.setProperty(`--theme-${kebabCase(key)}`, value);
  });
  
  document.body.appendChild(preloader);
  
  // Force browser to compute styles
  window.getComputedStyle(preloader).opacity;
  
  // Clean up
  document.body.removeChild(preloader);
};
```

## Testing Requirements

### Visual Regression Tests
- Screenshot each theme
- Compare color accuracy
- Verify contrast ratios
- Test all components in each theme

### Accessibility Tests
- Run axe-core on each theme
- Verify keyboard navigation
- Test with screen readers
- Check color contrast

### Performance Tests
- Measure theme switch time
- Check for layout shifts
- Monitor memory usage
- Test on low-end devices
