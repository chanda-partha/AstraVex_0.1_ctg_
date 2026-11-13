import React from 'react';
import { useProgress } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

interface CanvasLoadingOverlayProps {
  title?: string;
  accent?: 'cyan' | 'amber' | 'slate';
  compact?: boolean;
  /** Optional external loading trigger (e.g. mission API sync or model swap) */
  forceActive?: boolean;
}

const ACCENT_MAP = {
  cyan: {
    ring: 'border-cyan-400/80',
    bar: 'from-cyan-400 to-sky-400',
    text: 'text-cyan-300',
  },
  amber: {
    ring: 'border-amber-400/80',
    bar: 'from-amber-400 to-orange-400',
    text: 'text-amber-300',
  },
  slate: {
    ring: 'border-slate-300/80',
    bar: 'from-slate-300 to-cyan-400',
    text: 'text-slate-200',
  },
};

function formatAssetLabel(rawItem: string): string {
  if (!rawItem) return 'Streaming 3D spacecraft telemetry';
  const clean = rawItem.split('?')[0].split('/').pop() || rawItem;
  const friendlyNames: Record<string, string> = {
    'extracted_pano.jpg': 'Jezero Crater 8K Mastcam-Z panorama',
    'perseverance.glb': 'Perseverance rover 3D mesh',
    'curiosity.glb': 'Curiosity rover 3D mesh',
    'ingenuity.glb': 'Ingenuity rotorcraft 3D',
    'insight.glb': 'InSight geophysical lander 3D',
    'viking_lander.glb': 'Viking 1 lander 3D',
    'mro.glb': 'Mars Reconnaissance Orbiter 3D',
    'apollo_lunar_module.glb': 'Apollo 11 Eagle lander 3D',
    'mondfahrzeug_lunar_rover.glb': 'Apollo 15/17 LRV rover 3D',
    'isro_chandrayyan-3_mission_lander_module_vikram.glb': 'Chandrayaan-3 Vikram lander 3D',
    'tripo_astronaut_2_stylized_and_animated.glb': 'EVA astronaut suit 3D',
    'lunar_orbiter_lro.glb': 'Lunar Reconnaissance Orbiter 3D',
    'lunar_ladee.glb': 'LADEE lunar orbiter 3D',
    'lunar_habitat.glb': 'Artemis base habitat 3D',
    'rocket_saturn_v.glb': 'Saturn V launch vehicle 3D',
    'jwst.glb': 'James Webb Space Telescope 3D',
    'hubble.glb': 'Hubble Space Telescope 3D',
    'iss.glb': 'International Space Station 3D',
    'voyager.glb': 'Voyager interstellar probe 3D',
    'mars.glb': 'Mars planetary globe 3D',
    'moon.glb': 'Moon planetary globe 3D',
    'earth.glb': 'Earth planetary globe 3D',
    'earth_texture.jpg': 'High-res Earth surface texture',
  };
  return friendlyNames[clean] || `Streaming ${clean.replace(/[_-]+/g, ' ')}`;
}

/**
 * Real-time Three.js / WebGL loading HUD overlay powered by Drei's useProgress().
 * Renders non-blocking telemetry progress whenever 3D GLBs or skybox textures stream in.
 */
export const CanvasLoadingOverlay: React.FC<CanvasLoadingOverlayProps> = ({
  title = 'Synchronizing 3D scene',
  accent = 'cyan',
  compact = false,
  forceActive = false,
}) => {
  const { active, progress, item, loaded, total } = useProgress();
  const isBusy = active || forceActive;
  if (!isBusy) return null;

  const pct = active
    ? Math.max(4, Math.min(99, Math.round(progress)))
    : 50;
  const styles = ACCENT_MAP[accent];
  const assetLabel = item ? formatAssetLabel(item) : title;

  if (compact) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-3.5 py-2 rounded-xl hud-card border-white/15 shadow-2xl animate-fade-in"
      >
        <Loader2 className={`w-4 h-4 animate-spin ${styles.text}`} />
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-100 truncate max-w-[230px]">
            {assetLabel}
          </p>
          <div className="w-36 h-1 mt-1 rounded-full bg-slate-800/90 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${styles.bar} transition-all duration-200`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span className="text-xs font-mono tabular-nums text-slate-300">
          {pct}%
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center p-4"
    >
      <div className="hud-card hud-card-featured rounded-2xl px-6 py-5 w-full max-w-sm border-white/15 shadow-2xl backdrop-blur-xl animate-fade-in">
        <div className="flex items-center gap-3.5">
          <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
            <span className="absolute inset-0 rounded-full border border-white/10" />
            <span
              className={`w-10 h-10 rounded-full border-2 border-t-transparent ${styles.ring} animate-spin`}
            />
            <span className="text-[10px] font-mono font-bold text-slate-100">
              {pct}%
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
              ASTRAVEX // {title}
            </p>
            <p className="font-orbitron text-xs font-bold uppercase tracking-[0.06em] text-slate-100 truncate mt-1">
              {assetLabel}
            </p>
          </div>
        </div>

        <div className="mt-3.5 space-y-1.5">
          <div className="w-full h-1.5 rounded-full bg-slate-900 border border-white/[0.08] overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${styles.bar} transition-all duration-200`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {total > 0 && (
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Streaming 3D assets</span>
              <span>
                {loaded}/{total} resources
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface VideoLoadingOverlayProps {
  visible: boolean;
  label?: string;
}

/**
 * Responsive loading & seek-buffering indicator for archival NASA MP4 video streams.
 */
export const VideoLoadingOverlay: React.FC<VideoLoadingOverlayProps> = ({
  visible,
  label = 'Buffering archival NASA stream...',
}) => {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#07090F]/45 backdrop-blur-[2px]"
    >
      <div className="hud-card rounded-2xl px-4 py-3 flex items-center gap-3 border-white/15 shadow-2xl">
        <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
        <span className="text-xs font-mono text-slate-100 tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
};

