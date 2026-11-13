import React, { useState, useEffect, useCallback } from 'react';
import { AIStoryPayload, ResolvedNasaPayload } from '../../types';
import { Play, Pause, Square, Sparkles, Volume2, AlertCircle, RefreshCw, MessageSquare, Clock } from 'lucide-react';
import { StoryModalSkeleton } from '../skeleton/StoryModalSkeleton';
import { ModalShell, Button, IconButton } from '../ui';
import { elonVoice } from '../../elon/ElonVoice';
import { audioManager } from '../../audio/AudioManager';
import { tourEngine, useTourSpotlight } from '../../guide/tourEngine';
import { soundFx } from '../../utils/soundEffects';

interface AIStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyData: AIStoryPayload | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onAskAstra?: (prompt: string) => void;
  resolvedData: ResolvedNasaPayload | null;
}

export const AIStoryModal: React.FC<AIStoryModalProps> = ({
  isOpen,
  onClose,
  storyData,
  isLoading = false,
  error = null,
  onRetry,
  onAskAstra,
  resolvedData,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const storySpotlight = useTourSpotlight('modal-story');

  const stopStoryVoice = useCallback(() => {
    elonVoice.stop();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopStoryVoice();
    }
    return () => {
      stopStoryVoice();
    };
  }, [isOpen, storyData?.title, stopStoryVoice]);

  if (!isOpen) return null;

  if (isLoading && !storyData) {
    return <StoryModalSkeleton onClose={onClose} />;
  }

  if (error && !storyData) {
    return (
      <ModalShell
        id="story-error-modal"
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        eyebrow="Mission story"
        title="Story dossier unavailable"
        statusBadge={{ label: 'Offline', tone: 'danger' }}
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-400/35 text-red-300 mx-auto flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {error || 'Unable to load the mission story dossier right now.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            {onRetry && (
              <Button
                variant="primary"
                size="md"
                onClick={onRetry}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
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

  if (!storyData) {
    return (
      <ModalShell
        id="story-empty-modal"
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        eyebrow="Mission story"
        title="No story dossier available"
      >
        <div className="space-y-4 text-center py-2">
          <p className="text-xs sm:text-sm text-slate-300">
            No story dossier was found for this active hardware item.
          </p>
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </ModalShell>
    );
  }

  const handlePlayVoice = () => {
    if (!elonVoice.isAvailable()) return;

    audioManager.handleUserGesture();
    if (audioManager.getState().isVoiceMuted) {
      audioManager.toggleVoice();
    }
    tourEngine.stopAudioOnly();

    if (isPaused) {
      elonVoice.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    const fullText =
      `${storyData.title}. ${storyData.subtitle || ''}. ` +
      storyData.paragraphs.map((p) => `${p.heading}. ${p.content}`).join(' ');

    elonVoice.speak(
      fullText,
      {
        onStart: () => {
          setIsPlaying(true);
          setIsPaused(false);
        },
        onEnd: () => {
          setIsPlaying(false);
          setIsPaused(false);
        },
        onError: () => {
          setIsPlaying(false);
          setIsPaused(false);
        },
      },
      { pitch: 0.94, rate: 0.95 }
    );
  };

  const handlePauseVoice = () => {
    elonVoice.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStopVoice = () => {
    stopStoryVoice();
  };

  const wordCount = storyData.paragraphs.reduce(
    (acc, p) => acc + p.content.split(/\s+/).filter(Boolean).length,
    0
  );
  const readMinutes = Math.max(1, Math.round(wordCount / 160));
  const theaterLabel =
    resolvedData?.destination === 'Moon'
      ? 'Lunar Theater'
      : resolvedData?.destination === 'Mars'
        ? 'Mars Theater'
        : 'Deep Space Theater';

  return (
    <ModalShell
      id="mission-story-modal"
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      eyebrow={`Mission Story · ${theaterLabel}`}
      title={storyData.title}
      subtitle={`${storyData.subtitle} · ${readMinutes} min read`}
      statusBadge={{ label: 'NASA verified', tone: 'success' }}
    >
      <div className={`space-y-4 rounded-2xl p-2 -m-2 ${storySpotlight.className}`}>
        {/* Audio Story Narration Control Bar */}
        <div className="p-4 rounded-xl hud-well flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
              <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-emerald-400 animate-pulse' : ''}`} />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-white block">
                Audio story narration
              </span>
              <span className="text-xs text-slate-400">
                {isPlaying
                  ? 'Playing voice narration...'
                  : isPaused
                    ? 'Narration paused'
                    : 'Listen to this mission story'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePlayVoice}
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                {isPaused ? 'Resume' : 'Play narration'}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePauseVoice}
                icon={<Pause className="w-3.5 h-3.5 fill-current" />}
              >
                Pause
              </Button>
            )}

            {(isPlaying || isPaused) && (
              <IconButton
                size="sm"
                label="Stop narration"
                onClick={handleStopVoice}
              >
                <Square className="w-3.5 h-3.5" />
              </IconButton>
            )}
          </div>
        </div>

        {/* Story Paragraphs */}
        <div className="space-y-3">
          {storyData.paragraphs.map((para, idx) => (
            <div key={idx} className="p-4 rounded-xl hud-well space-y-1.5">
              <h3 className="text-sm font-semibold text-white font-display">
                {para.heading}
              </h3>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                {para.content}
              </p>
            </div>
          ))}
        </div>

        {/* Mission Science Highlights */}
        {storyData.funFacts && storyData.funFacts.length > 0 && (
          <div className="p-4 rounded-xl hud-well space-y-2.5">
            <div className="flex items-center gap-2 text-slate-200 text-xs font-semibold uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <span>Mission science highlights</span>
            </div>
            <ul className="space-y-1.5 text-slate-200 text-xs sm:text-sm">
              {storyData.funFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{storyData.paragraphs.length} chapters · ~{readMinutes} min read</span>
          </span>
          {onAskAstra && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                soundFx.playClick();
                onClose();
                onAskAstra(
                  `[MISSION STORY FOLLOW-UP: ${storyData.title}]\nExplain more fascinating engineering behind ${resolvedData?.hardware?.name || resolvedData?.mission?.name || 'this mission'}.`
                );
              }}
              icon={<MessageSquare className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
            >
              Discuss story with Astra
            </Button>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

export default AIStoryModal;
