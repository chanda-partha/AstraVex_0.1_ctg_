import React from 'react';
import { X } from 'lucide-react';

interface QuizModalSkeletonProps {
  onClose?: () => void;
}

export const QuizModalSkeleton: React.FC<QuizModalSkeletonProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl nasa-card-elevated p-6 md:p-8 rounded-3xl my-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 bg-[#070b18]/95"
        role="status"
        aria-label="Loading NASA Science Quiz"
      >
        {/* Header Bar Skeleton */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="space-y-2 w-3/4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-32 rounded-full bg-white/[0.06] loading-shimmer" />
              <div className="h-5 w-24 rounded-full bg-white/[0.06] loading-shimmer" />
            </div>
            <div className="h-7 w-3/5 rounded-xl bg-white/[0.08] loading-shimmer" />
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

        {/* Question Counter & Progress Bar Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-28 rounded bg-white/[0.06] loading-shimmer" />
            <div className="h-3 w-16 rounded bg-white/[0.06] loading-shimmer" />
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <div className="w-1/3 h-full bg-white/[0.1] loading-shimmer" />
          </div>
        </div>

        {/* Question Prompt Skeleton Card */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
          <div className="h-5 w-full rounded bg-white/[0.08] loading-shimmer" />
          <div className="h-5 w-4/5 rounded bg-white/[0.07] loading-shimmer" />
        </div>

        {/* 4 Multiple-Choice Option Skeleton Cards */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3.5"
            >
              <div className="w-6 h-6 rounded-lg bg-white/[0.07] loading-shimmer flex-shrink-0" />
              <div className="h-4 w-5/6 rounded bg-white/[0.06] loading-shimmer" />
            </div>
          ))}
        </div>

        {/* Submit Action Button Skeleton */}
        <div className="pt-2 flex justify-end">
          <div className="h-11 w-36 rounded-xl bg-white/[0.08] loading-shimmer" />
        </div>
      </div>
    </div>
  );
};

export default QuizModalSkeleton;
