# 🔊 Voice Module Guide

## Overview

The Ghost Archive Terminal now includes a **Text-to-Speech (TTS)** feature with two providers:
- **🎙️ ElevenLabs AI** - High-quality, natural-sounding voices (recommended)
- **🔊 Browser TTS** - Free fallback using Web Speech API

The module automatically falls back to browser TTS if ElevenLabs is unavailable.

## Features

✅ **Two TTS Providers** - ElevenLabs AI (high quality) or Browser TTS (free fallback)  
✅ **Auto-read agent responses** - Automatically speaks when agents respond  
✅ **Click to re-read** - Click any agent message to hear it again  
✅ **Voice controls** - Toggle voice on/off, adjust settings  
✅ **Customizable** - Adjust speed, pitch, volume, stability, similarity, and style  
✅ **Persistent settings** - Your preferences are saved in localStorage  
✅ **Stop button** - Interrupt speech at any time  
✅ **Automatic fallback** - Falls back to browser TTS if ElevenLabs fails  

## How to Use

### Setup ElevenLabs (Recommended)

1. **Get API Key:**
   - Go to [elevenlabs.io](https://elevenlabs.io)
   - Sign up for a free account
   - Navigate to your profile → API Keys
   - Copy your API key

2. **Configure in App:**
   - Open voice settings (⚙️ button)
   - Select "🎙️ ElevenLabs AI (High Quality)" as provider
   - Paste your API key in the "ElevenLabs API Key" field
   - Click "Save"
   - Wait for voices to load

3. **Choose Voice:**
   - Select from available ElevenLabs voices
   - Each voice has different characteristics
   - Test different voices to find your favorite

### Basic Usage

1. **Enable/Disable Voice:**
   - Click the 🔊 button in the top-right corner of the terminal
   - When enabled (🔊), agent responses will be read automatically
   - When disabled (🔈), voice is off

2. **Stop Speaking:**
   - While speech is active, a ⏹ button appears
   - Click it to stop the current speech

3. **Re-read a Message:**
   - Click any agent message to hear it read again
   - Only works when voice is enabled

### Voice Settings

1. **Open Settings:**
   - Click the ⚙️ button next to the voice toggle
   - A settings panel will appear

2. **Select Provider:**
   - **ElevenLabs AI**: High-quality voices (requires API key)
   - **Browser TTS**: Free fallback (no setup required)

3. **ElevenLabs Settings:**
   - **API Key**: Your ElevenLabs API key (required)
   - **Voice**: Choose from available ElevenLabs voices
   - **Stability**: 0.0 to 1.0 (default: 0.5) - Controls voice consistency
   - **Similarity Boost**: 0.0 to 1.0 (default: 0.75) - How closely it matches the original voice
   - **Style**: 0.0 to 1.0 (default: 0.0) - Voice expressiveness
   - **Volume**: 0% to 100% (default: 80%)

4. **Browser TTS Settings:**
   - **Voice**: Choose from available system voices (English voices shown)
   - **Speed**: 0.5x to 2.0x (default: 1.0x)
   - **Pitch**: 0.5 to 2.0 (default: 1.0)
   - **Volume**: 0% to 100% (default: 80%)

5. **Test Voice:**
   - Click "Test Voice" button to hear a sample
   - Adjust settings and test again to find your preference

6. **Close Settings:**
   - Click the × button or click outside the panel

## Technical Details

### ElevenLabs Pricing

- **Free Tier**: 10,000 characters/month
- **Starter**: $5/month - 30,000 characters
- **Creator**: $22/month - 100,000 characters
- **Pro**: $99/month - 500,000 characters

**Note**: Character count is based on text length, not audio duration.

### Browser Support

**ElevenLabs:**
- ✅ Works in all modern browsers
- ✅ Requires API key
- ✅ High-quality voices

**Browser TTS:**
- ✅ Chrome/Edge (best support)
- ✅ Safari (good support)
- ⚠️ Firefox (limited support)
- ❌ Not available in some older browsers

### Voice Selection

**ElevenLabs:**
- Voices are loaded from your ElevenLabs account
- Each voice has unique characteristics
- Default voice: Rachel (21m00Tcm4TlvDq8ikWAM)

**Browser TTS:**
- Automatically selects a good default voice:
  1. English Natural/Neural voices (preferred)
  2. English Premium voices
  3. English-US voices
  4. Any English voice
  5. First available voice

### Text Cleaning

Before speaking, the text is automatically cleaned:
- Removes code blocks (```...```)
- Removes inline code (`...`)
- Removes markdown formatting
- Removes terminal symbols (▸☾⚙)
- Normalizes whitespace

### Performance

- **First request**: May take a moment to initialize
- **Subsequent requests**: Instant
- **Long messages**: Automatically handled by browser
- **Multiple messages**: Only the latest agent response is spoken

## Customization

### Default Settings

You can change default settings in `TerminalDisplay.tsx`:

```typescript
const [voiceEnabled, setVoiceEnabled] = useLocalStorage<boolean>('ghost-archive-voice-enabled', true);
const [voiceRate, setVoiceRate] = useLocalStorage<number>('ghost-archive-voice-rate', 1.0);
const [voicePitch, setVoicePitch] = useLocalStorage<number>('ghost-archive-voice-pitch', 1.0);
const [voiceVolume, setVoiceVolume] = useLocalStorage<number>('ghost-archive-voice-volume', 0.8);
```

### Disable Auto-Speak

To disable automatic speaking (but keep manual click-to-speak):

1. Find the `useEffect` that handles auto-speak in `TerminalDisplay.tsx`
2. Comment out or remove the effect
3. Click-to-speak will still work

## Troubleshooting

### ElevenLabs Issues

1. **API Key Not Working:**
   - Verify key is correct (starts with your account identifier)
   - Check if you've exceeded your character limit
   - Ensure key has TTS permissions enabled

2. **Voices Not Loading:**
   - Check internet connection
   - Verify API key is valid
   - Try refreshing the page

3. **Audio Not Playing:**
   - Check browser audio permissions
   - Ensure volume is not muted
   - Try a different voice

### Browser TTS Issues

1. **Voice Not Working:**
   - Check browser support:
     - Open browser console (F12)
     - Type: `'speechSynthesis' in window`
     - Should return `true`
   - Check if enabled:
     - Look for 🔊 icon (not 🔈)
     - Click to toggle if needed
   - Check browser permissions:
     - Some browsers require user interaction first
     - Try clicking a message manually first

### Voice Sounds Wrong

**ElevenLabs:**
1. **Adjust stability:**
   - Lower stability (0.3-0.5) for more variation
   - Higher stability (0.7-0.9) for consistency

2. **Adjust similarity boost:**
   - Higher values (0.8-1.0) match original voice more closely
   - Lower values (0.5-0.7) allow more variation

3. **Try different voice:**
   - Each voice has unique characteristics
   - Test multiple voices to find the best fit

**Browser TTS:**
1. **Try different voice:**
   - Open settings (⚙️)
   - Select a different voice from dropdown
   - Test with "Test Voice" button

2. **Adjust speed/pitch:**
   - Lower speed (0.7-0.9) for clearer speech
   - Adjust pitch to match your preference

### Voice Cuts Off

1. **Check volume:**
   - Make sure volume slider is not at 0%
   - Try increasing to 80-100%

2. **Check browser:**
   - Some browsers have speech limits
   - Try Chrome/Edge for best results

### Settings Not Saving

- Settings are saved in localStorage
- Clear browser cache if issues persist
- Check browser console for errors

## Code Structure

### Files

- `src/hooks/useTextToSpeech.ts` - Main TTS hook
- `src/components/terminal-tarot/ghost-archive/TerminalDisplay.tsx` - Integration
- `src/components/terminal-tarot/ghost-archive/TerminalDisplay.module.css` - Styles

### Key Functions

- `speak(text, options)` - Speak text with options
- `stop()` - Stop current speech
- `toggle()` - Toggle voice on/off
- `setVoice(voice)` - Change voice
- `setRate(rate)` - Change speed
- `setPitch(pitch)` - Change pitch
- `setVolume(volume)` - Change volume

## API Key Security

**Important**: Your ElevenLabs API key is stored in browser localStorage. It's:
- ✅ Stored locally (never sent to our servers)
- ✅ Encrypted in transit (HTTPS)
- ⚠️ Visible in browser DevTools (local only)
- ⚠️ Cleared if you clear browser data

**Best Practices:**
- Don't share your API key
- Use a separate key for development
- Monitor your usage on ElevenLabs dashboard
- Set up usage alerts if available

## Future Enhancements

Possible improvements:
- [ ] Voice selection per agent personality
- [ ] Speech queue for multiple messages
- [ ] Highlight text while speaking
- [ ] Keyboard shortcuts
- [ ] Voice commands (speech-to-text)
- [ ] Character usage tracking
- [ ] Voice cloning support

---

**Enjoy your voice-enabled Ghost Archive experience!** 🎤✨

