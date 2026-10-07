import React from 'react';
import { X } from 'lucide-react';

interface DataRegistrySkeletonProps {
  onClose?: () => void;
}

export const DataRegistrySkeleton: React.FC<DataRegistrySkeletonProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in select-none">
      <div 
        className="relative w-full max-w-4xl nasa-card-elevated p-6 md:p-8 rounded-3xl my-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 bg-[#070b18]/95"
        role="status"
        aria-label="Loading NASA Data Registry"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="space-y-2 w-3/4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-40 rounded-full bg-white/[0.06] loading-shimmer" />
            </div>
            <div className="h-8 w-1/2 rounded-xl bg-white/[0.08] loading-shimmer" />
            <div className="h-4 w-2/3 rounded bg-white/[0.05] loading-shimmer" />
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

        {/* 4 Registry Source Card Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-40 rounded bg-white/[0.08] loading-shimmer" />
                <div className="h-4 w-16 rounded-full bg-white/[0.06] loading-shimmer" />
              </div>
              <div className="h-3 w-5/6 rounded bg-white/[0.04] loading-shimmer" />
              <div className="flex gap-1.5 pt-1">
                <div className="h-4 w-20 rounded bg-white/[0.05] loading-shimmer" />
                <div className="h-4 w-24 rounded bg-white/[0.05] loading-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataRegistrySkeleton;
