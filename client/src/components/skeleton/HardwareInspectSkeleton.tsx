import React from 'react';
import { X } from 'lucide-react';

interface HardwareInspectSkeletonProps {
  onClose?: () => void;
}

export const HardwareInspectSkeleton: React.FC<HardwareInspectSkeletonProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in select-none">
      <div 
        className="relative w-full max-w-4xl nasa-card-elevated p-6 md:p-8 rounded-3xl my-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 bg-[#070b18]/95"
        role="status"
        aria-label="Loading NASA Hardware Dossier"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="space-y-2 w-3/4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-36 rounded-full bg-white/[0.06] loading-shimmer" />
              <div className="h-5 w-24 rounded-full bg-white/[0.06] loading-shimmer" />
            </div>
            <div className="h-8 w-2/3 rounded-xl bg-white/[0.08] loading-shimmer" />
            <div className="h-4 w-1/2 rounded bg-white/[0.05] loading-shimmer" />
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/[0.05] text-slate-400 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 2-Column Grid matching HardwareInspectModal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Purpose & Specs */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2.5">
              <div className="h-3.5 w-28 rounded bg-white/[0.07] loading-shimmer" />
              <div className="h-3 w-full rounded bg-white/[0.05] loading-shimmer" />
              <div className="h-3 w-4/5 rounded bg-white/[0.05] loading-shimmer" />
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
              <div className="h-3.5 w-32 rounded bg-white/[0.07] loading-shimmer" />
              <div className="grid grid-cols-2 gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] space-y-1.5">
                    <div className="h-2.5 w-16 rounded bg-white/[0.05] loading-shimmer" />
                    <div className="h-3.5 w-24 rounded bg-white/[0.07] loading-shimmer" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Image Placeholder with FIXED aspect ratio (Prevents CLS!) */}
          <div className="space-y-3">
            <div className="w-full aspect-video rounded-2xl bg-white/[0.04] border border-white/[0.06] loading-shimmer flex items-center justify-center">
              <span className="text-[11px] font-mono text-slate-500 tracking-wider">LOADING NASA IMAGERY...</span>
            </div>
            {/* Thumbnail selector row skeleton */}
            <div className="flex gap-2">
              {[1, 2, 3].map((t) => (
                <div key={t} className="w-16 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] loading-shimmer" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareInspectSkeleton;
