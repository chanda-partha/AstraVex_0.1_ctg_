import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AIQuizPayload, QuizQuestion } from '../../types';
import {
  CheckCircle,
  XCircle,
  Award,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Flame,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/soundEffects';
import { QuizModalSkeleton } from '../skeleton/QuizModalSkeleton';
import { ModalShell, Button, Badge, Stat } from '../ui';
import { useTourSpotlight } from '../../guide/tourEngine';

interface AIQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizData: AIQuizPayload | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onNewRound?: () => void;
  onAskAstra?: (prompt: string) => void;
  onAnswerQuestion: (isCorrect: boolean, reward: number, penalty: number) => void;
}

export const AIQuizModal: React.FC<AIQuizModalProps> = ({
  isOpen,
  onClose,
  quizData,
  isLoading = false,
  error = null,
  onRetry,
  onNewRound,
  onAskAstra,
  onAnswerQuestion,
}) => {
  const [currentQIdx, setCurrentQIdx] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [missedIds, setMissedIds] = useState<string[]>([]);
  const [reviewOnlyMissed, setReviewOnlyMissed] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [bankedThisRound, setBankedThisRound] = useState<number>(0);

  const awardedKeysRef = useRef<Set<string>>(new Set());
  const quizSpotlight = useTourSpotlight('modal-quiz');

  useEffect(() => {
    setCurrentQIdx(0);
    setSelectedOptionIdx(null);
    setIsSubmitted(false);
    setQuizScore(0);
    setStreak(0);
    setBestStreak(0);
    setMissedIds([]);
    setReviewOnlyMissed(false);
    setIsCompleted(false);
    setBankedThisRound(0);
  }, [isOpen, quizData]);

  const activeQuestions: QuizQuestion[] = useMemo(() => {
    if (!quizData?.questions?.length) return [];
    if (reviewOnlyMissed && missedIds.length > 0) {
      const subset = quizData.questions.filter((q) => missedIds.includes(q.id));
      if (subset.length > 0) return subset;
    }
    return quizData.questions;
  }, [quizData, reviewOnlyMissed, missedIds]);

  const safeQIdx = activeQuestions.length > 0 ? Math.min(currentQIdx, activeQuestions.length - 1) : 0;
  const currentQ = activeQuestions[safeQIdx];

  const handleSubmitAnswer = () => {
    if (selectedOptionIdx === null || !currentQ || !quizData || isSubmitted) return;
    setIsSubmitted(true);

    const isCorrect = selectedOptionIdx === currentQ.correctIndex;
    const rewardKey = `${quizData.missionId || quizData.destination || 'mission'}::${currentQ.id}`;
    const alreadyAwarded = awardedKeysRef.current.has(rewardKey);

    if (isCorrect) {
      soundFx.playSuccess();
      setQuizScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setMissedIds((prev) => prev.filter((id) => id !== currentQ.id));
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#9DB4D3', '#34d399', '#D9774B'],
      });
    } else {
      soundFx.playWarning();
      setStreak(0);
      setMissedIds((prev) => (prev.includes(currentQ.id) ? prev : [...prev, currentQ.id]));
    }

    if (!alreadyAwarded) {
      awardedKeysRef.current.add(rewardKey);
      if (isCorrect) {
        setBankedThisRound((prev) => prev + 50);
      }
      onAnswerQuestion(isCorrect, currentQ.healthReward, currentQ.healthPenalty);
    }
  };

  const handleNextQuestion = () => {
    soundFx.playClick();
    if (safeQIdx < activeQuestions.length - 1) {
      setCurrentQIdx(safeQIdx + 1);
      setSelectedOptionIdx(null);
      setIsSubmitted(false);
    } else {
      setIsCompleted(true);
      soundFx.playSuccess();
    }
  };

  const keyStateRef = useRef({
    currentQ,
    isSubmitted,
    selectedOptionIdx,
    handleSubmitAnswer,
    handleNextQuestion,
  });
  keyStateRef.current = {
    currentQ,
    isSubmitted,
    selectedOptionIdx,
    handleSubmitAnswer,
    handleNextQuestion,
  };

  // Keyboard shortcuts: A-D or 1-4 to pick option, Enter to submit/next
  useEffect(() => {
    if (!isOpen || isLoading || isCompleted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const latest = keyStateRef.current;
      if (!latest.currentQ) return;
      const key = e.key.toUpperCase();
      const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, A: 0, B: 1, C: 2, D: 3 };
      if (!latest.isSubmitted && key in map && map[key] < latest.currentQ.options.length) {
        soundFx.playClick();
        setSelectedOptionIdx(map[key]);
      } else if (e.key === 'Enter') {
        if (!latest.isSubmitted && latest.selectedOptionIdx !== null) {
          e.preventDefault();
          latest.handleSubmitAnswer();
        } else if (latest.isSubmitted) {
          e.preventDefault();
          latest.handleNextQuestion();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isLoading, isCompleted]);

  if (!isOpen) return null;

  if (isLoading && !quizData) {
    return <QuizModalSkeleton onClose={onClose} />;
  }

  if (error && !quizData) {
    return (
      <ModalShell
        id="quiz-error-modal"
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        eyebrow="Mission quiz"
        title="Evaluation unavailable"
        statusBadge={{ label: 'Offline', tone: 'danger' }}
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-400/35 text-red-300 mx-auto flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {error || 'Unable to load the mission quiz right now.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            {onRetry && (
              <Button variant="primary" size="md" onClick={onRetry} icon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry
              </Button>
            )}
            <Button variant="secondary" size="md" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </ModalShell>
    );
  }

  if (!quizData || !activeQuestions.length || !currentQ) {
    return (
      <ModalShell
        id="quiz-empty-modal"
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        eyebrow="Mission quiz"
        title="No quiz questions available"
      >
        <div className="space-y-4 text-center py-2">
          <p className="text-xs sm:text-sm text-slate-300">
            No evaluation questions are registered for this hardware payload.
          </p>
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </ModalShell>
    );
  }

  const theaterDisplay =
    quizData.destination === 'DeepSpace' ? 'Deep Space & Orbital' : quizData.destination || 'Mission Theater';
  const rewardKey = `${quizData.missionId || quizData.destination || 'mission'}::${currentQ.id}`;
  const alreadyAwarded = awardedKeysRef.current.has(rewardKey);

  const handleResetQuiz = (onlyMissed = false) => {
    soundFx.playClick();
    setReviewOnlyMissed(onlyMissed);
    setCurrentQIdx(0);
    setSelectedOptionIdx(null);
    setIsSubmitted(false);
    setQuizScore(0);
    setStreak(0);
    setIsCompleted(false);
    setBankedThisRound(0);
  };

  const percentScore = Math.round((quizScore / activeQuestions.length) * 100);
  const badgeTitle = quizData.specialtyBadge || `${theaterDisplay} Specialist`;

  return (
    <ModalShell
      id="mission-quiz-modal"
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      eyebrow={`Mission Certification · ${theaterDisplay}`}
      title={quizData.quizTitle || 'Mission knowledge check'}
      statusBadge={{ label: '+50 XP per question', tone: 'success' }}
    >
      <div className={`rounded-2xl p-2 -m-2 ${quizSpotlight.className}`}>
        {!isCompleted ? (
          <div className="space-y-4">
            {/* Progress & Streak Header */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300">
                <span>
                  Question <strong className="text-white">{safeQIdx + 1}</strong> of{' '}
                  <strong className="text-white">{activeQuestions.length}</strong>
                </span>
                <div className="flex items-center gap-2.5">
                  {streak >= 2 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-300 font-semibold">
                      <Flame className="w-3 h-3" />
                      <span>{streak}x Streak</span>
                    </span>
                  )}
                  <span>
                    Score: <strong className="text-emerald-400">{quizScore}</strong>
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--accent-primary)] h-full rounded-full transition-all duration-300"
                  style={{ width: `${((safeQIdx + 1) / activeQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Box */}
            <div className="p-4 sm:p-5 rounded-xl hud-well space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 hud-eyebrow">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{currentQ.topic || 'Mission Science'}</span>
                </div>
                <Badge tone="neutral">{currentQ.difficulty || 'Specialist'}</Badge>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOptionIdx === idx;
                const isCorrectAnswer = idx === currentQ.correctIndex;
                const letter = String.fromCharCode(65 + idx);

                let cardStyle = 'hud-well hover:border-slate-600 text-slate-200';
                let badgeStyle = 'bg-slate-900 border-slate-700 text-slate-300';

                if (isSelected) {
                  cardStyle = 'bg-[var(--accent-surface)] border-[var(--accent-border)] text-white font-medium';
                  badgeStyle = 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-slate-950 font-bold';
                }

                if (isSubmitted) {
                  if (isCorrectAnswer) {
                    cardStyle = 'bg-emerald-500/15 border-emerald-400/50 text-emerald-100 font-semibold';
                    badgeStyle = 'bg-emerald-500/30 border-emerald-400/60 text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrectAnswer) {
                    cardStyle = 'bg-red-500/15 border-red-400/50 text-red-100';
                    badgeStyle = 'bg-red-500/30 border-red-400/60 text-red-200';
                  } else {
                    cardStyle = 'bg-slate-950/50 border-slate-800/60 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => {
                      if (isSubmitted) return;
                      soundFx.playClick();
                      setSelectedOptionIdx(idx);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-colors flex items-center justify-between gap-3 cursor-pointer ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono text-xs flex-shrink-0 ${badgeStyle}`}
                      >
                        {letter}
                      </span>
                      <span className="leading-snug">{option}</span>
                    </div>

                    {isSubmitted && isCorrectAnswer && (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-semibold flex-shrink-0">
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Correct</span>
                      </div>
                    )}
                    {isSubmitted && isSelected && !isCorrectAnswer && (
                      <div className="flex items-center gap-1.5 text-red-400 text-xs font-mono font-semibold flex-shrink-0">
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Incorrect</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Box */}
            {isSubmitted && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  selectedOptionIdx === currentQ.correctIndex
                    ? 'bg-emerald-950/40 border-emerald-500/35 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/35 text-red-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono font-semibold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {selectedOptionIdx === currentQ.correctIndex
                        ? alreadyAwarded
                          ? 'Verified · Practice review (XP awarded)'
                          : 'Verified · +10 O₂ & +50 XP'
                        : alreadyAwarded
                          ? 'Correction · Practice review'
                          : 'Correction · -5 O₂'}
                    </span>
                  </div>
                  {onAskAstra && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onClose();
                        onAskAstra(
                          `[${theaterDisplay.toUpperCase()} QUIZ CLARIFICATION]\nQuestion: ${currentQ.question}\nVerified Answer: ${currentQ.options[currentQ.correctIndex]}\nExplain why this is true in detail.`
                        );
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-200 hover:text-white underline cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Ask Astra why</span>
                    </button>
                  )}
                </div>
                <p className="text-slate-200 leading-relaxed text-xs sm:text-sm">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800/80 gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                {selectedOptionIdx === null && !isSubmitted
                  ? 'Keys A–D or 1–4 · Enter to submit'
                  : 'Press Enter to continue'}
              </span>

              {!isSubmitted ? (
                <Button
                  variant="primary"
                  size="md"
                  disabled={selectedOptionIdx === null}
                  onClick={handleSubmitAnswer}
                >
                  Check answer
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextQuestion}
                  iconRight={<ArrowRight className="w-4 h-4" />}
                >
                  {safeQIdx < activeQuestions.length - 1 ? 'Next question' : 'View results'}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-5 py-3">
            <div className="w-20 h-20 rounded-2xl hud-well mx-auto flex flex-col items-center justify-center border border-[var(--accent-border)]">
              <Award className="w-7 h-7 text-amber-300" />
              <span className="text-xs font-mono font-semibold text-white mt-1">
                {percentScore}%
              </span>
            </div>

            <div className="space-y-1.5">
              <Badge tone={percentScore >= 80 ? 'success' : 'accent'}>
                {percentScore >= 80 ? `${badgeTitle} Certified` : `${theaterDisplay} Debrief`}
              </Badge>
              <h3 className="text-xl font-bold text-white tracking-tight font-display pt-1">
                {percentScore >= 80 ? 'Specialist Qualification Unlocked' : 'Mission Evaluation Complete'}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
                You verified <strong className="text-white">{quizScore} of {activeQuestions.length}</strong> mission briefings cleanly (best streak: {bestStreak}x).
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto text-left">
              <Stat label="Accuracy" value={`${percentScore}%`} mono />
              <Stat label="Best Streak" value={`${bestStreak}x`} mono />
              <Stat label="Earned XP" value={`+${bankedThisRound} XP`} mono />
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 pt-2">
              {missedIds.length > 0 && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleResetQuiz(true)}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Review {missedIds.length} missed
                </Button>
              )}
              {onNewRound && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    soundFx.playClick();
                    onNewRound();
                  }}
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  New question round
                </Button>
              )}
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleResetQuiz(false)}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retake
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
              >
                Return to exploration
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export default AIQuizModal;
