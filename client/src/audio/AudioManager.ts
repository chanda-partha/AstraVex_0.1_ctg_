/**
 * Studio-Grade Cinematic Audio Manager for ASTRAVEX
 * 
 * Features:
 * - Interstellar-inspired Atmospheric Background Music Engine
 * - Smooth Audio Ducking when ELON speaks (gradual volume fade down / restore)
 * - Autonomous User Interaction detection to unlock browser autoplay policies
 * - Independent Music and Voice Volume & Mute Controls
 * - Single-instance enforcement (prevents duplicate playback)
 * - Persistent preferences via localStorage
 */

export interface AudioState {
  isMusicMuted: boolean;
  musicVolume: number;
  isVoiceMuted: boolean;
  voiceVolume: number;
  isPlayingMusic: boolean;
  isDucked: boolean;
}

type AudioStateListener = (state: AudioState) => void;

class CinematicAudioManager {
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private proceduralOscillators: OscillatorNode[] = [];
  private proceduralGain: GainNode | null = null;
  private usingProceduralFallback: boolean = false;

  private isMusicMuted: boolean = false;
  private musicVolume: number = 0.35; // Default ambient volume (subtle, atmospheric)
  private isVoiceMuted: boolean = false;
  private voiceVolume: number = 1.0;

  private isDucked: boolean = false;
  private currentVolume: number = 0;
  private fadeInterval: any = null;
  private listeners: Set<AudioStateListener> = new Set();
  private hasInteracted: boolean = false;
  private isInitialized: boolean = false;

