import React from 'react';

interface ScreenSkeletonProps {
  label?: string;
}

export const ScreenSkeleton: React.FC<ScreenSkeletonProps> = ({ label = 'INITIALIZING MISSION TELEMETRY...' }) => {
  return (
    <div 
      className="w-full h-screen bg-[#030611] text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-hidden"
      role="status"
      aria-label={label}
    >
      {/* Top HUD Skeleton Bar */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between pt-16">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.05] loading-shimmer" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded bg-white/[0.08] loading-shimmer" />
            <div className="h-2.5 w-24 rounded bg-white/[0.04] loading-shimmer" />
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-7 w-28 rounded-full bg-white/[0.05] loading-shimmer" />
          <div className="h-7 w-20 rounded-full bg-white/[0.05] loading-shimmer" />
        </div>
      </div>

      {/* Center 3D Loading Ticker */}
      <div className="flex flex-col items-center justify-center space-y-4 my-auto">
        <div className="relative w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.2)]">
          <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
        <div className="space-y-1 text-center">
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 block">
            {label}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            NASA DEEP SPACE TELEMETRY FEED • 60 FPS WEBGL STREAM
          </span>
        </div>
      </div>

      {/* Bottom Command Dock Skeleton */}
      <div className="w-full max-w-3xl mx-auto mb-4">
        <div className="h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400/50 animate-pulse" />
            <div className="h-3 w-40 rounded bg-white/[0.06] loading-shimmer" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 rounded-xl bg-white/[0.05] loading-shimmer" />
            <div className="h-8 w-16 rounded-xl bg-white/[0.05] loading-shimmer" />
            <div className="h-8 w-20 rounded-xl bg-white/[0.08] loading-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenSkeleton;
