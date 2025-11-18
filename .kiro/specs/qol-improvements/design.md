# Quality of Life Improvements - Design Document

## Overview

This design document outlines the technical approach for implementing quality of life improvements across the Dark Productivity Suite. The improvements focus on performance optimization, enhanced user feedback, accessibility compliance, and convenience features that reduce friction in common workflows.

## Architecture

### Component Optimization Strategy

The application will implement React performance optimizations at three levels:

1. **Route-Level Code Splitting**: Use React.lazy() to split the application bundle by route, reducing initial load time
2. **Component-Level Memoization**: Apply React.memo to frequently re-rendering components to prevent unnecessary updates
3. **Hook-Level Optimization**: Use useMemo and useCallback to prevent expensive recalculations and function recreations

### State Management Enhancements

The existing Context-based state management will be enhanced with:

- Undo/redo history tracking in TasksContext and NotesContext
- Bulk operation support for multi-item actions
- Optimized selectors using useMemo for filtered and sorted data

### UI Feedback System

A new toast notification system will provide transient feedback for user actions:

- ToastContext for global toast state management
- ToastProvider wrapping the application
- ToastNotification component with mystical styling
- Queue-based toast management supporting multiple simultaneous toasts

## Components and Interfaces

### New Components

#### LoadingFallback Component
```typescript
interface LoadingFallbackProps {
  message?: string;
  minDisplayTime?: number;
}
```
- Displays during lazy component loading
- Uses mystical-themed animations (fog, shadows, spinning rings)
- Ensures minimum display time to prevent flashing

#### SkeletonLoader Component
```typescript
interface SkeletonLoaderProps {
  type: 'task' | 'note' | 'list';
  count?: number;
}
```
- Mimics the structure of content being loaded
- Pulsing animation effect
- Variants for different content types

#### ErrorBoundary Component
```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
```
- Catches JavaScript errors in child component tree
- Displays user-friendly error messages with gothic styling
- Provides "Try Again" button to reset error state
- Logs errors for debugging

#### ToastNotification Component
```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}
```
- Slide-in/slide-out animations
- Auto-dismiss after configurable duration (default 3-5 seconds)
- Manual dismiss on click
- Support for action buttons (e.g., "Undo")
- Mystical styling with glow effects

#### ConfirmDialog Component
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  showDontAskAgain?: boolean;
}
```
- Modal dialog for destructive actions
- Focus trapping
- Escape key dismissal
- Warning styling for destructive actions
- Optional "Don't ask again" checkbox

#### EmptyState Component
```typescript
interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}
```
- Displayed when lists have no items
- Mystical-themed illustrations
- Call-to-action button
- Consistent styling across all empty states

### Enhanced Existing Components

#### TasksContext Enhancements
```typescript
interface TasksContextType {
  // Existing methods...
  
  // New bulk operations
  bulkDelete: (ids: string[]) => void;
  bulkArchive: (ids: string[]) => void;
  bulkTag: (ids: string[], tags: string[]) => void;
  
  // Undo/redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
```

#### NotesContext Enhancements
```typescript
interface NotesContextType {
  // Existing methods...
  
  // New bulk operations
  bulkDelete: (ids: string[]) => void;
  bulkTag: (ids: string[], tags: string[]) => void;
  
