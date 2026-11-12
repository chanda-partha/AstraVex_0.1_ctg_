import React, { useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Eye,
} from "lucide-react";
import { soundFx } from "../../utils/soundEffects";

interface MissionChapterControllerProps {
  chapterIndex: number; // 0 to 3
  isAutoPlay: boolean;
  autoRotate: boolean;
  onNextChapter: () => void;
  onPrevChapter: () => void;
  onReplayChapter: () => void;
  onToggleAutoPlay: () => void;
  onToggleAutoRotate: () => void;
}

export const MissionChapterController: React.FC<
  MissionChapterControllerProps
> = ({
  chapterIndex,
  isAutoPlay,
  autoRotate,
  onNextChapter,
  onPrevChapter,
  onReplayChapter,
  onToggleAutoPlay,
  onToggleAutoRotate,
}) => {
  // Comfortable Auto-Play timer: 14 seconds per chapter to read comfortably
  const timerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  useEffect(() => {
    if (isAutoPlay) {
      timerRef.current = window.setTimeout(() => {
        onNextChapter();
      }, 14000);
    } else if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [isAutoPlay, chapterIndex, onNextChapter]);

  return (
    <div className="crystal-glass p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono pointer-events-auto border-white/10 shadow-lg">
      {/* ═══ 1. PREVIOUS & REPLAY BUTTONS ═══ */}
      <div className="flex items-center gap-2">
        <button
          disabled={chapterIndex === 0}
          onClick={() => {
            soundFx.playClick();
            onPrevChapter();
          }}
          className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer transition-all"
          title="Previous Chapter"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PREVIOUS</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onReplayChapter();
          }}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-slate-200 cursor-pointer transition-all"
          title="Replay Current Chapter"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ═══ 2. AUTO-PLAY & 360 SHOW TOGGLES ═══ */}
      <div className="flex items-center gap-2">
        {/* Auto Play Experience */}
        <button
          onClick={() => {
            soundFx.playClick();
            onToggleAutoPlay();
          }}
          className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
            isAutoPlay
              ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(56,189,248,0.3)]"
              : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200"
          }`}
          title={isAutoPlay ? "Pause Auto Play" : "Start Auto Play"}
        >
          {isAutoPlay ? (
            <>
              <Pause className="w-3.5 h-3.5 text-cyan-400" />
              <span>AUTO ACTIVE</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-slate-400" />
              <span>AUTO PLAY</span>
            </>
          )}
        </button>

        {/* 360 Inspection Orbit Toggle */}
        <button
          onClick={() => {
            soundFx.playClick();
            onToggleAutoRotate();
          }}
          className={`px-3 py-2 rounded-xl border hidden md:flex items-center gap-1.5 cursor-pointer transition-all ${
            autoRotate
              ? "bg-blue-600/25 border-blue-400/50 text-blue-200"
              : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle 360° Spacecraft Orbit"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>360° ORBIT</span>
        </button>
      </div>

      {/* ═══ 3. NEXT / ADVANCE BUTTON ═══ */}
      <button
        onClick={() => {
          soundFx.playSuccess();
          onNextChapter();
        }}
        className="premium-btn-primary px-5 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-glow-cyan"
      >
        <span>{chapterIndex < 3 ? "CONTINUE" : "ARCHIVE MISSION"}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default MissionChapterController;
