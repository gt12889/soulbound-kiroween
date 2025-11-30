# Routing System - Requirements

## Overview
A comprehensive routing system that manages navigation between features, handles authentication, provides smooth transitions, and supports deep linking.

## User Stories

### US-1: Feature Navigation
**As a** user  
**I want** to navigate between different features  
**So that** I can access all functionality

**Acceptance Criteria:**
- All features accessible via routes
- Browser back/forward buttons work
- URL reflects current location
- Bookmarkable URLs
- Smooth page transitions

### US-2: Protected Routes
**As a** user  
**I want** my data to be secure  
**So that** only I can access my information

**Acceptance Criteria:**
- Authentication required for protected routes
- Redirect to login if not authenticated
- Return to intended page after login
- Session persistence
- Automatic logout on expiry

### US-3: Deep Linking
**As a** user  
**I want** to share links to specific content  
**So that** others can view exactly what I'm seeing

**Acceptance Criteria:**
- Direct links to tasks, notes, etc.
- Query parameters preserved
- Hash navigation supported
- 404 page for invalid routes
- Redirect old URLs to new structure

### US-4: Loading States
**As a** user  
**I want** to see loading indicators during navigation  
**So that** I know the app is responding

**Acceptance Criteria:**
- Loading spinner during route changes
- Skeleton loaders for content
- Progress bar for slow loads
- Timeout handling
- Error states

## Route Structure

```
/                           → Landing page (public)
/login                      → Login page (public)
/register                   → Registration page (public)
/reset-password             → Password reset (public)

/app                        → Main app (protected)
  /forest                   → Forest hub navigation
  /graveyard                → Task management
    /                       → All tasks view
    /active                 → Active tasks
    /completed              → Completed tasks
    /archived               → Archived tasks
    /:taskId                → Single task detail
  /necronomicon             → Notes
    /                       → All notes
    /:noteId                → Single note
    /:noteId/edit           → Edit note
  /ghost-writer             → AI writing assistant
    /                       → Main interface
    /history                → Writing history
    /:sessionId             → Specific session
  /terminal-tarot           → Git insights
    /                       → Dashboard
    /commits                → Commit history
    /branches               → Branch analysis
  /seance                   → Settings & profile
    /profile                → User profile
    /settings               → App settings
    /themes                 → Theme customization
    /integrations           → External integrations

/404                        → Not found page
/error                      → Error page
```

## Technical Requirements

### TR-1: Route Configuration
```typescript
interface Route {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  title?: string;
  meta?: {
    description?: string;
    keywords?: string[];
  };
  preload?: () => Promise<void>;
  transition?: TransitionType;
}

interface RouteConfig {
  routes: Route[];
  fallback: React.ComponentType;
  errorBoundary: React.ComponentType;
}
```

### TR-2: Navigation Guards
```typescript
interface NavigationGuard {
  canActivate: (to: Route, from: Route) => boolean | Promise<boolean>;
  canDeactivate: (from: Route, to: Route) => boolean | Promise<boolean>;
  onBeforeEnter?: (to: Route) => void;
  onAfterLeave?: (from: Route) => void;
}

// Example: Authentication guard
const authGuard: NavigationGuard = {
  canActivate: async (to) => {
    if (to.protected) {
      return await checkAuthentication();
    }
    return true;
  },
  onBeforeEnter: (to) => {
    if (!isAuthenticated()) {
      saveIntendedRoute(to.path);
      redirect('/login');
    }
  },
};
```

### TR-3: Route Transitions
```typescript
type TransitionType = 
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom'
  | 'none';

interface TransitionConfig {
  type: TransitionType;
  duration: number;
  easing: string;
}
```

### TR-4: Performance
- Code splitting per route
- Lazy loading of route components
- Preload next likely route
- Route transition < 300ms
- No layout shift during navigation

### TR-5: SEO & Meta
- Dynamic page titles
- Meta descriptions per route
- Open Graph tags
- Canonical URLs
- Sitemap generation

## Navigation Patterns

### Pattern 1: Direct Navigation
```typescript
// Programmatic navigation
navigate('/graveyard/active');

// Link component
<Link to="/necronomicon">Notes</Link>
```

### Pattern 2: Nested Navigation
```typescript
// Parent route with outlet
<Route path="/graveyard" element={<GraveyardLayout />}>
  <Route index element={<AllTasks />} />
  <Route path="active" element={<ActiveTasks />} />
  <Route path=":taskId" element={<TaskDetail />} />
</Route>
```

### Pattern 3: Conditional Redirect
```typescript
// Redirect based on condition
<Route path="/app" element={
  isAuthenticated() ? <AppLayout /> : <Navigate to="/login" />
} />
```

### Pattern 4: Modal Routes
```typescript
// Show modal without changing URL
navigate('/graveyard', { state: { modal: 'create-task' } });

// Or with URL change
navigate('/graveyard/create');
```

## Route Parameters

### Path Parameters
```typescript
// Define route
<Route path="/graveyard/:taskId" element={<TaskDetail />} />

// Access in component
const { taskId } = useParams<{ taskId: string }>();
```

### Query Parameters
```typescript
// Navigate with query
navigate('/graveyard?filter=active&sort=priority');

// Access in component
const [searchParams] = useSearchParams();
const filter = searchParams.get('filter');
```

### State Parameters
```typescript
// Navigate with state
navigate('/graveyard', { state: { from: 'forest' } });

// Access in component
const location = useLocation();
const from = location.state?.from;
```

## Error Handling

### 404 Not Found
- Custom 404 page with navigation
- Suggest similar routes
- Search functionality
- Report broken link option

### Route Load Errors
- Retry mechanism
- Fallback UI
- Error boundary
- User notification

### Authentication Errors
- Redirect to login
- Save intended destination
- Show error message
- Refresh token attempt

## Accessibility

### Keyboard Navigation
- Tab through links
- Enter to activate
- Skip navigation link
- Focus management on route change

### Screen Readers
- Announce route changes
- Descriptive link text
- ARIA current for active route
- Landmark regions

### Focus Management
```typescript
// Focus main content on route change
useEffect(() => {
  const mainContent = document.getElementById('main-content');
  mainContent?.focus();
}, [location]);
```

## Analytics & Tracking

### Page Views
```typescript
// Track route changes
useEffect(() => {
  analytics.pageView({
    path: location.pathname,
    title: document.title,
    referrer: document.referrer,
  });
}, [location]);
```

### Navigation Events
```typescript
// Track navigation patterns
analytics.event('navigation', {
  from: previousRoute,
  to: currentRoute,
  method: 'click' | 'keyboard' | 'programmatic',
});
```

## Constraints
- Must use React Router v6+
- Support browser history API
- No hash routing (use browser history)
- Maximum route depth: 4 levels
- Route config must be serializable
- Support server-side rendering (future)
