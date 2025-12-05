# Personality Voice Mapping

Each personality in the Ghost Archive has a unique ElevenLabs voice that automatically activates when you connect to them.

## Current Voice Assignments

### Albert Einstein
- **Voice ID:** `onwK4e9ZLuTAKqWW03F9` (Onyx - Deep, mature old man voice)
- **Personality:** Wise, curious, philosophical
- **Voice Characteristics:** Deep, mature, elderly male voice with scholarly wisdom

### Cleopatra
- **Voice ID:** `EXAVITQu4vr4xnSDxMaL` (Bella - Elegant female voice)
- **Personality:** Regal, strategic, charismatic
- **Voice Characteristics:** Elegant, authoritative, with a commanding presence

### Dr. Victor Frankenstein
- **Voice ID:** `VR6AewLTigWG4xSOukaG` (Antoni - Dramatic male voice)
- **Personality:** Tormented, brilliant, passionate
- **Voice Characteristics:** Dramatic, intense, with emotional depth

## How It Works

1. **Automatic Voice Switching:**
   - When you connect to a personality, their voice automatically loads
   - The voice is used for all responses from that personality
   - Voice switches when you connect to a different personality

2. **Voice Selection Priority:**
   - Personality's voice (if connected to an agent)
   - Manually selected voice (from settings)
   - Default voice (Rachel)

3. **Manual Override:**
   - You can still manually select a different voice in settings
   - Manual selection overrides the personality voice
   - Reconnect to the personality to restore their voice

## Adding New Voices

To add a voice for a new personality:

1. **Get Voice ID from ElevenLabs:**
   - Go to [elevenlabs.io](https://elevenlabs.io)
   - Browse voices or create a custom voice
   - Copy the voice ID

2. **Update `personalities.json`:**
   ```json
   {
     "id": "new-personality",
     "name": "New Personality",
     ...
     "elevenLabsVoiceId": "your_voice_id_here"
   }
   ```

3. **Test:**
   - Connect to the personality
   - Ask a question
   - Verify the voice matches the personality

## Voice Recommendations by Personality Type

- **Scholarly/Wise:** Deep, thoughtful voices (Adam, George)
- **Regal/Authoritative:** Elegant, commanding voices (Bella, Charlotte)
- **Dramatic/Intense:** Emotional, expressive voices (Antoni, Arnold)
- **Playful/Creative:** Light, energetic voices (Domi, Elli)
- **Mysterious/Mystical:** Soft, ethereal voices (Rachel, Sam)

## Troubleshooting

**Voice not switching?**
- Check if ElevenLabs is configured (API key set)
- Verify the voice ID is correct in `personalities.json`
- Check browser console for errors
- Try reconnecting to the personality

**Wrong voice playing?**
- Check if you manually selected a different voice
- Reconnect to the personality to restore their voice
- Verify the voice ID exists in your ElevenLabs account

**Voice not available?**
- The voice ID might not exist in your ElevenLabs account
- Some voices are premium and require a paid plan
- Check ElevenLabs dashboard for available voices

