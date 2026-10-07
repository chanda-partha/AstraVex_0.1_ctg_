import React, { useState, useEffect } from 'react';
import {
  Compass,
  Database,
  Bot,
  Film,
  Rocket,
  Sparkles,
  Volume2,
  VolumeX,
  Menu,
  X,
  Radio,
  Activity,
  Award,
  Globe,
  ChevronRight,
  Gauge
} from 'lucide-react';
import { DestinationType, ScreenType } from '../../types';
import { soundFx } from '../../utils/soundEffects';

interface NavbarProps {
  currentScreen: ScreenType;
  selectedDestination: DestinationType;
  health: number;
  score: number;
  onNavigate: (screen: ScreenType) => void;
  onSwitchDestination?: (dest: DestinationType) => void;
  onToggleAiChat: () => void;
  onOpenRegistry: () => void;
  onOpenSimulators?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  selectedDestination,
  health,
  score,
  onNavigate,
  onSwitchDestination,
  onToggleAiChat,
  onOpenRegistry,
  onOpenSimulators,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(soundFx.isMuted());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [utcClock, setUtcClock] = useState<string>('');

  // Live NASA UTC Mission Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcClock(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAudio = () => {
    const muted = soundFx.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleNav = (screen: ScreenType) => {
    soundFx.playClick();
    onNavigate(screen);
    setIsMobileMenuOpen(false);
  };

  // Suit / Life support telemetry color
  const healthColor = health > 60 ? 'bg-cyan-400' : health > 30 ? 'bg-amber-400' : 'bg-red-400';
  const healthText = health > 60 ? 'text-cyan-400' : health > 30 ? 'text-amber-400' : 'text-red-400';

