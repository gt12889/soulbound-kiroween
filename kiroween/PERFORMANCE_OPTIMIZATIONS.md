# Ghost Archive Terminal - Performance Optimization Analysis

## Current Performance Profile

The Ghost Archive Terminal is already well-optimized with:
- React.memo on TerminalDisplay
- Custom memoization comparison
- Output history limiting (200 max)
- Lore events capped at 50

## Recommended Optimizations

### 1. Virtual Scrolling for Terminal Output ⚡ HIGH IMPACT

**Current Issue:**
- All terminal outputs (up to 200) are rendered at once
- With long conversations, DOM nodes accumulate
- Each output has multiple nested spans and divs

**Solution:**
Implement virtual scrolling using `react-window` or `react-virtualized`:

```typescript
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={outputs.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {renderOutput(outputs[index])}
    </div>
  )}
</List>
```

**Expected Improvement:**
- **Render time**: 80-90% faster with 100+ outputs
- **Memory usage**: 70% reduction
- **Scroll performance**: 60fps even with 1000+ outputs

**Trade-offs:**
- Additional dependency (~10KB gzipped)
- Slightly more complex implementation
- Fixed-height items (or need dynamic sizing)
- Initial setup time: 1-2 hours

**When to implement:** When users have 100+ terminal outputs

---

### 2. Debounced Input Handling ⚡ MEDIUM IMPACT

**Current Issue:**
- Every keystroke potentially triggers state updates
- Audio plays on each character typed (with 150ms debounce)
- No debouncing on input value changes

**Solution:**
```typescript
import { useDebouncedCallback } from 'use-debounce';

const handleInputChange = useDebouncedCallback((value: string) => {
  setInput(value);
  playTypingSound();
}, 50); // Only update after 50ms of no typing
```

**Expected Improvement:**
- **Input responsiveness**: Feels smoother
- **Re-renders**: 60-70% reduction during typing
- **Audio performance**: Better timing, less overlap

**Trade-offs:**
- 50ms delay before state updates (imperceptible)
- Slightly more complex
- New dependency

**When to implement:** If terminal feels sluggish during typing

---

### 3. Lazy Load CRT Effects ⚡ MEDIUM IMPACT

**Current Issue:**
- CRT effects (scanlines, flicker, glow) render on every frame
- CSS animations run continuously
- May cause repaints

**Solution:**
Make CRT effects optional/toggleable:

```typescript
const [enableCRTEffects, setEnableCRTEffects] = useState(
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

{enableCRTEffects ? (
  <CRTEffects>...</CRTEffects>
) : (
  <>{children}</>
)}
```

**Expected Improvement:**
- **FPS**: 10-20% better without CRT effects
- **Battery life**: 15-20% longer on laptops
- **Accessibility**: Respects motion preferences

**Trade-offs:**
- Less "retro terminal" aesthetic
- User preference setting needed
- Minimal code changes

**When to implement:** For performance mode or accessibility

---

### 4. Memoize Terminal Guide Suggestions 🔄 MEDIUM IMPACT

**Current Issue:**
- `terminalGuideService.generateSuggestions()` called frequently
- Recreates arrays on every interaction
- Same suggestions generated multiple times

**Solution:**
```typescript
const generateSuggestionsMemo = useMemo(() => 
  terminalGuideService.generateSuggestions(guideState, {
    connectedAgent,
    hasActiveAgents: activeAgents.length > 0,
  }),
  [guideState.stage, guideState.featuresDiscovered, connectedAgent]
);
```

**Expected Improvement:**
- **Suggestion generation**: 80-90% faster
- **Re-renders**: Fewer unnecessary updates
- **Memory**: Reduced garbage collection

**Trade-offs:**
- Slightly more memory for memoized values
- Need to carefully track dependencies
- Minimal effort

**When to implement:** Now (easy win)

---

### 5. Optimize Output History Storage 💾 MEDIUM IMPACT

**Current Issue:**
- Terminal outputs stored in localStorage on every change
- `useLocalStorage` hook writes frequently
- Can cause I/O bottleneck

**Solution:**
Add debouncing to localStorage writes:

```typescript
const debouncedSetTerminalOutput = useDebouncedCallback(
  (outputs: TerminalOutput[]) => {
    localStorage.setItem('ghost-archive-output', JSON.stringify(outputs));
  },
  1000 // Write to localStorage max once per second
);
```

**Expected Improvement:**
- **I/O operations**: 90% reduction
- **UI blocking**: Eliminated
- **Performance**: Smoother interactions

**Trade-offs:**
- Up to 1 second of data loss on crash/reload
- Slightly more complex
- Acceptable for terminal history

**When to implement:** If terminal feels laggy during rapid interactions

---

### 6. Code-Split Terminal Components 📦 LOW IMPACT

**Current Issue:**
- All terminal components load immediately
- Increases initial bundle size
- Some components rarely used (WorkflowVisualizer, FragmentRestorer)

**Solution:**
```typescript
const WorkflowVisualizer = lazy(() => 
  import('./WorkflowVisualizer').then(m => ({ default: m.WorkflowVisualizer }))
);

const FragmentRestorer = lazy(() => 
  import('./FragmentRestorer').then(m => ({ default: m.FragmentRestorer }))
);
```

**Expected Improvement:**
- **Initial load**: 5-10% faster
- **Bundle size**: 20-30KB smaller
- **Time to interactive**: 100-200ms faster

