# Performance Testing Integration Guide

## Quick Start

### 1. Import the CSS Optimizations

Add the low-end optimizations CSS to your main app or Ghost Writer component:

```typescript
// In your main App.tsx or GhostWriter.tsx
import './low-end-optimizations.css';
```

### 2. Initialize Device Detection

Add device detection to your app initialization:

```typescript
// In App.tsx or main.tsx
import { detectLowEndDevice, applyLowEndOptimizations } from '@/utils/performanceMonitor';

useEffect(() => {
  const capabilities = detectLowEndDevice();
  
  if (capabilities.isLowEnd) {
    applyLowEndOptimizations(capabilities);
    console.info('Low-end device detected, optimizations applied');
  }
}, []);
```

### 3. Add Performance Test Panel (Development Only)

For development and testing, add the performance test panel:

```typescript
// In your development environment
import { PerformanceTestPanel } from '@/components/ghost-writer/PerformanceTestPanel';

function App() {
  const [showPerfPanel, setShowPerfPanel] = useState(
    process.env.NODE_ENV === 'development'
  );

  return (
    <>
      {/* Your app content */}
      
      {/* Performance test panel - development only */}
      {showPerfPanel && (
        <PerformanceTestPanel onClose={() => setShowPerfPanel(false)} />
      )}
      
      {/* Keyboard shortcut to toggle panel */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowPerfPanel(!showPerfPanel)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
          }}
        >
          🔬 Perf
        </button>
      )}
    </>
  );
}
```

## Testing Workflow

### Manual Testing

1. **Open the Performance Test Panel**
   - Click the "🔬 Perf" button in development mode
   - Or add `?perf=true` to URL and check for panel

2. **Start Monitoring**
   - Click "▶ Start Monitoring"
   - Trigger Ghost Writer animations
   - Observe real-time FPS

3. **Test Different Scenarios**
   - Loading animation
   - Suggestion display
   - Accept animation
   - Multiple suggestions
   - Error states

4. **Toggle Low-End Mode**
   - Click "🐌 Low-End Mode: OFF" to enable
   - Repeat tests
   - Compare performance

5. **Generate Report**
   - Click "📊 Generate Report"
   - Check console for detailed report
   - Report is automatically copied to clipboard

### Automated Testing

Add performance tests to your test suite:

```typescript
// In your test file
import { testAnimationPerformance } from '@/utils/performanceMonitor';

describe('Ghost Writer Performance', () => {
  it('should maintain 30+ FPS during accept animation', async () => {
    const metrics = await testAnimationPerformance(async () => {
      // Trigger accept animation
      await triggerAcceptAnimation();
    }, 1000);

    expect(metrics.fps).toBeGreaterThanOrEqual(30);
    expect(metrics.droppedFrames).toBeLessThan(10);
  });
});
```

## Chrome DevTools Integration

### Performance Recording

1. Open Chrome DevTools (F12)
2. Go to Performance tab
3. Click Record (Ctrl+E)
4. Trigger Ghost Writer animations
5. Stop recording
6. Analyze:
   - FPS graph (should be green, 60fps)
   - Main thread activity
   - GPU activity
   - Memory usage

### CPU Throttling

Test on simulated low-end devices:

1. Open Chrome DevTools
2. Go to Performance tab
3. Click gear icon
4. Set CPU throttling:
   - 4x slowdown (low-end)
   - 6x slowdown (very low-end)
5. Record and test animations

### Network Throttling

Test with slow connections:

1. Open Chrome DevTools
2. Go to Network tab
3. Select throttling:
   - Fast 3G
   - Slow 3G
   - Offline
4. Test Ghost Writer behavior

## Firefox Performance Tools

### Performance Profiler

1. Open Firefox DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Trigger animations
5. Stop and analyze:
   - Waterfall view
   - Call tree
   - Flame graph

### Responsive Design Mode

Test on mobile devices:

1. Press Ctrl+Shift+M
2. Select device:
   - Galaxy A10 (budget Android)
   - iPhone 6 (old iOS)
3. Enable touch simulation
4. Test animations

## Lighthouse Audits

### Run Performance Audit

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view

