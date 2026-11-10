import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Music,
  RotateCcw,
  Send,
  X,
  ChevronUp,
  ChevronDown,
  UserCheck,
  Compass,
  Radio,
  Sliders,
  Maximize2,
  Minimize2,
  Bot,
  Eye,
  EyeOff,
  GripHorizontal,
  Move
} from 'lucide-react';
import { elonConversation, ElonState } from './ElonConversation';
import { elonVoice } from './ElonVoice';
import { audioManager, AudioState } from '../audio/AudioManager';
import { DestinationType } from '../types';
import './ElonAssistant.css';

interface ElonAssistantProps {
  onStartMoonMission: () => void;
  onStartMarsMission: () => void;
  onOpenDestinations: () => void;
  currentDestination?: DestinationType;
}

export const ElonAssistant: React.FC<ElonAssistantProps> = ({
  onStartMoonMission,
  onStartMarsMission,
  onOpenDestinations,
  currentDestination = 'Mars'
}) => {
  // ELON conversation state
  const [elonState, setElonState] = useState<ElonState>(elonConversation.getState());
  // Audio state (music & voice)
  const [audioState, setAudioState] = useState<AudioState>(audioManager.getState());

  // UI Local States
  const [inputName, setInputName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [isControlsExpanded, setIsControlsExpanded] = useState<boolean>(false);
  const [isChatExpanded, setIsChatExpanded] = useState<boolean>(false);
  const [isDockMinimized, setIsDockMinimized] = useState<boolean>(false);
  const [isHudHidden, setIsHudHidden] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const prevStageRef = useRef(elonState.stage);

  // Draggable HUD Position State
  const [hudPos, setHudPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingHud, setIsDraggingHud] = useState<boolean>(false);
  const hudRef = useRef<HTMLDivElement>(null);
  const hudDragData = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  // Draggable Floating Dock Position State
  const [dockPos, setDockPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingDock, setIsDraggingDock] = useState<boolean>(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const dockDragData = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  // Draggable Name Identification Modal Position State
  const [nameModalPos, setNameModalPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingNameModal, setIsDraggingNameModal] = useState<boolean>(false);
  const nameModalRef = useRef<HTMLDivElement>(null);
  const nameModalDragData = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  // Pointer Handlers: Move Name Modal
  const handleNameModalPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('input, button, textarea, a, select')) return;

    const el = nameModalRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const currentX = nameModalPos ? nameModalPos.x : rect.left;
    const currentY = nameModalPos ? nameModalPos.y : rect.top;

    nameModalDragData.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: currentX,
      initY: currentY,
    };

    setIsDraggingNameModal(true);
    try {
      target.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleNameModalPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingNameModal || !nameModalDragData.current || !nameModalRef.current) return;

    const deltaX = e.clientX - nameModalDragData.current.startX;
    const deltaY = e.clientY - nameModalDragData.current.startY;

    const rect = nameModalRef.current.getBoundingClientRect();
    const maxX = Math.max(12, window.innerWidth - rect.width - 12);
    const maxY = Math.max(12, window.innerHeight - rect.height - 12);

    const nextX = Math.max(12, Math.min(maxX, nameModalDragData.current.initX + deltaX));
    const nextY = Math.max(12, Math.min(maxY, nameModalDragData.current.initY + deltaY));

    setNameModalPos({ x: nextX, y: nextY });
  };

  const handleNameModalPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingNameModal) return;
    setIsDraggingNameModal(false);
    nameModalDragData.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Pointer Handlers: Move HUD Card
  const handleHudPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a')) return;

    const el = hudRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const currentX = hudPos ? hudPos.x : rect.left;
    const currentY = hudPos ? hudPos.y : rect.top;

    hudDragData.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: currentX,
      initY: currentY,
    };

    setIsDraggingHud(true);
    try {
      target.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleHudPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingHud || !hudDragData.current || !hudRef.current) return;

    const deltaX = e.clientX - hudDragData.current.startX;
    const deltaY = e.clientY - hudDragData.current.startY;

    const rect = hudRef.current.getBoundingClientRect();
    const maxX = Math.max(12, window.innerWidth - rect.width - 12);
    const maxY = Math.max(12, window.innerHeight - rect.height - 12);

    const nextX = Math.max(12, Math.min(maxX, hudDragData.current.initX + deltaX));
    const nextY = Math.max(12, Math.min(maxY, hudDragData.current.initY + deltaY));

    setHudPos({ x: nextX, y: nextY });
  };

  const handleHudPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingHud) return;
    setIsDraggingHud(false);
    hudDragData.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Pointer Handlers: Move Dock
  const handleDockPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, form, select')) return;

    const el = dockRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const currentX = dockPos ? dockPos.x : rect.left;
    const currentY = dockPos ? dockPos.y : rect.top;

    dockDragData.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: currentX,
      initY: currentY,
    };

    setIsDraggingDock(true);
    try {
      target.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleDockPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingDock || !dockDragData.current || !dockRef.current) return;

    const deltaX = e.clientX - dockDragData.current.startX;
    const deltaY = e.clientY - dockDragData.current.startY;

    const rect = dockRef.current.getBoundingClientRect();
    const maxX = Math.max(12, window.innerWidth - rect.width - 12);
    const maxY = Math.max(12, window.innerHeight - rect.height - 12);

    const nextX = Math.max(12, Math.min(maxX, dockDragData.current.initX + deltaX));
    const nextY = Math.max(12, Math.min(maxY, dockDragData.current.initY + deltaY));

    setDockPos({ x: nextX, y: nextY });
  };

  const handleDockPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingDock) return;
    setIsDraggingDock(false);
    dockDragData.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Draggable Restore Pill State
  const [pillPos, setPillPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingPill, setIsDraggingPill] = useState<boolean>(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const pillDragData = useRef<{ startX: number; startY: number; initX: number; initY: number; hasMoved: boolean } | null>(null);

  const handlePillPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const el = pillRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const currentX = pillPos ? pillPos.x : rect.left;
    const currentY = pillPos ? pillPos.y : rect.top;

    pillDragData.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: currentX,
      initY: currentY,
      hasMoved: false,
    };

    setIsDraggingPill(true);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePillPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingPill || !pillDragData.current || !pillRef.current) return;

    const deltaX = e.clientX - pillDragData.current.startX;
    const deltaY = e.clientY - pillDragData.current.startY;

    if (Math.hypot(deltaX, deltaY) > 4) {
      pillDragData.current.hasMoved = true;
    }

    const rect = pillRef.current.getBoundingClientRect();
    const maxX = Math.max(12, window.innerWidth - rect.width - 12);
    const maxY = Math.max(12, window.innerHeight - rect.height - 12);

    const nextX = Math.max(12, Math.min(maxX, pillDragData.current.initX + deltaX));
    const nextY = Math.max(12, Math.min(maxY, pillDragData.current.initY + deltaY));

    setPillPos({ x: nextX, y: nextY });
  };

  const handlePillPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingPill) return;
    const didMove = pillDragData.current?.hasMoved;
    setIsDraggingPill(false);
    pillDragData.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    // If it was a simple click without dragging, unhide HUD
    if (!didMove) {
      setIsHudHidden(false);
    }
  };

  // Viewport resize guard to keep positions on-screen
  useEffect(() => {
    const handleResize = () => {
      if (hudPos && hudRef.current) {
        const rect = hudRef.current.getBoundingClientRect();
        const maxX = Math.max(12, window.innerWidth - rect.width - 12);
        const maxY = Math.max(12, window.innerHeight - rect.height - 12);
        setHudPos((prev) => prev ? { x: Math.min(prev.x, maxX), y: Math.min(prev.y, maxY) } : null);
      }
      if (dockPos && dockRef.current) {
        const rect = dockRef.current.getBoundingClientRect();
        const maxX = Math.max(12, window.innerWidth - rect.width - 12);
        const maxY = Math.max(12, window.innerHeight - rect.height - 12);
        setDockPos((prev) => prev ? { x: Math.min(prev.x, maxX), y: Math.min(prev.y, maxY) } : null);
      }
      if (nameModalPos && nameModalRef.current) {
        const rect = nameModalRef.current.getBoundingClientRect();
        const maxX = Math.max(12, window.innerWidth - rect.width - 12);
        const maxY = Math.max(12, window.innerHeight - rect.height - 12);
        setNameModalPos((prev) => prev ? { x: Math.min(prev.x, maxX), y: Math.min(prev.y, maxY) } : null);
      }
      if (pillPos && pillRef.current) {
        const rect = pillRef.current.getBoundingClientRect();
        const maxX = Math.max(12, window.innerWidth - rect.width - 12);
        const maxY = Math.max(12, window.innerHeight - rect.height - 12);
        setPillPos((prev) => prev ? { x: Math.min(prev.x, maxX), y: Math.min(prev.y, maxY) } : null);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hudPos, dockPos, nameModalPos, pillPos]);

  // Unhide automatically when a new stage transition begins
  useEffect(() => {
    if (prevStageRef.current !== elonState.stage) {
      prevStageRef.current = elonState.stage;
      setIsHudHidden(false);
    }
  }, [elonState.stage]);

  // Subscribe to ELON conversation state
  useEffect(() => {
    const unsubElon = elonConversation.subscribe((state) => {
      setElonState(state);
    });
    return unsubElon;
  }, []);

  // Subscribe to Audio manager state
  useEffect(() => {
    const unsubAudio = audioManager.subscribe((state) => {
      setAudioState(state);
    });
    return unsubAudio;
  }, []);

  // Auto-focus name input when popup opens
  useEffect(() => {
    if (elonState.isNamePopupOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [elonState.isNamePopupOpen]);

  // Auto-start ELON AI 1st welcome sequence a few seconds after user enters the project
  useEffect(() => {
    const autoStartTimer = setTimeout(() => {
      if (elonConversation.getState().stage === 'idle') {
        elonConversation.startWelcome();
      }
    }, 2500); // 2.5 second cinematic delay after entry

    return () => clearTimeout(autoStartTimer);
  }, []);

  // Handle Name Confirmation (Step 2)
  const handleConfirmName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputName.trim();
    if (!clean) {
      setNameError('Please enter your name or callsign to proceed, explorer.');
      return;
    }
    if (clean.length < 2) {
      setNameError('Name must be at least 2 characters.');
      return;
    }
    setNameError('');
    elonConversation.confirmVisitorName(clean);
  };

  // Handle Custom Question Submission
  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = chatInput.trim();
    if (!clean) return;
    setChatInput('');
    elonConversation.sendUserQuestion(clean, { destination: currentDestination });
  };

  return (
    <>
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 1. STEP 2 MODAL: FUTURISTIC NAME IDENTIFICATION POPUP                 */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {elonState.isNamePopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none animate-fade-in pointer-events-auto">
          <div
            ref={nameModalRef}
            style={nameModalPos ? {
              left: `${nameModalPos.x}px`,
              top: `${nameModalPos.y}px`,
              position: 'fixed',
              transform: 'none',
              margin: 0
            } : undefined}
            onPointerDown={handleNameModalPointerDown}
            onPointerMove={handleNameModalPointerMove}
            onPointerUp={handleNameModalPointerUp}
            onDoubleClick={() => setNameModalPos(null)}
            className="relative w-full max-w-md elon-modal-glass p-6 sm:p-8 rounded-3xl space-y-5 text-center shadow-2xl overflow-hidden border border-cyan-400/30 cursor-grab active:cursor-grabbing"
            title="Click and drag with mouse pointer to move modal anywhere (double-click to reset position)"
          >
            {/* Holographic Top Accent Rim */}
            <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[2px] pointer-events-none" />

            {/* Top Drag Indicator & Reset */}
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80 -mt-2 pb-1">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04] border border-cyan-400/25">
                <GripHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span>DRAG TO MOVE</span>
              </div>
              {nameModalPos && (
                <button
                  type="button"
                  onClick={() => setNameModalPos(null)}
                  className="text-slate-400 hover:text-cyan-300 text-[10px] font-mono transition-colors cursor-pointer"
                  title="Reset to center position"
                >
                  RESET POS
                </button>
              )}
            </div>

            {/* Glowing Spacecraft AI Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.4)] elon-orb-active">
              <Sparkles className="w-8 h-8 text-cyan-300" />
            </div>

            {/* Modal Header */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-orbitron font-extrabold tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent uppercase">
                IDENTIFY YOURSELF
              </h2>
              <p className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                ASTRAVEX MISSION CONTROL
              </p>
            </div>

            {/* Subtitle Dialogue */}
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              "Before we begin our journey, may I know your name?"
            </p>

            {/* Input Form */}
            <form onSubmit={handleConfirmName} className="space-y-4 pt-1">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputName}
                  onChange={(e) => {
                    setInputName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  placeholder="Enter your name, explorer..."
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.05] border border-cyan-400/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 text-white placeholder-slate-400 text-sm font-sans tracking-wide transition-all shadow-inner"
                  maxLength={40}
                  autoComplete="off"
                />
              </div>

              {/* Error Message */}
              {nameError && (
                <p className="text-xs text-rose-400 font-mono tracking-wide animate-fade-in">
                  {nameError}
                </p>
              )}

              {/* Confirm Identity Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-orbitron font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(56,189,248,0.4)] hover:shadow-[0_0_35px_rgba(56,189,248,0.6)] cursor-pointer transition-all duration-200 active:scale-[0.98]"
              >
                <UserCheck className="w-4 h-4" />
                <span>CONFIRM IDENTITY</span>
              </button>
            </form>

            {/* Privacy notice */}
            <p className="text-[10px] font-mono text-slate-500 tracking-wider">
              TEMPORARY SESSION STATE · NO REGISTRATION OR PERMANENT ACCOUNT REQUIRED
            </p>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 2. SUBTITLES & MISSION BRIEFING HUD (FLOATING BOTTOM CENTER)          */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {elonState.subtitles && !elonState.isNamePopupOpen && !isHudHidden && (
        <div
          ref={hudRef}
          style={hudPos ? {
            left: `${hudPos.x}px`,
            top: `${hudPos.y}px`,
            bottom: 'auto',
            transform: 'none',
            maxWidth: 'min(672px, calc(100vw - 24px))',
            position: 'fixed'
          } : undefined}
          className={`fixed z-30 w-full max-w-2xl px-4 pointer-events-none select-none animate-fade-in ${
            hudPos ? '' : 'bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2'
          }`}
        >
          <div className="elon-subtitle-box rounded-2xl p-4 sm:p-5 pointer-events-auto shadow-2xl transition-all duration-300">
            {/* Header: Draggable Grip Handle, ELON Status, Waveform & Hide Button */}
            <div
              onPointerDown={handleHudPointerDown}
              onPointerMove={handleHudPointerMove}
              onPointerUp={handleHudPointerUp}
              onDoubleClick={() => setHudPos(null)}
              className="flex items-center justify-between gap-3 pb-2 border-b border-white/[0.08] mb-2.5 cursor-grab active:cursor-grabbing select-none"
              title="Click and drag with mouse pointer to move freely anywhere (double-click to reset position)"
            >
              <div className="flex items-center gap-2">
                <div
                  className="p-1 px-1.5 rounded-lg text-cyan-400 hover:text-cyan-200 bg-white/[0.04] hover:bg-white/[0.08] border border-cyan-400/25 flex items-center gap-1 transition-colors cursor-grab active:cursor-grabbing"
                  title="Click and drag with mouse pointer to move freely"
                >
                  <GripHorizontal className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-mono tracking-wider hidden sm:inline uppercase">DRAG</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                <span className="text-xs font-orbitron font-bold tracking-wider text-cyan-300 uppercase">
                  ELON · ONBOARD AI GUIDE
                </span>
                {elonState.visitorName && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-200">
                    Explorer: {elonState.visitorName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Animated audio bars while speaking */}
                {elonState.isSpeaking && (
                  <div className="flex items-center gap-1 h-5 px-2">
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                  </div>
                )}

                {/* Reset position button if moved */}
                {hudPos && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHudPos(null);
                    }}
                    className="px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-cyan-300 text-[10px] font-mono transition-colors cursor-pointer"
                    title="Reset to center bottom position"
                  >
                    RESET POS
                  </button>
                )}

                {/* Hide / Dismiss Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHudHidden(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-400/40 text-slate-400 hover:text-cyan-200 text-[11px] font-mono tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Hide mission briefing (click Show or ELON orb to appear again)"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>HIDE</span>
                </button>
              </div>
            </div>

            {/* Subtitle Spoken Content */}
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans font-medium whitespace-pre-line">
              {elonState.subtitles}
            </p>

            {/* STEP 5: MISSION SELECTION QUICK ACTIONS */}
            {elonState.showMissionOptions && (
              <div className="mt-4 pt-3 border-t border-cyan-400/20 flex flex-wrap items-center gap-2.5 animate-fade-in">
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block w-full mb-1">
                  Available Missions:
                </span>

                {/* Option 1: Moon Exploration */}
                <button
                  onClick={() => {
                    onStartMoonMission();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-400/50 hover:border-cyan-300 text-cyan-100 font-orbitron text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <span>🌕 Explore The Moon</span>
                </button>

                {/* Option 2: Mars Exploration */}
                <button
                  onClick={() => {
                    onStartMarsMission();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600/30 to-amber-600/30 hover:from-rose-500/50 hover:to-amber-500/50 border border-rose-400/50 hover:border-rose-300 text-rose-100 font-orbitron text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <span>🔴 Discover Mars</span>
                </button>

                {/* Option 3: All Destinations */}
                <button
                  onClick={() => {
                    onOpenDestinations();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/20 text-slate-200 font-sans text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-300" />
                  <span>All Destinations</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2B. DRAGGABLE RESTORE PILL (WHEN HUD IS HIDDEN) */}
      {elonState.subtitles && !elonState.isNamePopupOpen && isHudHidden && (
        <div
          ref={pillRef}
          style={pillPos ? {
            left: `${pillPos.x}px`,
            top: `${pillPos.y}px`,
            bottom: 'auto',
            transform: 'none',
            position: 'fixed'
          } : undefined}
          onPointerDown={handlePillPointerDown}
          onPointerMove={handlePillPointerMove}
          onPointerUp={handlePillPointerUp}
          onDoubleClick={() => setPillPos(null)}
          className={`fixed z-30 pointer-events-auto select-none animate-fade-in cursor-grab active:cursor-grabbing ${
            pillPos ? '' : 'bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2'
          }`}
          title="Click to show mission briefing · Drag with mouse pointer to move anywhere (double-click to reset)"
        >
          <div
            className="group px-4 py-2.5 rounded-full bg-[#050918]/90 hover:bg-[#071128] border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white shadow-[0_0_25px_rgba(56,189,248,0.35)] backdrop-blur-xl flex items-center gap-2.5 text-xs font-orbitron font-semibold tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)] pointer-events-none" />
            <Eye className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition-transform pointer-events-none" />
            <span className="pointer-events-none">SHOW MISSION BRIEFING</span>
            {elonState.showMissionOptions && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[10px] font-mono text-cyan-300 border border-cyan-400/30 pointer-events-none">
                MISSIONS
              </span>
            )}
            <GripHorizontal className="w-3.5 h-3.5 text-cyan-400/60 pointer-events-none ml-0.5" />
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 3. FLOATING ELON SPACECRAFT ORB & AUDIO DOCK (BOTTOM RIGHT)          */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div
        ref={dockRef}
        style={dockPos ? {
          left: `${dockPos.x}px`,
          top: `${dockPos.y}px`,
          right: 'auto',
          bottom: 'auto',
          position: 'fixed'
        } : undefined}
        className={`fixed z-40 select-none ${dockPos ? '' : 'bottom-5 right-5'}`}
      >
        <div className="flex flex-col items-end gap-2.5">

          {/* Expanded Audio & Assistant Controls Drawer */}
          {isControlsExpanded && (
            <div className="elon-subtitle-box p-4 rounded-2xl w-72 space-y-3.5 shadow-2xl animate-fade-in border border-cyan-400/30">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <span className="text-xs font-orbitron font-bold tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  AUDIO CONTROLS
                </span>
                <button
                  onClick={() => setIsControlsExpanded(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Background Music Volume & Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Music className="w-3 h-3 text-cyan-400" />
                    Cinematic Music
                  </span>
                  <button
                    onClick={() => audioManager.toggleMusic()}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider transition-colors cursor-pointer ${
                      audioState.isMusicMuted
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {audioState.isMusicMuted ? 'MUTED' : 'PLAYING'}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioState.isMusicMuted ? 0 : audioState.musicVolume}
                  onChange={(e) => {
                    if (audioState.isMusicMuted) audioManager.toggleMusic();
                    audioManager.setMusicVolume(parseFloat(e.target.value));
                  }}
                  className="w-full accent-cyan-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              {/* ELON Voice Volume & Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Volume2 className="w-3 h-3 text-cyan-400" />
                    ELON AI Voice
                  </span>
                  <button
                    onClick={() => audioManager.toggleVoice()}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider transition-colors cursor-pointer ${
                      audioState.isVoiceMuted
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {audioState.isVoiceMuted ? 'MUTED' : 'ACTIVE'}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioState.isVoiceMuted ? 0 : audioState.voiceVolume}
                  onChange={(e) => {
                    if (audioState.isVoiceMuted) audioManager.toggleVoice();
                    audioManager.setVoiceVolume(parseFloat(e.target.value));
                  }}
                  className="w-full accent-cyan-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              {/* Action Buttons: Replay Welcome & Reset */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/[0.08]">
                <button
                  onClick={() => {
                    elonConversation.replayWelcome();
                  }}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-cyan-200 text-[10px] font-mono tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Replay cinematic welcome message"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>REPLAY WELCOME</span>
                </button>

                <button
                  onClick={() => {
                    elonConversation.resetSession();
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-[10px] font-mono tracking-wider transition-colors cursor-pointer"
                  title="Clear temporary session and start over"
                >
                  RESET
                </button>
              </div>
            </div>
          )}

          {/* Quick Chat Drawer with ELON */}
          {isChatExpanded && (
            <div className="elon-subtitle-box p-3.5 rounded-2xl w-80 space-y-3 shadow-2xl animate-fade-in border border-cyan-400/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  TALK WITH ELON
                </span>
                <button
                  onClick={() => setIsChatExpanded(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendChat} className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask ELON about space..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={elonState.isLoading || !chatInput.trim()}
                  className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* The Holographic AI Orb Dock */}
          <div className="flex items-center gap-2">

            {/* Dock Move Drag Handle */}
            <div
              onPointerDown={handleDockPointerDown}
              onPointerMove={handleDockPointerMove}
              onPointerUp={handleDockPointerUp}
              onDoubleClick={() => setDockPos(null)}
              className="p-2.5 rounded-2xl bg-[#050918]/85 hover:bg-[#071128] border border-cyan-400/30 text-slate-400 hover:text-cyan-300 shadow-lg backdrop-blur-xl transition-all cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
              title="Click and drag with mouse pointer to move ELON dock anywhere (double-click to reset position)"
            >
              <Move className="w-4 h-4" />
            </div>

            {/* Quick Audio Controls Toggle Button */}
            <button
              onClick={() => setIsControlsExpanded(!isControlsExpanded)}
              className="p-2.5 rounded-2xl bg-[#050918]/85 hover:bg-[#071128] border border-cyan-400/30 text-cyan-300 hover:text-white shadow-lg backdrop-blur-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Open Audio & Volume Controls"
            >
              <Music className="w-4 h-4" />
              {audioState.isMusicMuted && <span className="text-[10px] text-rose-400 font-bold">OFF</span>}
            </button>

            {/* Quick Briefing HUD Visibility Toggle Button */}
            {elonState.subtitles && !elonState.isNamePopupOpen && (
              <button
                onClick={() => setIsHudHidden(!isHudHidden)}
                className={`p-2.5 rounded-2xl border shadow-lg backdrop-blur-xl transition-all cursor-pointer flex items-center justify-center ${
                  isHudHidden
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                    : 'bg-[#050918]/85 hover:bg-[#071128] border-cyan-400/30 text-slate-300 hover:text-white'
                }`}
                title={isHudHidden ? "Show mission briefing HUD" : "Hide mission briefing HUD"}
              >
                {isHudHidden ? <Eye className="w-4 h-4 text-cyan-300 animate-pulse" /> : <EyeOff className="w-4 h-4" />}
              </button>
            )}

            {/* Quick Chat Toggle Button */}
            <button
              onClick={() => setIsChatExpanded(!isChatExpanded)}
              className="p-2.5 rounded-2xl bg-[#050918]/85 hover:bg-[#071128] border border-cyan-400/30 text-cyan-300 hover:text-white shadow-lg backdrop-blur-xl transition-all cursor-pointer"
              title="Ask ELON a question"
            >
              <Bot className="w-4 h-4" />
            </button>

            {/* Main ELON Holographic Orb Button */}
            <button
              onClick={() => {
                if (isHudHidden) {
                  setIsHudHidden(false);
                } else if (elonState.stage === 'idle') {
                  elonConversation.startWelcome();
                } else if (elonState.isSpeaking) {
                  elonVoice.stop();
                } else {
                  elonConversation.replayWelcome();
                }
              }}
              className="group relative flex items-center gap-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#050918]/95 to-[#0b1736]/95 hover:from-[#081230] hover:to-[#0f2250] border border-cyan-400/40 hover:border-cyan-300 shadow-[0_0_25px_rgba(56,189,248,0.35)] backdrop-blur-2xl transition-all duration-300 cursor-pointer active:scale-95"
              title={
                elonState.stage === 'idle'
                  ? 'Engage ELON AI Mission Guide'
                  : elonState.isSpeaking
                  ? 'Click to pause ELON speech'
                  : 'Replay ELON speech'
              }
            >
              {/* Outer pulsing ring */}
              <div className={`relative w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center p-0.5 ${
                elonState.isSpeaking ? 'elon-orb-active' : ''
              }`}>
                <div className="w-full h-full rounded-full bg-[#050918] flex items-center justify-center">
                  <Sparkles className={`w-4 h-4 text-cyan-300 transition-transform ${
                    elonState.isSpeaking ? 'scale-110 animate-spin' : 'group-hover:rotate-45'
                  }`} />
                </div>
              </div>

              {/* Status and Name Label */}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-orbitron font-extrabold tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                    ELON
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    elonState.isSpeaking
                      ? 'bg-cyan-400 animate-ping'
                      : 'bg-emerald-400 animate-pulse'
                  }`} />
                </div>
                <span className="text-[10px] font-mono text-cyan-400/90 tracking-widest uppercase leading-none">
                  {elonState.stage === 'idle'
                    ? 'CLICK TO ENGAGE'
                    : elonState.isSpeaking
                    ? 'SPEAKING...'
                    : 'MISSION GUIDE'}
                </span>
              </div>
            </button>

          </div>

        </div>
      </div>
    </>
  );
};

export default ElonAssistant;

