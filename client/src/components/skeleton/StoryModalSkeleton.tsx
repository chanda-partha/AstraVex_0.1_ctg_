import React from 'react';
import { ModalShell } from '../ui';

interface StoryModalSkeletonProps {
  onClose?: () => void;
}

export const StoryModalSkeleton: React.FC<StoryModalSkeletonProps> = ({ onClose }) => {
  return (
    <ModalShell
      id="story-skeleton-modal"
      isOpen={true}
      onClose={onClose || (() => {})}
      size="md"
      eyebrow="Mission story"
      title="Loading mission story..."
    >
      <div className="space-y-4" role="status" aria-label="Loading mission story">
        <div className="p-4 rounded-xl hud-well flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800/80 loading-shimmer" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-slate-800 loading-shimmer" />
              <div className="h-3 w-24 rounded bg-slate-800/60 loading-shimmer" />
            </div>
          </div>
          <div className="h-9 w-28 rounded-xl bg-slate-800 loading-shimmer" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="p-4 rounded-xl hud-well space-y-2.5">
              <div className="h-4 w-48 rounded bg-slate-800 loading-shimmer" />
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded bg-slate-800/60 loading-shimmer" />
                <div className="h-3.5 w-11/12 rounded bg-slate-800/60 loading-shimmer" />
                <div className="h-3.5 w-4/5 rounded bg-slate-800/50 loading-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModalShell>
  );
};

export default StoryModalSkeleton;
