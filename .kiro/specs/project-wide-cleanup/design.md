# Project-Wide Cleanup & Improvements - Design Document

## Overview

This design document outlines the technical approach for cleaning up the Kiroween codebase and implementing a persistent focused timer system. The cleanup will remove 100+ redundant files, optimize performance, and improve code quality. The focused timer enhancement will provide site-wide timer tracking with a persistent visual indicator.

## Architecture

### Current State Analysis

```
kiroween/
├── src/
│   ├── components/           # ~200+ files (many are docs)
│   │   ├── spirit-companion/ # 50+ files (30+ docs to remove)
│   │   ├── ghost-writer/     # 80+ files (40+ docs to remove)
│   │   ├── terminal-tarot/   # 10+ files
│   │   ├── necronomicon-notes/ # 15+ files
│   │   └── common/           # 10+ files
│   ├── contexts/            # 20+ files (10+ docs to remove)
│   ├── services/            # 10+ files (5+ docs to remove)
│   └── ...
└── public/                  # Contains test HTML files to remove
```

### Target Architecture

```
kiroween/
├── src/
│   ├── components/          # ~120 files (40% reduction)
│   │   ├── spirit-companion/ # 15 files
│   │   ├── ghost-writer/     # 25 files
│   │   ├── terminal-tarot/   # 8 files
│   │   ├── necronomicon-notes/ # 10 files
│   │   ├── focused-timer/    # NEW: Timer components
│   │   └── common/
│   │       ├── TimerIndicator.tsx  # NEW: Site-wide timer display
│   │       └── animations.css      # NEW: Shared animations
│   ├── contexts/
│   │   └── TimerContext.tsx  # NEW: Global timer state
│   └── ...
```

## Components and Interfaces

### 1. Focused Timer System

#### TimerContext

Global context managing timer state across the application.

```typescript
interface TimerState {
  isActive: boolean;
  startTime: number | null;
  duration: number; // in minutes
  remainingTime: number; // in seconds
  isPaused: boolean;
  sessionType: 'focus' | 'break' | 'long-break';
}

interface TimerContextValue {
  timer: TimerState;
  startTimer: (duration: number, type: 'focus' | 'break' | 'long-break') => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

// Context provider wraps entire app
<TimerProvider>
  <App />
</TimerProvider>
```

#### TimerIndicator Component

Persistent visual indicator displayed on all pages when timer is active.

```typescript
interface TimerIndicatorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  compact?: boolean;
}

// Features:
// - Shows remaining time (MM:SS format)
// - Displays session type (focus/break)
// - Quick pause/resume button
// - Click to navigate to full timer page
// - Animated progress ring
// - Companion reaction when timer completes
```

#### Timer Persistence

```typescript
// LocalStorage schema
interface TimerPersistence {
  isActive: boolean;
  startTime: number;
  duration: number;
  isPaused: boolean;
  pausedAt: number | null;
  sessionType: string;
}

// Sync with Firebase for cross-device
interface FirebaseTimerData {
  userId: string;
  activeTimer: TimerPersistence | null;
  completedSessions: number;
  totalFocusTime: number; // in minutes
  lastSessionDate: string;
}
```

### 2. Cleanup Architecture

#### Automated Cleanup Script

```bash
#!/bin/bash
# cleanup-docs.sh

# Remove documentation files
find kiroween/src -name "*_COMPLETE.md" -delete
find kiroween/src -name "*_IMPLEMENTATION.md" -delete
find kiroween/src -name "*_VERIFICATION.md" -delete
find kiroween/src -name "*_SUMMARY.md" -delete
find kiroween/src -name "*Demo.md" -delete
find kiroween/src -name "*.demo.tsx" -delete
find kiroween/src -name "*.demo.html" -delete

# Remove test files from public
find kiroween/public -name "*test*.html" -delete
find kiroween -name "*-test.html" -delete

echo "Cleanup complete: $(date)" >> cleanup.log
```

#### CSS Consolidation

