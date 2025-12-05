/**
 * ElevenLabs Text-to-Speech Service
 * High-quality AI voice synthesis
 */

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
}

export interface ElevenLabsOptions {
  voice_id?: string;
  model_id?: string;
  stability?: number; // 0.0 to 1.0
  similarity_boost?: number; // 0.0 to 1.0
  style?: number; // 0.0 to 1.0
  use_speaker_boost?: boolean;
}

export interface ElevenLabsResponse {
  audio: ArrayBuffer;
  content_type: string;
}

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - default voice
const DEFAULT_MODEL = 'eleven_multilingual_v2'; // or 'eleven_turbo_v2' for faster

class ElevenLabsService {
  private apiKey: string | null = null;
  private cachedVoices: ElevenLabsVoice[] | null = null;

  /**
   * Initialize the service with API key
   */
  initialize(apiKey: string): void {
    this.apiKey = apiKey;
    this.cachedVoices = null; // Clear cache on re-initialization
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    if (!this.isConfigured()) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Return cached voices if available
    if (this.cachedVoices) {
      return this.cachedVoices;
    }

    try {
      const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey!,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Failed to fetch voices: ${error.detail?.message || error.error || response.statusText}`);
      }

      const data = await response.json();
      this.cachedVoices = data.voices || [];
      return this.cachedVoices || [];
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech using ElevenLabs
   */
  async textToSpeech(
    text: string,
    options: ElevenLabsOptions = {}
  ): Promise<ArrayBuffer> {
    if (!this.isConfigured()) {
      throw new Error('ElevenLabs API key not configured');
    }

    if (!text || !text.trim()) {
      throw new Error('Text is required');
    }

    const voiceId = options.voice_id || DEFAULT_VOICE_ID;
    const modelId = options.model_id || DEFAULT_MODEL;

    // Clean and prepare text
    const cleanText = this.cleanText(text);

    try {
      const response = await fetch(
        `${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: modelId,
            voice_settings: {
              stability: options.stability ?? 0.5,
              similarity_boost: options.similarity_boost ?? 0.75,
              style: options.style ?? 0.0,
              use_speaker_boost: options.use_speaker_boost ?? true,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(
          `ElevenLabs TTS failed: ${error.detail?.message || error.error || response.statusText}`
        );
      }

      const audioBuffer = await response.arrayBuffer();
      return audioBuffer;
    } catch (error) {
      console.error('Error with ElevenLabs TTS:', error);
      throw error;
    }
  }

  /**
   * Play audio from ArrayBuffer
   */
  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };

      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };

      audio.play().catch(reject);
    });
  }

  /**
   * Clean text for better TTS quality
   */
  private cleanText(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/#{1,6}\s+/g, '') // Remove markdown headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/[▸☾⚙]/g, '') // Remove terminal symbols
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Get character count for pricing estimation
   */
  getCharacterCount(text: string): number {
    return this.cleanText(text).length;
  }

  /**
   * Check API key validity
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const voices = await this.getVoices();
      return Array.isArray(voices) && voices.length > 0;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }
}

export const elevenLabsService = new ElevenLabsService();