# Focus on performance
lighthouse http://localhost:3000 --only-categories=performance --view
```

### Key Metrics to Check

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Total Blocking Time (TBT)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1

## Real Device Testing

### Android Testing

1. **Enable USB Debugging**
   - Settings → Developer Options → USB Debugging

2. **Connect Device**
   ```bash
   adb devices
   ```

3. **Chrome Remote Debugging**
   - Open chrome://inspect in desktop Chrome
   - Select your device
   - Inspect page
   - Use DevTools as normal

### iOS Testing

1. **Enable Web Inspector**
   - Settings → Safari → Advanced → Web Inspector

2. **Connect Device**
   - Connect iPhone/iPad via USB
   - Open Safari on Mac
   - Develop → [Your Device] → [Your Page]

3. **Use Web Inspector**
   - Similar to Chrome DevTools
   - Performance timeline
   - Network inspector

## Performance Budgets

### Set Performance Targets

```typescript
// performance-budget.ts
export const PERFORMANCE_BUDGET = {
  // FPS targets
  minFPS: 30,
  targetFPS: 60,
  
  // Animation durations
  maxLoadingTime: 200, // ms
  maxAnimationTime: 1000, // ms
  
  // Frame budgets
  maxDroppedFrames: 10,
  maxFrameTime: 33, // ms (60fps)
  
  // Memory
  maxMemoryIncrease: 10, // MB over 5 minutes
};
```

### Enforce Budgets in Tests

```typescript
import { PERFORMANCE_BUDGET } from './performance-budget';

describe('Performance Budget', () => {
  it('should meet FPS budget', async () => {
    const metrics = await testAnimationPerformance(triggerAnimation);
    expect(metrics.fps).toBeGreaterThanOrEqual(PERFORMANCE_BUDGET.minFPS);
  });
  
  it('should meet frame drop budget', async () => {
    const metrics = await testAnimationPerformance(triggerAnimation);
    expect(metrics.droppedFrames).toBeLessThanOrEqual(
      PERFORMANCE_BUDGET.maxDroppedFrames
    );
  });
});
```

## Continuous Integration

### Add Performance Tests to CI

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance tests
        run: npm run test:performance
      
      - name: Run Lighthouse
        run: |
          npm run build
          npm run lighthouse
      
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: performance-results
          path: lighthouse-results/
```

## Monitoring in Production

### Add Performance Monitoring

```typescript
// In production app
import { detectLowEndDevice, logPerformanceMetrics } from '@/utils/performanceMonitor';

// On app load
const capabilities = detectLowEndDevice();

// Send to analytics
analytics.track('device_capabilities', {
  isLowEnd: capabilities.isLowEnd,
  memory: capabilities.memory,
  cores: capabilities.cores,
  connection: capabilities.connection,
});

// Monitor critical animations
async function handleGhostWriterAccept() {
  const startTime = performance.now();
  
  await acceptSuggestion();
  
  const duration = performance.now() - startTime;
  
  // Log if slow
  if (duration > 1000) {
    analytics.track('slow_animation', {
      animation: 'accept',
      duration,
      isLowEnd: capabilities.isLowEnd,
    });
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Animations Still Laggy on Low-End Devices

**Solution:**
- Check if `.low-end-device` class is applied
- Verify CSS is imported
- Try ultra-low-end mode
- Check for JavaScript blocking

#### 2. Device Not Detected as Low-End

**Solution:**
- Check browser support for detection APIs
- Manually enable low-end mode
- Check console for detection logs
- Verify user agent string

#### 3. Performance Panel Not Showing

**Solution:**
- Check if in development mode
- Verify component is imported
- Check z-index conflicts
- Look for console errors

#### 4. FPS Counter Inaccurate

**Solution:**
- Close other browser tabs
- Disable browser extensions
- Check for background processes
- Use Chrome DevTools for verification

## Best Practices

### 1. Test Early and Often
- Test on low-end devices from the start
- Don't wait until the end
- Catch performance issues early

### 2. Use Real Devices
- Simulators are not accurate
- Test on actual budget phones
- Borrow devices if needed

### 3. Monitor in Production
- Track real-world performance
- Identify problem devices
- Adjust optimizations based on data

### 4. Set Performance Budgets
- Define acceptable thresholds
- Enforce in CI/CD
- Don't ship if budget exceeded

### 5. Optimize Progressively
- Start with biggest wins
- Measure impact of each change
- Don't over-optimize

## Resources

### Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Firefox DevTools](https://firefox-source-docs.mozilla.org/devtools-user/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)

### Documentation
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [CSS Containment](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Containment)
- [will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)

### Articles
- [Rendering Performance](https://web.dev/rendering-performance/)
- [Optimize CSS](https://web.dev/optimize-css/)
- [JavaScript Performance](https://web.dev/fast/)

## Support

For issues or questions:
1. Check the documentation
2. Review test results
3. Check browser console
4. File an issue with performance report

---

**Last Updated:** [Current Date]
**Version:** 1.0.0
**Status:** ✅ Ready for Use
