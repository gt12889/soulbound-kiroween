/**
 * Text-to-Speech Hook
 * Supports both ElevenLabs AI (high quality) and Browser TTS (fallback)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { elevenLabsService, type ElevenLabsVoice, type ElevenLabsOptions } from '../services/elevenLabsService';
import { useLocalStorage } from './useLocalStorage';
import { settingsService } from '../services/settingsService';
import { useAuth } from '../contexts/AuthContext';

export type TTSProvider = 'elevenlabs' | 'browser';

export interface TextToSpeechOptions {
  enabled?: boolean;
  provider?: TTSProvider;
  // Browser TTS options
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  voice?: SpeechSynthesisVoice | null;
  lang?: string;
  // ElevenLabs options
  elevenLabsVoiceId?: string;
  elevenLabsModel?: string;
  stability?: number; // 0.0 to 1.0
  similarity_boost?: number; // 0.0 to 1.0
  style?: number; // 0.0 to 1.0
  use_speaker_boost?: boolean;
}

export interface UseTextToSpeechReturn {
  isEnabled: boolean;
  isSpeaking: boolean;
  provider: TTSProvider;
  // Browser TTS
  availableVoices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  // ElevenLabs
  elevenLabsVoices: ElevenLabsVoice[];
  currentElevenLabsVoice: ElevenLabsVoice | null;
  elevenLabsApiKey: string | null;
  elevenLabsConfigured: boolean;
  // Options
  options: TextToSpeechOptions;
  // Actions
  speak: (text: string, options?: Partial<TextToSpeechOptions>) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  setProvider: (provider: TTSProvider) => void;
  setVoice: (voice: SpeechSynthesisVoice | null) => void;
  setElevenLabsVoice: (voice: ElevenLabsVoice | null) => void;
  setElevenLabsApiKey: (key: string) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  setStability: (stability: number) => void;
  setSimilarityBoost: (boost: number) => void;
  setStyle: (style: number) => void;
  isSupported: boolean;
}

const DEFAULT_OPTIONS: TextToSpeechOptions = {
  enabled: true,
  provider: 'elevenlabs',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  voice: null,
  lang: 'en-US',
  elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
  elevenLabsModel: 'eleven_multilingual_v2',
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
};

export function useTextToSpeech(
  initialOptions: Partial<TextToSpeechOptions> = {}
): UseTextToSpeechReturn {
  const [isEnabled, setIsEnabled] = useState(initialOptions.enabled ?? DEFAULT_OPTIONS.enabled ?? true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [provider, setProviderState] = useLocalStorage<TTSProvider>('tts-provider', initialOptions.provider ?? DEFAULT_OPTIONS.provider ?? 'elevenlabs');
  
  // Browser TTS state
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // ElevenLabs state
  const [elevenLabsVoices, setElevenLabsVoices] = useState<ElevenLabsVoice[]>([]);
  const [currentElevenLabsVoice, setCurrentElevenLabsVoice] = useState<ElevenLabsVoice | null>(null);
  const [elevenLabsApiKey, setElevenLabsApiKeyState] = useState<string | null>(null);
  const [elevenLabsConfigured, setElevenLabsConfigured] = useState(false);
  const { user } = useAuth();
  
  const [options, setOptions] = useState<TextToSpeechOptions>({
    ...DEFAULT_OPTIONS,
    ...initialOptions,
    provider,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isBrowserSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load ElevenLabs API key from environment variable first, then settings
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        // Priority 1: Environment variable (for deployment)
        const envApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
        if (envApiKey) {
          setElevenLabsApiKeyState(envApiKey);
          elevenLabsService.initialize(envApiKey);
          setElevenLabsConfigured(true);
          loadElevenLabsVoices();
          return;
        }
        
        // Priority 2: Try to load from Firebase settings
        if (user?.id) {
          try {
            const cloudSettings = await settingsService.loadFromCloud(user.id);
            const apiKey = cloudSettings?.elevenLabsApiKey || null;
            
            if (apiKey) {
              setElevenLabsApiKeyState(apiKey);
              elevenLabsService.initialize(apiKey);
              setElevenLabsConfigured(true);
              loadElevenLabsVoices();
              return;
            }
          } catch (error) {
            console.warn('Failed to load from cloud, trying local:', error);
          }
        }
        
        // Priority 3: Fallback to local settings
        const localSettings = settingsService.getSettings();
        const localApiKey = localSettings?.elevenLabsApiKey || null;
        
        if (localApiKey) {
          setElevenLabsApiKeyState(localApiKey);
          elevenLabsService.initialize(localApiKey);
          setElevenLabsConfigured(true);
          loadElevenLabsVoices();
          return;
        }
        
        // Priority 4: Fallback to localStorage
        const localKey = localStorage.getItem('elevenlabs-api-key');
        if (localKey) {
          setElevenLabsApiKeyState(localKey);
          elevenLabsService.initialize(localKey);
          setElevenLabsConfigured(true);
          loadElevenLabsVoices();
        } else {
          setElevenLabsConfigured(false);
        }
      } catch (error) {
        console.error('Failed to load ElevenLabs API key:', error);
        setElevenLabsConfigured(false);
      }
    };

    loadApiKey();
  }, [user?.id]);

  // Initialize ElevenLabs if API key is set
  useEffect(() => {
    if (elevenLabsApiKey) {
      elevenLabsService.initialize(elevenLabsApiKey);
      setElevenLabsConfigured(true);
      loadElevenLabsVoices();
    } else {
      setElevenLabsConfigured(false);
    }
  }, [elevenLabsApiKey]);

  // Load ElevenLabs voices
  const loadElevenLabsVoices = useCallback(async () => {
    if (!elevenLabsApiKey) return;
    
    try {
      const voices = await elevenLabsService.getVoices();
      setElevenLabsVoices(voices);
      
      // Set default voice if none selected
      if (!currentElevenLabsVoice && voices.length > 0) {
        const defaultVoice = voices.find(v => v.voice_id === options.elevenLabsVoiceId) || voices[0];
        setCurrentElevenLabsVoice(defaultVoice);
      }
    } catch (error) {
      console.error('Failed to load ElevenLabs voices:', error);
    }
  }, [elevenLabsApiKey, currentElevenLabsVoice, options.elevenLabsVoiceId]);

  // Load browser voices
  useEffect(() => {
    if (!isBrowserSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      if (!currentVoice && voices.length > 0) {
        const preferredVoice =
          voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
          voices.find(v => v.lang.startsWith('en') && v.name.includes('Neural')) ||
          voices.find(v => v.lang.startsWith('en') && v.name.includes('Premium')) ||
          voices.find(v => v.lang.startsWith('en-US')) ||
          voices.find(v => v.lang.startsWith('en')) ||
          voices[0];

        if (preferredVoice) {
          setCurrentVoice(preferredVoice);
          setOptions(prev => ({ ...prev, voice: preferredVoice }));
        }
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isBrowserSupported, currentVoice]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Speak using ElevenLabs
  const speakElevenLabs = useCallback(async (text: string, overrideOptions?: Partial<TextToSpeechOptions>) => {
    if (!elevenLabsConfigured || !elevenLabsApiKey) {
      throw new Error('ElevenLabs not configured');
    }

    setIsSpeaking(true);

    try {
      const finalOptions = { ...options, ...overrideOptions };
      const elevenLabsOptions: ElevenLabsOptions = {
        voice_id: finalOptions.elevenLabsVoiceId || currentElevenLabsVoice?.voice_id || DEFAULT_OPTIONS.elevenLabsVoiceId,
        model_id: finalOptions.elevenLabsModel || DEFAULT_OPTIONS.elevenLabsModel,
        stability: finalOptions.stability ?? DEFAULT_OPTIONS.stability,
        similarity_boost: finalOptions.similarity_boost ?? DEFAULT_OPTIONS.similarity_boost,
        style: finalOptions.style ?? DEFAULT_OPTIONS.style,
        use_speaker_boost: finalOptions.use_speaker_boost ?? DEFAULT_OPTIONS.use_speaker_boost,
      };

      const audioBuffer = await elevenLabsService.textToSpeech(text, elevenLabsOptions);
      
      // Stop any current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Play audio
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        audioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsSpeaking(false);
      // Fallback to browser TTS
      if (isBrowserSupported) {
        console.log('Falling back to browser TTS');
        speakBrowser(text, overrideOptions);
      } else {
        throw error;
      }
    }
  }, [elevenLabsConfigured, elevenLabsApiKey, options, currentElevenLabsVoice, isBrowserSupported]);

  // Speak using browser TTS
  const speakBrowser = useCallback(
    (text: string, overrideOptions?: Partial<TextToSpeechOptions>) => {
      if (!isBrowserSupported || !text.trim()) {
        return;
      }

      window.speechSynthesis.cancel();

      const cleanText = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[▸☾⚙]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const finalOptions = { ...options, ...overrideOptions };

      utterance.rate = finalOptions.rate ?? 1.0;
      utterance.pitch = finalOptions.pitch ?? 1.0;
      utterance.volume = finalOptions.volume ?? 1.0;
      utterance.lang = finalOptions.lang ?? 'en-US';

      if (finalOptions.voice) {
        utterance.voice = finalOptions.voice;
      } else if (currentVoice) {
        utterance.voice = currentVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isBrowserSupported, options, currentVoice]
  );

  // Main speak function - routes to appropriate provider
  const speak = useCallback(
    async (text: string, overrideOptions?: Partial<TextToSpeechOptions>) => {
      if (!isEnabled || !text.trim()) {
        return;
      }

      const finalProvider = overrideOptions?.provider ?? provider;

      if (finalProvider === 'elevenlabs' && elevenLabsConfigured) {
        await speakElevenLabs(text, overrideOptions);
      } else if (isBrowserSupported) {
        speakBrowser(text, overrideOptions);
      } else {
        console.warn('No TTS provider available');
      }
    },
    [isEnabled, provider, elevenLabsConfigured, speakElevenLabs, speakBrowser, isBrowserSupported]
  );

  const stop = useCallback(() => {
    if (provider === 'elevenlabs' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    } else if (isBrowserSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, [provider, isBrowserSupported]);

  const pause = useCallback(() => {
    if (provider === 'elevenlabs' && audioRef.current) {
      audioRef.current.pause();
    } else if (isBrowserSupported && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [provider, isBrowserSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (provider === 'elevenlabs' && audioRef.current) {
      audioRef.current.play();
    } else if (isBrowserSupported && isSpeaking) {
      window.speechSynthesis.resume();
    }
  }, [provider, isBrowserSupported, isSpeaking]);

  const toggle = useCallback(() => {
    setIsEnabled(prev => !prev);
    if (isSpeaking) {
      stop();
    }
  }, [isSpeaking, stop]);

  const setProvider = useCallback((newProvider: TTSProvider) => {
    setProviderState(newProvider);
    setOptions(prev => ({ ...prev, provider: newProvider }));
    if (isSpeaking) {
      stop();
    }
  }, [setProviderState, isSpeaking, stop]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setCurrentVoice(voice);
    setOptions(prev => ({ ...prev, voice }));
  }, []);

  const setElevenLabsVoice = useCallback((voice: ElevenLabsVoice | null) => {
    setCurrentElevenLabsVoice(voice);
    setOptions(prev => ({ 
      ...prev, 
      elevenLabsVoiceId: voice?.voice_id || DEFAULT_OPTIONS.elevenLabsVoiceId 
    }));
  }, []);

  const setElevenLabsApiKey = useCallback(async (key: string) => {
    setElevenLabsApiKeyState(key);
    
    // Save to localStorage as backup
    if (key) {
      localStorage.setItem('elevenlabs-api-key', key);
    } else {
      localStorage.removeItem('elevenlabs-api-key');
    }
    
    // Save to Firebase settings if user is authenticated
    if (user?.id) {
      try {
        await settingsService.updateSettings(
          { elevenLabsApiKey: key || undefined },
          user.id
        );
      } catch (error) {
        console.error('Failed to save API key to Firebase:', error);
        // Continue anyway - localStorage backup is set
      }
    }
    
    if (key) {
      elevenLabsService.initialize(key);
      setElevenLabsConfigured(true);
      loadElevenLabsVoices();
    } else {
      setElevenLabsConfigured(false);
    }
  }, [user?.id, loadElevenLabsVoices]);

  const setRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.1, Math.min(10, rate));
    setOptions(prev => ({ ...prev, rate: clampedRate }));
  }, []);

  const setPitch = useCallback((pitch: number) => {
    const clampedPitch = Math.max(0, Math.min(2, pitch));
    setOptions(prev => ({ ...prev, pitch: clampedPitch }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setOptions(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  const setStability = useCallback((stability: number) => {
    const clamped = Math.max(0, Math.min(1, stability));
    setOptions(prev => ({ ...prev, stability: clamped }));
  }, []);

  const setSimilarityBoost = useCallback((boost: number) => {
    const clamped = Math.max(0, Math.min(1, boost));
    setOptions(prev => ({ ...prev, similarity_boost: clamped }));
  }, []);

  const setStyle = useCallback((style: number) => {
    const clamped = Math.max(0, Math.min(1, style));
    setOptions(prev => ({ ...prev, style: clamped }));
  }, []);

  return {
    isEnabled,
    isSpeaking,
    provider,
    availableVoices,
    currentVoice,
    elevenLabsVoices,
    currentElevenLabsVoice,
    elevenLabsApiKey,
    elevenLabsConfigured,
    options,
    speak,
    stop,
    pause,
    resume,
    toggle,
    setProvider,
    setVoice,
    setElevenLabsVoice,
    setElevenLabsApiKey,
    setRate,
    setPitch,
    setVolume,
    setStability,
    setSimilarityBoost,
    setStyle,
    isSupported: isBrowserSupported || elevenLabsConfigured,
  };
}
