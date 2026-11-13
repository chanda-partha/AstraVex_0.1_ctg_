import React from 'react';

interface ScreenSkeletonProps {
  label?: string;
}

export const ScreenSkeleton: React.FC<ScreenSkeletonProps> = ({
  label = 'Loading mission scene...',
}) => {
  return (
    <div
      className="w-full h-screen bg-[#07090F] text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-hidden"
      role="status"
      aria-label={label}
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between pt-16">
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded bg-slate-800 loading-shimmer" />
          <div className="h-3 w-24 rounded bg-slate-800/60 loading-shimmer" />
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-8 w-28 rounded-lg bg-slate-800/70 loading-shimmer" />
          <div className="h-8 w-20 rounded-lg bg-slate-800/70 loading-shimmer" />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-3 my-auto">
        <div className="w-12 h-12 rounded-xl hud-card flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-200 rounded-full animate-spin" />
        </div>
        <div className="space-y-1 text-center">
          <span className="text-xs font-mono font-medium text-slate-200 block">
            {label}
          </span>
          <span className="text-xs font-mono text-slate-400">
            Preparing 3D WebGL environment
          </span>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto mb-4">
        <div className="h-14 rounded-2xl hud-card px-4 flex items-center justify-between">
          <div className="h-3.5 w-36 rounded bg-slate-800 loading-shimmer" />
          <div className="flex gap-2">
            <div className="h-8 w-20 rounded-lg bg-slate-800 loading-shimmer" />
            <div className="h-8 w-24 rounded-lg bg-slate-800 loading-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenSkeleton;