  // Music assets in order of preference
  private musicSources: string[] = [
    '/sounds/astravex_cinematic_music.wav',
    '/sounds/astravex_cinematic_music.mp3',
    '/sounds/interstellar_ambient.mp3'
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      // Load saved preferences
      const savedMusicMuted = localStorage.getItem('astravex_music_muted');
      const savedMusicVol = localStorage.getItem('astravex_music_vol');
      const savedVoiceMuted = localStorage.getItem('astravex_voice_muted');
      const savedVoiceVol = localStorage.getItem('astravex_voice_vol');

      if (savedMusicMuted !== null) this.isMusicMuted = savedMusicMuted === 'true';
      if (savedMusicVol !== null) this.musicVolume = parseFloat(savedMusicVol);
      if (savedVoiceMuted !== null) this.isVoiceMuted = savedVoiceMuted === 'true';
      if (savedVoiceVol !== null) this.voiceVolume = parseFloat(savedVoiceVol);

      this.setupAutoplayListener();
    }
  }

  /**
   * Listen for first user click / gesture to unlock browser audio autoplay
   */
  private setupAutoplayListener() {
    const unlockAutoplay = () => {
      if (this.hasInteracted) return;
      this.hasInteracted = true;
      this.initAudio();
      this.startBackgroundMusic();

      window.removeEventListener('pointerdown', unlockAutoplay);
      window.removeEventListener('keydown', unlockAutoplay);
      window.removeEventListener('click', unlockAutoplay);
    };

    window.addEventListener('pointerdown', unlockAutoplay, { once: true });
    window.addEventListener('keydown', unlockAutoplay, { once: true });
    window.addEventListener('click', unlockAutoplay, { once: true });
  }

  /**
   * Explicit user trigger to start audio (e.g. clicking "Engage ELON" or "Explore")
   */
  public handleUserGesture() {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
    }
    this.initAudio();
    this.startBackgroundMusic();
  }

  private initAudio() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    try {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.preload = 'auto';
      this.audioElement.volume = 0; // Starts at 0, smoothly fades in

      // Attempt to load music sources sequentially
      this.tryLoadSource(0);

      this.audioElement.addEventListener('error', () => {
        console.warn('[Audio Manager] Primary soundtrack file unavailable, engaging procedural ambient fallback');
        this.initProceduralAmbient();
      });
    } catch (e) {
      console.warn('[Audio Manager] Audio initialization notice:', e);
      this.initProceduralAmbient();
    }
  }

  private tryLoadSource(index: number) {
    if (!this.audioElement || index >= this.musicSources.length) {
      this.initProceduralAmbient();
      return;
    }

    const src = this.musicSources[index];
    this.audioElement.src = src;
    this.audioElement.load();
  }

  /**
   * Procedural Web Audio Ambient Space Synthesizer (Fallback if no audio file is accessible)
   * Produces grand atmospheric organ drone and slow-evolving space harmonics
   */
  private initProceduralAmbient() {
    if (this.usingProceduralFallback || typeof window === 'undefined') return;
    this.usingProceduralFallback = true;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();

      this.proceduralGain = this.audioContext.createGain();
      this.proceduralGain.gain.setValueAtTime(0, this.audioContext.currentTime);

      // Low-pass filter for deep space warmth
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.audioContext.currentTime);

      this.proceduralGain.connect(filter);
      filter.connect(this.audioContext.destination);

      // Ambient organ frequencies (Am7 chord: A1, E2, A2, C3, G3)
      const frequencies = [55.0, 82.41, 110.0, 130.81, 196.0];
      frequencies.forEach((freq, idx) => {
        if (!this.audioContext || !this.proceduralGain) return;
        const osc = this.audioContext.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

        const oscGain = this.audioContext.createGain();
        oscGain.gain.setValueAtTime(0.15 / frequencies.length, this.audioContext.currentTime);

        osc.connect(oscGain);
        oscGain.connect(this.proceduralGain);
        osc.start();
        this.proceduralOscillators.push(osc);
      });
    } catch (e) {
      console.warn('[Audio Manager] Procedural fallback notice:', e);
    }
  }

  /**
   * Start or resume background music with smooth fade-in
   */
  public startBackgroundMusic() {
    if (this.isMusicMuted) {
      this.notifyListeners();
      return;
    }

    if (this.audioElement && this.audioElement.src) {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.fadeToVolume(this.calculateTargetVolume(), 1800);
            this.notifyListeners();
          })
          .catch(() => {
            // Browser autoplay restrictions handled on next click
          });
      }
    } else if (this.audioContext && this.proceduralGain) {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      this.fadeToVolume(this.calculateTargetVolume(), 1800);
      this.notifyListeners();
    }
  }

  /**
   * Audio Ducking: smooth volume reduction when ELON speaks
   */
  public setDucking(active: boolean) {
    if (this.isDucked === active) return;
    this.isDucked = active;
    
    // Smooth transition: 350ms duck down, 800ms restore up
    const duration = active ? 350 : 800;
    this.fadeToVolume(this.calculateTargetVolume(), duration);
    this.notifyListeners();
  }

  private calculateTargetVolume(): number {
    if (this.isMusicMuted) return 0;
    if (this.isDucked) {
      // Duck down to 22% of normal volume so ELON is crystal clear
      return this.musicVolume * 0.22;
    }
    return this.musicVolume;
  }

  /**
   * Smooth volume interpolation (avoids pops/clicks)
   */
  private fadeToVolume(targetVol: number, durationMs: number = 500) {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    const startVol = this.currentVolume;
    const startTime = performance.now();

    this.fadeInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth cosine easing
      const easedProgress = 0.5 * (1 - Math.cos(Math.PI * progress));
      this.currentVolume = startVol + (targetVol - startVol) * easedProgress;

      if (this.audioElement) {
        this.audioElement.volume = Math.max(0, Math.min(1, this.currentVolume));
      }
      if (this.proceduralGain && this.audioContext) {
        this.proceduralGain.gain.setValueAtTime(
          Math.max(0, Math.min(1, this.currentVolume)),
          this.audioContext.currentTime
        );
      }

      if (progress >= 1) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
    }, 25);
  }

  // --- CONTROLS API ---

  public toggleMusic(): boolean {
    this.isMusicMuted = !this.isMusicMuted;
    localStorage.setItem('astravex_music_muted', String(this.isMusicMuted));

    if (this.isMusicMuted) {
      this.fadeToVolume(0, 400);
    } else {
      this.startBackgroundMusic();
      this.fadeToVolume(this.calculateTargetVolume(), 800);
    }

    this.notifyListeners();
    return !this.isMusicMuted;
  }

  public setMusicVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.musicVolume = clamped;
    localStorage.setItem('astravex_music_vol', String(clamped));

    if (!this.isMusicMuted) {
      this.fadeToVolume(this.calculateTargetVolume(), 150);
    }
    this.notifyListeners();
  }

  public toggleVoice(): boolean {
    this.isVoiceMuted = !this.isVoiceMuted;
    localStorage.setItem('astravex_voice_muted', String(this.isVoiceMuted));
    this.notifyListeners();
    return !this.isVoiceMuted;
  }

  public setVoiceVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.voiceVolume = clamped;
    localStorage.setItem('astravex_voice_vol', String(clamped));
    this.notifyListeners();
  }

  public getState(): AudioState {
    return {
      isMusicMuted: this.isMusicMuted,
      musicVolume: this.musicVolume,
      isVoiceMuted: this.isVoiceMuted,
      voiceVolume: this.voiceVolume,
      isPlayingMusic: !this.isMusicMuted && this.currentVolume > 0.01,
      isDucked: this.isDucked,
    };
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (_) {}
    });
  }
}

export const audioManager = new CinematicAudioManager();

