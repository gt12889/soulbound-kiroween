/**
 * Audio Service
 * Manages Web Audio API integration, sound file loading, and playback
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

export type SoundEffect = 
  | 'ghost-appear'
  | 'ghost-disappear'
  | 'suggestion-accept'
  | 'page-turn'
  | 'tombstone-rise'
  | 'tombstone-sink'
  | 'ui-click'
  | 'ui-hover';

interface AudioState {
  context: AudioContext | null;
  buffers: Map<SoundEffect, AudioBuffer>;
  isInitialized: boolean;
  volume: number;
  enabled: boolean;
}

class AudioService {
  private state: AudioState = {
    context: null,
    buffers: new Map(),
    isInitialized: false,
    volume: 0.5,
    enabled: false,
  };

  /**
   * Initialize Web Audio API context
   * Handles browser audio policy restrictions by requiring user interaction
   */
  async initialize(): Promise<void> {
    if (this.state.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported in this browser');
        return;
      }

      this.state.context = new AudioContextClass();
      
      // Handle browser autoplay policies - resume context on user interaction
      if (this.state.context.state === 'suspended') {
        await this.state.context.resume();
      }

      this.state.isInitialized = true;
      console.log('Audio service initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  /**
   * Resume audio context (required after user interaction due to browser policies)
   */
  async resume(): Promise<void> {
    if (this.state.context && this.state.context.state === 'suspended') {
      try {
        await this.state.context.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }
  }

  /**
   * Set audio enabled state
   */
  setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
    if (enabled && !this.state.isInitialized) {
      this.initialize();
    }
  }

  /**
   * Set volume (0-100)
   */
  setVolume(volume: number): void {
    this.state.volume = Math.max(0, Math.min(100, volume)) / 100;
  }

  /**
   * Generate a synthesized tone using Web Audio API
   * Used for sound effects when audio files are not available
   */
  private generateTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ): void {
    if (!this.state.enabled || !this.state.context) return;

    try {
      const context = this.state.context;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);

      // Apply volume settings
      const adjustedVolume = this.state.volume * volume;
      gainNode.gain.setValueAtTime(adjustedVolume, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      console.warn('Error generating tone:', error);
    }
  }

  /**
   * Play a sound effect
   * Ensures effects don't exceed 500ms as per requirements
   */
  async playSound(soundName: SoundEffect): Promise<void> {
    if (!this.state.enabled) return;

    // Ensure audio context is initialized and resumed
    if (!this.state.isInitialized) {
      await this.initialize();
    }
    await this.resume();

    // Check if we have a loaded buffer for this sound
    const buffer = this.state.buffers.get(soundName);
    if (buffer && this.state.context) {
      this.playBuffer(buffer);
      return;
    }

    // Fallback to synthesized sounds
    this.playSynthesizedSound(soundName);
  }

  /**
   * Play an audio buffer
   */
  private playBuffer(buffer: AudioBuffer): void {
    if (!this.state.context) return;

    try {
      const source = this.state.context.createBufferSource();
      const gainNode = this.state.context.createGain();

      source.buffer = buffer;
      gainNode.gain.value = this.state.volume;

      source.connect(gainNode);
      gainNode.connect(this.state.context.destination);

      source.start(0);
    } catch (error) {
      console.warn('Error playing audio buffer:', error);
    }
  }

  /**
   * Play synthesized sound effects
   * Fallback when audio files are not available
   */
  private playSynthesizedSound(soundName: SoundEffect): void {
    switch (soundName) {
      case 'ghost-appear':
        // Ethereal ascending tone
        this.generateTone(220, 0.3, 'sine', 0.25);
        setTimeout(() => this.generateTone(330, 0.2, 'sine', 0.2), 100);
        break;

      case 'ghost-disappear':
        // Descending fading tone
        this.generateTone(330, 0.25, 'sine', 0.2);
        setTimeout(() => this.generateTone(220, 0.25, 'sine', 0.15), 80);
        break;

      case 'suggestion-accept':
        // Pleasant confirmation tone
        this.generateTone(440, 0.15, 'sine', 0.3);
        setTimeout(() => this.generateTone(554, 0.15, 'sine', 0.25), 80);
        break;

      case 'page-turn':
        // Rustling paper sound simulation
        this.generateTone(150, 0.2, 'sawtooth', 0.15);
        setTimeout(() => this.generateTone(180, 0.15, 'sawtooth', 0.12), 100);
        setTimeout(() => this.generateTone(120, 0.1, 'sawtooth', 0.1), 200);
        break;

      case 'tombstone-rise':
        // Deep rumbling rise
        this.generateTone(80, 0.4, 'sawtooth', 0.2);
        setTimeout(() => this.generateTone(100, 0.3, 'sawtooth', 0.15), 150);
        break;

      case 'tombstone-sink':
        // Descending rumble
        this.generateTone(100, 0.35, 'sawtooth', 0.18);
        setTimeout(() => this.generateTone(70, 0.3, 'sawtooth', 0.12), 120);
        break;

      case 'ui-click':
        // Short click sound
        this.generateTone(800, 0.05, 'square', 0.2);
        break;

      case 'ui-hover':
        // Subtle hover sound
        this.generateTone(600, 0.08, 'sine', 0.15);
        break;

      default:
        console.warn(`Unknown sound effect: ${soundName}`);
    }
  }

  /**
   * Load an audio file and store in buffer
   * For future enhancement when audio files are added
   */
  async loadSound(soundName: SoundEffect, url: string): Promise<void> {
    if (!this.state.context) {
      await this.initialize();
    }

    if (!this.state.context) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.state.context.decodeAudioData(arrayBuffer);
      this.state.buffers.set(soundName, audioBuffer);
    } catch (error) {
      console.warn(`Failed to load sound ${soundName}:`, error);
    }
  }

  /**
   * Pause all audio (for future ambient sound support)
   */
  pause(): void {
    // Future implementation for ambient sounds
  }

  /**
   * Clean up audio resources
   */
  cleanup(): void {
    if (this.state.context && this.state.context.state !== 'closed') {
      this.state.context.close();
    }
    this.state.buffers.clear();
    this.state.isInitialized = false;
  }
}

// Export singleton instance
export const audioService = new AudioService();
