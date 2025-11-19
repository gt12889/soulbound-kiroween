# Design Document - Web App Enhancements

## Overview

This design document outlines the technical architecture and implementation approach for four major enhancements to the Dark Productivity Suite: Productivity Analytics, Note/Task Templates, Shared Workspaces with Collaboration, and Smart Notifications. Additionally, it covers 14 UX improvements including tooltips, animations, command palette, drag-and-drop, and other quality-of-life features.

The design maintains the existing mystical gothic aesthetic while adding intelligent, data-driven features that enhance productivity and collaboration.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                            │
│  ├─ Analytics Dashboard                                      │
│  ├─ Template Gallery & Manager                               │
│  ├─ Collaboration UI (Workspaces, Activity Feed)            │
│  ├─ Notification System                                      │
│  └─ UX Components (Tooltips, Command Palette, etc.)         │
├─────────────────────────────────────────────────────────────┤
│  Context & State Management                                  │
│  ├─ AnalyticsContext                                         │
│  ├─ TemplateContext                                          │
│  ├─ CollaborationContext                                     │
│  ├─ NotificationContext                                      │
│  └─ Existing Contexts (Tasks, Notes, Auth)                  │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                              │
│  ├─ analyticsService                                         │
│  ├─ templateService                                          │
│  ├─ collaborationService                                     │
│  ├─ notificationService                                      │
│  └─ Firebase Integration                                     │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                  │
│  ├─ Firestore (Cloud Data)                                  │
│  ├─ Local Storage (Offline Support)                         │
│  └─ IndexedDB (Analytics Cache)                             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 18+ with TypeScript
- **State Management**: React Context API + Custom Hooks
- **Backend**: Firebase (Firestore, Authentication, Cloud Functions)
- **Real-time**: Firestore real-time listeners
- **Storage**: Firestore + Local Storage + IndexedDB
- **Styling**: CSS Modules with mystical gothic theme
- **Charts**: Recharts or Chart.js for analytics visualizations
- **Notifications**: Browser Notification API + In-app notifications

## Components and Interfaces

### 1. Productivity Analytics

#### Components

**AnalyticsDashboard.tsx**
- Main container for analytics view
- Displays productivity score, charts, and insights
- Responsive grid layout

**ProductivityScore.tsx**
- Circular progress indicator showing overall score
- Calculated from completion rate, consistency, focus time
- Mystical-themed visualization

**TrendChart.tsx**
- Line/bar charts for tasks completed over time
- Supports daily, weekly, monthly views
- Interactive tooltips

**PeakHoursChart.tsx**
- Heatmap or bar chart showing productivity by hour
- Highlights most productive times

**InsightCards.tsx**
- Card-based layout for AI-generated insights
- Recommendations based on patterns
- Dismissible and actionable

#### Data Models

```typescript
interface ProductivityMetrics {
  userId: string;
  date: string; // ISO date
  tasksCompleted: number;
  tasksCreated: number;
  focusTimeMinutes: number;
  completionsByHour: Record<number, number>; // hour -> count
  completionsByTag: Record<string, number>;
  averageCompletionTime: number; // minutes
  streak: number; // consecutive days
}

interface ProductivityScore {
  overall: number; // 0-100
  completionRate: number;
  consistency: number;
  focusTime: number;
  calculatedAt: Date;
}

interface Insight {
  id: string;
  type: 'peak_hours' | 'productive_day' | 'tag_performance' | 'streak';
  title: string;
  description: string;
  actionable: boolean;
  createdAt: Date;
}
```

### 2. Templates System

#### Components

**TemplateGallery.tsx**
- Grid view of available templates
- Filter by type (note/task), category
- Search functionality

**TemplateCard.tsx**
- Preview card with icon, name, description
- Quick actions (use, edit, delete)
- Mystical-themed styling

**TemplateEditor.tsx**
- Form for creating/editing templates
- Variable placeholder support {{variable_name}}
- Preview mode

**TemplateVariableDialog.tsx**
- Modal for collecting variable values
- Dynamic form based on template variables
- Validation support

#### Data Models

```typescript
interface Template {
  id: string;
  userId: string;
  type: 'note' | 'task';
  name: string;
  description: string;
  icon: string; // mystical icon identifier
  content: string; // with {{variable}} placeholders
  variables: TemplateVariable[];
  category: string;
  isDefault: boolean; // system templates
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select';
  required: boolean;
  defaultValue?: string;
  options?: string[]; // for select type
}
```

