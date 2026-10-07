import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DestinationType } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  ArrowRight,
  Activity,
  Tv,
  Radio,
  Flame,
  Gauge,
  CheckCircle,
  Compass,
  Zap,
  FastForward,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface EarthLaunchSceneProps {
  destination: DestinationType;
  health?: number;
  onLaunchComplete: () => void;
  onExplore3D?: () => void;
  onModifyHealth: (amount: number) => void;
  onNavigateHome?: () => void;
}

export const EarthLaunchScene: React.FC<EarthLaunchSceneProps> = ({
  destination,
  onLaunchComplete,
  onExplore3D,
}) => {
  const isMars = destination === 'Mars';
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Real NASA High-Definition Mission Launch Footage
  const videoSrc = isMars ? '/videos/mars_launch_journey.mp4' : '/videos/moon_launch_journey.mp4';

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(isMars ? 71.2 : 175.3);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);

  // Exact NASA Mission Flight Milestones
  const milestones = useMemo(() => {
    if (isMars) {
      return [
        {
          id: 'ignition',
          time: 0,
          label: '01. Ignition',
          title: 'Atlas V Main Engine Start & Solid Booster Ignition',
          tag: 'T-0 IGNITION',
          speed: '0 km/h (Standby)',
          alt: '0.0 m • SLC-41 Cape Canaveral',
          gForce: '1.4 G',
          desc: 'RD-180 dual combustion chamber engine roars to life, producing 860,000 lbs of thrust.',
        },
        {
          id: 'liftoff',
          time: 12,
          label: '02. Liftoff',
          title: 'Tower Clearance & Pitch Maneuver',
          tag: 'LIFTOFF & TOWER CLEAR',
          speed: 'Mach 0.6 • 740 km/h',
          alt: '1,200 m • Atmospheric Ascent',
          gForce: '2.2 G',
          desc: 'Vehicle clears launch umbilical tower. Roll and pitch program initiates flight azimuth toward Mars.',
        },
        {
          id: 'max_q',
          time: 32,
          label: '03. Max-Q',
          title: 'Maximum Aerodynamic Pressure (Max-Q)',
          tag: 'MAX-Q TRANSONIC',
          speed: 'Mach 1.8 • 2,150 km/h',
          alt: '14.2 km • Troposphere Punch',
          gForce: '3.6 G',
          desc: 'Rocket shears through peak aerodynamic forces. Condensation clouds form along payload fairing.',
        },
        {
          id: 'staging',
          time: 50,
          label: '04. Staging',
          title: 'Booster Cutoff & Core Stage Separation',
          tag: 'STAGE 1 SEPARATION',
          speed: 'Mach 6.2 • 7,400 km/h',
          alt: '85 km • Mesosphere / Space Border',
          gForce: '1.2 G',
          desc: 'Solid rocket boosters jettison. Core stage cuts off. Centaur upper stage prepares vacuum burn.',
        },
        {
          id: 'orbit',
          time: 65,
          label: '05. Mars Departure',
          title: 'Trans-Mars Injection & Deep Space Trajectory',
          tag: 'TMI ESCAPE INJECTION',
          speed: 'Mach 33 • 11.2 km/s (Escape Velocity)',
          alt: '185 km • Earth Departure Orbit',
          gForce: '0.0 G (Microgravity)',
          desc: 'Perseverance spacecraft accelerates past Earth escape velocity toward Martian intercept.',
        },
      ];
    } else {
      return [
        {
          id: 'ignition',
          time: 0,
          label: '01. Ignition',
          title: 'Saturn V Five F-1 Engines Ignition',
          tag: 'T-0 IGNITION',
          speed: '0 km/h (Standby)',
          alt: '0.0 m • LC-39A Kennedy Space Center',
          gForce: '1.2 G',
          desc: '7.5 million pounds of thrust ignite in the flame trench. Hold-down arms release.',
        },
        {
          id: 'liftoff',
          time: 30,
          label: '02. Liftoff',
          title: 'Tower Clearance & Saturn V Roll Program',
          tag: 'LIFTOFF & TOWER CLEAR',
          speed: 'Mach 0.5 • 620 km/h',
          alt: '1,500 m • Cloud Penetration',
          gForce: '2.1 G',
          desc: 'The 363-foot Saturn V clears the umbilical tower, rolling to azimuth 72 degrees.',
        },
        {
          id: 'max_q',
          time: 68,
          label: '03. Max-Q',
          title: 'Transonic Punch & Maximum Dynamic Pressure',
          tag: 'MAX-Q TRANSONIC',
          speed: 'Mach 1.9 • 2,300 km/h',
          alt: '13.8 km • Sound Barrier Broken',
          gForce: '3.8 G',
          desc: 'Vehicle experiences maximum aerodynamic drag forces before exiting the dense atmosphere.',
        },
        {
          id: 'staging',
          time: 110,
          label: '04. Staging',
          title: 'S-IC First Stage Separation & S-II Ignition',
          tag: 'STAGE 1 SEPARATION',
          speed: 'Mach 8.4 • 9,800 km/h',
          alt: '68 km • Upper Stratosphere',
          gForce: '1.4 G',
          desc: 'S-IC first stage burns out and separates. Five J-2 cryogenic hydrogen engines ignite.',
        },
        {
          id: 'orbit',
          time: 155,
          label: '05. Translunar',
          title: 'S-IVB Translunar Injection (TLI)',
          tag: 'TLI ESCAPE INJECTION',
          speed: 'Mach 32 • 10.8 km/s (Escape Velocity)',
          alt: '185 km • Cislunar Insertion',
          gForce: '0.0 G (Microgravity)',
          desc: 'Apollo Command & Lunar Module depart Earth orbit on free-return trajectory to the Moon.',
        },
      ];
    }
  }, [isMars]);

  // Current active milestone based on video playback time
  const currentMilestone = useMemo(() => {
    let active = milestones[0];
    for (const m of milestones) {
      if (currentTime >= m.time) {
        active = m;
      }
    }
    return active;
  }, [milestones, currentTime]);

  // Handle Play/Pause
  const togglePlay = () => {
    soundFx.playClick();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Step Frame-by-Frame (-1s, +1s)
  const stepFrame = (seconds: number) => {
    soundFx.playClick();
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  // Jump to specific milestone
  const jumpToMilestone = (time: number) => {
    soundFx.playClick();
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    if (!isPlaying) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Toggle Video Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    soundFx.playClick();
  };

  // Cycle Playback Speed
  const cycleSpeed = () => {
    soundFx.playClick();
    if (!videoRef.current) return;
    const speeds = [0.5, 1.0, 2.0];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    soundFx.playClick();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const tenths = Math.floor((secs % 1) * 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${tenths}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#020408] overflow-hidden select-none flex flex-col justify-between pt-16 font-sans"
    >
      {/* ═══ 1. 4K CINEMATIC NASA LAUNCH VIDEO BACKGROUND ═══ */}
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted={isMuted}
          playsInline
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || (isMars ? 71.2 : 175.3));
              videoRef.current.play().catch(() => {});
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
          }}
          className="w-full h-full object-cover object-center filter brightness-105 contrast-105"
        />

        {/* Cinematic Vignette & Ambient Top/Bottom Gradients */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#020408] via-transparent to-[#020408]/80 opacity-90" />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.85)]" />
      </div>

      {/* ═══ 2. TOP FLIGHT DIRECTOR HUD OVERLAY ═══ */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3 pointer-events-auto screen-enter">
        {/* Left: Active Flight Phase Badge */}
        <div className="flex items-center gap-3">
          <div className="crystal-glass flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-mono text-slate-200 shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
            <span className="text-white font-bold font-mono tracking-wider">{currentMilestone.tag}</span>
            <span className="text-white/20">|</span>
            <span className="text-cyan-300 font-mono text-[11px]">T+ {formatTime(currentTime)}</span>
          </div>

          <div className="crystal-glass hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono">
            <span className="text-slate-400">MISSION TARGET:</span>
            <span className={`font-bold ${isMars ? 'text-rose-400' : 'text-cyan-300'}`}>
              {destination.toUpperCase()} FLIGHT
            </span>
          </div>
        </div>

        {/* Center: Real-Time Scientific Flight Telemetry Gauges */}
        <div className="crystal-glass flex items-center gap-3 px-4 py-2 rounded-full shadow-xl text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">ALT</span>
            <span className="text-white font-semibold">{currentMilestone.alt.split('•')[0]}</span>
          </div>
          <span className="text-white/15">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">VEL</span>
            <span className="text-cyan-300 font-semibold">{currentMilestone.speed.split('•')[0]}</span>
          </div>
          <span className="text-white/15">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">G</span>
            <span className="text-emerald-400 font-semibold">{currentMilestone.gForce}</span>
          </div>
        </div>

        {/* Right: Quick Action to Landing Video */}
        <button
          onClick={() => {
            soundFx.playSuccess();
            onLaunchComplete();
          }}
          className="premium-btn-primary px-4 py-2 rounded-full text-white font-display text-xs font-bold flex items-center gap-2 shadow-glow-cyan cursor-pointer group/btn"
        >
          <span>Watch Landing</span>
          <Tv className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ═══ 3. CENTER: CLEAN OBSERVATION VIEWPORT WITH BRIEFING PILL ═══ */}
      <div className="flex-1 flex items-end justify-center pb-4 px-4 pointer-events-none">
        <div className="crystal-glass max-w-2xl w-full p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto transition-all relative overflow-hidden group content-selectable">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1 relative z-10">
            <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              {currentMilestone.title}
            </span>
            <span className="text-slate-400">
              FRAME {Math.floor(currentTime * 30)} / {Math.floor(duration * 30)}
            </span>
          </div>
          <p className="text-slate-200 text-xs sm:text-sm font-sans leading-relaxed relative z-10 content-selectable">
            {currentMilestone.desc}
          </p>
        </div>
      </div>

      {/* ═══ 4. BOTTOM AEROSPACE TIMELINE & FRAME CONTROLLER ═══ */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 pb-4 pointer-events-auto screen-enter">
        <div className="crystal-glass p-3.5 sm:p-4 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] space-y-3 relative overflow-hidden group">
          <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[2px] pointer-events-none" />

          {/* Interactive Milestone Buttons (Clickable Frame Markers) */}
          <div className="grid grid-cols-5 gap-1.5">
            {milestones.map((m) => {
              const isActive = currentMilestone.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => jumpToMilestone(m.time)}
                  className={`p-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-cyan-400/60 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`block text-[10px] font-mono font-bold truncate ${isActive ? 'text-cyan-300' : 'text-slate-500'}`}>
                    {m.label}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-400 truncate">
                    T+{Math.floor(m.time)}s
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Scrubbing Rail with Time Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.05}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                if (videoRef.current) {
                  videoRef.current.currentTime = val;
                }
              }}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
              <span>T+ {formatTime(currentTime)}</span>
              <span>TOTAL {formatTime(duration)}</span>
            </div>
          </div>

          {/* Precision Flight Transport Controls (Play, Step, Speed, Audio, Fullscreen) */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Left Transport: Play/Pause and Frame-by-Frame Steppers */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-all shadow-[0_0_16px_rgba(56,189,248,0.4)] cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              {/* Step Back 1s */}
              <button
                onClick={() => stepFrame(-1.0)}
                className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-all cursor-pointer"
                title="Step backward 1 second (30 frames)"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">-1s</span>
              </button>

              {/* Step Forward 1s */}
              <button
                onClick={() => stepFrame(1.0)}
                className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-all cursor-pointer"
                title="Step forward 1 second (30 frames)"
              >
                <span className="hidden sm:inline">+1s</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {/* Reset to Pad T-0 */}
              <button
                onClick={() => jumpToMilestone(0)}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Reset to Ignition T-0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Right Transport: Speed, Audio, Fullscreen & Next Stage */}
            <div className="flex items-center gap-2">
              {/* Playback Speed Multiplier */}
              <button
                onClick={cycleSpeed}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-cyan-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
                title="Cycle Playback Speed (0.5x, 1x, 2x)"
              >
                {playbackSpeed}x SPEED
              </button>

              {/* Audio Volume Toggle */}
              <button
                onClick={toggleMute}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                title={isMuted ? 'Unmute Launch Audio' : 'Mute Launch Audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Toggle Fullscreen Video Mode"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Direct Jump to 3D World */}
              {onExplore3D && (
                <button
                  onClick={() => {
                    soundFx.playSuccess();
                    onExplore3D();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-cyan-300 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Jump directly to 3D Planetary World"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Explore 3D</span>
                </button>
              )}

              {/* Complete Journey -> Landing Button */}
              <button
                onClick={() => {
                  soundFx.playSuccess();
                  onLaunchComplete();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 transition-all shadow-[0_0_16px_rgba(37,99,235,0.4)] cursor-pointer"
              >
                <span>Landing Sequence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export { EarthLaunchScene as EarthLaunchPage };
export default EarthLaunchScene;

