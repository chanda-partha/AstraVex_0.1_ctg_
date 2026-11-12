import React from 'react';
import type { MAChapterId } from '../../types/missionAfterlife';
import { soundFx } from '../../utils/soundEffects';

interface MissionProgressBarProps {
  currentChapter: MAChapterId;
  chapterIndex: number; // 0 to 3
  onSelectChapter: (chapter: MAChapterId) => void;
}

const CHAPTER_CONFIG: { id: MAChapterId; label: string; code: string }[] = [
  { id: 'identity', label: 'THE IDENTITY', code: '01' },
  { id: 'purpose', label: 'THE PURPOSE', code: '02' },
  { id: 'finalChapter', label: 'THE FINAL CHAPTER', code: '03' },
  { id: 'legacy', label: 'THE LEGACY', code: '04' },
];

export const MissionProgressBar: React.FC<MissionProgressBarProps> = ({
  currentChapter,
  chapterIndex,
  onSelectChapter,
}) => {
  return (
    <div className="w-full crystal-glass px-4 py-2.5 rounded-2xl flex items-center justify-between gap-2 text-xs font-mono select-none">
      <div className="flex items-center gap-1.5 sm:gap-3 flex-1">
        {CHAPTER_CONFIG.map((chap, idx) => {
          const isCurrent = chap.id === currentChapter;
          const isPassed = idx < chapterIndex;

          return (
            <button
              key={chap.id}
              onClick={() => {
                soundFx.playClick();
                onSelectChapter(chap.id);
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer border ${
                isCurrent
                  ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-cyan-400/60 text-white font-bold shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : isPassed
                  ? 'bg-white/[0.04] border-emerald-400/30 text-emerald-300'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  isCurrent
                    ? 'bg-cyan-500/30 text-cyan-200'
                    : isPassed
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-white/10 text-slate-500'
                }`}
              >
                {chap.code}
              </span>
              <span className="hidden md:inline tracking-wider truncate">
                {chap.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-white/[0.08] text-[10px] text-slate-400">
        <span>CHAPTER {chapterIndex + 1} OF 4</span>
      </div>
    </div>
  );
};

export default MissionProgressBar;