### 3. Shared Workspaces & Collaboration

#### Components

**WorkspaceList.tsx**
- List of user's workspaces
- Create new workspace button
- Workspace cards with member count

**WorkspaceView.tsx**
- Shared notes and tasks view
- Real-time updates indicator
- Member list sidebar

**InviteDialog.tsx**
- Email/link invitation form
- Permission selection (view/edit)
- Shareable link generation

**ActivityFeed.tsx**
- Chronological list of workspace activities
- User avatars and action descriptions
- Filter by user, action type, date

**CollaboratorBadge.tsx**
- Visual indicator on shared items
- Shows last editor and timestamp
- Mystical aura effect

#### Data Models

```typescript
interface Workspace {
  id: string;
  name: string;
  icon: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkspaceMember {
  userId: string;
  email: string;
  displayName: string;
  avatar?: string;
  permission: 'view' | 'edit';
  joinedAt: Date;
}

interface SharedItem {
  id: string;
  workspaceId: string;
  type: 'note' | 'task';
  itemId: string;
  lastEditedBy: string;
  lastEditedAt: Date;
}

interface Activity {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  action: 'created' | 'edited' | 'completed' | 'deleted';
  itemType: 'note' | 'task';
  itemId: string;
  itemTitle: string;
  timestamp: Date;
}
```

### 4. Smart Notifications

#### Components

**NotificationCenter.tsx**
- Dropdown panel with notification list
- Badge count indicator
- Mark as read/clear all actions

**NotificationItem.tsx**
- Individual notification display
- Action buttons (view, dismiss, snooze)
- Mystical-themed styling

**NotificationSettings.tsx**
- Preference configuration panel
- Notification type toggles
- Quiet hours scheduler

**NotificationToast.tsx**
- Temporary popup notification
- Auto-dismiss with timer
- Click to view details

#### Data Models

```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'due_date' | 'inactive_task' | 'workspace_activity' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
  actionUrl?: string;
  read: boolean;
  snoozedUntil?: Date;
  createdAt: Date;
}

interface NotificationPreferences {
  userId: string;
  dueDateReminders: boolean;
  dueDateLeadTime: number; // hours
  inactiveTaskReminders: boolean;
  inactiveTaskThreshold: number; // days
  workspaceActivity: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string; // HH:mm
  allowPriorityOverride: boolean;
}

interface NotificationHistory {
  notificationId: string;
  action: 'dismissed' | 'acted_upon' | 'snoozed';
  timestamp: Date;
}
```

### 5. UX Enhancements

#### Components

**Tooltip.tsx**
- Reusable tooltip component
- 500ms hover delay
- Mystical-themed styling
- Keyboard accessible

**CommandPalette.tsx**
- Modal overlay with search
- Fuzzy search implementation
- Recent commands tracking
- Keyboard navigation (Ctrl/Cmd+P)

**ContextMenu.tsx**
- Right-click menu component
- Position-aware rendering
- Nested submenu support

**DragDropProvider.tsx**
- Context for drag-and-drop state
- Ghost image rendering
- Drop zone highlighting

**InlineEditor.tsx**
- Double-click to edit component
- Auto-focus and select
- Save on Enter, cancel on Escape

**BreadcrumbNav.tsx**
- Hierarchical navigation component
- Clickable path segments
- Responsive truncation

**ViewModeToggle.tsx**
- List/Grid/Compact view switcher
- Persists preference per section

**FilterPanel.tsx**
- Advanced filtering UI
- Multiple criteria support
- Save filter presets

**FocusMode.tsx**
- Full-screen distraction-free mode
- Minimal UI overlay
- F11 toggle

**ProgressIndicator.tsx**
- Loading bar for long operations
- Percentage and description
- Cancellation support

#### Hooks

**useTooltip.ts**
- Manages tooltip state and positioning
- Handles hover delays

**useCommandPalette.ts**
- Command registration and search
- Keyboard shortcut handling

**useDragDrop.ts**
- Drag-and-drop state management
- Event handlers

**useInlineEdit.ts**
- Inline editing state
- Validation and save logic

**useAnimation.ts**
- Respects prefers-reduced-motion
- Provides animation utilities

