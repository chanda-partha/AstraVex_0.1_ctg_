import React, { useState, useRef, useMemo, useEffect } from 'react';
import { DestinationType } from '../types';
import {
  ArrowRight,
  Box,
  Maximize2,
  Pause,
  Play,
  Tv,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { audioManager } from '../audio/AudioManager';
import { useTourSpotlight } from '../guide/tourEngine';
import { Button, IconButton, SegmentedControl } from '../components/ui';
import { getMissionFlightProfile } from '../utils/missionCatalog';
import { LaunchVehicle3DSimulator } from '../components/3d/LaunchVehicle3DSimulator';
import { VideoLoadingOverlay } from '../components/common/CanvasLoadingOverlay';
import { fetchMissionVideos, NasaArchiveVideo } from '../services/api';

interface EarthLaunchSceneProps {
  destination: DestinationType;
  activeMissionId?: string;
  missionName?: string;
  onLaunchComplete: () => void;
  onExplore3D?: () => void;
}

export const EarthLaunchScene: React.FC<EarthLaunchSceneProps> = ({
  destination,
  activeMissionId = 'perseverance',
  missionName,
  onLaunchComplete,
  onExplore3D,
}) => {
  const isMars = destination === 'Mars';
  const isDeepSpace = destination === 'DeepSpace';
  const profile = useMemo(() => getMissionFlightProfile(activeMissionId), [activeMissionId]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [archiveVideos, setArchiveVideos] = useState<NasaArchiveVideo[]>([]);
  const activeVideoSrc =
    profile.launchArchivalVideo ||
    profile.curatedLaunchVideo ||
    archiveVideos[0]?.videoUrl ||
    null;
  const activeVideoLabel =
    profile.launchArchivalLabel ||
    profile.curatedLaunchVideoLabel ||
    archiveVideos[0]?.title ||
    null;

  const hasExactArchivalVideo = Boolean(activeVideoSrc);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Play real NASA launch video by default unless user prefers reduced motion
  const [viewMode, setViewMode] = useState<'video' | '3d'>(hasExactArchivalVideo ? 'video' : '3d');
  const [isPlaying, setIsPlaying] = useState<boolean>(() => !prefersReducedMotion);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [isVideoBuffering, setIsVideoBuffering] = useState<boolean>(hasExactArchivalVideo);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const simDefaultDuration = 72.0;

  const [duration, setDuration] = useState<number>(simDefaultDuration);

  const timelineSpotlight = useTourSpotlight('launch-timeline');
  const proceedSpotlight = useTourSpotlight('proceed-landing');

  // Query official NASA Image & Video Library as secondary backup if curated URL is missing
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    setArchiveVideos([]);
    if (!profile.launchArchivalVideo && !profile.curatedLaunchVideo) {
      fetchMissionVideos(profile.missionId, controller.signal).then((vids) => {
        if (mounted && vids.length > 0) {
          setArchiveVideos(vids);
        }
      });
    }
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [profile.missionId, profile.launchArchivalVideo, profile.curatedLaunchVideo]);

  useEffect(() => {
    setVideoError(false);
    setIsVideoBuffering(hasExactArchivalVideo);
    setIsMuted(true);
    setIsPlaying(!prefersReducedMotion);
    setCurrentTime(0);
    setDuration(simDefaultDuration);
    setViewMode(hasExactArchivalVideo ? 'video' : '3d');
    audioManager.setDucking(false, 'video');
  }, [profile.missionId, hasExactArchivalVideo, simDefaultDuration, prefersReducedMotion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => {
      setPrefersReducedMotion(mq.matches);
      if (mq.matches && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
        audioManager.setDucking(false, 'video');
      }
    };
    mq.addEventListener('change', handleMotionChange);
    return () => mq.removeEventListener('change', handleMotionChange);
  }, []);

  useEffect(() => {
    if (viewMode === '3d') {
      audioManager.setDucking(false, 'video');
    }
  }, [viewMode]);

  useEffect(() => {
    return () => {
      audioManager.setDucking(false, 'video');
    };
  }, []);

  const agencyLabel = missionName || profile.missionId.toUpperCase();

  const milestones = useMemo(() => {
    const safeDur = duration > 1 ? duration : 72;
    const scaleRatio =
      viewMode === 'video' ? Math.max(0.4, safeDur / 72) : 1.0;
    const t0 = 0;
    const t1 = Math.round(12 * scaleRatio);
    const t2 = Math.round(28 * scaleRatio);
    const t3 = Math.round(46 * scaleRatio);
    const t4 = Math.round(60 * scaleRatio);

    if (isDeepSpace) {
      const id = profile.missionId;
      const targetDesc =
        id === 'jwst'
          ? 'Escapade / ESC upper stage injects JWST onto a precision direct transfer toward Sun–Earth L2 (1.5M km).'
          : id === 'voyager'
            ? 'Centaur and Star 37E kick stage accelerate Voyager 1 past Earth escape velocity toward Jupiter and interstellar space.'
            : id === 'hubble'
              ? 'Orbital Maneuvering System (OMS) circularizes Discovery at 535 km altitude ahead of RMS telescope release.'
              : 'Stage delivers visiting vehicle into a 51.6° inclined rendezvous orbit matching the ISS altitude.';
      const targetSpeed = id === 'voyager' ? '14.3 km/s' : id === 'jwst' ? '10.9 km/s' : '7.7 km/s';
      const targetAlt = id === 'hubble' ? '535 km' : id === 'iss' ? '408 km' : '240 km';

      return [
        {
          id: 'ignition',
          time: t0,
          label: 'Ignition',
          title: `${profile.launchVehicleName} engine start`,
          speed: '0 km/h',
          alt: `0.0 km · ${profile.launchSite}`,
          gLoad: '1.3 g',
          downrange: '0 km',
          desc: `Main stage engines ignite on the pad at ${profile.launchSite} for ${agencyLabel}.`,
        },
        {
          id: 'liftoff',
          time: t1,
          label: 'Liftoff',
          title: 'Tower clearance & orbital azimuth roll',
          speed: '780 km/h',
          alt: '1.4 km',
          gLoad: '1.8 g',
          downrange: '1 km',
          desc: `Vehicle clears pad tower and pitches onto the ${profile.launchInclinationDeg}° orbital plane.`,
        },
        {
          id: 'max_q',
          time: t2,
          label: 'Fairing',
          title: 'Max-Q & payload fairing jettison',
          speed: '4,200 km/h',
          alt: '112 km',
          gLoad: '2.9 g',
          downrange: '190 km',
          desc: 'Peak dynamic pressure subsides above the stratosphere and protective payload fairing halves separate.',
        },
        {
          id: 'staging',
          time: t3,
          label: 'SECO-1',
          title: 'Core stage separation & parking orbit',
          speed: '27,800 km/h',
          alt: '205 km',
          gLoad: '3.4 g',
          downrange: '1,420 km',
          desc: 'Core booster separates and cryogenic upper stage establishes a stable parking orbit.',
        },
        {
          id: 'orbit',
          time: t4,
          label: 'Injection',
          title: id === 'jwst' ? 'L2 transfer injection burn' : id === 'voyager' ? 'Outer-planet escape burn' : 'Final orbital insertion',
          speed: targetSpeed,
          alt: targetAlt,
          gLoad: '0.9 g',
          downrange: 'Orbital',
          desc: targetDesc,
        },
      ];
    }

    if (isMars) {
      return [
        {
          id: 'ignition',
          time: t0,
          label: 'Ignition',
          title: `${profile.launchVehicleName} main engine start`,
          speed: '0 km/h',
          alt: `0.0 km · ${profile.launchSite}`,
          gLoad: '1.2 g',
          downrange: '0 km',
          desc: `Booster engines ignite at ${profile.launchSite} carrying ${agencyLabel}.`,
        },
        {
          id: 'liftoff',
          time: t1,
          label: 'Liftoff',
          title: 'Tower clearance & gravity-turn pitch',
          speed: '740 km/h',
          alt: '1.2 km',
          gLoad: '1.7 g',
          downrange: '2 km',
          desc: `Vehicle clears launch umbilical tower and pitches toward the ${profile.launchInclinationDeg}° departure azimuth.`,
        },
        {
          id: 'max_q',
          time: t2,
          label: 'Max-Q',
          title: 'Maximum aerodynamic pressure & fairing sep',
          speed: '2,250 km/h',
          alt: '14.2 km',
          gLoad: '2.6 g',
          downrange: '48 km',
          desc: 'Spacecraft clears supersonic Max-Q before shedding aerodynamic fairing shells.',
        },
        {
          id: 'staging',
          time: t3,
          label: 'Staging',
          title: 'Core stage separation & Centaur ignition',
          speed: '7,600 km/h',
          alt: '88 km',
          gLoad: '3.2 g',
          downrange: '610 km',
          desc: 'Strap-on boosters and core stage jettison cleanly as the Centaur upper stage ignites.',
        },
        {
          id: 'orbit',
          time: t4,
          label: 'TMI Burn',
          title: 'Trans-Mars injection (TMI) departure',
          speed: '11.2 km/s',
          alt: '185 km',
          gLoad: '1.1 g',
          downrange: 'Interplanetary',
          desc: `${agencyLabel} exceeds Earth escape energy onto a Hohmann-class transfer trajectory to Mars.`,
        },
      ];
    }

    return [
      {
        id: 'ignition',
        time: t0,
        label: 'Ignition',
        title: `${profile.launchVehicleName} main ignition`,
        speed: '0 km/h',
        alt: `0.0 km · ${profile.launchSite}`,
        gLoad: '1.3 g',
        downrange: '0 km',
        desc: `Primary engines ignite at ${profile.launchSite} to launch ${agencyLabel}.`,
      },
      {
        id: 'liftoff',
        time: t1,
        label: 'Liftoff',
        title: 'Tower clearance & lunar azimuth roll',
        speed: '620 km/h',
        alt: '1.5 km',
        gLoad: '1.8 g',
        downrange: '2 km',
        desc: `${profile.launchVehicleName} clears the pad tower onto its ${profile.launchInclinationDeg}° cislunar azimuth.`,
      },
      {
        id: 'max_q',
        time: t2,
        label: 'Max-Q',
        title: 'Supersonic Max-Q & aerodynamic fairing sep',
        speed: '2,350 km/h',
        alt: '13.8 km',
        gLoad: '2.8 g',
        downrange: '55 km',
        desc: 'Vehicle traverses peak aerodynamic pressure prior to climbing out of dense lower atmosphere.',
      },
      {
        id: 'staging',
        time: t3,
        label: 'Staging',
        title: 'Booster separation & upper stage ignition',
        speed: '9,800 km/h',
        alt: '68 km',
        gLoad: '3.8 g',
        downrange: '780 km',
        desc: 'First-stage core separates cleanly while liquid hydrogen upper stage engines fire.',
      },
      {
        id: 'orbit',
        time: t4,
        label: 'TLI Burn',
        title: 'Translunar injection (TLI)',
        speed: '10.8 km/s',
        alt: '185 km',
        gLoad: '1.4 g',
        downrange: 'Translunar',
        desc: `Upper stage places ${agencyLabel} onto a precision translunar trajectory toward the Moon.`,
      },
    ];
  }, [isMars, isDeepSpace, profile, agencyLabel, duration, viewMode]);

  // Continuous playback timer in 3D Simulation mode
  useEffect(() => {
    if (viewMode !== '3d' || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1 * playbackSpeed;
        if (next >= duration) {
          setIsPlaying(false);
          soundFx.playSuccess();
          return duration;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [viewMode, isPlaying, playbackSpeed, duration]);

  const currentPhaseIndex = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < milestones.length; i++) {
      if (currentTime >= milestones[i].time) {
        idx = i;
      }
    }
    return idx;
  }, [milestones, currentTime]);

  const currentMilestone = milestones[currentPhaseIndex] || milestones[0];

  const togglePlay = () => {
    soundFx.playClick();
    if (viewMode === '3d') {
      if (!isPlaying && currentTime >= duration - 0.2) {
        setCurrentTime(0);
      }
      setIsPlaying((p) => !p);
      return;
    }
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      audioManager.setDucking(false, 'video');
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      if (!isMuted) audioManager.setDucking(true, 'video');
    }
  };

  const jumpToMilestone = (time: number) => {
    soundFx.playThrust();
    setCurrentTime(time);
    if (viewMode === 'video' && videoRef.current) {
      videoRef.current.currentTime = time;
      if (!isPlaying) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
        if (!isMuted) audioManager.setDucking(true, 'video');
      }
    }
  };

  const toggleMute = () => {
    if (viewMode === '3d' || !videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    audioManager.setDucking(!nextMuted && isPlaying, 'video');
    soundFx.playClick();
  };

  const cycleSpeed = () => {
    soundFx.playClick();
    const speeds = [1.0, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
    setPlaybackSpeed(nextSpeed);
  };

  const toggleFullscreen = () => {
    soundFx.playClick();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const accentHex = isMars ? '#D9774B' : isDeepSpace ? '#818CF8' : '#9DB4D3';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#07090F] overflow-hidden select-none flex flex-col justify-between p-4 sm:p-6 pt-20 sm:pt-20 font-sans"
    >
      {/* 1. Full-Bleed Stage: Vehicle-Exact 3D Ascent Sim OR Verified Mission Archive Video */}
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
        {viewMode === 'video' && activeVideoSrc && !videoError ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              key={activeVideoSrc}
              ref={videoRef}
              src={activeVideoSrc}
              width={1280}
              height={720}
              autoPlay={!prefersReducedMotion}
              muted={isMuted}
              playsInline
              preload="metadata"
              onLoadStart={() => setIsVideoBuffering(true)}
              onWaiting={() => setIsVideoBuffering(true)}
              onSeeking={() => setIsVideoBuffering(true)}
              onLoadedData={() => setIsVideoBuffering(false)}
              onCanPlay={() => setIsVideoBuffering(false)}
              onPlaying={() => setIsVideoBuffering(false)}
              onSeeked={() => setIsVideoBuffering(false)}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                setIsVideoBuffering(false);
                if (videoRef.current) {
                  setDuration(videoRef.current.duration || simDefaultDuration);
                  videoRef.current.playbackRate = playbackSpeed;
                  if (!prefersReducedMotion && isPlaying) {
                    videoRef.current.play().catch(() => {});
                  }
                }
              }}
              onEnded={() => {
                setIsVideoBuffering(false);
                setIsPlaying(false);
                audioManager.setDucking(false, 'video');
              }}
              onError={() => {
                setIsVideoBuffering(false);
                setVideoError(true);
                setViewMode('3d');
                audioManager.setDucking(false, 'video');
              }}
              className="w-full h-full object-cover object-center"
            />
            <VideoLoadingOverlay
              visible={isVideoBuffering}
              label={activeVideoLabel ? `Buffering: ${activeVideoLabel}` : 'Buffering archival launch stream...'}
            />
          </div>
        ) : (
          <LaunchVehicle3DSimulator
            vehicleId={profile.launchVehicleId}
            phaseIndex={currentPhaseIndex}
            accentHex={accentHex}
          />
        )}
        <div className="absolute inset-0 pointer-events-none hud-vignette" />
      </div>

      {/* 2. Top-Left Vehicle Mode Badge & Toggle */}
      <div className="relative z-10 w-full flex flex-wrap items-center justify-between gap-2 pointer-events-none screen-enter">
        <div className="pointer-events-auto">
          {hasExactArchivalVideo && !videoError ? (
            <SegmentedControl<'video' | '3d'>
              ariaLabel="Launch view mode"
              value={viewMode}
              onChange={(next) => {
                soundFx.playClick();
                setViewMode(next);
                setCurrentTime(0);
                setIsPlaying(true);
                if (next === '3d') {
                  setDuration(simDefaultDuration);
                }
              }}
              options={[
                {
                  value: 'video',
                  label: profile.launchArchivalVideo ? 'Archival film' : 'NASA archive clip',
                  icon: <Tv className="w-3.5 h-3.5" />,
                },
                { value: '3d', label: '3D flight sim', icon: <Box className="w-3.5 h-3.5" /> },
              ]}
            />
          ) : (
            <div className="px-3 py-1.5 rounded-xl hud-card text-xs font-mono text-slate-200 flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>3D Ascent Sim · {profile.launchVehicleName}</span>
            </div>
          )}
        </div>

        {viewMode === 'video' && activeVideoLabel && (
          <div className="px-3 py-1.5 rounded-xl hud-well text-[11px] font-mono text-slate-300 hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="truncate max-w-xs">{activeVideoLabel}</span>
          </div>
        )}
      </div>

      {/* 3. Unified Media Stage Bottom Deck */}
      <div className="relative z-10 max-w-3xl mx-auto w-full pb-1 pointer-events-auto screen-enter">
        <div
          className={`hud-card hud-card-featured tabular-nums p-4 sm:p-5 rounded-2xl space-y-3.5 content-selectable ${timelineSpotlight.className}`}
        >
          {/* Chapter Title & Telemetry Readout */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
              <div className="min-w-0 space-y-0.5">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--accent-text)] block">
                  ASTRAVEX // LAUNCH · {profile.launchVehicleName}
                </span>
                <h1 className="font-orbitron text-base sm:text-lg font-bold tracking-[0.04em] uppercase text-white truncate">
                  {currentMilestone.title}
                </h1>
                <p className="text-xs text-slate-300/90 mt-0.5 line-clamp-1">{currentMilestone.desc}</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0 font-mono text-[11px]">
                <div className="px-2.5 py-1 rounded-lg hud-well text-slate-100">
                  <span className="text-[10px] tracking-[0.14em] uppercase text-slate-400 mr-1.5">ALT</span>
                  <span>{currentMilestone.alt.split('·')[0].trim()}</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg hud-well text-slate-100">
                  <span className="text-[10px] tracking-[0.14em] uppercase text-slate-400 mr-1.5">VEL</span>
                  <span>{currentMilestone.speed}</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg hud-well text-slate-100 hidden md:block">
                  <span className="text-[10px] tracking-[0.14em] uppercase text-slate-400 mr-1.5">LOAD</span>
                  <span>{currentMilestone.gLoad}</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg hud-well text-slate-100 hidden md:block">
                  <span className="text-[10px] tracking-[0.14em] uppercase text-slate-400 mr-1.5">INC</span>
                  <span>{profile.launchInclinationDeg}°</span>
                </div>
              </div>
            </div>
            <div className="hud-deck-rule" aria-hidden="true" />
          </div>

          {/* Chapter Selector Pills */}
          <div className="grid grid-cols-5 gap-1.5">
            {milestones.map((m, idx) => {
              const isActive = currentMilestone.id === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => jumpToMilestone(m.time)}
                  className={`px-2.5 py-2 rounded-xl text-left cursor-pointer hud-row-card ${
                    isActive
                      ? '!bg-[var(--accent-surface)] !border-[var(--accent-border)] text-white shadow-[0_6px_18px_-6px_var(--accent-border)]'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-medium truncate">
                    <span className={`font-mono text-[10px] tabular-nums ${isActive ? 'text-[var(--accent-text)]' : 'text-slate-500'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-orbitron text-[10px] tracking-[0.04em] uppercase truncate">
                      {m.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scrubber Bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-300 tabular-nums w-12">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 72}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                if (viewMode === 'video' && videoRef.current) {
                  videoRef.current.currentTime = val;
                }
              }}
              aria-label="Launch timeline scrubber"
              className="telemetry-range flex-1"
            />
            <span className="text-xs font-mono text-slate-400 tabular-nums w-12 text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Transport Controls & Primary Progression CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-1.5">
              <IconButton
                label={isPlaying ? 'Pause' : 'Play'}
                active={isPlaying}
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </IconButton>

              <button
                type="button"
                onClick={cycleSpeed}
                className="h-9 px-2.5 rounded-lg hud-well hover:border-white/20 text-xs font-mono font-medium text-slate-200 cursor-pointer"
                title="Playback speed"
              >
                {playbackSpeed}x
              </button>

              {viewMode === 'video' && (
                <IconButton
                  label={isMuted ? 'Unmute audio' : 'Mute audio'}
                  active={!isMuted}
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </IconButton>
              )}

              <IconButton
                label="Toggle fullscreen"
                onClick={toggleFullscreen}
                className="hidden sm:inline-flex"
              >
                <Maximize2 className="w-4 h-4" />
              </IconButton>
            </div>

            <div className="flex items-center gap-3">
              {onExplore3D && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    soundFx.playClick();
                    onExplore3D();
                  }}
                >
                  <span>{isDeepSpace ? 'Skip to 3D →' : 'Skip to surface →'}</span>
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  soundFx.playSuccess();
                  onLaunchComplete();
                }}
                className={proceedSpotlight.className}
              >
                <span className="font-orbitron text-[11px] tracking-[0.06em] uppercase">
                  {profile.stage4Kind === 'orbit-capture'
                    ? 'Proceed to Orbit Capture'
                    : isDeepSpace
                      ? 'Proceed to Deployment'
                      : 'Proceed to Landing'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { EarthLaunchScene as EarthLaunchPage };
export default EarthLaunchScene;