```css
/* src/components/common/animations.css */

/* Shared animations extracted from multiple components */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(20px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes glow {
  0%, 100% { 
    box-shadow: 0 0 5px var(--primary-color); 
  }
  50% { 
    box-shadow: 0 0 20px var(--primary-color); 
  }
}

/* Timer-specific animations */
@keyframes timerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes progressRing {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: var(--progress-offset); }
}
```

## Data Models

### Timer State Model

```typescript
// src/types/timer.ts

export type SessionType = 'focus' | 'break' | 'long-break';

export interface TimerSession {
  id: string;
  type: SessionType;
  duration: number; // minutes
  startTime: number; // timestamp
  endTime: number | null; // timestamp
  completed: boolean;
  interrupted: boolean;
}

export interface TimerSettings {
  focusDuration: number; // default 25 minutes
  shortBreakDuration: number; // default 5 minutes
  longBreakDuration: number; // default 15 minutes
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  sessionsUntilLongBreak: number; // default 4
}

export interface TimerStats {
  totalSessions: number;
  completedSessions: number;
  totalFocusTime: number; // minutes
  currentStreak: number; // consecutive days
  longestStreak: number;
  todaySessions: number;
}
```

### Cleanup Tracking Model

```typescript
// src/types/cleanup.ts

export interface CleanupReport {
  timestamp: string;
  filesRemoved: number;
  categoriesProcessed: {
    documentation: number;
    debugComponents: number;
    testFiles: number;
    consoleLogs: number;
  };
  bundleSizeBefore: number; // bytes
  bundleSizeAfter: number; // bytes
  performanceImprovements: {
    loadTimeBefore: number; // ms
    loadTimeAfter: number; // ms
    lighthouseScoreBefore: number;
    lighthouseScoreAfter: number;
  };
}
```

## Error Handling

### Timer Error Scenarios

```typescript
// Timer-specific errors
export class TimerError extends Error {
  constructor(
    message: string,
    public code: TimerErrorCode,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'TimerError';
  }
}

export enum TimerErrorCode {
  PERSISTENCE_FAILED = 'PERSISTENCE_FAILED',
  INVALID_DURATION = 'INVALID_DURATION',
  NOTIFICATION_DENIED = 'NOTIFICATION_DENIED',
  SYNC_FAILED = 'SYNC_FAILED',
}

// Error recovery strategies
const handleTimerError = (error: TimerError) => {
  switch (error.code) {
    case TimerErrorCode.PERSISTENCE_FAILED:
      // Fall back to memory-only timer
      console.warn('Timer persistence failed, using memory only');
      return { useMemoryOnly: true };
      
    case TimerErrorCode.NOTIFICATION_DENIED:
      // Use visual notification only
      return { useVisualNotification: true };
      
    case TimerErrorCode.SYNC_FAILED:
      // Continue with local state
      return { continueLocal: true };
      
    default:
      throw error;
  }
};
```

### Cleanup Error Handling

