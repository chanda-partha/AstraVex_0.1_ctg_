/**
 * ELON AI Voice Engine
 * 
 * Provides cinematic text-to-speech synthesized through the Web Speech API.
 * Features:
 * - Intelligent voice selection for deep, resonant spacecraft AI timbre
 * - Cinematic pacing and natural articulation (pitch 0.88, rate 0.93)
 * - Automatic background audio ducking synchronization with AudioManager
 * - Boundary events for synchronized subtitle delivery
 * - Resilient text-only fallback if speech synthesis is disabled/blocked
 */

import { audioManager } from '../audio/AudioManager';

export interface VoiceCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onBoundary?: (charIndex: number, charLength?: number) => void;
  onError?: (error: any) => void;
}

class ElonVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private isSpeakingState: boolean = false;
  private isLoaded: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  /**
   * Intelligently selects the best deep, natural English voice for spacecraft AI
   */
  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    this.isLoaded = true;

    // Preferred cinematic voices in priority order:
    // 1. Natural / Journey / Studio deep English voices
    // 2. Microsoft David (Classic deep authoritative sci-fi AI tone)
    // 3. Google US English
    // 4. Daniel (British refined intelligence)
    // 5. Any en-US male voice
    const preferredNames = [
      'Microsoft David',
      'Google US English',
      'Daniel',
      'Alex',
      'Microsoft Mark',
      'Oliver',
      'Fred'
    ];

    for (const name of preferredNames) {
      const found = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
      if (found) {
        this.preferredVoice = found;
        return;
      }
    }

    // Fallback: Pick first English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      this.preferredVoice = englishVoice;
    }
  }

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  /**
   * Speak cinematic text with audio ducking and boundary sync
   */
  public speak(text: string, callbacks: VoiceCallbacks = {}): boolean {
    if (!this.synth) {
      // Graceful text-only fallback
      this.simulateSpeechTiming(text, callbacks);
      return false;
    }

    const state = audioManager.getState();
    if (state.isVoiceMuted) {
      // Voice is muted: run text-only timing
      this.simulateSpeechTiming(text, callbacks);
      return false;
    }

    // Stop any existing speech first
    this.stop();

    if (!this.preferredVoice) {
      this.loadVoices();
    }

    // Prepare speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }

    // Cinematic Spacecraft AI parameters
    utterance.pitch = 0.88; // Deep, confident, resonant frequency
    utterance.rate = 0.93;  // Calm, deliberate, cinematic pacing
    utterance.volume = state.voiceVolume;

    utterance.onstart = () => {
      this.isSpeakingState = true;
      audioManager.setDucking(true); // Duck background music smoothly
      callbacks.onStart?.();
    };

    utterance.onboundary = (event) => {
      callbacks.onBoundary?.(event.charIndex, (event as any).charLength || 0);
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.currentUtterance = null;
      audioManager.setDucking(false); // Restore background music
      callbacks.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeakingState = false;
      this.currentUtterance = null;
      audioManager.setDucking(false);
      callbacks.onError?.(e);
      callbacks.onEnd?.();
    };

    try {
      this.synth.speak(utterance);
      return true;
    } catch (err) {
      this.isSpeakingState = false;
      audioManager.setDucking(false);
      this.simulateSpeechTiming(text, callbacks);
      return false;
    }
  }

  /**
   * Stop speaking and restore background music immediately
   */
  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (_) {}
    }
    this.isSpeakingState = false;
    this.currentUtterance = null;
    audioManager.setDucking(false);
  }

  /**
   * Text-only timing simulation if voice is muted or unavailable
   */
  private simulateSpeechTiming(text: string, callbacks: VoiceCallbacks) {
    callbacks.onStart?.();
    const words = text.split(/\s+/).length;
    // Average reading rate: ~150 words per minute -> ~400ms per word
    const durationMs = Math.max(2000, words * 380);
    setTimeout(() => {
      callbacks.onEnd?.();
    }, durationMs);
  }
}

export const elonVoice = new ElonVoiceEngine();

