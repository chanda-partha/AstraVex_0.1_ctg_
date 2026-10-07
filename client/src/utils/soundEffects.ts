// Studio-Grade Aerospace Audio Engine for NASA Mission Explorer
// Uses authentic 16-bit PCM WAV audio assets with intelligent throttling and soft envelopes

class NasaSoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private lastPlayTimes: Map<string, number> = new Map();
  private isLoaded: boolean = false;

  private soundUrls: Record<string, string> = {
    click: '/sounds/ui_click.wav',
    chime: '/sounds/telemetry_chime.wav',
    quindar: '/sounds/quindar_beep.wav',
    thrust: '/sounds/rocket_thrust.wav',
    success: '/sounds/mission_success.wav',
    alert: '/sounds/telemetry_alert.wav',
  };

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nasa_audio_muted');
      if (saved !== null) {
        this.muted = saved === 'true';
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.preloadSounds();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private async preloadSounds() {
    if (!this.ctx || this.isLoaded) return;
    this.isLoaded = true;

    for (const [key, url] of Object.entries(this.soundUrls)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        if (this.ctx) {
          const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
          this.audioBuffers.set(key, audioBuffer);
        }
      } catch (e) {
        // Fallback or silent fail
      }
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('nasa_audio_muted', String(this.muted));
    }
    if (!this.muted) {
      this.playChirp();
    }
    return this.muted;
  }

  private playSound(key: string, gainValue = 0.35, throttleMs = 90) {
    if (this.muted) return;

    // Rate limiting: Prevent loud overlapping or machine-gun sound spam
    const now = performance.now();
    const last = this.lastPlayTimes.get(key) || 0;
    if (now - last < throttleMs) {
      return;
    }
    this.lastPlayTimes.set(key, now);

    const ctx = this.initContext();
    if (!ctx) return;

    const buffer = this.audioBuffers.get(key);
    if (buffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(gainValue, ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start();
      } catch (_) {}
    } else {
      // HTMLAudioElement Fallback
      try {
        const url = this.soundUrls[key];
        if (url) {
          const audio = new Audio(url);
          audio.volume = Math.max(0, Math.min(1, gainValue));
          audio.play().catch(() => {});
        }
      } catch (_) {}
    }
  }

  // Tactile button click (soft damped Apple/Tesla-style haptic tap)
  public playClick() {
    this.playSound('click', 0.28, 110);
  }

  // Telemetry chime / Quindar radio ping
  public playChirp() {
    this.playSound('chime', 0.22, 250);
  }

  // Quindar historic roger tone
  public playQuindar() {
    this.playSound('quindar', 0.18, 300);
  }

  // Heavy rocket thruster burn
  public playThrust(_duration = 2.5) {
    this.playSound('thrust', 0.40, 600);
  }

  // Non-jarring telemetry warning
  public playWarning() {
    this.playSound('alert', 0.25, 400);
  }

  // Mission success chord chime
  public playSuccess() {
    this.playSound('success', 0.30, 400);
  }

  // Countdown beep: Silent during ticks to avoid annoyance; soft ping on liftoff (T-0)
  public playCountdownBeep(isZero = false) {
    if (!isZero) {
      // Intentionally silent during counting down to eliminate annoying beeps!
      return;
    }
    this.playSound('quindar', 0.25, 200);
  }

  // Thunderous multi-stage rocket ignition roar
  public playIgnitionRoar() {
    this.playSound('thrust', 0.45, 1000);
  }

  // Interplanetary warp transition
  public playWarpTone() {
    this.playSound('chime', 0.25, 500);
  }
}

export const soundFx = new NasaSoundEngine();
