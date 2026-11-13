import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Check,
  ChevronRight,
  Database,
  FlaskConical,
  Menu,
  MoreHorizontal,
  Music,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { DestinationType, ScreenType } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { audioManager, AudioState } from '../../audio/AudioManager';
import { tourEngine, useTourState } from '../../guide/tourEngine';
import { THEATER_META } from '../../utils/missionCatalog';

const STEP_INDEX: Record<ScreenType, number> = {
  home: 0,
  destination: 1,
  launch: 2,
  landing: 3,
  exploration: 4,
  registry: 5,
};

interface NavbarProps {
  currentScreen: ScreenType;
  maxReachedScreen: ScreenType;
  selectedDestination: DestinationType;
  activeMissionId?: string;
  activeMissionName?: string;
  isAiChatOpen: boolean;
  onNavigate: (screen: ScreenType) => void;
  onToggleAiChat: () => void;
  onOpenRegistry: () => void;
  onOpenSimulators: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  maxReachedScreen,
  selectedDestination,
  activeMissionId = 'perseverance',
  activeMissionName,
  isAiChatOpen,
  onNavigate,
  onToggleAiChat,
  onOpenRegistry,
  onOpenSimulators,
}) => {
  const [isSfxMuted, setIsSfxMuted] = useState(soundFx.isMuted());
  const [audioState, setAudioState] = useState<AudioState>(() => audioManager.getState());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toolsPopoverRef = useRef<HTMLDivElement>(null);

  const tourState = useTourState();

  useEffect(() => {
    const unsubAudio = audioManager.subscribe(setAudioState);
    const unsubSfx = soundFx.subscribe(setIsSfxMuted);
    return () => {
      unsubAudio();
      unsubSfx();
    };
  }, []);

  const handleToggleSfx = () => {
    soundFx.toggleMute();
  };

  const replayContextualNarration = () => {
    audioManager.handleUserGesture();
    if (audioManager.getState().isVoiceMuted) {
      audioManager.toggleVoice();
    }
    tourEngine.setTourEnabled(true);
    if (currentScreen === 'exploration' && activeMissionId) {
      tourEngine.playMissionBriefing(activeMissionId, { force: true });
    } else {
      tourEngine.playScreenStage(currentScreen, selectedDestination, { force: true });
    }
  };

  const handleToggleNarration = () => {
    soundFx.playClick();
    if (tourState.tourEnabled && !audioState.isVoiceMuted) {
      tourEngine.setTourEnabled(false);
    } else {
      replayContextualNarration();
    }
  };

  const handleNav = (screen: ScreenType) => {
    soundFx.playClick();
    onNavigate(screen);
    setIsMobileMenuOpen(false);
  };

  const closeToolsPopover = () => {
    const el = toolsPopoverRef.current as (HTMLDivElement & { hidePopover?: () => void }) | null;
    try {
      el?.hidePopover?.();
    } catch (_) {}
  };

  const theaterMeta = THEATER_META[selectedDestination] || THEATER_META.Mars;

  const journeySteps: { screen: ScreenType; label: string }[] = [
    { screen: 'destination', label: 'Missions' },
    { screen: 'launch', label: 'Launch' },
    { screen: 'landing', label: theaterMeta.stepThreeLabel },
    { screen: 'exploration', label: '3D World' },
  ];

  const currentOrder = STEP_INDEX[currentScreen];
  const maxOrder = Math.max(currentOrder, STEP_INDEX[maxReachedScreen]);
  const isHome = currentScreen === 'home';
  const isNarrationOn = tourState.tourEnabled && !audioState.isVoiceMuted;
  const isMusicOn = !audioState.isMusicMuted;

  const shortMissionLabel = activeMissionName
    ? activeMissionName.split('(')[0].trim()
    : selectedDestination === 'Mars'
      ? 'Perseverance'
      : selectedDestination === 'DeepSpace'
        ? 'JWST'
        : 'Apollo 11';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 select-none">
        <div
          className={`transition-colors duration-200 ${
            isHome
              ? 'bg-gradient-to-b from-[#07090F]/90 to-transparent border-b border-transparent'
              : 'bg-[#07090F]/88 backdrop-blur-xl border-b border-white/[0.08] shadow-header'
          }`}
        >
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            {/* 1. LEFT: Brand Identity */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleNav('home')}
                className="flex items-center gap-2.5 cursor-pointer group text-left"
                title="Return to home"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900/90 border border-white/[0.10] p-1.5 flex items-center justify-center transition-all duration-200 group-hover:border-[var(--accent-border)] group-hover:scale-105 group-hover:shadow-[0_0_16px_-4px_var(--accent-border)]">
                  <img
                    src="/astravex_logo.png"
                    alt="AstraVex"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-bold text-sm tracking-wider font-orbitron text-slate-50 group-hover:text-white transition-colors">
                  AstraVex
                </span>
              </button>

              {/* Destination & Active Mission Chip (shown after Home) */}
              {!isHome && (
                <button
                  type="button"
                  onClick={() => handleNav('destination')}
                  className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] hover:border-white/20 text-xs text-slate-200 transition-all duration-150 hover:-translate-y-[0.5px] cursor-pointer"
                  title="Change destination or mission"
                >
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] live-beacon" />
                  <span className="font-medium text-slate-100">{theaterMeta.shortLabel}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300 truncate max-w-[140px]">{shortMissionLabel}</span>
                </button>
              )}
            </div>

            {/* 2. CENTER: Progressive Step Indicator (shown after Home) */}
            {!isHome && (
              <nav
                aria-label="Mission progress"
                className="hidden lg:flex items-center gap-1 p-1 rounded-lg bg-slate-900/75 border border-white/[0.08]"
              >
                {journeySteps.map(({ screen, label }, idx) => {
                  const stepOrder = STEP_INDEX[screen];
                  const isCurrent = currentScreen === screen;
                  const isCompleted = stepOrder < currentOrder;
                  const isUnlocked = stepOrder <= maxOrder;

                  return (
                    <React.Fragment key={screen}>
                      {idx > 0 && (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      )}
                      <button
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => isUnlocked && handleNav(screen)}
                        aria-current={isCurrent ? 'step' : undefined}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-slate-800/95 text-slate-50 border border-[var(--accent-border-subtle)] shadow-[0_2px_10px_-4px_var(--accent-border),inset_0_1px_0_rgba(255,255,255,0.10)]'
                            : isUnlocked
                              ? 'text-slate-300 hover:text-white hover:bg-white/[0.05] cursor-pointer'
                              : 'text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3 h-3 text-[var(--accent-primary)]" />
                        ) : (
                          <span className="font-mono text-xs text-slate-400">{idx + 1}</span>
                        )}
                        <span>{label}</span>
                      </button>
                    </React.Fragment>
                  );
                })}
              </nav>
            )}

            {/* 3. RIGHT: Ask Astra & Overflow Menu */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Unified AI Assistant Trigger ("Ask Astra") */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onToggleAiChat();
                }}
                aria-expanded={isAiChatOpen}
                className={`group h-9 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 hover:-translate-y-[0.5px] cursor-pointer ${
                  isAiChatOpen
                    ? 'bg-[var(--accent-surface)] border-[var(--accent-border)] text-[var(--accent-text)] shadow-[0_0_16px_-4px_var(--accent-border)]'
                    : 'bg-slate-900/80 hover:bg-slate-800/90 border-white/[0.08] hover:border-[var(--accent-border-subtle)] text-slate-200 hover:text-white'
                }`}
                title="Ask Astra AI assistant"
              >
                <Bot className="w-3.5 h-3.5 text-[var(--accent-primary)] transition-transform duration-200 group-hover:scale-110" />
                <span>Ask Astra</span>
              </button>

              {/* Secondary Tools & Audio Settings Popover Trigger */}
              <button
                type="button"
                className="hidden lg:flex w-9 h-9 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] text-slate-300 hover:text-white items-center justify-center transition-colors cursor-pointer"
                style={{ anchorName: '--tools-anchor' } as React.CSSProperties}
                {...({ popovertarget: 'tools-popover' } as Record<string, string>)}
                title="More tools and audio settings"
                aria-label="More tools and audio settings"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Native Popover Menu */}
              <div
                ref={toolsPopoverRef}
                id="tools-popover"
                {...({ popover: 'auto' } as Record<string, string>)}
              >
                <div className="space-y-1 text-xs">
                  <div className="px-2.5 py-1 text-xs font-medium text-slate-400">
                    Reference &amp; labs
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      closeToolsPopover();
                      onOpenSimulators();
                    }}
                    className="w-full px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-slate-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-[var(--accent-primary)]" />
                      <span>Science lab</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      closeToolsPopover();
                      onOpenRegistry();
                    }}
                    className="w-full px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-slate-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-400" />
                      <span>Data registry</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <div className="my-1.5 border-t border-white/[0.08]" />

                  <div className="px-2.5 py-1 text-xs font-medium text-slate-400">
                    Audio &amp; narration
                  </div>

                  {/* Voice Narration Toggle + Volume */}
                  <div className="px-2.5 py-2 rounded-lg bg-slate-900/70 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-200">
                        {isNarrationOn ? (
                          <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-500" />
                        )}
                        <span>Voice narration</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleNarration}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 cursor-pointer"
                      >
                        {isNarrationOn ? 'On' : 'Off'}
                      </button>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={isNarrationOn ? audioState.voiceVolume : 0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNarrationOn && v > 0) {
                          if (audioState.isVoiceMuted) audioManager.toggleVoice();
                          tourEngine.setTourEnabled(true);
                        }
                        audioManager.setVoiceVolume(v);
                      }}
                      aria-label="Voice narration volume"
                      className="w-full telemetry-range"
                    />
                  </div>

                  {/* Replay Current Step Narration */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      closeToolsPopover();
                      replayContextualNarration();
                    }}
                    className="w-full px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-slate-400" />
                      <span>Replay step narration</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Background Music Toggle + Volume */}
                  <div className="px-2.5 py-2 rounded-lg bg-slate-900/70 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-200">
                        <Music className="w-4 h-4 text-slate-400" />
                        <span>Ambient music</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          audioManager.toggleMusic();
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        {isMusicOn ? (
                          <>
                            <Pause className="w-3 h-3" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            <span>Play</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={isMusicOn ? audioState.musicVolume : 0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isMusicOn && v > 0) {
                          audioManager.toggleMusic();
                        }
                        audioManager.setMusicVolume(v);
                      }}
                      aria-label="Music volume"
                      className="w-full telemetry-range"
                    />
                  </div>

                  {/* Sound Effects Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleSfx}
                    className="w-full px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {isSfxMuted ? (
                        <VolumeX className="w-4 h-4 text-slate-500" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-slate-400" />
                      )}
                      <span>Interface sound effects</span>
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {isSfxMuted ? 'Off' : 'On'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="lg:hidden w-9 h-9 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE / TABLET NAVIGATION SHEET */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="absolute top-14 left-0 right-0 p-4 max-h-[calc(100dvh-56px)] overflow-y-auto">
            <div className="hud-modal rounded-2xl p-4 space-y-4">
              {/* Destination Summary */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                  <span className="font-medium text-slate-100">{theaterMeta.shortLabel}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">{shortMissionLabel}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNav('destination')}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Change destination
                </button>
              </div>

              {/* Progressive Steps */}
              <div className="space-y-1">
                {journeySteps.map(({ screen, label }, idx) => {
                  const stepOrder = STEP_INDEX[screen];
                  const isCurrent = currentScreen === screen;
                  const isUnlocked = stepOrder <= maxOrder;
                  return (
                    <button
                      key={screen}
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => isUnlocked && handleNav(screen)}
                      className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        isCurrent
                          ? 'bg-slate-800 text-white border border-white/[0.10]'
                          : isUnlocked
                            ? 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                            : 'text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="font-mono text-xs text-slate-400">{idx + 1}.</span>
                        <span>{label}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  );
                })}
              </div>

              {/* Tools & Audio */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setIsMobileMenuOpen(false);
                    onOpenSimulators();
                  }}
                  className="p-2.5 rounded-lg hud-well text-slate-200 flex items-center justify-center gap-2 text-xs font-medium"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>Science lab</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setIsMobileMenuOpen(false);
                    onOpenRegistry();
                  }}
                  className="p-2.5 rounded-lg hud-well text-slate-200 flex items-center justify-center gap-2 text-xs font-medium"
                >
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span>Data registry</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleNarration}
                  className="p-2.5 rounded-lg hud-well text-slate-200 flex items-center justify-center gap-2 text-xs font-medium"
                >
                  {isNarrationOn ? (
                    <Volume2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>Narration: {isNarrationOn ? 'On' : 'Off'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    audioManager.toggleMusic();
                  }}
                  className="p-2.5 rounded-lg hud-well text-slate-200 flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
                >
                  <Music className="w-3.5 h-3.5 text-slate-400" />
                  <span>Music: {isMusicOn ? 'On' : 'Off'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleSfx}
                  className="p-2.5 rounded-lg hud-well text-slate-200 flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
                >
                  {isSfxMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>SFX: {isSfxMuted ? 'Off' : 'On'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setIsMobileMenuOpen(false);
                    replayContextualNarration();
                  }}
                  className="p-2.5 rounded-lg hud-well text-slate-200 flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Replay voice</span>
                </button>
              </div>

              {/* Mobile Volume Sliders */}
              <div className="space-y-2.5 pt-2 border-t border-white/[0.08] text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 w-24 shrink-0">Voice volume</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={isNarrationOn ? audioState.voiceVolume : 0}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNarrationOn && v > 0) {
                        if (audioState.isVoiceMuted) audioManager.toggleVoice();
                        tourEngine.setTourEnabled(true);
                      }
                      audioManager.setVoiceVolume(v);
                    }}
                    aria-label="Mobile voice narration volume"
                    className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 w-24 shrink-0">Music volume</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={isMusicOn ? audioState.musicVolume : 0}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isMusicOn && v > 0) {
                        audioManager.toggleMusic();
                      }
                      audioManager.setMusicVolume(v);
                    }}
                    aria-label="Mobile ambient music volume"
                    className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
