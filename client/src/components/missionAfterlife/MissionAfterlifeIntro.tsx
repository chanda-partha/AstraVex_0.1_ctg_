import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Compass } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface MissionAfterlifeIntroProps {
  onBegin: () => void;
  onSkip: () => void;
}

export const MissionAfterlifeIntro: React.FC<MissionAfterlifeIntroProps> = ({ onBegin, onSkip }) => {
  const [step, setStep] = useState<number>(0);

  // Cinematic sequence pacing
  useEffect(() => {
    // Step 0: Initial black starfield (0ms)
    // Step 1: Reveal primary question (1.2s)
    // Step 2: Reveal subtitle (3.2s)
    // Step 3: Reveal final call to action & buttons (5.0s)
    const t1 = setTimeout(() => setStep(1), 1200);
    const t2 = setTimeout(() => setStep(2), 3200);
    const t3 = setTimeout(() => setStep(3), 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleBegin = () => {
    soundFx.playSuccess();
    onBegin();
  };

  const handleSkip = () => {
    soundFx.playClick();
    onSkip();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020408] select-none flex items-center justify-center font-sans">
      {/* ═══ 1. AMBIENT BACKGROUND STARS & GLOW ═══ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle radial gradients simulating distant cosmic nebula */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        
        {/* Procedural CSS stars */}
        <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
      </div>

      {/* ═══ 2. SKIP INTRO BUTTON (Always visible at top-right) ═══ */}
      <div className="absolute top-20 right-6 z-20">
        <button
          onClick={handleSkip}
          className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-slate-200 text-xs font-mono tracking-wider transition-all cursor-pointer backdrop-blur-md"
        >
          SKIP INTRO
        </button>
      </div>

      {/* ═══ 3. CINEMATIC TEXT SEQUENCE ═══ */}
      <div className="relative z-10 max-w-3xl px-6 text-center space-y-8">
        
        {/* Sub-badge: Mission classification */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-cyan-400/30 text-[10px] font-mono tracking-widest text-cyan-300 uppercase shadow-glow-cyan"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>ASTRAVEX SEE • MISSION AFTERLIFE</span>
        </motion.div>

        {/* Primary Question Heading */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-orbitron leading-tight"
            >
              WHAT HAPPENED TO THE{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
                SPACECRAFT WE LEFT BEHIND?
              </span>
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Subtitle */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto"
            >
              Every mission has a story.{' '}
              <span className="text-slate-400">Not every explorer makes it home.</span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Discover their final chapter + Buttons */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 pt-4"
            >
              <div className="text-xs sm:text-sm font-mono tracking-widest text-cyan-400/90 uppercase">
                DISCOVER THEIR FINAL CHAPTER
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleBegin}
                  className="premium-btn-primary px-8 py-3.5 rounded-2xl font-display font-bold text-sm flex items-center gap-3 cursor-pointer shadow-glow-cyan w-full sm:w-auto justify-center group"
                >
                  <Compass className="w-4 h-4 text-cyan-200 group-hover:rotate-45 transition-transform duration-300" />
                  <span>BEGIN EXPLORATION</span>
                  <ChevronRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition-transform duration-200" />
                </button>

                <button
                  onClick={handleSkip}
                  className="px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white font-mono text-xs tracking-wider transition-all cursor-pointer backdrop-blur-md w-full sm:w-auto"
                >
                  SKIP TO SELECTION
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ═══ 4. BOTTOM TELEMETRY FOOTER ═══ */}
      <div className="absolute bottom-6 left-0 right-0 px-6 flex items-center justify-between text-[11px] font-mono text-slate-500 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>NASA HISTORICAL TELEMETRY ARCHIVE</span>
        </div>
        <div className="hidden sm:block">
          MOON • MARS HISTORICAL HARDWARE CATALOG
        </div>
      </div>
    </div>
  );
};

