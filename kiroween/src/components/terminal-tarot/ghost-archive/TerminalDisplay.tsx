/**
 * Terminal Display Component
 * Shows terminal output with enhanced UX features
 */

import React, { useEffect, useRef, memo, useState } from 'react';
import type { TerminalOutput } from '../../../types/ghostArchive';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useGhostArchive } from '../../../contexts/GhostArchiveContext';
import styles from './TerminalDisplay.module.css';

interface TerminalDisplayProps {
  outputs: TerminalOutput[];
  theme?: {
    backgroundColor: string;
    textColor: string;
    glowColor: string;
  };
}

const LONG_MESSAGE_THRESHOLD = 500; // Characters

export const TerminalDisplay: React.FC<TerminalDisplayProps> = memo(({ outputs, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const lastOutputCount = useRef(outputs.length);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [showVoiceControls, setShowVoiceControls] = useState(false);
  const lastSpokenOutputId = useRef<string | null>(null);

  // Voice settings persisted in localStorage
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage<boolean>('ghost-archive-voice-enabled', true);
  const [voiceRate, setVoiceRate] = useLocalStorage<number>('ghost-archive-voice-rate', 1.0);
  const [voicePitch, setVoicePitch] = useLocalStorage<number>('ghost-archive-voice-pitch', 1.0);
  const [voiceVolume, setVoiceVolume] = useLocalStorage<number>('ghost-archive-voice-volume', 0.8);
  const [voiceStability, setVoiceStability] = useLocalStorage<number>('ghost-archive-voice-stability', 0.5);
  const [voiceSimilarityBoost, setVoiceSimilarityBoost] = useLocalStorage<number>('ghost-archive-voice-similarity', 0.75);
  const [voiceStyle, setVoiceStyle] = useLocalStorage<number>('ghost-archive-voice-style', 0.0);
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Get connected agent to determine voice
  const { connectedAgent, getPersonality } = useGhostArchive();

  // Initialize TTS hook
  const {
    isEnabled,
    isSpeaking,
    provider,
    availableVoices,
    currentVoice,
    elevenLabsVoices,
    currentElevenLabsVoice,
    elevenLabsApiKey,
    elevenLabsConfigured,
    speak,
    stop,
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
    isSupported,
  } = useTextToSpeech({
    enabled: voiceEnabled,
    rate: voiceRate,
    pitch: voicePitch,
    volume: voiceVolume,
    stability: voiceStability,
    similarity_boost: voiceSimilarityBoost,
    style: voiceStyle,
  });

  // Sync TTS settings with localStorage
  useEffect(() => {
    if (isEnabled !== voiceEnabled) {
      setVoiceEnabled(isEnabled);
    }
  }, [isEnabled, voiceEnabled, setVoiceEnabled]);

  // Load API key from localStorage on mount
  useEffect(() => {
    if (elevenLabsApiKey) {
      setApiKeyInput(elevenLabsApiKey);
    }
  }, [elevenLabsApiKey]);

  // Auto-speak new agent responses
  useEffect(() => {
    if (!isEnabled || !isSupported) return;

    // Find the latest agent response that hasn't been spoken
    const latestAgentOutput = outputs
      .filter(output => output.type === 'agent' && output.agentName)
      .slice(-1)[0];

    if (
      latestAgentOutput &&
      latestAgentOutput.id !== lastSpokenOutputId.current &&
      latestAgentOutput.content.trim()
    ) {
      lastSpokenOutputId.current = latestAgentOutput.id;
      
      // Small delay to let the text render first
      setTimeout(() => {
        speak(latestAgentOutput.content, {
          rate: voiceRate,
          pitch: voicePitch,
          volume: voiceVolume,
          stability: voiceStability,
          similarity_boost: voiceSimilarityBoost,
          style: voiceStyle,
        }).catch(err => {
          console.error('Failed to speak:', err);
        });
      }, 300);
    }
  }, [outputs, isEnabled, isSupported, speak, voiceRate, voicePitch, voiceVolume]);

  // Check scroll position to show/hide scroll button
  const handleScroll = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // On initial mount with existing history, scroll to bottom
  useEffect(() => {
    if (containerRef.current && isInitialMount.current && outputs.length > 0) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
        isInitialMount.current = false;
      }, 100);
    }
  }, []);

  // Smooth auto-scroll to bottom on new output
  useEffect(() => {
    if (containerRef.current && !isInitialMount.current) {
      const container = containerRef.current;
      const hasNewOutput = outputs.length > lastOutputCount.current;
      
      if (hasNewOutput) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          if (containerRef.current) {
            const targetScroll = containerRef.current.scrollHeight;
            const currentScroll = containerRef.current.scrollTop;
            const distance = targetScroll - currentScroll;
            
            // Only scroll if there's significant new content
            if (distance > 10) {
              // Smooth scroll animation
              const duration = Math.min(500, distance * 0.5); // Max 500ms, scales with distance
              const startTime = performance.now();
              const startScroll = containerRef.current.scrollTop;
              
              const animateScroll = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-out function for smooth deceleration
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                if (containerRef.current) {
                  containerRef.current.scrollTop = startScroll + (distance * easeOut);
                }
                
                if (progress < 1) {
                  requestAnimationFrame(animateScroll);
                }
              };
              
              requestAnimationFrame(animateScroll);
            }
          }
        }, 50);
      }
      
      lastOutputCount.current = outputs.length;
    }
  }, [outputs]);

  const scrollToLatest = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const targetScroll = container.scrollHeight;
      const currentScroll = container.scrollTop;
      const distance = targetScroll - currentScroll;
      
      if (distance > 0) {
        const duration = Math.min(500, distance * 0.5);
        const startTime = performance.now();
        const startScroll = container.scrollTop;
        
        const animateScroll = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          
          if (containerRef.current) {
            containerRef.current.scrollTop = startScroll + (distance * easeOut);
          }
          
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          } else {
            setShowScrollButton(false);
          }
        };
        
        requestAnimationFrame(animateScroll);
      } else {
        setShowScrollButton(false);
      }
    }
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderMessage = (output: TerminalOutput) => {
    const isUser = output.type === 'command';
    const isAgent = output.type === 'agent';
    const isLongMessage = output.content.length > LONG_MESSAGE_THRESHOLD;
    const isExpanded = expandedMessages.has(output.id);
    const shouldTruncate = isLongMessage && !isExpanded;

    const displayContent = shouldTruncate 
      ? output.content.substring(0, LONG_MESSAGE_THRESHOLD) + '...'
      : output.content;

    const handleSpeakMessage = () => {
      if (isEnabled && output.content.trim()) {
        // Get the agent's voice ID if available
        const personality = connectedAgent ? getPersonality(connectedAgent) : null;
        const agentVoiceId = personality?.elevenLabsVoiceId;
        
        speak(output.content, {
          rate: voiceRate,
          pitch: voicePitch,
          volume: voiceVolume,
          stability: voiceStability,
          similarity_boost: voiceSimilarityBoost,
          style: voiceStyle,
          elevenLabsVoiceId: agentVoiceId, // Use agent's voice if available
        }).catch(err => {
          console.error('Failed to speak:', err);
        });
      }
    };

    return (
      <div 
        key={output.id}
        className={`${styles.messageBlock} ${isUser ? styles.userMessage : isAgent ? styles.agentMessage : styles.systemMessage}`}
        onClick={!isUser && isEnabled ? handleSpeakMessage : undefined}
        style={!isUser && isEnabled ? { cursor: 'pointer' } : undefined}
        title={!isUser && isEnabled ? 'Click to read aloud' : undefined}
      >
        <div className={styles.messageHeader}>
          {isUser && (
            <span className={styles.messagePrefix}>▸ You</span>
          )}
          {isAgent && output.agentName && (
            <span className={styles.messagePrefix} style={{ color: theme?.glowColor }}>
              ☾ {output.agentName}
            </span>
          )}
          {!isUser && !isAgent && (
            <span className={styles.messagePrefix}>⚙ System</span>
          )}
          <span className={styles.messageTime} title={new Date(output.timestamp).toLocaleString()}>
            {formatTimestamp(output.timestamp)}
          </span>
        </div>
        
        <div className={styles.messageContent}>
          <pre className={styles.messageText}>{displayContent}</pre>
          
          {isLongMessage && (
            <button
              className={styles.expandButton}
              onClick={() => toggleMessageExpansion(output.id)}
            >
              {isExpanded ? '▲ Show less' : '▼ Show more'}
            </button>
          )}
        </div>

        {output.reasoning && output.reasoning.length > 0 && (
          <details className={styles.reasoningDetails}>
            <summary className={styles.reasoningSummary}>
              🧠 Reasoning Process ({output.reasoning.length} steps)
            </summary>
            <div className={styles.reasoningSteps}>
              {output.reasoning.map((step, idx) => (
                <div key={idx} className={styles.reasoningStep}>
                  <span className={styles.stepNumber}>Step {step.step}:</span>
                  <span className={styles.stepThought}>{step.thought}</span>
                  {step.alternatives && step.alternatives.length > 0 && (
                    <div className={styles.alternatives}>
                      {step.alternatives.map((alt, altIdx) => (
                        <div key={altIdx} className={styles.alternative}>• {alt}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  };

  const handleVoiceToggle = () => {
    toggle();
    setVoiceEnabled(!isEnabled);
  };

  const handleVoiceStop = () => {
    stop();
  };

  return (
    <div className={styles.terminalDisplayWrapper}>
      {/* Voice Controls */}
      {isSupported && (
        <div className={styles.voiceControls}>
          <button
            className={`${styles.voiceButton} ${isEnabled ? styles.voiceButtonActive : ''}`}
            onClick={handleVoiceToggle}
            title={isEnabled ? 'Disable voice' : 'Enable voice'}
            style={{
              color: theme?.textColor || '#00ff00',
              borderColor: theme?.glowColor || '#00ff88',
            }}
          >
            {isSpeaking ? '🔊' : isEnabled ? '🔇' : '🔈'}
          </button>
          
          {isSpeaking && (
            <button
              className={styles.voiceStopButton}
              onClick={handleVoiceStop}
              title="Stop speaking"
              style={{
                color: theme?.textColor || '#00ff00',
                borderColor: theme?.glowColor || '#00ff88',
              }}
            >
              ⏹
            </button>
          )}

          <button
            className={styles.voiceSettingsButton}
            onClick={() => setShowVoiceControls(!showVoiceControls)}
            title="Voice settings"
            style={{
              color: theme?.textColor || '#00ff00',
              borderColor: theme?.glowColor || '#00ff88',
            }}
          >
            ⚙️
          </button>

          {showVoiceControls && (
            <div
              className={styles.voiceSettingsPanel}
              style={{
                backgroundColor: theme?.backgroundColor || '#0a2e0a',
                borderColor: theme?.glowColor || '#00ff88',
              }}
            >
              <div className={styles.voiceSettingsHeader}>
                <h4 style={{ color: theme?.glowColor || '#00ff88' }}>Voice Settings</h4>
                <button
                  className={styles.voiceSettingsClose}
                  onClick={() => setShowVoiceControls(false)}
                >
                  ×
                </button>
              </div>

              {/* Provider Selection */}
              <div className={styles.voiceSetting}>
                <label>Provider</label>
                <select
                  value={provider}
                  onChange={(e) => {
                    const newProvider = e.target.value as 'elevenlabs' | 'browser';
                    setProvider(newProvider);
                  }}
                  style={{
                    backgroundColor: theme?.backgroundColor || '#0a2e0a',
                    color: theme?.textColor || '#00ff00',
                    borderColor: theme?.glowColor || '#00ff88',
                  }}
                >
                  <option value="elevenlabs">🎙️ ElevenLabs AI (High Quality)</option>
                  <option value="browser">🔊 Browser TTS (Fallback)</option>
                </select>
                {provider === 'elevenlabs' && !elevenLabsConfigured && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.8, color: '#ffaa00' }}>
                    ⚠️ API key required
                  </div>
                )}
              </div>

              {/* ElevenLabs API Key */}
              {provider === 'elevenlabs' && (
                <>
                  <div className={styles.voiceSetting}>
                    <label>ElevenLabs API Key</label>
                    {import.meta.env.VITE_ELEVENLABS_API_KEY ? (
                      <div style={{ 
                        padding: '0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        border: `1px solid ${theme?.glowColor || '#00ff88'}`,
                        fontSize: '0.85rem',
                        color: theme?.textColor || '#00ff00',
                      }}>
                        ✅ API key loaded from environment variable
                        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.7 }}>
                          Configured via VITE_ELEVENLABS_API_KEY in .env file
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          type="password"
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          placeholder={elevenLabsApiKey ? '••••••••' : 'Enter API key or set VITE_ELEVENLABS_API_KEY in .env'}
                          style={{
                            backgroundColor: theme?.backgroundColor || '#0a2e0a',
                            color: theme?.textColor || '#00ff00',
                            borderColor: theme?.glowColor || '#00ff88',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            width: '100%',
                            fontSize: '0.9rem',
                          }}
                        />
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              if (apiKeyInput.trim()) {
                                setElevenLabsApiKey(apiKeyInput.trim());
                              }
                            }}
                            style={{
                              backgroundColor: theme?.glowColor || '#00ff88',
                              color: theme?.backgroundColor || '#0a2e0a',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {elevenLabsConfigured ? 'Update' : 'Save'}
                          </button>
                          {elevenLabsConfigured && (
                            <button
                              onClick={() => {
                                setElevenLabsApiKey('');
                                setApiKeyInput('');
                              }}
                              style={{
                                backgroundColor: 'transparent',
                                color: theme?.textColor || '#00ff00',
                                border: `1px solid ${theme?.glowColor || '#00ff88'}`,
                                padding: '0.4rem 0.8rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                              }}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>
                          Get your API key from{' '}
                          <a
                            href="https://elevenlabs.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: theme?.glowColor || '#00ff88' }}
                          >
                            elevenlabs.io
                          </a>
                          {' '}or add <code style={{ fontSize: '0.7rem', opacity: 0.8 }}>VITE_ELEVENLABS_API_KEY=your_key</code> to your .env file
                        </div>
                      </>
                    )}
                  </div>

                  {/* ElevenLabs Voice Selection */}
                  {elevenLabsConfigured && elevenLabsVoices.length > 0 && (
                    <div className={styles.voiceSetting}>
                      <label>ElevenLabs Voice</label>
                      <select
                        value={currentElevenLabsVoice?.voice_id || ''}
                        onChange={(e) => {
                          const voice = elevenLabsVoices.find(v => v.voice_id === e.target.value) || null;
                          setElevenLabsVoice(voice);
                        }}
                        style={{
                          backgroundColor: theme?.backgroundColor || '#0a2e0a',
                          color: theme?.textColor || '#00ff00',
                          borderColor: theme?.glowColor || '#00ff88',
                        }}
                      >
                        {elevenLabsVoices.map(voice => (
                          <option key={voice.voice_id} value={voice.voice_id}>
                            {voice.name} {voice.category ? `(${voice.category})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* ElevenLabs Settings */}
                  {elevenLabsConfigured && (
                    <>
                      <div className={styles.voiceSetting}>
                        <label>Stability: {voiceStability.toFixed(2)}</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={voiceStability}
                          onChange={(e) => {
                            const stability = parseFloat(e.target.value);
                            setVoiceStability(stability);
                            setStability(stability);
                          }}
                        />
                      </div>

                      <div className={styles.voiceSetting}>
                        <label>Similarity Boost: {voiceSimilarityBoost.toFixed(2)}</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={voiceSimilarityBoost}
                          onChange={(e) => {
                            const boost = parseFloat(e.target.value);
                            setVoiceSimilarityBoost(boost);
                            setSimilarityBoost(boost);
                          }}
                        />
                      </div>

                      <div className={styles.voiceSetting}>
                        <label>Style: {voiceStyle.toFixed(2)}</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={voiceStyle}
                          onChange={(e) => {
                            const style = parseFloat(e.target.value);
                            setVoiceStyle(style);
                            setStyle(style);
                          }}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Browser TTS Settings */}
              {provider === 'browser' && (
                <>
                  <div className={styles.voiceSetting}>
                    <label>Voice</label>
                    <select
                      value={currentVoice?.name || ''}
                      onChange={(e) => {
                        const voice = availableVoices.find(v => v.name === e.target.value) || null;
                        setVoice(voice);
                      }}
                      style={{
                        backgroundColor: theme?.backgroundColor || '#0a2e0a',
                        color: theme?.textColor || '#00ff00',
                        borderColor: theme?.glowColor || '#00ff88',
                      }}
                    >
                      {availableVoices
                        .filter(v => v.lang.startsWith('en'))
                        .map(voice => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className={styles.voiceSetting}>
                    <label>Speed: {voiceRate.toFixed(1)}x</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceRate}
                      onChange={(e) => {
                        const rate = parseFloat(e.target.value);
                        setVoiceRate(rate);
                        setRate(rate);
                      }}
                    />
                  </div>

                  <div className={styles.voiceSetting}>
                    <label>Pitch: {voicePitch.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voicePitch}
                      onChange={(e) => {
                        const pitch = parseFloat(e.target.value);
                        setVoicePitch(pitch);
                        setPitch(pitch);
                      }}
                    />
                  </div>
                </>
              )}

              {/* Common Settings */}
              <div className={styles.voiceSetting}>
                <label>Volume: {Math.round(voiceVolume * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceVolume}
                  onChange={(e) => {
                    const volume = parseFloat(e.target.value);
                    setVoiceVolume(volume);
                    setVolume(volume);
                  }}
                />
              </div>

              <button
                className={styles.voiceTestButton}
                onClick={() => {
                  const testText = 'Hello, I am the voice of the Ghost Archive. How may I assist you?';
                  speak(testText, {
                    rate: voiceRate,
                    pitch: voicePitch,
                    volume: voiceVolume,
                    stability: voiceStability,
                    similarity_boost: voiceSimilarityBoost,
                    style: voiceStyle,
                  }).catch(err => {
                    console.error('Test failed:', err);
                  });
                }}
                disabled={provider === 'elevenlabs' && !elevenLabsConfigured}
                style={{
                  backgroundColor: theme?.glowColor || '#00ff88',
                  color: theme?.backgroundColor || '#0a2e0a',
                  opacity: provider === 'elevenlabs' && !elevenLabsConfigured ? 0.5 : 1,
                }}
              >
                Test Voice
              </button>
            </div>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className={styles.terminalDisplay}
        onScroll={handleScroll}
        style={{
          backgroundColor: theme?.backgroundColor || '#0a2e0a',
          color: theme?.textColor || '#00ff00',
        }}
      >
        {outputs.length === 0 && (
          <div className={styles.welcomeMessage}>
            <div className={styles.welcomeTitle}>✨ Ghost Archive Terminal</div>
            <div className={styles.welcomeText}>
              Connecting to the digital realm of historical personalities...
            </div>
            <div className={styles.welcomeHint}>
              💡 Type 'help' to see available commands
            </div>
          </div>
        )}
        
        {outputs.map((output) => renderMessage(output))}
      </div>
      
      {showScrollButton && (
        <button
          className={styles.scrollToLatest}
          onClick={scrollToLatest}
          title="Scroll to latest message"
          style={{
            backgroundColor: theme?.backgroundColor || '#0a2e0a',
            color: theme?.textColor || '#00ff00',
            borderColor: theme?.glowColor || '#00ff88',
          }}
        >
          ↓ Scroll to latest
        </button>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.outputs.length === nextProps.outputs.length &&
    prevProps.outputs.every((output, idx) => output.id === nextProps.outputs[idx]?.id) &&
    prevProps.theme?.textColor === nextProps.theme?.textColor &&
    prevProps.theme?.glowColor === nextProps.theme?.glowColor &&
    prevProps.theme?.backgroundColor === nextProps.theme?.backgroundColor
  );
});

TerminalDisplay.displayName = 'TerminalDisplay';

