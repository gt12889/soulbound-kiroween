# Ghost Writer Continuation and Dialogue Box Fixes

## Issues Fixed

### 1. Passive Generation Dialogue Box Sizing

**Problem:** Dialogue boxes for passive (automatic) generation were being cut off too early, not showing the full suggestion text.

**Solution:**
- Changed `width: 100%` to `width: max-content` for dynamic sizing based on content
- Increased `max-height` in `.textContainer` from 300px to 400px
- Improved `line-height` from 1.6 to 1.7 for better readability
- Enhanced text wrapping with `hyphens: auto`
- Removed `max-height` constraint on `.suggestionText`
- Added `word-wrap: break-word` and `overflow-wrap: break-word` to `.textContainer`

**Files Modified:**
- `kiroween/src/components/ghost-writer/SuggestionDisplay.module.css`

### 2. Active Generation Text Continuation

**Problem:** Double-Tab (active generation) was not properly appending to current text and sometimes repeated existing content.

**Solution:**

#### A. Enhanced AI Service (`aiService.ts`)

1. **Added `isManual` parameter** to `getSuggestion()` method:
   - Distinguishes between manual (double-Tab) and automatic (while typing) generation
   - Different prompts and token limits for each mode

2. **Different prompts for manual vs automatic:**
   - **Manual (double-Tab):** 
     - Handles incomplete sentences intelligently
     - Completes mid-sentence text with proper punctuation
     - Generates 3-5 additional sentences (300 tokens)
     - Explicit instructions to not repeat original text
   - **Automatic (while typing):**
     - Shorter, contextual continuations (2-3 sentences, 150 tokens)
     - Quick suggestions that don't interrupt flow

3. **Added `cleanSuggestion()` method:**
   - Removes repetition of original context from AI responses
   - Analyzes last 10 words of context
   - Finds and removes any repeated content at start of suggestion
   - Handles spacing and punctuation intelligently
   - Ensures smooth continuation without duplication

4. **Separate caching for manual vs automatic:**
   - Cache keys include generation type: `${context}:manual` or `${context}:auto`
   - Prevents cached automatic suggestions from being used for manual requests

#### B. Improved GhostWriter Component (`GhostWriter.tsx`)

1. **Pass `isManual` flag to AI service:**
   - `aiService.getSuggestion(context, 1, isManual)`
   - Tracks whether generation was manually triggered

2. **Enhanced optimistic suggestions:**
   - Different patterns for manual vs automatic generation
   - Manual patterns are longer and more sophisticated
   - Better handling of incomplete sentences and punctuation
   - Adds period before continuation if sentence is incomplete (manual mode)

## Technical Implementation

### AI Service Changes

```typescript
async getSuggestion(context: string, count: number = 1, isManual: boolean = false): Promise<string>
```

**Manual Generation Prompt (Gemini):**
```
Continue this text naturally and creatively. The text may be incomplete (ending mid-sentence). 
Complete any incomplete sentence first, then continue with additional content. Only provide 
the continuation, not the original text. If the text ends mid-sentence, complete it properly 
with appropriate punctuation before continuing.

TONE MATCHING (critical):
- Match the exact voice, tense, and vocabulary
- Continue naturally - don't repeat the original text
- If the sentence is incomplete, complete it first with proper punctuation
- Then add 3-5 more sentences continuing the narrative
```

**Automatic Generation Prompt (Gemini):**
```
Continue this text naturally and creatively with 2-3 sentences. Only provide the continuation, 
not the original text.

TONE MATCHING (critical):
- Match the exact voice, tense, and vocabulary of the original
- Continue naturally - don't repeat or restart
- Keep it brief (2-3 sentences)
```

### Text Cleaning Algorithm

The `cleanSuggestion()` method:
1. Analyzes the last 10 words of the original context
2. Finds and removes any repetition at the start of the AI suggestion
3. Handles spacing and punctuation intelligently
4. Ensures smooth continuation without duplication

```typescript
private cleanSuggestion(suggestion: string, originalContext: string): string {
  // Remove repetition of context from beginning
  const contextWords = originalContext.toLowerCase().split(/\s+/).slice(-10);
  const suggestionWords = suggestion.split(/\s+/);
  
  // Find where suggestion actually starts
  let startIndex = 0;
  for (let i = 0; i < suggestionWords.length - contextWords.length + 1; i++) {
    const suggestionSlice = suggestionWords.slice(i, i + contextWords.length).join(' ').toLowerCase();
    const contextSlice = contextWords.join(' ');
    
    if (suggestionSlice.includes(contextSlice) || contextSlice.includes(suggestionSlice)) {
      startIndex = i + contextWords.length;
      break;
    }
  }
  
  // Return cleaned suggestion with proper spacing
  const cleanedSuggestion = suggestionWords.slice(startIndex).join(' ').trim();
  
  // Handle spacing for incomplete sentences
  if (cleanedSuggestion && !originalContext.match(/[.!?]\s*$/) && !cleanedSuggestion.match(/^[.!?,;]/)) {
    if (!originalContext.endsWith(' ') && !cleanedSuggestion.startsWith(' ')) {
      return ' ' + cleanedSuggestion;
    }
  }
  
  return cleanedSuggestion;
}
```