```typescript
// Cleanup validation
export interface CleanupValidation {
  success: boolean;
  errors: CleanupError[];
  warnings: CleanupWarning[];
}

export interface CleanupError {
  file: string;
  operation: 'delete' | 'update' | 'move';
  reason: string;
  critical: boolean;
}

// Rollback mechanism
export class CleanupRollback {
  private backupPath: string;
  
  async createBackup(): Promise<void> {
    // Create git branch backup
    await exec('git checkout -b backup/pre-cleanup');
    await exec('git push origin backup/pre-cleanup');
  }
  
  async rollback(): Promise<void> {
    // Restore from backup branch
    await exec('git checkout backup/pre-cleanup');
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// TimerContext.test.tsx
describe('TimerContext', () => {
  it('should start timer with correct duration', () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.startTimer(25, 'focus');
    });
    expect(result.current.timer.isActive).toBe(true);
    expect(result.current.timer.duration).toBe(25);
  });
  
  it('should persist timer state to localStorage', () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.startTimer(25, 'focus');
    });
    const stored = localStorage.getItem('kiroween_timer');
    expect(stored).toBeTruthy();
  });
  
  it('should restore timer state on page reload', () => {
    // Set up persisted timer
    localStorage.setItem('kiroween_timer', JSON.stringify({
      isActive: true,
      startTime: Date.now() - 60000, // 1 minute ago
      duration: 25,
      isPaused: false,
      sessionType: 'focus'
    }));
    
    const { result } = renderHook(() => useTimer());
    expect(result.current.timer.isActive).toBe(true);
    expect(result.current.timer.remainingTime).toBeLessThan(25 * 60);
  });
});

// TimerIndicator.test.tsx
describe('TimerIndicator', () => {
  it('should not render when timer is inactive', () => {
    const { container } = render(<TimerIndicator />);
    expect(container.firstChild).toBeNull();
  });
  
  it('should display remaining time in MM:SS format', () => {
    const mockTimer = {
      isActive: true,
      remainingTime: 125, // 2:05
      sessionType: 'focus'
    };
    const { getByText } = render(<TimerIndicator timer={mockTimer} />);
    expect(getByText('2:05')).toBeInTheDocument();
  });
  
  it('should navigate to timer page on click', () => {
    const mockNavigate = jest.fn();
    const { getByRole } = render(<TimerIndicator />);
    fireEvent.click(getByRole('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/focused-timer');
  });
});
```

### Integration Tests

```typescript
// timer-persistence.test.tsx
describe('Timer Persistence Integration', () => {
  it('should sync timer across tabs', async () => {
    // Simulate two tabs
    const tab1 = renderHook(() => useTimer());
    const tab2 = renderHook(() => useTimer());
    
    // Start timer in tab1
    act(() => {
      tab1.result.current.startTimer(25, 'focus');
    });
    
    // Trigger storage event in tab2
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'kiroween_timer',
        newValue: localStorage.getItem('kiroween_timer')
      }));
    });
    
    // Verify tab2 sees the timer
    await waitFor(() => {
      expect(tab2.result.current.timer.isActive).toBe(true);
    });
  });
  
  it('should trigger companion reaction on timer completion', async () => {
    const { result: timerResult } = renderHook(() => useTimer());
    const { result: companionResult } = renderHook(() => useCompanion());
    
    // Start 1-second timer for testing
    act(() => {
      timerResult.current.startTimer(1/60, 'focus');
    });
    
    // Wait for completion
    await waitFor(() => {
      expect(timerResult.current.timer.isActive).toBe(false);
    }, { timeout: 2000 });
    
    // Verify companion reacted
    expect(companionResult.current.companion.mood).toBe('proud');
  });
});
```

### Cleanup Validation Tests

```typescript
// cleanup-validation.test.ts
describe('Cleanup Validation', () => {
  it('should identify all documentation files to remove', () => {
    const files = findDocumentationFiles('./kiroween/src');
    expect(files.length).toBeGreaterThan(80);
    expect(files.every(f => 
      f.endsWith('_COMPLETE.md') || 
      f.endsWith('_IMPLEMENTATION.md') ||
      f.endsWith('_VERIFICATION.md')
    )).toBe(true);
  });
  
  it('should not remove essential README files', () => {
    const files = findDocumentationFiles('./kiroween/src');
    expect(files.every(f => !f.endsWith('README.md'))).toBe(true);
  });
  
  it('should verify no broken imports after cleanup', async () => {
    await runCleanup();
    const result = await exec('npm run type-check');
    expect(result.exitCode).toBe(0);
  });
});
```

### Performance Tests

```typescript
// performance.test.ts
describe('Performance Improvements', () => {
  it('should reduce bundle size by 25%', async () => {
    const sizeBefore = await getBundleSize();
    await runCleanup();
    await exec('npm run build');
    const sizeAfter = await getBundleSize();
    
    const reduction = (sizeBefore - sizeAfter) / sizeBefore;
    expect(reduction).toBeGreaterThanOrEqual(0.25);
  });
  
  it('should improve Lighthouse score', async () => {
    const scoreBefore = await runLighthouse();
    await runOptimizations();
    const scoreAfter = await runLighthouse();
    
    expect(scoreAfter.performance).toBeGreaterThan(90);
    expect(scoreAfter.performance).toBeGreaterThan(scoreBefore.performance);
  });
});
```

