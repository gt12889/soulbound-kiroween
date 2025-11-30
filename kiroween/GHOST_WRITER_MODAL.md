# Ghost Writer Modal Feature

## Overview

The Ghost Writer Modal is a separate, obvious UI component that helps users finish their writing by calling the Gemini API (or other AI providers). This is distinct from the ambient "whispering ghosts" feature.

## Features

### Modal Interface
- **Prominent Popup**: Large, centered modal with dark gothic styling
- **Backdrop**: Semi-transparent overlay with blur effect
- **Context Preview**: Shows the last 200 characters of current text
- **AI Suggestions**: Displays generated continuation suggestions
- **Action Buttons**: 
  - "Accept & Insert" - Inserts suggestion into editor
  - "Regenerate" - Requests a new suggestion
  - Close button (X) in header

### User Experience
- **Keyboard Shortcuts**:
  - `Ctrl+G` (or `Cmd+G` on Mac) - Opens the modal
  - `Escape` - Closes the modal
- **Focus Trap**: Keeps keyboard navigation within modal when open
- **Loading States**: Animated ghost while generating suggestions
- **Error Handling**: Clear error messages with retry option

### Integration
- **Toolbar Button**: "👻 Summon Ghost Writer" button in editor toolbar
- **Disabled State**: Button is disabled when no text is present
- **Seamless Insertion**: Accepted suggestions are inserted at cursor position

## Technical Implementation

### Components
1. **GhostWriterModal.tsx** - Main modal component
2. **GhostWriterModal.module.css** - Modal styling
3. **WritingEditor.tsx** - Updated to include modal trigger

### AI Service Integration
- Uses existing `aiService` for API calls
- Supports multiple providers: OpenRouter, OpenAI, Gemini
- Implements debouncing, caching, and error handling
- Graceful fallback to local suggestions on API failure

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Usage

1. Start writing in the Ghost Writer editor
2. Click "Summon Ghost Writer" button or press `Ctrl+G`
3. Review the AI-generated suggestion
4. Click "Accept & Insert" to add it to your text, or "Regenerate" for a new suggestion
5. Press `Escape` or click the X to close without inserting

## Configuration

### Quick Setup (Recommended: Google Gemini)

Google Gemini offers a generous free tier, making it the easiest option to get started:

1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Copy `.env.example` to `.env`
3. Add your Gemini API key:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_AI_PROVIDER=gemini
```

4. Restart the development server

### Alternative Providers

**OpenRouter** (Multiple models including NVIDIA, Meta, Anthropic):
```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_AI_PROVIDER=openrouter
VITE_AI_MODEL=nvidia/llama-3.1-nemotron-70b-instruct
```
Get API key: [https://openrouter.ai/keys](https://openrouter.ai/keys)

**OpenAI** (GPT-3.5, GPT-4):
```env
VITE_OPENROUTER_API_KEY=your_openai_api_key_here
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-3.5-turbo
```
Get API key: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### In-App Configuration

You can also view setup instructions directly in the app:
1. Open Settings (⚙️ icon in navigation)
2. Go to the "AI" tab
3. Follow the provider-specific instructions with direct links to get API keys

## Differences from Whispering Ghosts

| Feature | Ghost Writer Modal | Whispering Ghosts |
|---------|-------------------|-------------------|
| **Visibility** | Obvious, centered popup | Subtle, ambient suggestions |
| **Trigger** | Manual (button/shortcut) | Automatic while typing |
| **Interaction** | Explicit accept/reject | Hover to interact |
| **Purpose** | Help finish writing | Atmospheric enhancement |
| **API Calls** | On-demand | Debounced during typing |

## Future Enhancements

- [ ] Multiple suggestion options
- [ ] Tone/style selection
- [ ] Suggestion history
- [ ] Custom prompt templates
- [ ] Voice input integration
