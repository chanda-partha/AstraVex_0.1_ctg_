import React from 'react';
import { RotateCcw, Award, Globe, Sparkles, CheckCircle2 } from 'lucide-react';
import type { MAMissionData } from '../../types/missionAfterlife';
import { soundFx } from '../../utils/soundEffects';

interface MissionCompletionScreenProps {
  mission: MAMissionData;
  onReplay: () => void;
  onLaunchQuiz: () => void;
  onReturnToPlanets: () => void;
}

export const MissionCompletionScreen: React.FC<MissionCompletionScreenProps> = ({
  mission,
  onReplay,
  onLaunchQuiz,
  onReturnToPlanets,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in select-none">
      {/* High-End Aerospace Glass Container */}
      <div className="relative w-full max-w-xl crystal-glass p-6 sm:p-8 rounded-3xl space-y-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.7)] border-white/15 overflow-hidden group">
        {/* Iridescent Top Rim */}
        <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[2px] pointer-events-none" />

        {/* Ambient Nebula Flare */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* ═══ 1. ICON SEAL & STATUS ═══ */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-spin-slow" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600/30 to-cyan-500/30 border border-cyan-400/60 flex items-center justify-center shadow-glow-cyan">
            <CheckCircle2 className="w-8 h-8 text-cyan-300" />
          </div>
        </div>

        {/* ═══ 2. HEADINGS ═══ */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>HISTORICAL CHAPTER ARCHIVED</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-orbitron">
            MISSION ARCHIVED
          </h2>

          <p className="text-sm font-mono text-cyan-300/90 italic">
            "The journey has ended. The discoveries remain."
          </p>
        </div>

        {/* ═══ 3. FINAL MISSION STATEMENT ═══ */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-slate-300 font-sans leading-relaxed text-left">
          <p>{mission.finalMessage}</p>
        </div>

        {/* ═══ 4. THREE PRIMARY ACTIONS ═══ */}
        <div className="space-y-2.5 pt-2">
          {/* BUTTON 2: TEST YOUR KNOWLEDGE (Primary Action) */}
          <button
            onClick={() => {
              soundFx.playSuccess();
              onLaunchQuiz();
            }}
            className="w-full premium-btn-primary py-3.5 px-5 rounded-2xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-glow-cyan"
          >
            <Award className="w-4 h-4 text-cyan-100" />
            <span>TEST YOUR KNOWLEDGE (AI QUIZ)</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            {/* BUTTON 1: REPLAY JOURNEY */}
            <button
              onClick={() => {
                soundFx.playClick();
                onReplay();
              }}
              className="py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>REPLAY JOURNEY</span>
            </button>

            {/* BUTTON 3: RETURN TO PLANETS */}
            <button
              onClick={() => {
                soundFx.playClick();
                onReturnToPlanets();
              }}
              className="py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-cyan-300 hover:text-cyan-200 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>RETURN TO PLANETS</span>
            </button>
          </div>
        </div>

        {/* Footnote */}
        <div className="text-[10px] font-mono text-slate-500">
          Selected Hardware: {mission.spacecraftName} • {mission.locationName}
        </div>
      </div>
    </div>
  );
};

export default MissionCompletionScreen;

