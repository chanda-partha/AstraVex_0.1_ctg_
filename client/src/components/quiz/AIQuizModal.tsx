import React, { useState } from 'react';
import { AIQuizPayload } from '../../types';
import {
  X,
  CheckCircle,
  XCircle,
  Award,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';
import { QuizModalSkeleton } from '../skeleton/QuizModalSkeleton';

interface AIQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizData: AIQuizPayload | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onAnswerQuestion: (isCorrect: boolean, reward: number, penalty: number) => void;
}

export const AIQuizModal: React.FC<AIQuizModalProps> = ({
  isOpen,
  onClose,
  quizData,
  isLoading = false,
  error = null,
  onRetry,
  onAnswerQuestion,
}) => {
  const [currentQIdx, setCurrentQIdx] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  // 1. Initial Loading State: High-end Skeleton UI
  if (isLoading && !quizData) {
    return <QuizModalSkeleton onClose={onClose} />;
  }

  // 2. Error State: Understandable error with recovery Retry button
  if (error && !quizData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none animate-fade-in">
        <div className="relative w-full max-w-lg bg-[#060a17]/95 p-6 md:p-8 rounded-3xl space-y-5 text-center shadow-2xl border border-red-500/20">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">Evaluation Telemetry Offline</h3>
            <p className="text-xs text-slate-400">
              {error || 'Unable to establish link with the AI flight evaluation module.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Challenge</span>
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
  if (!quizData || !quizData.questions.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none">
        <div className="relative w-full max-w-md bg-[#060a17]/95 p-6 rounded-3xl space-y-4 text-center border border-white/10">
          <p className="text-sm text-slate-300">No evaluation questions registered for this hardware payload.</p>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs">
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quizData.questions[currentQIdx];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    soundFx.playClick();
    setSelectedOptionIdx(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIdx === null) return;
    setIsSubmitted(true);

    const isCorrect = selectedOptionIdx === currentQ.correctIndex;
    if (isCorrect) {
      soundFx.playSuccess();
      setQuizScore((prev) => prev + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#38bdf8', '#34d399', '#fbbf24']
      });
    } else {
      soundFx.playWarning();
    }

    onAnswerQuestion(isCorrect, currentQ.healthReward, currentQ.healthPenalty);
  };

  const handleNextQuestion = () => {
    soundFx.playClick();
    if (currentQIdx < quizData.questions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
      setSelectedOptionIdx(null);
      setIsSubmitted(false);
    } else {
      setIsCompleted(true);
      soundFx.playSuccess();
    }
  };

  const handleResetQuiz = () => {
    soundFx.playClick();
    setCurrentQIdx(0);
    setSelectedOptionIdx(null);
    setIsSubmitted(false);
    setQuizScore(0);
    setIsCompleted(false);
  };

  const percentScore = Math.round((quizScore / quizData.questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl overflow-y-auto animate-fade-in select-none">
      {/* High-End Aerospace Glass Container */}
      <div className="relative w-full max-w-2xl crystal-glass p-6 sm:p-8 rounded-3xl my-6 space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative overflow-hidden group">
        
        {/* Iridescent Top Rim */}
        <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[2px] pointer-events-none" />

        {/* Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* ═══ 1. HEADER: Mission Patch & Telemetry Status ═══ */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                <Target className="w-3 h-3 text-cyan-400" />
                NASA Flight Evaluation
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-[10px] font-mono text-emerald-300 font-semibold">
                <Zap className="w-3 h-3 text-emerald-400" />
                +10 HP • +50 XP
              </span>
              {isLoading && (
                <span className="text-[10px] font-mono text-cyan-300 animate-pulse">
                  Syncing...
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
              {quizData.quizTitle || 'Mission Hardware Knowledge Evaluation'}
            </h2>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close Evaluation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ═══ 2. ACTIVE QUIZ STEPPER & QUESTIONS ═══ */}
        {!isCompleted ? (
          <div className="space-y-5">

            {/* Stepper Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  CHALLENGE <strong className="text-cyan-400">0{currentQIdx + 1}</strong> OF <strong className="text-slate-200">0{quizData.questions.length}</strong>
                </span>
                <span className="text-slate-400">
                  SCORE: <strong className="text-emerald-400 font-semibold">{quizScore} CORRECT</strong>
                </span>
              </div>

              {/* Progress Rail */}
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                  style={{ width: `${((currentQIdx + 1) / quizData.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Scientific Question Briefing Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-inner">
              <div className="flex items-center gap-2 mb-1.5 text-[10px] font-mono text-cyan-400/80 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Mission Scenario Query</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed font-sans">
                {currentQ.question}
              </h3>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOptionIdx === idx;
                const isCorrectAnswer = idx === currentQ.correctIndex;
                const letter = String.fromCharCode(65 + idx);

                let cardStyle =
                  'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.08] text-slate-200 hover:border-cyan-400/30';
                let badgeStyle = 'bg-white/[0.05] border-white/10 text-slate-400';

                if (isSelected) {
                  cardStyle =
                    'bg-cyan-500/15 border-cyan-400/60 text-white shadow-[0_0_16px_rgba(56,189,248,0.2)] font-medium';
                  badgeStyle = 'bg-cyan-500/30 border-cyan-400/50 text-cyan-200 font-bold';
                }

                if (isSubmitted) {
                  if (isCorrectAnswer) {
                    cardStyle =
                      'bg-emerald-500/20 border-emerald-400/60 text-emerald-100 font-semibold shadow-[0_0_16px_rgba(52,211,153,0.25)]';
                    badgeStyle = 'bg-emerald-500/40 border-emerald-400/70 text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrectAnswer) {
                    cardStyle =
                      'bg-rose-500/20 border-rose-400/60 text-rose-100 shadow-[0_0_16px_rgba(244,63,94,0.2)]';
                    badgeStyle = 'bg-rose-500/40 border-rose-400/70 text-rose-200';
                  } else {
                    cardStyle = 'bg-white/[0.01] border-white/[0.04] text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl border flex items-center justify-center font-mono text-xs flex-shrink-0 transition-all ${badgeStyle}`}
                      >
                        {letter}
                      </span>
                      <span className="leading-snug">{option}</span>
                    </div>

                    {isSubmitted && isCorrectAnswer && (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold flex-shrink-0">
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">CORRECT</span>
                      </div>
                    )}
                    {isSubmitted && isSelected && !isCorrectAnswer && (
                      <div className="flex items-center gap-1.5 text-rose-400 text-xs font-mono font-bold flex-shrink-0">
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">INCORRECT</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scientific Explanation Box */}
            {isSubmitted && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-fade-in ${
                  selectedOptionIdx === currentQ.correctIndex
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {selectedOptionIdx === currentQ.correctIndex
                      ? 'Telemetry Validated • +10 HP Restored'
                      : 'Telemetry Divergence • -5 HP Sustained'}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-xs">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
              <div className="text-[11px] font-mono text-slate-400">
                {selectedOptionIdx === null && !isSubmitted && 'Select an answer to proceed'}
              </div>

              {!isSubmitted ? (
                <button
                  disabled={selectedOptionIdx === null}
                  onClick={handleSubmitAnswer}
                  className="premium-btn-primary px-6 py-2.5 rounded-xl text-white font-bold text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-glow-cyan cursor-pointer group/btn"
                >
                  <span className="shimmer-sweep" />
                  <span className="relative z-10">Confirm Telemetry Answer</span>
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="premium-btn-primary px-6 py-2.5 rounded-xl text-white font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-glow-cyan cursor-pointer group/btn"
                >
                  <span className="shimmer-sweep" />
                  <span className="relative z-10">{currentQIdx < quizData.questions.length - 1 ? 'Next Challenge' : 'Complete Evaluation'}</span>
                  <ArrowRight className="w-4 h-4 relative z-10" />
                </button>
              )}
            </div>

          </div>
        ) : (
          /* ═══ 3. QUIZ COMPLETED SUMMARY SCREEN ═══ */
          <div className="text-center space-y-6 py-4 animate-fade-in">
            {/* Luminous Certification Ring */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin-slow" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600/30 to-emerald-500/30 border border-cyan-400/60 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.4)]">
                <Award className="w-7 h-7 text-amber-300" />
                <span className="text-[11px] font-mono font-bold text-white mt-0.5">
                  {percentScore}%
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
                Evaluation Complete • NASA Level Verified
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight font-display">
                {percentScore >= 80 ? 'Flight Specialist Certification' : 'Mission Trainee Debrief'}
              </h3>
              <p className="text-slate-300 text-xs max-w-md mx-auto">
                You correctly resolved <strong className="text-cyan-300">{quizScore} of {quizData.questions.length}</strong> scientific mission scenarios.
              </p>
            </div>

            {/* Performance Metric Badges */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left text-xs font-mono">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[9px] text-slate-400 block uppercase">Accuracy</span>
                <span className="text-base font-bold text-cyan-300">{percentScore}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[9px] text-slate-400 block uppercase">Discovery Reward</span>
                <span className="text-base font-bold text-emerald-300">+{quizScore * 50} XP</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleResetQuiz}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs transition-all shadow-[0_0_16px_rgba(37,99,235,0.4)] cursor-pointer"
              >
                Return to Mission Exploration
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AIQuizModal;
