# Theme-Specific Dialogue Demo

## How It Works

When a user changes the theme in Kiroween, their Spirit Companion will react with a personality-specific comment about the new aesthetic.

## Example Flow

### Scenario 1: Shadow Companion + Blood Moon Theme

1. User has Shadow companion active
2. User switches from "Default Dark" to "Blood Moon" theme
3. Shadow companion displays: *"The crimson moon rises... how fitting."*
4. Dialogue appears in a speech bubble above the companion
5. Text appears with typewriter effect
6. Dialogue auto-dismisses after 5 seconds

### Scenario 2: Forest Companion + Midnight Forest Theme

1. User has Forest companion active
2. User switches to "Midnight Forest" theme
3. Forest companion displays: *"Ah, home! The deep forest at night."*
4. Speech bubble has green border (forest companion color)
5. Dialogue fades out after 5 seconds

### Scenario 3: Ember Companion + Default Dark Theme

1. User has Ember companion active
2. User switches to "Default Dark" theme
3. Ember companion displays: *"A dark canvas for our flames to shine."*
4. Speech bubble has orange border (ember companion color)
5. User can manually dismiss by clicking the × button

## Visual Example

```
┌─────────────────────────────────────────┐
│  "The crimson moon rises... how         │
│   fitting."                             │
│         ▼                               │
│                                         │
│         👻                              │
│    (Shadow Companion)                   │
│                                         │
└─────────────────────────────────────────┘
```

## All Dialogue Options

### Shadow Companion
- **Default Dark**: 
  - "Ah, the classic darkness. Timeless and elegant."
  - "This familiar void suits us well."
  - "The original shadows... always reliable."
  
- **Blood Moon**: 
  - "The crimson moon rises... how fitting."
  - "Blood and shadows... a powerful combination."
  - "This red hue stirs ancient memories."
  
- **Midnight Forest**: 
  - "The forest at night... mysterious and deep."
  - "I sense the whispers of ancient trees."
  - "Nature's darkness has its own secrets."

### Forest Companion
- **Default Dark**: 
  - "A simple, clean environment. Like a well-tended garden."
  - "This classic setting lets us focus on growth."
  - "Elegant simplicity, like a zen garden."
  
- **Blood Moon**: 
  - "The red moon affects even the forest."
  - "Crimson light through the trees... unusual but beautiful."
  - "Nature adapts to all conditions, even this."
  
- **Midnight Forest**: 
  - "Ah, home! The deep forest at night."
  - "This is where I feel most alive."
  - "The midnight forest... my natural habitat."

### Ember Companion
- **Default Dark**: 
  - "A dark canvas for our flames to shine."
  - "Classic darkness makes the fire stand out."
  - "Simple and effective, like a well-tended hearth."
  
- **Blood Moon**: 
  - "Red on red... the fire intensifies!"
  - "This crimson atmosphere fuels my flames!"
  - "Blood and fire... a powerful combination!"
  
- **Midnight Forest**: 
  - "Fire in the forest... we must be careful."
  - "The contrast of flame and foliage is striking."
  - "Even in the deep woods, fire finds its place."

## Technical Implementation

### User Action
```typescript
// User clicks theme selector
<ThemeSelector onThemeChange={(themeId) => switchTheme(themeId)} />
```

### Theme Change Detection
```typescript
// CompanionContext detects theme change
useEffect(() => {
  if (previousTheme !== themeId && previousTheme !== '') {
    const dialogue = getThemeDialogue(activeCompanion, themeId);
    setThemeChangeDialogue(dialogue);
    setTimeout(() => setThemeChangeDialogue(null), 5000);
  }
  setPreviousTheme(themeId);
}, [themeId, previousTheme, activeCompanion]);
```

### Dialogue Display
```typescript
// InteractiveCompanion shows dialogue
{themeChangeDialogue && (
  <CompanionDialogue
    message={themeChangeDialogue}
    companionType={activeCompanion}
    position="top"
    duration={5000}
    showTail={true}
  />
)}
```

## Testing the Feature

### Manual Testing Steps:
1. Open Kiroween application
2. Navigate to Settings or Theme Selector
3. Change theme from one to another
4. Observe companion's dialogue response
5. Verify dialogue matches companion personality
6. Confirm dialogue auto-dismisses after 5 seconds
7. Try different companion types
8. Try all theme combinations

### Expected Behavior:
- ✅ Dialogue appears immediately after theme change
- ✅ Message is personality-appropriate for active companion
- ✅ Speech bubble has companion-colored border
- ✅ Typewriter effect displays text smoothly
- ✅ Dialogue auto-dismisses after 5 seconds
- ✅ No dialogue on initial page load
- ✅ Different messages for different themes
- ✅ Accessible to screen readers

## Accessibility Features

- **ARIA Labels**: Dialogue has `role="tooltip"` and `aria-live="polite"`
- **Screen Reader**: Message is announced: "Shadow companion says: The crimson moon rises... how fitting."
- **Keyboard**: Dismiss button is keyboard accessible (Tab + Enter)
- **Reduced Motion**: Respects `prefers-reduced-motion` setting

## Integration with Other Features

### Works With:
- ✅ Theme System (ThemeContext)
- ✅ Companion Selection (CompanionContext)
- ✅ Custom Naming (displays custom name if set)
- ✅ Mood System (dialogue color matches mood)
- ✅ Firebase Sync (theme preference synced)

### Future Integration:
- 🔄 Sound effects when dialogue appears
- 🔄 Achievement for trying all themes
- 🔄 Special dialogue for rapid theme switching
- 🔄 Dialogue history/log feature

## Performance Notes

- **Lazy Loading**: Dialogue service imported only when needed
- **Memory**: Dialogue cleared after 5 seconds to prevent memory leaks
- **Re-renders**: Minimal - only updates on actual theme changes
- **Bundle Size**: ~3KB added for dialogue service

## User Feedback

Expected user reactions:
- 😊 "My companion noticed I changed the theme!"
- 🎨 "The dialogue matches the companion's personality perfectly"
- 💜 "This makes the app feel more alive and responsive"
- ✨ "I love trying different themes just to see what they say"

## Conclusion

The theme-specific dialogue feature adds a delightful layer of personality and responsiveness to the Spirit Companion system. It reinforces the emotional connection between users and their companions while providing contextual feedback on aesthetic choices.
