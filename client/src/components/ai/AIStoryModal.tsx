import React, { useState, useEffect } from 'react';
import { AIStoryPayload, ResolvedNasaPayload } from '../../types';
import { X, Play, Pause, Square, Sparkles, Volume2, AlertCircle, RefreshCw } from 'lucide-react';
import { StoryModalSkeleton } from '../skeleton/StoryModalSkeleton';

interface AIStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyData: AIStoryPayload | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  resolvedData: ResolvedNasaPayload | null;
}

export const AIStoryModal: React.FC<AIStoryModalProps> = ({
  isOpen,
  onClose,
  storyData,
  isLoading = false,
  error = null,
  onRetry,
  resolvedData,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [volume] = useState<number>(1.0);

  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Initial Loading State: Match exact layout with high-end skeleton
  if (isLoading && !storyData) {
    return <StoryModalSkeleton onClose={onClose} />;
  }

  // 2. Error State: Clear error message and retry capability
  if (error && !storyData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-fade-in">
        <div className="relative w-full max-w-lg nasa-card-elevated p-6 md:p-8 rounded-3xl space-y-5 text-center shadow-2xl border border-red-500/20 bg-[#070b18]/95">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">Story Telemetry Unavailable</h3>
            <p className="text-xs text-slate-400">
              {error || 'Unable to establish link with the AI story dossier generator.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty State Fallback
  if (!storyData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
        <div className="relative w-full max-w-lg nasa-card-elevated p-6 rounded-3xl space-y-4 text-center">
          <p className="text-sm text-slate-300">No story dossier found for this active hardware item.</p>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs">
            Close
          </button>
        </div>
      </div>
    );
  }

  const handlePlayVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-Speech narration is not supported in this browser.");
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const fullText = `${storyData.title}. ${storyData.subtitle || ''}. ` +
      storyData.paragraphs.map(p => `${p.heading}. ${p.content}`).join(' ');

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.volume = volume;
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseVoice = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStopVoice = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl overflow-y-auto animate-fade-in select-none">
      <div className="relative w-full max-w-3xl crystal-glass p-6 md:p-8 rounded-3xl my-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative overflow-hidden group">
        
        {/* Iridescent Top Rim */}
        <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[2px] pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold">
                NASA Educational Dossier
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                NASA Open Data Verified
              </span>
              {isLoading && (
                <span className="text-[10px] font-mono text-cyan-300 animate-pulse">
                  Refreshing...
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {storyData.title}
            </h2>
            <p className="text-xs text-slate-400">
              {storyData.subtitle} • Target: <span className="text-slate-200">{storyData.targetAgeGroup || 'All Explorers'}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Story Dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VOICE TTS CONTROL DOCK */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-emerald-400' : ''}`} />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                Audio Story Narration
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {isPlaying ? 'Currently playing...' : isPaused ? 'Narration paused' : 'AI voice narrator ready'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handlePlayVoice}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPaused ? 'Resume' : 'Play Narration'}</span>
              </button>
            ) : (
              <button
                onClick={handlePauseVoice}
                className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleStopVoice}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Stop Narration"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* STORY PARAGRAPHS */}
        <div className="space-y-3">
          {storyData.paragraphs.map((para, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 transition-all hover:border-blue-500/30"
            >
              <h3 className="text-sm font-semibold text-white">
                {para.heading}
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed font-normal">
                {para.content}
              </p>
            </div>
          ))}
        </div>

        {/* FUN FACTS CARDS (IF PRESENT) */}
        {storyData.funFacts && storyData.funFacts.length > 0 && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mission Science Highlights</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-xs">
              {storyData.funFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};

export default AIStoryModal;
