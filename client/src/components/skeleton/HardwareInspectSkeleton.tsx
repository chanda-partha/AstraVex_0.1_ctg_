import React from 'react';
import { ModalShell } from '../ui';

interface HardwareInspectSkeletonProps {
  onClose?: () => void;
}

export const HardwareInspectSkeleton: React.FC<HardwareInspectSkeletonProps> = ({ onClose }) => {
  return (
    <ModalShell
      id="hardware-skeleton-modal"
      isOpen={true}
      onClose={onClose || (() => {})}
      size="lg"
      eyebrow="Hardware specifications"
      title="Loading hardware specifications..."
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
        role="status"
        aria-label="Loading NASA hardware specifications"
      >
        <div className="space-y-3">
          <div className="p-4 rounded-xl hud-well space-y-2">
            <div className="h-3.5 w-32 rounded bg-slate-800 loading-shimmer" />
            <div className="h-3.5 w-full rounded bg-slate-800/60 loading-shimmer" />
            <div className="h-3.5 w-4/5 rounded bg-slate-800/60 loading-shimmer" />
          </div>

          <div className="p-4 rounded-xl hud-well space-y-2">
            <div className="h-3.5 w-36 rounded bg-slate-800 loading-shimmer" />
            <div className="h-3.5 w-full rounded bg-slate-800/60 loading-shimmer" />
            <div className="h-3.5 w-5/6 rounded bg-slate-800/60 loading-shimmer" />
          </div>

          <div className="p-4 rounded-xl hud-well space-y-2.5">
            <div className="h-3.5 w-28 rounded bg-slate-800 loading-shimmer" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-20 rounded-md bg-slate-800 loading-shimmer" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="w-full aspect-video rounded-xl hud-well loading-shimmer flex items-center justify-center">
            <span className="text-xs font-mono text-slate-400">Loading NASA imagery...</span>
          </div>
          <div className="h-4 w-3/4 rounded bg-slate-800/60 loading-shimmer" />
        </div>
      </div>
    </ModalShell>
  );
};

export default HardwareInspectSkeleton;
