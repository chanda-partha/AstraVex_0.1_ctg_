import React from 'react';
import { ModalShell } from '../ui';

interface DataRegistrySkeletonProps {
  onClose?: () => void;
}

export const DataRegistrySkeleton: React.FC<DataRegistrySkeletonProps> = ({ onClose }) => {
  return (
    <ModalShell
      id="data-registry-skeleton-modal"
      isOpen={true}
      onClose={onClose || (() => {})}
      size="lg"
      eyebrow="Data sources"
      title="Loading NASA data registry..."
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
        role="status"
        aria-label="Loading NASA data registry"
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl hud-well space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-40 rounded bg-slate-800 loading-shimmer" />
              <div className="h-5 w-20 rounded-md bg-slate-800/70 loading-shimmer" />
            </div>
            <div className="h-3.5 w-5/6 rounded bg-slate-800/50 loading-shimmer" />
            <div className="flex gap-1.5 pt-1">
              <div className="h-5 w-24 rounded-md bg-slate-800/60 loading-shimmer" />
              <div className="h-5 w-28 rounded-md bg-slate-800/60 loading-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
};

export default DataRegistrySkeleton;