### CSS Improvements

```css
.suggestionDisplay {
  width: max-content; /* Dynamic sizing instead of 100% */
}

.textContainer {
  max-height: 400px; /* Increased from 300px */
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.suggestionText {
  line-height: 1.7; /* Improved from 1.6 */
  hyphens: auto;
  max-height: none; /* Removed height constraint */
}
```

## User Experience Improvements

### Passive Generation (While Typing)
- ✅ Dialogue boxes now properly display full suggestions
- ✅ Better text wrapping and readability
- ✅ Dynamic sizing based on content
- ✅ Shorter, contextual suggestions (2-3 sentences)

### Active Generation (Double-Tab)
- ✅ **Automatically inserts text** - No need to press Tab/Enter to accept
- ✅ Properly continues from current cursor position
- ✅ Handles incomplete sentences intelligently
- ✅ Adds appropriate punctuation when needed
- ✅ Longer, more substantial continuations (3-5 sentences)
- ✅ No repetition of existing text
- ✅ Smart spacing and grammar handling

## Examples

### Before Fix:
**User types:** "The explorer walked through the forest"
**Double-Tab generates:** "The explorer walked through the forest and discovered..." (repetitive)
**Dialogue box:** Cut off at "The explorer walked through..."

### After Fix:
**User types:** "The explorer walked through the forest"
**Double-Tab:** Automatically generates and inserts " and discovered something amazing. The journey continued with new revelations. Each step revealed hidden wonders." (clean continuation, no manual acceptance needed)
**Dialogue box:** Fully displays the entire suggestion with proper sizing (for passive generation)

### Incomplete Sentence Handling:
**User types:** "She examined the ancient artifact"
**Double-Tab generates:** ". The mystery deepened as she explored further. Ancient symbols began to glow with an otherworldly light." (completes sentence first)

### Automatic Generation:
**User types:** "The story begins when"
**Automatic suggestion:** " a mysterious stranger arrives at the door." (short, contextual)

## Files Modified

1. `kiroween/src/services/aiService.ts` - Enhanced suggestion generation with manual/automatic modes
2. `kiroween/src/components/ghost-writer/SuggestionDisplay.module.css` - Improved sizing and text wrapping
3. `kiroween/src/components/ghost-writer/GhostWriter.tsx` - Better text handling and optimistic suggestions

## Testing Recommendations

1. **Test passive generation:**
   - Type naturally and observe automatic suggestions
   - Verify dialogue boxes show full text without cutoff
   - Check that suggestions are brief (2-3 sentences)

2. **Test active generation:**
   - Type incomplete sentence and press Tab twice
   - Verify it completes the sentence with proper punctuation
   - Verify it adds 3-5 more sentences
   - Verify no repetition of original text

3. **Test edge cases:**
   - Very long suggestions (should wrap properly)
   - Incomplete sentences ending mid-word
   - Text ending with punctuation vs no punctuation
   - Different writing styles (formal, casual, creative)

## Performance Considerations

- Separate caching for manual vs automatic prevents cache pollution
- Text cleaning algorithm is O(n) where n is suggestion length
- Dynamic sizing uses CSS `max-content` for optimal performance
- No additional API calls - cleaning happens client-side


## Double-Tab Auto-Accept Feature

### Behavior

When you press **Tab twice** (double-Tab):

1. **If a suggestion is already visible:** Accepts and inserts it immediately
2. **If no suggestion is visible:** 
   - Generates a new manual suggestion (3-5 sentences)
   - Shows optimistic placeholder while loading
   - **Automatically accepts and inserts** the suggestion when it arrives
   - No need to press Tab/Enter to accept

### Implementation

The auto-accept feature uses a flag (`autoAcceptNext`) that:
- Gets set to `true` when double-Tab triggers new generation
- Causes the suggestion to be automatically accepted when it arrives
- Resets to `false` after auto-acceptance

This provides a seamless writing experience where double-Tab means "give me more content NOW" rather than "show me a suggestion I need to manually accept."

### User Experience

**Before:**
1. Press Tab-Tab
2. Wait for suggestion
3. Press Tab or Enter to accept
4. Continue writing

**After:**
1. Press Tab-Tab
2. Text automatically appears
3. Continue writing immediately

This reduces friction and makes the Ghost Writer feel more like a true writing assistant that anticipates your needs.