**Trade-offs:**
- Loading delay first time component is used
- More complex imports
- Minimal user impact

**When to implement:** During build optimization phase

---

### 7. Virtualize Long Text Outputs 📝 HIGH IMPACT

**Current Issue:**
- Long AI responses render as single blocks
- Large text content creates heavy DOM nodes
- No text chunking or pagination

**Solution:**
Chunk long responses:

```typescript
const renderLongContent = (content: string) => {
  if (content.length < 500) return content;
  
  const chunks = chunkText(content, 500);
  return (
    <details>
      <summary>{chunks[0]}... (click to expand)</summary>
      {chunks.slice(1).join('')}
    </details>
  );
};
```

**Expected Improvement:**
- **Render time**: 70% faster for long responses
- **DOM nodes**: 60% reduction
- **Scroll performance**: Significantly smoother

**Trade-offs:**
- Users must expand to see full content
- Slightly different UX
- May break text copying

**When to implement:** If AI responses are frequently >1000 characters

---

### 8. Optimize SageMaker Request Caching 🚀 HIGH IMPACT

**Current Issue:**
- Every identical question triggers new API call
- No response caching
- Wastes API calls and costs money

**Solution:**
```typescript
class SageMakerCache {
  private cache = new Map<string, { response: string; timestamp: number }>();
  private TTL = 3600000; // 1 hour
  
  async getOrFetch(key: string, fetcher: () => Promise<string>): Promise<string> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.response;
    }
    
    const response = await fetcher();
    this.cache.set(key, { response, timestamp: Date.now() });
    return response;
  }
}
```

**Expected Improvement:**
- **API calls**: 40-60% reduction
- **Response time**: Instant for cached queries
- **Cost savings**: $5-10/month
- **User experience**: Much faster repeated queries

**Trade-offs:**
- Stale responses (max 1 hour old)
- Memory usage for cache
- May not reflect updated context

**When to implement:** Before deploying SageMaker (high ROI)

---

### 9. Web Worker for Heavy Processing 🔧 LOW-MEDIUM IMPACT

**Current Issue:**
- Question detection runs on main thread
- JSON parsing/serialization blocks UI
- Pattern matching can be slow

**Solution:**
```typescript
// worker.ts
self.onmessage = (e) => {
  const { input } = e.data;
  const result = detectInputType(input);
  self.postMessage(result);
};

// usage
const worker = new Worker('./worker.ts');
worker.postMessage({ input: userInput });
```

**Expected Improvement:**
- **UI responsiveness**: Never blocks
- **Typing smoothness**: Perfect 60fps
- **Processing time**: Parallel execution

**Trade-offs:**
- More complex architecture
- Worker communication overhead
- Overkill for current use case

**When to implement:** Only if UI becomes noticeably janky

---

### 10. Reduce LocalStorage Writes 💾 MEDIUM IMPACT

**Current Issue:**
- `guideState` writes to localStorage on every interaction
- `terminalOutput` writes frequently
- Can cause quota issues and slowdowns

**Solution:**
Batch localStorage updates:

```typescript
const [pendingWrites, setPendingWrites] = useState({});

useEffect(() => {
  const timer = setTimeout(() => {
    Object.entries(pendingWrites).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    setPendingWrites({});
  }, 2000);
  
  return () => clearTimeout(timer);
}, [pendingWrites]);
```

**Expected Improvement:**
- **Write operations**: 85% reduction
- **Performance**: Smoother interactions
- **Browser responsiveness**: Better

**Trade-offs:**
- Up to 2 seconds of data loss on crash
- More complex state management
- Acceptable for most use cases

**When to implement:** If experiencing localStorage quota errors

---

## Priority Implementation Order

### Must Do Now (Quick Wins):
1. ✅ **Memoize suggestions** (5 minutes, medium impact)
2. ✅ **SageMaker response caching** (30 minutes, high impact on cost)

### Should Do Soon:
3. **Virtual scrolling** (2 hours, high impact with 100+ outputs)
4. **Debounced localStorage** (1 hour, medium impact)

### Consider Later:
5. **Code splitting** (30 minutes, low impact)
6. **CRT effects toggle** (1 hour, accessibility benefit)
7. **Long content chunking** (1 hour, conditional benefit)

### Skip Unless Needed:
8. **Web Workers** (complex, low ROI for current scale)
9. **Debounced input** (already pretty good)

---

## Performance Metrics to Track

Monitor these to know if optimizations are working:

```typescript
// Add to GhostArchive.tsx
useEffect(() => {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    console.log(`Render time: ${duration}ms`);
  };
});
```

**Targets:**
- Initial render: <200ms
- Command execution: <100ms
- New output render: <50ms
- Scroll performance: 60fps

---

## Bundle Size Optimizations

Current estimated sizes:
- TerminalDisplay: ~5KB
- GhostArchiveContext: ~15KB
- Services: ~10KB
- **Total**: ~30KB for terminal feature

**Potential savings:**
- Tree-shaking unused code: -5KB
- Minification improvements: -3KB
- Code splitting: -10KB from initial bundle

---

## Recommended Next Steps

1. **Implement SageMaker caching first** (biggest cost/performance win)
2. **Add virtual scrolling** when outputs exceed 50-100 items
3. **Monitor performance** in production
4. **Optimize based on actual usage patterns**

Most optimizations aren't needed yet - premature optimization is the root of all evil! Focus on the caching first.

