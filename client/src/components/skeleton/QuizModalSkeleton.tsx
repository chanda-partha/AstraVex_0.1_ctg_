import React from 'react';
import { ModalShell } from '../ui';

interface QuizModalSkeletonProps {
  onClose?: () => void;
}

export const QuizModalSkeleton: React.FC<QuizModalSkeletonProps> = ({ onClose }) => {
  return (
    <ModalShell
      id="quiz-skeleton-modal"
      isOpen={true}
      onClose={onClose || (() => {})}
      size="md"
      eyebrow="Mission quiz"
      title="Loading mission quiz..."
    >
      <div className="space-y-4" role="status" aria-label="Loading mission quiz">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-28 rounded bg-slate-800 loading-shimmer" />
            <div className="h-3.5 w-20 rounded bg-slate-800 loading-shimmer" />
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="w-1/3 h-full bg-slate-700 loading-shimmer" />
          </div>
        </div>

        <div className="p-5 rounded-xl hud-well space-y-2">
          <div className="h-4 w-full rounded bg-slate-800 loading-shimmer" />
          <div className="h-4 w-4/5 rounded bg-slate-800/70 loading-shimmer" />
        </div>

        <div className="space-y-2">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl hud-well flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-800 loading-shimmer flex-shrink-0" />
              <div className="h-4 w-5/6 rounded bg-slate-800/70 loading-shimmer" />
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <div className="h-9 w-32 rounded-xl bg-slate-800 loading-shimmer" />
        </div>
      </div>
    </ModalShell>
  );
};

export default QuizModalSkeleton;
