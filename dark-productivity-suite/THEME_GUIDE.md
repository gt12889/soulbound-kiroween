# Theme System Guide

Complete guide to the Dark Productivity Suite's theme system and visual customization.

## Table of Contents

1. [Overview](#overview)
2. [Available Themes](#available-themes)
3. [Changing Themes](#changing-themes)
4. [Theme Components](#theme-components)
5. [Creating Custom Themes](#creating-custom-themes)
6. [Theme Persistence](#theme-persistence)
7. [Technical Details](#technical-details)

---

## Overview

The Dark Productivity Suite features a comprehensive theme system that allows you to customize the visual atmosphere of the entire application. Each theme provides a unique color palette and aesthetic while maintaining the gothic, mystical feel.

### Theme Features

- **Multiple Themes**: 3 built-in themes with distinct aesthetics
- **Instant Switching**: Apply themes immediately with smooth transitions
- **Consistent Application**: All modules use the selected theme
- **Cloud Sync**: Theme preferences sync across devices
- **Real-time Preview**: Hover to preview themes before applying
- **Smooth Transitions**: 500ms fade between themes
- **Persistent Selection**: Theme choice saved to your profile

---

## Available Themes

### Default Dark

The original gothic aesthetic with purple accents and deep blacks.

**Visual Characteristics:**
- Deep, rich blacks for maximum contrast
- Purple accents for mystical touches
- Ethereal blues and greens for highlights
- Off-white text for excellent readability

**Color Palette:**
```
Background Primary:    #0a0a0a (Deep Black)
Background Secondary:  #1a1a1a (Charcoal)
Text Primary:          #e0e0e0 (Off-White)
Text Secondary:        #b0b0b0 (Light Gray)
Accent Primary:        #2d1b4e (Dark Purple)
Accent Secondary:      #4a2d6e (Medium Purple)
Highlight:             #3d5a80 (Ethereal Blue)
Warning:               #4a1a1a (Deep Red)
```

**Best For:**
- General use
- Long reading sessions
- Balanced contrast
- Classic gothic aesthetic

**Mood:**
- Mystical and mysterious
- Professional yet creative
- Focused and contemplative

---

### Blood Moon

Crimson and blood red tones for an intense, dramatic atmosphere.

**Visual Characteristics:**
- Blacks with subtle red tint
- Crimson and blood red accents
- Warm, intense color scheme
- High contrast for dramatic effect

**Color Palette:**
```
Background Primary:    #0a0505 (Black with Red Tint)
Background Secondary:  #1a0a0a (Dark Crimson)
Text Primary:          #e0c0c0 (Pale Red)
Text Secondary:        #b08080 (Dusty Rose)
Accent Primary:        #4a0000 (Blood Red)
Accent Secondary:      #6e1a1a (Crimson)
Highlight:             #803d3d (Dark Orange-Red)
Warning:               #8a0000 (Bright Red)
```

**Best For:**
- Evening/night work
- Creative writing
- Intense focus sessions
- Dramatic aesthetic preference

**Mood:**
- Intense and passionate
- Dramatic and bold
- Energetic and powerful

---

### Midnight Forest

Dark greens and earth tones for a natural, mystical feel.

**Visual Characteristics:**
- Blacks with subtle green tint
- Forest greens and teals
- Natural, earthy color scheme
- Calming yet mysterious

**Color Palette:**
```
Background Primary:    #050a05 (Black with Green Tint)
Background Secondary:  #0a1a0a (Dark Forest)
Text Primary:          #c0e0c0 (Pale Green)
Text Secondary:        #80b080 (Sage)
Accent Primary:        #1a4a2d (Deep Forest Green)
Accent Secondary:      #2d6e4a (Teal Green)
Highlight:             #2d4a3d (Forest Blue-Green)
Warning:               #4a3a1a (Amber)
```

**Best For:**
- Daytime work
- Long sessions
- Reduced eye strain
- Nature-inspired aesthetic

**Mood:**
- Calm and grounded
- Natural and organic
- Peaceful and focused

---

## Changing Themes

### Via Settings Panel

1. **Open Settings**
   - Click settings icon in navigation
   - Or press `Ctrl+,`

2. **Navigate to Appearance**
   - Click "Appearance" tab
   - View theme options

3. **Preview Themes**
   - Hover over theme cards
   - See color swatches
   - Preview in real-time

4. **Select Theme**
   - Click desired theme
   - Theme applies instantly
   - Smooth 500ms transition

### Via Theme Selector

1. **Open Theme Selector**
   - Click theme icon in navigation
   - Or use quick access menu

2. **Choose Theme**
   - Click theme preview
   - Or use keyboard shortcuts:
     - `1` - Default Dark
     - `2` - Blood Moon
     - `3` - Midnight Forest

3. **Apply**
   - Theme applies immediately
   - All modules update
   - Preference saved

### Keyboard Shortcuts

While theme selector is open:
- `1` - Switch to Default Dark
- `2` - Switch to Blood Moon
- `3` - Switch to Midnight Forest
- `Escape` - Close selector

---

## Theme Components

### What Themes Affect

Themes control the visual appearance of:

#### Core UI Elements
- Navigation bar
- Buttons and controls
- Input fields
- Modals and dialogs
- Tooltips
- Loading screens

#### Module-Specific Elements
- **Terminal Tarot**: Card backgrounds, text colors
- **Ghost Writer**: Editor background, suggestion styling
- **Necronomicon Notes**: Parchment color, ink effects
- **Graveyard Dashboard**: Tombstone colors, moon icons

#### Interactive Elements
- Hover states
- Focus indicators
- Active states
- Disabled states
- Selection highlights

#### Typography
- Text colors (primary, secondary, muted)
- Link colors
- Code block styling
- Header colors

### What Themes Don't Affect

- Font families (consistent across themes)
- Layout and spacing
- Animation timings
- Component structure
- Functionality

---

## Creating Custom Themes

### Custom Theme Support (Coming Soon)

Future versions will support user-created custom themes.

**Planned Features:**
- Theme editor interface
- Color picker for all elements
- Preview before saving
- Export/import themes
- Share themes with community

### Current Workaround

Advanced users can create custom themes by:

1. **Browser DevTools**
   - Inspect CSS variables
   - Override in browser console
   - Test color combinations

2. **Local Modifications**
   - Fork the repository
   - Edit theme files in `src/themes/`
   - Build and deploy custom version

**Theme File Structure:**
```typescript
// src/themes/customTheme.ts
export const customTheme = {
  id: 'custom',
  name: 'Custom Theme',
  colors: {
    background: '#000000',
    backgroundSecondary: '#111111',
    text: '#ffffff',
    textSecondary: '#cccccc',
    accent: '#ff0000',
    accentSecondary: '#cc0000',
    highlight: '#00ff00',
    warning: '#ffff00',
  },
};
```

---

## Theme Persistence

### Local Storage

Themes are saved to browser local storage:
- Persists across sessions
- Survives browser restarts
- Independent per browser/device

### Cloud Sync

With authentication enabled:
- Theme syncs to cloud
- Applies on all devices
- Updates in real-time
- Survives local storage clear

### Priority

Theme selection priority:
1. Cloud-synced preference (if authenticated)
2. Local storage preference
3. Default Dark (fallback)

---

## Technical Details

### CSS Variables

Themes use CSS custom properties for dynamic styling:

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --text-primary: #e0e0e0;
  --text-secondary: #b0b0b0;
  --accent-primary: #2d1b4e;
  --accent-secondary: #4a2d6e;
  --highlight: #3d5a80;
  --warning: #4a1a1a;
}
```

### Theme Switching

Theme changes update CSS variables:
1. User selects theme
2. Theme context updates
3. CSS variables injected
4. Smooth transition applied
5. Preference saved

### Performance

- **Instant Application**: No page reload required
- **Smooth Transitions**: 500ms fade effect
- **Minimal Overhead**: CSS variables are efficient
- **No Flash**: Proper loading prevents flash of unstyled content

### Browser Compatibility

- ✓ Chrome/Edge: Full support
- ✓ Firefox: Full support
- ✓ Safari: Full support
- ✓ Opera: Full support
- ✗ IE11: Not supported (CSS variables required)

---

## Accessibility

### Contrast Ratios

All themes meet WCAG AA standards:
- **Text**: 4.5:1 minimum contrast
- **Large Text**: 3:1 minimum contrast
- **UI Components**: 3:1 minimum contrast

### Color Blindness

Themes designed with color blindness in mind:
- Not relying solely on color for information
- Sufficient contrast for all types
- Icons and labels supplement color

### High Contrast Mode

Themes work with browser high contrast mode:
- Respects system preferences
- Maintains readability
- Preserves functionality

---

## Tips for Theme Selection

### Consider Your Environment

**Bright Rooms:**
- All themes work well
- Default Dark recommended
- Midnight Forest for reduced glare

**Dark Rooms:**
- Blood Moon for dramatic effect
- Default Dark for balance
- Avoid Midnight Forest (may be too bright)

**Mixed Lighting:**
- Default Dark most versatile
- Adjust based on time of day
- Use auto-switching (coming soon)

### Consider Your Work

**Writing/Reading:**
- Midnight Forest (easy on eyes)
- Default Dark (balanced)
- Avoid Blood Moon (too intense)

**Creative Work:**
- Blood Moon (inspiring)
- Default Dark (focused)
- Midnight Forest (calming)

**Task Management:**
- Any theme works well
- Personal preference matters most
- Try each for a day

### Time of Day

**Morning:**
- Midnight Forest (natural)
- Default Dark (energizing)

**Afternoon:**
- Default Dark (balanced)
- Any theme works

**Evening/Night:**
- Blood Moon (dramatic)
- Default Dark (comfortable)
- Avoid bright themes

---

## Troubleshooting

### Theme Not Applying

**Check:**
1. Settings saved correctly
2. Browser cache cleared
3. JavaScript enabled
4. CSS loaded properly

**Try:**
1. Refresh page
2. Clear browser cache
3. Sign out and sign in
4. Reset to default theme

### Theme Looks Wrong

**Possible Causes:**
- Browser extension interference
- Custom CSS overrides
- Cached old styles
- Browser compatibility

**Solutions:**
1. Disable browser extensions
2. Clear browser cache
3. Try different browser
4. Reset theme to default

### Theme Not Syncing

**Check:**
1. Signed in to account
2. Internet connection
3. Cloud sync enabled
4. Sync status indicator

**Try:**
1. Manual sync
2. Sign out and sign in
3. Check sync settings
4. Contact support

---

## Future Enhancements

### Planned Features

- **Custom Theme Creator**: Build your own themes
- **Theme Marketplace**: Share and download themes
- **Auto-Switching**: Change themes by time of day
- **Seasonal Themes**: Special themes for holidays
- **Theme Presets**: Quick theme combinations
- **Advanced Customization**: Fine-tune individual elements

### Community Themes

We plan to support community-created themes:
- Submit your themes
- Browse theme gallery
- Rate and review themes
- Install with one click

---

## Conclusion

The theme system in Dark Productivity Suite allows you to customize your experience while maintaining the mystical, gothic aesthetic. Experiment with different themes to find what works best for your workflow and environment.

**May your chosen theme enhance your mystical productivity.** 🎨🌙
