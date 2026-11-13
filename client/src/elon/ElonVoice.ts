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
  onPause?: () => void;
  onResume?: () => void;
  onBoundary?: (charIndex: number, charLength?: number) => void;
  onError?: (error: any) => void;
}

export interface VoiceOptions {
  pitch?: number;
  rate?: number;
  volumeScale?: number;
  ignoreVoiceMute?: boolean;
}

class ElonVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private isSpeakingState: boolean = false;
  private isPausedState: boolean = false;
  private isLoaded: boolean = false;
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;
  private simTimer: ReturnType<typeof setTimeout> | null = null;
  private speakEpoch: number = 0;

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

  public isVoicesLoaded(): boolean {
    return this.isLoaded;
  }

  public getCurrentUtteranceText(): string | null {
    return this.currentUtterance ? this.currentUtterance.text : null;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }

  private clearTimers() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    if (this.simTimer) {
      clearTimeout(this.simTimer);
      this.simTimer = null;
    }
  }

  private startKeepAlive() {
    this.clearKeepAliveOnly();
    // Workaround for Chromium's ~14-second speechSynthesis auto-pause bug on long stories
    this.keepAliveTimer = setInterval(() => {
      if (!this.synth || !this.isSpeakingState || this.isPausedState) return;
      try {
        if (this.synth.speaking && !this.synth.paused) {
          this.synth.pause();
          this.synth.resume();
        }
      } catch (_) {}
    }, 10000);
  }

  private clearKeepAliveOnly() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  /**
   * Speak text with audio ducking and boundary sync
   */
  public speak(
    text: string,
    callbacks: VoiceCallbacks = {},
    options: VoiceOptions = {}
  ): boolean {
    if (!this.synth) {
      this.simulateSpeechTiming(text, callbacks);
      return false;
    }

    const state = audioManager.getState();
    if (state.isVoiceMuted && !options.ignoreVoiceMute) {
      this.simulateSpeechTiming(text, callbacks);
      return false;
    }

    this.stop();
    const myEpoch = this.speakEpoch;

    if (!this.preferredVoice) {
      this.loadVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }

    const volScale = options.volumeScale ?? 1.0;
    utterance.pitch = options.pitch ?? 0.88;
    utterance.rate = options.rate ?? 0.93;
    utterance.volume = Math.max(0, Math.min(1, state.voiceVolume * volScale));

    utterance.onstart = () => {
      if (myEpoch !== this.speakEpoch) return;
      this.isSpeakingState = true;
      this.isPausedState = false;
      audioManager.setDucking(true, 'tts');
      this.startKeepAlive();
      callbacks.onStart?.();
    };

    utterance.onboundary = (event) => {
      if (myEpoch !== this.speakEpoch) return;
      callbacks.onBoundary?.(event.charIndex, (event as any).charLength || 0);
    };

    utterance.onend = () => {
      if (myEpoch !== this.speakEpoch) return;
      this.clearTimers();
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      audioManager.setDucking(false, 'tts');
      callbacks.onEnd?.();
    };

    utterance.onerror = (e) => {
      if (myEpoch !== this.speakEpoch) return;
      this.clearTimers();
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      audioManager.setDucking(false, 'tts');
      callbacks.onError?.(e);
      callbacks.onEnd?.();
    };

    try {
      this.synth.speak(utterance);
      return true;
    } catch (err) {
      this.clearTimers();
      this.isSpeakingState = false;
      this.isPausedState = false;
      audioManager.setDucking(false, 'tts');
      this.simulateSpeechTiming(text, callbacks);
      return false;
    }
  }

  public pause() {
    if (!this.synth || !this.isSpeakingState || this.isPausedState) return;
    try {
      this.synth.pause();
      this.isPausedState = true;
      audioManager.setDucking(false, 'tts');
    } catch (_) {}
  }

  public resume() {
    if (!this.synth || !this.isPausedState) return;
    try {
      this.synth.resume();
      this.isPausedState = false;
      audioManager.setDucking(true, 'tts');
    } catch (_) {}
  }

  /**
   * Stop speaking and restore background music immediately
   */
  public stop() {
    this.speakEpoch += 1;
    this.clearTimers();
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (_) {}
    }
    this.isSpeakingState = false;
    this.isPausedState = false;
    this.currentUtterance = null;
    audioManager.setDucking(false, 'tts');
  }

  /**
   * Text-only timing simulation if voice is muted or unavailable
   */
  private simulateSpeechTiming(text: string, callbacks: VoiceCallbacks) {
    this.speakEpoch += 1;
    const myEpoch = this.speakEpoch;
    this.clearTimers();
    callbacks.onStart?.();
    const words = text.split(/\s+/).length;
    const durationMs = Math.max(2000, words * 380);
    this.simTimer = setTimeout(() => {
      if (myEpoch !== this.speakEpoch) return;
      this.simTimer = null;
      callbacks.onEnd?.();
    }, durationMs);
  }
}

export const elonVoice = new ElonVoiceEngine();

