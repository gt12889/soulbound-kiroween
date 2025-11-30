# Companion Name Input - Implementation Guide

## Overview

This guide explains the custom naming feature for Spirit Companions, implemented as part of Task 4.3.

## What Was Built

A complete stats modal (`CompanionStats.tsx`) that includes:
- Comprehensive companion statistics display
- **Custom name input field with validation**
- Experience progress tracking
- Mood display
- Task and interaction statistics

## Key Features

### 1. Name Input Field

The name input appears when users click the "Edit Name" button:

```tsx
// Display mode (default)
<span className={styles.companionName}>
  "{customName || defaultName}"
</span>
<button onClick={() => setIsEditingName(true)}>
  ✏️ Edit Name
</button>

// Edit mode
<input
  type="text"
  value={nameInput}
  onChange={handleNameChange}
  placeholder="Enter companion name"
  autoFocus
/>
```

### 2. Validation Rules

- **Minimum**: 1 character
- **Maximum**: 20 characters
- **Trimming**: Whitespace is trimmed before saving
- **Real-time**: Validation occurs as user types

### 3. User Feedback

- Character counter: `7/20`
- Error messages:
  - "Name must be at least 1 character"
  - "Name must be 20 characters or less"
- Disabled save button when invalid
- Visual error styling (red border, error text)

### 4. Persistence

Names are automatically persisted through:
1. **CompanionContext** - Manages state
2. **localStorage** - Local persistence
3. **Firebase** - Cloud sync for authenticated users

## How to Use

### Basic Usage

```tsx
import { CompanionStats } from './components/spirit-companion/CompanionStats';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        View Stats
      </button>
      
      <CompanionStats 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

### Accessing Custom Names

```tsx
import { useCompanion } from './contexts/CompanionContext';

function MyComponent() {
  const { customNames, activeCompanion } = useCompanion();
  
  const displayName = customNames[activeCompanion] || 'Shadow Spirit';
  
  return <div>Hello, {displayName}!</div>;
}
```

### Setting Names Programmatically

```tsx
import { useCompanion } from './contexts/CompanionContext';

function MyComponent() {
  const { setCustomName, activeCompanion } = useCompanion();
  
  const handleRename = () => {
    setCustomName(activeCompanion, 'Whisper');
  };
  
  return <button onClick={handleRename}>Rename to Whisper</button>;
}
```

## Integration Points

### 1. InteractiveCompanion Component

The InteractiveCompanion already uses custom names in its tooltip:

```tsx
aria-label={`${customNames[activeCompanion] || stageInfo.name} companion...`}
```

To add a stats button:

```tsx
<button 
  onClick={() => setShowStats(true)}
  className={styles.statsButton}
>
  📊 View Stats
</button>
```

### 2. Companion Dialogue

When displaying dialogue, use the custom name:

```tsx
const { customNames, activeCompanion } = useCompanion();
const name = customNames[activeCompanion] || 'Shadow Spirit';

return (
  <div className={styles.dialogue}>
    <strong>{name}:</strong> {message}
  </div>
);
```

### 3. Achievements & Notifications

Include custom names in achievement text:

```tsx
const name = customNames[activeCompanion] || 'Your companion';
showToast(`${name} has reached level 10!`);
```

## Styling

The component uses CSS modules with theme variables:

```css
.nameInput {
  background: var(--color-background-primary);
  border: 2px solid var(--color-accent);
  color: var(--color-text-primary);
  /* ... */
}

.nameInput[aria-invalid="true"] {
  border-color: #ff6b6b;
}
```

## Accessibility

The implementation follows WCAG 2.1 AA standards:

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader support (ARIA labels)
- ✅ Focus management (auto-focus on edit)
- ✅ Error announcements (aria-live regions)
- ✅ High contrast support
- ✅ Reduced motion support

## Testing

Run tests with:

```bash
npm test CompanionStats.test.tsx
```

Test coverage includes:
- Name display (default and custom)
- Edit mode activation
- Input validation
- Save/cancel functionality
- Keyboard shortcuts
- Accessibility features
- Persistence

## Future Enhancements

Potential improvements:
1. Name change animation/celebration
2. Toast notification on successful save
3. Name history (previous names)
4. Name suggestions based on companion type
5. Profanity filter
6. Unicode emoji support in names
7. Name length based on companion level

## Troubleshooting

### Name not persisting
- Check that CompanionProvider wraps your component
- Verify localStorage is enabled
- Check browser console for errors

### Name not syncing to Firebase
- Ensure user is authenticated
- Check Firebase configuration
- Verify cloudSyncService is working

### Validation not working
- Check that nameError state is being set
- Verify handleNameChange is called on input
- Ensure error messages are rendered

## API Reference

### CompanionStats Props

```typescript
interface CompanionStatsProps {
  isOpen: boolean;      // Controls modal visibility
  onClose: () => void;  // Called when modal should close
}
```

### CompanionContext Methods

```typescript
interface CompanionContextType {
  // Name-related
  customNames: Record<CompanionType, string | undefined>;
  setCustomName: (type: CompanionType, name: string) => void;
  activeCompanion: CompanionType;
  
  // Other methods...
}
```

## Related Files

- `CompanionStats.tsx` - Main component
- `CompanionStats.module.css` - Styles
- `CompanionStats.test.tsx` - Tests
- `CompanionStats.demo.tsx` - Usage examples
- `CompanionContext.tsx` - State management
- `TASK_4.3_NAME_INPUT_COMPLETE.md` - Implementation summary

## Support

For questions or issues:
1. Check the demo file for usage examples
2. Review the test file for expected behavior
3. Consult the design document for requirements
4. Check CompanionContext for state management details
