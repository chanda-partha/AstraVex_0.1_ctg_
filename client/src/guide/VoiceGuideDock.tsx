import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, Sparkles, Square, Volume2, VolumeX } from 'lucide-react';
import { tourEngine, useTourState } from './tourEngine';
import { audioManager, AudioState } from '../audio/AudioManager';
import { soundFx } from '../utils/soundEffects';

export const VoiceGuideDock: React.FC = () => {
  const tour = useTourState();
  const [audioState, setAudioState] = useState<AudioState>(() => audioManager.getState());
  const [autoHidden, setAutoHidden] = useState(false);

  useEffect(() => {
    return audioManager.subscribe(setAudioState);
  }, []);

  // Reset auto-hide whenever track changes, restarts, pauses, or needs unlock
  useEffect(() => {
    setAutoHidden(false);
  }, [tour.currentTrackId, tour.isPlaying, tour.isPaused, tour.needsAutoplayUnlock]);

  // Auto-hide 2.2s after a narration clip finishes so the 3D HUD stays uncluttered
  useEffect(() => {
    if (tour.hasEnded && !tour.isPlaying && !tour.isPaused && !tour.needsAutoplayUnlock) {
      const timer = window.setTimeout(() => {
        setAutoHidden(true);
      }, 2200);
      return () => window.clearTimeout(timer);
    }
  }, [tour.hasEnded, tour.isPlaying, tour.isPaused, tour.needsAutoplayUnlock]);

  if (!tour.tourEnabled || audioState.isVoiceMuted || !tour.currentTrackId || autoHidden) {
    return null;
  }

  const showBar =
    tour.needsAutoplayUnlock ||
    tour.isPlaying ||
    tour.isPaused ||
    (tour.hasEnded && Boolean(tour.caption));

  if (!showBar) {
    return null;
  }

  const progressPct =
    tour.duration > 0 ? Math.min(100, Math.max(0, (tour.currentTime / tour.duration) * 100)) : 0;

  return (
    <div
      role="region"
      aria-label="Synchronized voice guide and captions"
      aria-live="polite"
      className="fixed top-[62px] left-0 right-0 z-30 flex justify-center px-3 pointer-events-none select-none"
    >
      <div className="pointer-events-auto relative max-w-lg w-full rounded-2xl sm:rounded-full hud-card hud-card-featured px-3.5 py-2 shadow-[0_14px_36px_rgba(0,0,0,0.85)] transition-all duration-200">
        <div className="flex items-center gap-2.5">
          {/* Voice Activity Indicator */}
          <div className="w-6 h-6 rounded-full hud-well flex items-center justify-center flex-shrink-0">
            {tour.isPlaying ? (
              <div className="flex items-center gap-0.5 h-3.5" aria-hidden="true">
                <span className="voice-eq-bar" style={{ animationDelay: '0s' }} />
                <span className="voice-eq-bar" style={{ animationDelay: '0.22s' }} />
                <span className="voice-eq-bar" style={{ animationDelay: '0.44s' }} />
              </div>
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            )}
          </div>

          {/* Status Pill / Enable Voice CTA + Live Caption */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {tour.needsAutoplayUnlock ? (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  tourEngine.resume();
                }}
                className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer animate-pulse"
              >
                <Sparkles className="w-3 h-3" />
                <span>ENABLE VOICE</span>
              </button>
            ) : (
              <span className="hidden sm:inline-block text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full hud-badge flex-shrink-0">
                {tour.stepLabel}
              </span>
            )}
            <p
              className="text-xs text-slate-100 font-sans truncate"
              title={tour.caption || tour.title}
            >
              {tour.caption || tour.title || 'Mission narration ready'}
            </p>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                tourEngine.togglePlayPause();
              }}
              className="w-7 h-7 rounded-full hud-well hover:border-[var(--accent-border)] text-slate-200 hover:text-white flex items-center justify-center transition-all duration-150 hover:scale-105 cursor-pointer"
              title={tour.isPlaying ? 'Pause narration' : 'Play narration'}
              aria-label={tour.isPlaying ? 'Pause narration' : 'Play narration'}
            >
              {tour.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                tourEngine.replay();
              }}
              className="w-7 h-7 rounded-full hud-well hover:border-[var(--accent-border)] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-150 hover:scale-105 cursor-pointer"
              title="Replay step narration"
              aria-label="Replay step narration"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                tourEngine.stopAudioOnly();
                setAutoHidden(true);
              }}
              className="w-7 h-7 rounded-full hud-well hover:border-white/25 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-150 hover:scale-105 cursor-pointer"
              title="Stop current clip (keeps guide active for next stage)"
              aria-label="Stop current narration clip"
            >
              <Square className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                tourEngine.dismissCurrent();
              }}
              className="w-7 h-7 rounded-full hud-well hover:border-rose-400/50 text-slate-400 hover:text-rose-200 flex items-center justify-center transition-all duration-150 hover:scale-105 cursor-pointer"
              title="Turn off voice guide (re-enable anytime in More tools)"
              aria-label="Turn off voice guide"
            >
              <VolumeX className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bottom Hairline Progress */}
        <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white/10 overflow-hidden rounded-full">
          <div
            className="h-full transition-all duration-150 bg-[var(--accent-primary)]"
            style={{ width: `${tour.hasEnded ? 100 : progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceGuideDock;