  // Undo/redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
```

### Custom Hooks

#### useUndoRedo Hook
```typescript
interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseUndoRedoReturn<T> {
  state: T;
  setState: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

function useUndoRedo<T>(initialState: T, maxHistory?: number): UseUndoRedoReturn<T>
```
- Manages undo/redo history stack
- Configurable max history (default 10)
- Provides undo, redo, and clear operations

#### useBulkSelection Hook
```typescript
interface UseBulkSelectionReturn {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  hasSelection: boolean;
  selectionCount: number;
}

function useBulkSelection(): UseBulkSelectionReturn
```
- Manages multi-item selection state
- Provides selection utilities
- Optimized with Set for O(1) lookups

## Data Models

### Toast Model
```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}
```

### Undo Action Model
```typescript
interface UndoAction {
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'BULK_DELETE' | 'BULK_UPDATE';
  entityType: 'task' | 'note';
  data: any;
  timestamp: Date;
}
```

### Dashboard Layout Model
```typescript
interface DashboardWidget {
  id: string;
  type: 'tasks' | 'moon' | 'pomodoro' | 'archive';
  visible: boolean;
  order: number;
}

interface DashboardLayout {
  widgets: DashboardWidget[];
  lastModified: Date;
}
```

## Error Handling

### Error Boundary Strategy

Error boundaries will be placed at strategic points:

1. **Route-level boundaries**: Wrap each major route to isolate errors
2. **Component-level boundaries**: Wrap complex components (MarkdownEditor, TarotReader)
3. **Global boundary**: Top-level boundary as last resort

### Error Types and Messages

```typescript
const ERROR_MESSAGES = {
  NETWORK_ERROR: "Check your connection and try again",
  AUTH_ERROR: "Please log in again",
  STORAGE_ERROR: "Unable to save data. Please try again",
  GENERIC_ERROR: "Something went wrong. Please refresh the page"
};
```

### Retry Mechanism

Network operations will implement exponential backoff:
- First retry: 1 second delay
- Second retry: 2 seconds delay
- Third retry: 4 seconds delay
- After 3 failures: Show error to user

## Accessibility Strategy

### ARIA Implementation

1. **Interactive Elements**: All icon-only buttons receive aria-label
2. **Live Regions**: Toast container and sync indicator use aria-live="polite"
3. **Dynamic Content**: State changes announced to screen readers
4. **Semantic HTML**: Use native elements (button, nav, main) where possible

### Keyboard Navigation

1. **Focus Management**: Visible focus indicators on all focusable elements
2. **Modal Focus Trapping**: Focus stays within modal until dismissed
3. **Keyboard Shortcuts**: Ctrl+Z (undo), Ctrl+Y (redo), Escape (close modals)
4. **Tab Order**: Logical tab order following visual layout

### Mobile Accessibility

1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Input Types**: Appropriate keyboard types (email, tel, url)
3. **Zoom**: Allow pinch-to-zoom while preventing input focus zoom

## Performance Optimizations

### Code Splitting Strategy

```typescript
// Route-level splitting
const TerminalTarot = lazy(() => import('./components/terminal-tarot/TerminalTarot'));
const GhostWriter = lazy(() => import('./components/ghost-writer/GhostWriter'));
const NecronomiconNotes = lazy(() => import('./components/necronomicon-notes/NecronomiconNotes'));
const GraveyardDashboard = lazy(() => import('./components/graveyard-dashboard/GraveyardDashboard'));

// Component-level splitting
const MarkdownEditor = lazy(() => import('./components/necronomicon-notes/MarkdownEditor'));
const TarotReader = lazy(() => import('./components/terminal-tarot/TarotReader'));
```

### Memoization Strategy

Components to memoize:
- Tombstone (re-renders on every task update)
- NotePage (re-renders on note list changes)
- TagCloud (re-renders on tag filter changes)
- TagFilter (re-renders on selection changes)

Custom comparison functions for complex props:
```typescript
const Tombstone = React.memo(TombstoneComponent, (prevProps, nextProps) => {
  return prevProps.task.id === nextProps.task.id &&
         prevProps.task.completed === nextProps.task.completed &&
         prevProps.task.title === nextProps.task.title;
});
```

### Animation Performance

1. **CSS Transforms**: Use transform and opacity for animations (GPU-accelerated)
2. **Will-change**: Apply to animated elements
3. **Reduced Motion**: Respect prefers-reduced-motion media query
4. **Frame Budget**: Keep animations under 16ms per frame (60fps)

## Testing Strategy

### Unit Tests

- Test useUndoRedo hook with various state changes
- Test useBulkSelection hook selection logic
- Test ToastContext queue management
- Test ErrorBoundary error catching and recovery

### Integration Tests

- Test lazy loading with Suspense boundaries
- Test undo/redo across multiple operations
- Test bulk operations on tasks and notes
- Test toast notifications for various actions
- Test keyboard navigation through entire app

### Accessibility Tests

- Test screen reader announcements
- Test keyboard-only navigation
- Test focus management in modals
- Test ARIA labels and roles
- Test color contrast ratios

### Performance Tests

- Measure initial load time
- Measure time to interactive
- Measure component re-render frequency
- Measure animation frame rates
- Test on low-end devices

## Styling Approach

### Mystical Theme Consistency

All new components will follow the existing gothic aesthetic:

- **Colors**: Deep purples, blacks, ethereal glows
- **Fonts**: Creepster for headings, system fonts for body
- **Effects**: Box shadows, text shadows, glow effects
- **Animations**: Smooth, eerie transitions

### CSS Architecture

```css
/* Spacing utilities */
.spacing-xs { margin: 4px; }
.spacing-sm { margin: 8px; }
.spacing-md { margin: 16px; }
.spacing-lg { margin: 24px; }
.spacing-xl { margin: 32px; }

/* Focus indicators */
.focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Animation utilities */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Implementation Phases

### Phase 1: Performance Optimizations
- Implement React.lazy for routes
- Add Suspense boundaries with LoadingFallback
- Apply React.memo to frequently re-rendering components
- Add useMemo/useCallback optimizations

### Phase 2: UI/UX Enhancements
- Create ToastContext and ToastNotification component
- Create SkeletonLoader component
- Create ErrorBoundary component
- Integrate toasts throughout application

### Phase 3: Accessibility Improvements
- Add ARIA labels to all interactive elements
- Implement ARIA live regions
- Add visible focus indicators
- Implement focus trapping in modals

### Phase 4: Convenience Features
- Create useUndoRedo hook
- Integrate undo/redo in TasksContext and NotesContext
- Create useBulkSelection hook
- Add bulk operations UI and logic
- Create ConfirmDialog component

### Phase 5: Polish & Refinements
- Create EmptyState component
- Add empty states to all list views
- Add prefers-reduced-motion support
- Enhance ForestHub hover effects
- Standardize spacing and alignment

### Phase 6: Advanced Features
- Implement customizable dashboard layout
- Add drag-and-drop for widget reordering
- Create backup and restore functionality
- Integrate all features and test end-to-end

## Security Considerations

- Sanitize user input in toast messages to prevent XSS
- Validate undo/redo actions before applying
- Ensure bulk operations respect user permissions
- Secure backup data with encryption

## Deployment Strategy

- Deploy incrementally by phase
- Use feature flags for gradual rollout
- Monitor performance metrics after each phase
- Gather user feedback and iterate

## Success Metrics

- Initial load time < 2 seconds
- Time to interactive < 3 seconds
- Lighthouse accessibility score > 95
- User satisfaction with new features > 80%
- Reduction in error reports by 50%