  // 4-Step NASA Mission Sequence
  const navItems: { screen: ScreenType; step: string; label: string; icon: React.ReactNode }[] = [
    { screen: 'home', step: '01', label: 'Overview', icon: <Globe className="w-3.5 h-3.5" /> },
    { screen: 'destination', step: '02', label: 'Destination', icon: <Compass className="w-3.5 h-3.5" /> },
    { screen: 'launch', step: '03', label: 'Earth Journey', icon: <Rocket className="w-3.5 h-3.5" /> },
    { screen: 'exploration', step: '04', label: '3D World', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 select-none">
        {/* Aerospace Command Bar Header */}
        <div className="bg-[#050814]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-[58px] flex items-center justify-between gap-4">

            {/* ═══ 1. LEFT ZONE: Brand Identity & Telemetry Clock ═══ */}
            <div className="flex items-center gap-3.5 flex-shrink-0">
              <div
                onClick={() => handleNav('home')}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="Astravex Mission Control - Return to Overview"
              >
                {/* Brand Seal Icon */}
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/15 backdrop-blur-md p-1.5 flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.2)] transition-all duration-300 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] group-hover:scale-105">
                  <img
                    src="/astravex_logo.png"
                    alt="ASTRAVEX SEE"
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]"
                  />
                </div>

                {/* Brand Typography: ASTRAVEX SEE */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[14px] sm:text-[15px] tracking-[0.16em] font-orbitron bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent leading-none">
                      ASTRAVEX <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]">SEE</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase leading-none mt-1">
                    NASA Mission Control
                  </span>
                </div>
              </div>

              {/* Minimal Mission Elapsed / UTC Clock Capsule */}
              <div className="hidden xl:flex items-center gap-2 pl-3.5 border-l border-white/[0.08]">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="tracking-wider">{utcClock || '12:00:00 UTC'}</span>
                </div>
              </div>
            </div>

            {/* ═══ 2. CENTER ZONE: Floating Mission Sequence Dock ═══ */}
            <nav className="hidden md:flex items-center p-1 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex-shrink-0">
              {navItems.map(({ screen, step, label, icon }) => {
                const isActive = currentScreen === screen;
                return (
                  <button
                    key={screen}
                    onClick={() => handleNav(screen)}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-[0_2px_14px_rgba(37,99,235,0.45)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {icon}
                    </span>
                    <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-white/20 text-white' : 'text-slate-500'}`}>
                      {step}
                    </span>
                    <span className="tracking-wide">{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* ═══ 3. RIGHT ZONE: Destination Segmented Switcher & Quick Actions ═══ */}
            <div className="flex items-center gap-2.5 flex-shrink-0">

              {/* High-End Dual Destination Switcher (Moon vs. Mars) */}
              <div className="flex items-center p-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-inner">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    if (onSwitchDestination && selectedDestination !== 'Moon') {
                      onSwitchDestination('Moon');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    selectedDestination === 'Moon'
                      ? 'bg-gradient-to-r from-slate-200/20 to-cyan-400/20 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)] font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Target Destination: Moon (Lunar South Pole & Apollo)"
                >
                  <span className="text-[12px] leading-none">🌕</span>
                  <span className="hidden sm:inline tracking-wider">MOON</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    if (onSwitchDestination && selectedDestination !== 'Mars') {
                      onSwitchDestination('Mars');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    selectedDestination === 'Mars'
                      ? 'bg-gradient-to-r from-rose-500/25 to-amber-500/25 text-rose-200 border border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.25)] font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Target Destination: Mars (Jezero Crater & Olympus Mons)"
                >
                  <span className="text-[12px] leading-none">🔴</span>
                  <span className="hidden sm:inline tracking-wider">MARS</span>
                </button>
              </div>

              {/* Destination Landing Video Icon Button */}
              <button
                onClick={() => handleNav('landing')}
                className={`relative w-9 h-9 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                  currentScreen === 'landing'
                    ? selectedDestination === 'Mars'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:text-white'
                }`}
                title={`Watch ${selectedDestination} Landing Video (${selectedDestination === 'Mars' ? 'Perseverance EDL' : 'Apollo 11 Historical Descent'})`}
              >
                <Film className={`w-4 h-4 ${selectedDestination === 'Mars' ? 'text-rose-400' : 'text-cyan-400'}`} />
                <span
                  className={`absolute 1.5 -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                    selectedDestination === 'Mars' ? 'bg-rose-400' : 'bg-cyan-400'
                  } animate-pulse`}
                />
              </button>

              {/* Life Support & XP Telemetry Capsule */}
              <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-inner text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <Activity className={`w-3.5 h-3.5 ${healthText}`} />
                  <span className="text-[10px] text-slate-400">O₂</span>
                  <span className={`text-[10px] font-bold ${healthText}`}>{health}%</span>
                  <div className="w-8 h-1 bg-white/10 rounded-full overflow-hidden ml-0.5">
                    <div
                      className={`h-full ${healthColor} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.max(0, Math.min(100, health))}%` }}
                    />
                  </div>
                </div>

                <div className="w-[1px] h-3 bg-white/10" />

                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-semibold text-slate-200">
                    {score} <span className="text-[10px] text-slate-400">XP</span>
                  </span>
                </div>
              </div>

              {/* Telemetry Audio FX Toggle */}
              <button
                onClick={handleToggleAudio}
                className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title={isAudioMuted ? "Unmute Telemetry Audio" : "Mute Telemetry Audio"}
              >
                {isAudioMuted ? (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                ) : (
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <div className="flex items-end gap-0.5 h-2">
                      <span className="w-0.5 h-1 bg-cyan-400 animate-pulse" />
                      <span className="w-0.5 h-2 bg-cyan-300 animate-pulse" />
                    </div>
                  </div>
                )}
              </button>

              {/* Astra AI Copilot Button */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  onToggleAiChat();
                }}
                className="h-9 px-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border border-blue-500/30 hover:border-cyan-400/50 text-cyan-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(56,189,248,0.15)] cursor-pointer"
                title="Launch Astra AI Flight Director"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline font-mono">Astra AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </button>

              {/* Verified NASA Open Data Registry */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenRegistry();
                }}
                className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer"
                title="Explore Verified NASA Open Data Registry"
              >
                <Database className="w-4 h-4" />
              </button>

              {/* Science Simulators */}
              {onOpenSimulators && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onOpenSimulators();
                  }}
                  className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer"
                  title="Interactive Science & Physics Simulators"
                >
                  <Gauge className="w-4 h-4" />
                </button>
              )}

              {/* Mobile Drawer Menu Toggle */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="md:hidden w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4 text-cyan-400" /> : <Menu className="w-4 h-4" />}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* ═══ MOBILE GLASSMORPHIC NAVIGATION SHEET ═══ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden animate-fade-in">
          {/* Frosted Backdrop */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-Down Navigation Panel */}
          <div className="absolute top-[58px] left-0 right-0 p-4">
            <div className="bg-[#070b18]/95 rounded-2xl p-4 space-y-3 shadow-2xl border border-white/15 backdrop-blur-2xl">
              
              {/* Header Status */}
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.08] flex items-center justify-between">
                <span>MISSION COMMAND NAVIGATION</span>
                <span className="text-cyan-400">{utcClock}</span>
              </div>

              {/* Mobile Dual Destination Switcher */}
              <div className="p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-1">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onSwitchDestination?.('Moon');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedDestination === 'Moon'
                      ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🌕</span>
                  <span>MOON MISSION</span>
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onSwitchDestination?.('Mars');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedDestination === 'Mars'
                      ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🔴</span>
                  <span>MARS MISSION</span>
                </button>
              </div>

              {/* 4 Mission Steps */}
              <div className="space-y-1">
                {navItems.map(({ screen, step, label, icon }) => {
                  const isActive = currentScreen === screen;
                  return (
                    <button
                      key={screen}
                      onClick={() => handleNav(screen)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-cyan-200 border border-cyan-500/40 font-bold'
                          : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isActive ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/10 text-slate-400'
                        }`}>
                          {step}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{icon}</span>
                          <span>{label}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  );
                })}
              </div>

              {/* Landing Video Button */}
              <button
                onClick={() => handleNav('landing')}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-between border ${
                  selectedDestination === 'Mars'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                    : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  <span>WATCH {selectedDestination.toUpperCase()} LANDING VIDEO</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Mobile Quick Action Buttons: Simulators & Registry */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {onOpenSimulators && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setIsMobileMenuOpen(false);
                      onOpenSimulators();
                    }}
                    className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-cyan-300 flex items-center justify-center gap-2 text-xs font-mono"
                  >
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    <span>SIMULATORS</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsMobileMenuOpen(false);
                    onOpenRegistry();
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-cyan-300 flex items-center justify-center gap-2 text-xs font-mono"
                >
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>REGISTRY</span>
                </button>
              </div>

              {/* Mobile Telemetry Status Footer */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between px-2 text-xs">
                <div className="flex items-center gap-2">
                  <Activity className={`w-3.5 h-3.5 ${healthText}`} />
                  <span className="font-mono text-slate-400">O₂ {health}%</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-slate-300">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{score} XP</span>
                </div>
                <button
                  onClick={handleToggleAudio}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5 font-mono text-[10px]"
                >
                  {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{isAudioMuted ? 'MUTED' : 'AUDIO ON'}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