**useRecentItems.ts**
- Tracks recently accessed items
- Manages recent list

## Data Models

### Firestore Collections

```
users/{userId}
  - profile data
  - preferences
  
analytics/{userId}/metrics/{date}
  - daily productivity metrics
  
templates/{templateId}
  - template definitions
  - shared across users if isDefault
  
workspaces/{workspaceId}
  - workspace metadata
  - members array
  
workspaces/{workspaceId}/items/{itemId}
  - shared notes and tasks
  
workspaces/{workspaceId}/activity/{activityId}
  - activity log entries
  
notifications/{userId}/items/{notificationId}
  - user notifications
  
notificationPreferences/{userId}
  - notification settings
```

## Error Handling

### Strategy

1. **Network Errors**: Retry with exponential backoff, queue operations for offline sync
2. **Permission Errors**: Show clear messages, redirect to appropriate auth flow
3. **Validation Errors**: Inline error messages, prevent submission
4. **Sync Conflicts**: Show merge dialog, allow user to choose version
5. **Analytics Errors**: Fail silently, log to console, don't block UI

### Error Boundaries

- Wrap each major feature in ErrorBoundary
- Provide fallback UI with retry option
- Log errors to Firebase Analytics

### User Feedback

- Toast notifications for transient errors
- Modal dialogs for critical errors
- Inline validation messages
- Loading states for async operations

## Testing Strategy

### Unit Tests

- Service layer functions (analytics calculations, template parsing)
- Utility functions (date formatting, score calculation)
- Custom hooks (useAnalytics, useTemplates, useCollaboration)
- Component logic (state management, event handlers)

### Integration Tests

- Analytics data flow (capture → calculate → display)
- Template creation and usage workflow
- Workspace invitation and collaboration
- Notification delivery and interaction
- Real-time sync behavior

### E2E Tests

- Complete user journeys (create template → use template → share)
- Multi-user collaboration scenarios
- Notification triggers and responses
- Analytics dashboard interactions

### Performance Tests

- Analytics calculation performance with large datasets
- Real-time listener efficiency
- Component render performance
- Memory leak detection

## Security Considerations

### Authentication & Authorization

- Firebase Authentication for user identity
- Firestore Security Rules for data access
- Workspace member validation
- Template ownership verification

### Data Privacy

- User analytics data isolated by userId
- Workspace data only accessible to members
- Notification data private to user
- No PII in analytics events

### Input Validation

- Sanitize template content
- Validate email addresses for invitations
- Limit template variable complexity
- Rate limit notification generation

## Performance Optimization

### Analytics

- Cache calculated metrics in IndexedDB
- Lazy load historical data
- Debounce metric updates
- Use Web Workers for heavy calculations

### Real-time Collaboration

- Batch Firestore updates
- Optimize listener queries with indexes
- Implement presence detection efficiently
- Throttle activity feed updates

### Notifications

- Background sync for notification checks
- Batch notification delivery
- Implement notification grouping
- Use service workers for push notifications

### UX Components

- Virtualize long lists (command palette, activity feed)
- Lazy load charts and visualizations
- Debounce search and filter operations
- Use CSS transforms for animations (GPU acceleration)

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation for all features
- Screen reader announcements for real-time updates
- High contrast mode support
- Focus trap in modals
- Skip links for navigation
- Reduced motion support

## Deployment Strategy

### Phased Rollout

1. **Phase 1**: Analytics Dashboard (read-only)
2. **Phase 2**: Templates System
3. **Phase 3**: UX Enhancements
4. **Phase 4**: Shared Workspaces
5. **Phase 5**: Smart Notifications

### Feature Flags

- Enable/disable features per user
- A/B testing for notification strategies
- Gradual rollout of collaboration features

### Monitoring

- Firebase Analytics for feature usage
- Error tracking with Firebase Crashlytics
- Performance monitoring
- User feedback collection

## Migration Plan

### Existing Data

- No breaking changes to existing data structures
- Add new fields to existing documents
- Backfill analytics data from task history
- Create default templates for existing users

### Backward Compatibility

- Graceful degradation for unsupported features
- Maintain existing API contracts
- Version API endpoints if needed

## Future Enhancements

- AI-powered productivity insights
- Advanced collaboration features (comments, mentions)
- Template marketplace
- Custom notification rules
- Mobile app support
- Offline-first architecture improvements
