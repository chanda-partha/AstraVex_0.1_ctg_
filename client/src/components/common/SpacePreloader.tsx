import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  BootProgressSnapshot,
  CRITICAL_BOOT_ASSETS,
  preloadCriticalBootAssets,
} from '../../utils/assetPreloader';

const HERO_WORDMARK = ['A', 'S', 'T', 'R', 'A', 'V', 'E', 'X'];
const LAUNCHING_LETTERS = ['L', 'A', 'U', 'N', 'C', 'H', 'I', 'N', 'G'];

const PIPELINE_MODULES = [
  { code: 'DRACO', label: 'WASM Core', threshold: 3 },
  { code: 'ISS', label: 'Orbital', threshold: 4 },
  { code: 'JWST', label: 'Deep Space', threshold: 5 },
  { code: 'EARTH', label: 'Homeworld', threshold: 6 },
  { code: 'MARS', label: 'Jezero', threshold: 7 },
  { code: 'MOON', label: 'Artemis', threshold: 8 },
] as const;

interface SpacePreloaderProps {
  onAssetsReady?: () => void;
  onReady: () => void;
}

const INITIAL_TOTAL_BYTES = CRITICAL_BOOT_ASSETS.reduce((acc, a) => acc + a.estimatedBytes, 0);

function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const SpacePreloader: React.FC<SpacePreloaderProps> = ({ onAssetsReady, onReady }) => {
  const [progress, setProgress] = useState<BootProgressSnapshot>({
    percent: 0,
    loadedBytes: 0,
    totalBytes: INITIAL_TOTAL_BYTES,
    activeLabel: 'Initializing Draco WASM & 3D planetary globe',
    completedCount: 0,
    totalCount: CRITICAL_BOOT_ASSETS.length,
    isComplete: false,
  });
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const completedRef = useRef(false);
  const onAssetsReadyRef = useRef(onAssetsReady);
  onAssetsReadyRef.current = onAssetsReady;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const triggerDismiss = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onAssetsReadyRef.current?.();
    // Allow 180ms for Three.js WebGL context + cached GLB attachment before fading curtain
    window.setTimeout(() => {
      setIsExiting(true);
    }, 180);
    window.setTimeout(() => {
      onReadyRef.current();
    }, 660);
  };

  // Populate --sibling-index fallback only when CSS sibling-index() is unsupported
  useEffect(() => {
    if (
      typeof CSS === 'undefined' ||
      !CSS.supports('animation-delay: calc(sibling-index() * 0.1s)')
    ) {
      document.querySelectorAll<HTMLElement>('[data-stagger-group]').forEach((group) => {
        Array.from(group.children).forEach((el, index) => {
          (el as HTMLElement).style.setProperty('--sibling-index', String(index + 1));
        });
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const mountTime = performance.now();
    const MIN_VISIBLE_MS = 600;
    const SAFETY_TIMEOUT_MS = 8000;

    let minTimer: number | null = null;
    const skipRevealTimer = window.setTimeout(() => {
      if (!completedRef.current) {
        setShowSkipOption(true);
      }
    }, 1800);

    const safetyTimeout = window.setTimeout(() => {
      controller.abort();
      triggerDismiss();
    }, SAFETY_TIMEOUT_MS);

    preloadCriticalBootAssets((snap) => {
      setProgress(snap);
    }, controller.signal).then(() => {
      if (completedRef.current || controller.signal.aborted) return;
      const elapsed = performance.now() - mountTime;
      const waitMs = Math.max(0, MIN_VISIBLE_MS - elapsed);
      minTimer = window.setTimeout(() => {
        triggerDismiss();
      }, waitMs);
    });

    return () => {
      controller.abort();
      window.clearTimeout(skipRevealTimer);
      window.clearTimeout(safetyTimeout);
      if (minTimer !== null) window.clearTimeout(minTimer);
    };
  }, []);

  const phaseTag = progress.isComplete
    ? 'SYSTEMS ONLINE'
    : progress.percent >= 45
      ? 'CALIBRATING WORLDS'
      : 'IGNITING TELEMETRY';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading AstraVex 3D mission environment"
      className={`fixed inset-0 z-[100] bg-[#04060D] flex flex-col justify-between px-6 py-5 sm:px-10 sm:py-7 overflow-hidden select-none transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-[1.015] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Full-Viewport Layered Celestial Lighting & Precision Coordinate Grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.11) 0%, transparent 50%), radial-gradient(ellipse 92% 46% at 50% 106%, rgba(217, 119, 75, 0.22) 0%, rgba(157, 180, 211, 0.10) 40%, transparent 74%)',
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 boot-grid-bg pointer-events-none" />

      {/* Centered Orbital Eclipse Rings & Corona Halo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="relative flex items-center justify-center w-[340px] h-[340px] sm:w-[540px] sm:h-[540px]">
          <div className="absolute inset-0 rounded-full border border-dashed border-white/[0.06] boot-orbit-ring boot-orbit-ring--outer" />
          <div className="absolute inset-8 sm:inset-14 rounded-full border border-white/[0.08] boot-orbit-ring boot-orbit-ring--inner" />
          <div className="absolute inset-12 sm:inset-20 boot-corona-arc opacity-85" />
          <div
            className="absolute inset-16 sm:inset-28 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(4, 6, 13, 0.72) 66%, transparent 100%)',
            }}
          />
        </div>
      </div>

      {/* Mission Control Corner Brackets */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-4 sm:inset-6 z-10 opacity-45"
      >
        <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/30" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/30" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30" />
      </div>

      {/* Top Perimeter Telemetry Header */}
      <header className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/astravex_logo.png"
            alt="AstraVex emblem"
            className="w-7 h-7 object-contain flex-shrink-0"
          />
          <div className="flex items-center gap-2 min-w-0 font-mono text-[11px] uppercase tracking-[0.2em]">
            <span className="text-slate-100 font-semibold">ASTRAVEX</span>
            <span className="text-slate-600 hidden sm:inline">//</span>
            <span className="text-slate-400 hidden sm:inline truncate">
              NASA Mission Explorer · SEE-2026
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-[10px] font-mono uppercase tracking-[0.18em] text-slate-200">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                progress.isComplete ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'
              }`}
            />
            <span>{phaseTag}</span>
          </span>
        </div>
      </header>

      {/* Main Monumental Kinetic Typography Stage */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-6">
        <span className="mb-3 sm:mb-4 font-mono text-[10px] sm:text-xs uppercase tracking-[0.38em] text-cyan-200/80">
          Interplanetary 3D Flight Deck
        </span>

        {/* Sculptural Staggered Hero Wordmark with Compositor Light Glaze */}
        <h1
          aria-label="ASTRAVEX"
          data-stagger-group="hero"
          className="boot-glaze-sweep inline-flex items-baseline justify-center gap-[0.14em] overflow-hidden px-3 py-1 font-orbitron font-extrabold uppercase tracking-normal text-[clamp(2.5rem,9vw,6.4rem)] leading-[0.98] text-slate-50 drop-shadow-[0_14px_40px_rgba(56,189,248,0.18)]"
        >
          {HERO_WORDMARK.map((letter, idx) => (
            <span key={`${letter}-${idx}`} className="boot-hero-char" aria-hidden="true">
              {letter}
            </span>
          ))}
        </h1>

        {/* Kinetic Orbital Wave Action Wordmark */}
        <div className="mt-4 sm:mt-5 flex items-center justify-center gap-3 sm:gap-5 w-full max-w-xl">
          <span
            aria-hidden="true"
            className="h-px flex-1 max-w-[96px] bg-gradient-to-r from-transparent to-cyan-400/55"
          />
          <div
            aria-label="Launching"
            data-stagger-group="wave"
            className="inline-flex items-center justify-center gap-[0.42em] sm:gap-[0.62em] font-orbitron text-xs sm:text-sm font-semibold tracking-normal"
          >
            {LAUNCHING_LETTERS.map((letter, idx) => (
              <span key={`${letter}-${idx}`} className="boot-wave-char" aria-hidden="true">
                {letter}
              </span>
            ))}
          </div>
          <span
            aria-hidden="true"
            className="h-px flex-1 max-w-[96px] bg-gradient-to-l from-transparent to-amber-400/55"
          />
        </div>

        {/* High-Impact Telemetry Progress Deck + Live Module Matrix */}
        <div className="mt-8 sm:mt-10 w-full max-w-[540px] space-y-3 text-left">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <span className="block text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">
                Active Telemetry Stream
              </span>
              <span className="block text-xs sm:text-sm font-mono text-slate-200 truncate mt-0.5">
                {progress.activeLabel}
              </span>
            </div>
            <div className="flex items-baseline gap-0.5 flex-shrink-0 font-orbitron tabular-nums">
              <span className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                {progress.percent}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-cyan-300">%</span>
            </div>
          </div>

          <progress
            className="boot-progress"
            value={progress.percent}
            max={100}
            aria-label={progress.activeLabel}
          />

          <div
            aria-hidden="true"
            className="flex items-center justify-between text-[9px] font-mono tracking-widest text-slate-600"
          >
            <span>00</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>

          {/* 6-Module Hardware Ignition Grid synced to live CRITICAL_BOOT_ASSETS */}
          <div className="pt-1.5 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {PIPELINE_MODULES.map((mod) => {
              const ready = progress.completedCount >= mod.threshold;
              return (
                <div
                  key={mod.code}
                  className={`px-2 py-1.5 rounded-lg border transition-colors duration-200 flex items-center justify-between gap-1 ${
                    ready
                      ? 'bg-cyan-500/[0.09] border-cyan-400/40 text-slate-100'
                      : 'bg-white/[0.02] border-white/[0.07] text-slate-500'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block text-[10px] font-mono font-semibold leading-none tracking-wider truncate">
                      {mod.code}
                    </span>
                    <span className="block text-[8.5px] font-mono text-slate-400/80 truncate mt-0.5">
                      {mod.label}
                    </span>
                  </div>
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      ready ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]' : 'bg-slate-700'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Network Stall Fallback Action (only after 4.2s) */}
        {showSkipOption && !isExiting && (
          <button
            type="button"
            onClick={triggerDismiss}
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-800 border border-white/[0.14] text-xs font-mono text-slate-200 hover:text-white transition-colors cursor-pointer animate-fade-in"
          >
            <span>Continue into theater</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </main>

      {/* Bottom Perimeter Ephemeris & Stream Telemetry */}
      <footer className="relative z-10 flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-400">
        <span className="hidden sm:inline truncate">
          J2000 Epoch · Earth ↔ Moon ↔ Mars · WebGL 2.0 + Draco WASM
        </span>
        <span className="sm:hidden">WebGL 2.0 · Draco</span>

        <div className="flex items-center gap-3 tabular-nums flex-shrink-0">
          <span>
            Modules {progress.completedCount}/{progress.totalCount}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-200">
            {formatMB(progress.loadedBytes)} / {formatMB(progress.totalBytes)}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default SpacePreloader;