## Implementation Details

### Timer Indicator Positioning

```typescript
// TimerIndicator.tsx
const TimerIndicator: React.FC<TimerIndicatorProps> = ({ 
  position = 'top-right',
  compact = false 
}) => {
  const { timer, pauseTimer, resumeTimer } = useTimer();
  const navigate = useNavigate();
  
  if (!timer.isActive) return null;
  
  const positionStyles = {
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
  };
  
  return (
    <div 
      className={styles.indicator}
      style={positionStyles[position]}
      onClick={() => navigate('/focused-timer')}
    >
      <div className={styles.progressRing}>
        <svg width="60" height="60">
          <circle
            cx="30"
            cy="30"
            r="25"
            stroke="var(--primary-color)"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 25}`}
            strokeDashoffset={calculateProgress(timer)}
            className={styles.progress}
          />
        </svg>
      </div>
      <div className={styles.time}>
        {formatTime(timer.remainingTime)}
      </div>
      {!compact && (
        <button
          className={styles.pauseButton}
          onClick={(e) => {
            e.stopPropagation();
            timer.isPaused ? resumeTimer() : pauseTimer();
          }}
        >
          {timer.isPaused ? '▶' : '⏸'}
        </button>
      )}
    </div>
  );
};
```

### Cross-Tab Synchronization

```typescript
// useTimerSync.ts
export const useTimerSync = () => {
  const { timer, setTimer } = useTimer();
  
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kiroween_timer' && e.newValue) {
        const updatedTimer = JSON.parse(e.newValue);
        setTimer(updatedTimer);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setTimer]);
  
  useEffect(() => {
    if (timer.isActive) {
      localStorage.setItem('kiroween_timer', JSON.stringify(timer));
    } else {
      localStorage.removeItem('kiroween_timer');
    }
  }, [timer]);
};
```

### Notification System

```typescript
// useTimerNotifications.ts
export const useTimerNotifications = () => {
  const { timer } = useTimer();
  const { companion } = useCompanion();
  
  useEffect(() => {
    if (timer.remainingTime === 0 && timer.isActive) {
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('Focus Session Complete! 🎉', {
          body: `Great work! You completed a ${timer.duration} minute focus session.`,
          icon: '/companion-icon.png',
          badge: '/badge-icon.png',
        });
      }
      
      // Visual notification
      showToast({
        type: 'success',
        message: 'Focus session complete!',
        duration: 5000,
      });
      
      // Companion reaction
      companion.celebrate();
      
      // Play sound if enabled
      if (timer.settings.soundEnabled) {
        playCompletionSound();
      }
    }
  }, [timer.remainingTime, timer.isActive]);
};
```

## Migration Plan

### Phase 1: Cleanup (Week 1)
1. Create backup branch
2. Run automated documentation cleanup
3. Remove debug components
4. Clean console logs
5. Verify all features work

### Phase 2: CSS Optimization (Week 1-2)
1. Audit CSS modules
2. Extract shared animations
3. Remove unused classes
4. Test visual regression

### Phase 3: Timer Implementation (Week 2-3)
1. Create TimerContext
2. Implement timer persistence
3. Build TimerIndicator component
4. Add cross-tab sync
5. Implement notifications

### Phase 4: Performance (Week 3-4)
1. Add React.memo to heavy components
2. Implement code splitting
3. Optimize bundle size
4. Run performance tests

### Phase 5: Polish (Week 4)
1. Accessibility improvements
2. Final testing
3. Documentation updates
4. Production deployment

## Risk Mitigation

### Backup Strategy
- Create git branch before cleanup
- Incremental commits for each phase
- Ability to rollback specific changes

### Testing Strategy
- Run full test suite after each phase
- Manual testing of critical paths
- Performance monitoring throughout

### Rollback Plan
- Keep backup branch for 30 days
- Document all changes in CHANGELOG
- Ability to cherry-pick specific improvements
