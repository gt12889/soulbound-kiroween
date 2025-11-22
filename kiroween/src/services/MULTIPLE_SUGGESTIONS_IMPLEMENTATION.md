# Multiple Suggestions Implementation

## Overview
Implemented support for requesting 2-3 alternative suggestions from the AI service, enabling users to choose from multiple writing continuations.

## Changes Made

### 1. Updated SuggestionCache Interface
- Added `alternatives?: string[]` field to store multiple suggestions for the same context
- Maintains backward compatibility with single suggestion caching

### 2. New Method: `getSuggestions()`
```typescript
async getSuggestions(context: string, count: number = 3): Promise<string[]>
```
- Generates 2-3 alternative suggestions based on context
- Implements same debouncing and caching as single suggestions
- Returns array of suggestion texts
- Clamps count to valid range (2-3)

### 3. Updated `getSuggestion()` Method
- Added optional `count` parameter (default: 1)
- Passes count through to API request
- Maintains backward compatibility for existing code

### 4. New Private Method: `fetchSuggestions()`
- Fetches multiple suggestions from API with retry logic
- Falls back to local suggestions on error
- Generates multiple local suggestions when API unavailable

### 5. New Private Method: `makeAPIRequestMultiple()`
- Makes API requests for multiple suggestions
- Handles provider-specific response formats:
  - **Gemini**: Uses `candidateCount` parameter, parses multiple candidates
  - **OpenAI/OpenRouter**: Uses `n` parameter, parses multiple choices
- Pads results if fewer suggestions returned than requested

### 6. Updated `buildRequestBody()`
- Added `count` parameter (default: 1)
- For Gemini: Sets `candidateCount` in generationConfig
- For OpenAI/OpenRouter: Sets `n` parameter in request body

### 7. New Cache Methods
```typescript
private getCachedSuggestions(context: string, count: number): string[] | null
private cacheSuggestions(context: string, suggestions: string[]): void
```
- Caches multiple suggestions with LRU eviction
- Checks if cached alternatives match requested count
- Stores first suggestion as primary for backward compatibility

## API Provider Support

### Gemini
- Uses `candidateCount` parameter in `generationConfig`
- Parses multiple candidates from response
- Each candidate has its own `content.parts[0].text`

### OpenAI / OpenRouter
- Uses `n` parameter in request body
- Parses multiple choices from response
- Each choice has its own `message.content`

## Usage Examples

### Single Suggestion (Backward Compatible)
```typescript
const suggestion = await aiService.getSuggestion(context);
```

### Multiple Suggestions
```typescript
const suggestions = await aiService.getSuggestions(context, 3);
// Returns: ["suggestion 1", "suggestion 2", "suggestion 3"]
```

### With Count Parameter
```typescript
const suggestion = await aiService.getSuggestion(context, 2);
// Still returns single string, but requests 2 alternatives from API
```

## Caching Behavior
- Multiple suggestions cached together under same context key
- Cache stores all alternatives in `alternatives` array
- First suggestion stored as primary for backward compatibility
- Cache hit returns requested number of alternatives if available

## Error Handling
- Falls back to local suggestions if API fails
- Generates multiple local suggestions when count > 1
- Maintains same retry logic as single suggestions
- Pads results if API returns fewer suggestions than requested

## Testing
- All existing tests pass
- Backward compatible with existing code
- Ready for integration with suggestion carousel UI

## Next Steps
1. Implement Task 6.2: Parse multiple responses (✓ Complete)
2. Implement Task 6.3: Cache all suggestions (✓ Complete)
3. Implement Task 6.4: Add selection logic (Ready for UI integration)
4. Create suggestion carousel component (Task 6.2 in tasks.md)
