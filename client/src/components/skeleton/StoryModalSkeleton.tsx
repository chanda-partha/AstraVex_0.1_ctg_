import React from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';

interface StoryModalSkeletonProps {
  onClose?: () => void;
}

export const StoryModalSkeleton: React.FC<StoryModalSkeletonProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in select-none">
      <div 
        className="relative w-full max-w-3xl nasa-card-elevated p-6 md:p-8 rounded-3xl my-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 bg-[#070b18]/95"
        role="status"
        aria-label="Loading NASA Dossier Story"
      >
        {/* Header Bar Skeleton */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="space-y-2.5 w-3/4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-36 rounded-full bg-white/[0.06] loading-shimmer" />
              <div className="h-5 w-28 rounded-full bg-white/[0.06] loading-shimmer" />
            </div>
            {/* Title Skeleton */}
            <div className="h-8 w-4/5 rounded-xl bg-white/[0.08] loading-shimmer" />
            {/* Subtitle Skeleton */}
            <div className="h-4 w-2/3 rounded-lg bg-white/[0.05] loading-shimmer" />
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

        {/* TTS Narration Audio Bar Skeleton */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.08] loading-shimmer" />
            <div className="space-y-1.5">
              <div className="h-3 w-32 rounded bg-white/[0.06] loading-shimmer" />
              <div className="h-2 w-20 rounded bg-white/[0.04] loading-shimmer" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-24 rounded-full bg-white/[0.05] loading-shimmer" />
            <div className="h-8 w-20 rounded-xl bg-white/[0.06] loading-shimmer" />
          </div>
        </div>

        {/* Article Paragraph Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-white/[0.06] loading-shimmer" />
                <div className="h-4 w-48 rounded bg-white/[0.08] loading-shimmer" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-3.5 w-full rounded bg-white/[0.05] loading-shimmer" />
                <div className="h-3.5 w-11/12 rounded bg-white/[0.05] loading-shimmer" />
                <div className="h-3.5 w-4/5 rounded bg-white/[0.04] loading-shimmer" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="h-3 w-40 rounded bg-white/[0.04] loading-shimmer" />
          <div className="h-3 w-28 rounded bg-white/[0.04] loading-shimmer" />
        </div>
      </div>
    </div>
  );
};

export default StoryModalSkeleton;
