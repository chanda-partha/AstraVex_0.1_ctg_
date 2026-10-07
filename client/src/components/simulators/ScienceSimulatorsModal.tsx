import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Activity,
  Compass,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Thermometer,
  Radio,
  Play,
  Pause,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface ScienceSimulatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMissionId?: string;
}

export const ScienceSimulatorsModal: React.FC<ScienceSimulatorsModalProps> = ({
  isOpen,
  onClose,
  activeMissionId = 'apollo11',
}) => {
  const [activeTab, setActiveTab] = useState<'laser' | 'retroreflector' | 'thermal' | 'traverse' | 'scale'>('laser');

  // Simulator 1: Laser Spectrometry State
  const [laserTarget, setLaserTarget] = useState<'basalt' | 'sediment' | 'orange_glass'>('basalt');
  const [isFiringLaser, setIsFiringLaser] = useState(false);
  const [laserAnalyzed, setLaserAnalyzed] = useState(false);

  // Simulator 2: LRRR Earth-Moon Laser Bounce State
  const [isBouncingLaser, setIsBouncingLaser] = useState(false);
  const [laserProgress, setLaserProgress] = useState(0); // 0 to 100%
  const [roundTripTime, setRoundTripTime] = useState<number | null>(null);

  // Simulator 3: ChaSTE Regolith Thermal Probe State
  const [probeDepthCm, setProbeDepthCm] = useState(0); // 0 to 10 cm

  // Simulator 4: Traverse Route Player State
  const [traverseStep, setTraverseStep] = useState(0);
  const [isPlayingTraverse, setIsPlayingTraverse] = useState(false);

  // Simulator 5: Scale Comparator Slider
  const [scaleRatio, setScaleRatio] = useState(1);

  useEffect(() => {
    if (activeMissionId === 'apollo11') setActiveTab('retroreflector');
    else if (activeMissionId === 'apollo15' || activeMissionId === 'apollo17') setActiveTab('traverse');
    else if (activeMissionId === 'chandrayaan3') setActiveTab('thermal');
    else if (activeMissionId === 'artemis3') setActiveTab('scale');
    else setActiveTab('laser');
  }, [activeMissionId, isOpen]);

  // Laser zap trigger
  const handleFireLaser = () => {
    soundFx.playChirp();
    setIsFiringLaser(true);
    setLaserAnalyzed(false);
    setTimeout(() => {
      soundFx.playSuccess();
      setIsFiringLaser(false);
      setLaserAnalyzed(true);
    }, 1200);
  };

  // Laser Earth-Moon bounce animation
  const handleTriggerLaserBounce = () => {
    soundFx.playChirp();
    setIsBouncingLaser(true);
    setLaserProgress(0);
    setRoundTripTime(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setLaserProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsBouncingLaser(false);
        setRoundTripTime(2.564);
        soundFx.playSuccess();
      }
    }, 45);
  };

  // Auto-play traverse steps
  useEffect(() => {
    if (!isPlayingTraverse) return;
    const timer = setInterval(() => {
      setTraverseStep((s) => (s + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, [isPlayingTraverse]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl nasa-card-elevated border border-white/20 shadow-2xl overflow-hidden font-display">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-orbitron">
                Interactive Scientific Laboratories
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                Simulated Planetary Sensors & Instrument Physics
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/[0.08] bg-black/40 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('laser');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'laser'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Laser Spectrometry (SuperCam)</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('retroreflector');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'retroreflector'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Laser Retroreflector (Apollo 11)</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('thermal');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'thermal'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Thermal Gradient (Chandrayaan-3)</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('traverse');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'traverse'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Animated Traverse Routes</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('scale');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'scale'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Apollo vs Starship Scale</span>
          </button>
        </div>

        {/* Modal Body / Simulator Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ======================================================== */}
          {/* TAB 1: LASER SPECTROMETRY SIMULATOR (SuperCam & LIBS)    */}
          {/* ======================================================== */}
          {activeTab === 'laser' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white font-orbitron">SuperCam Laser Induced Breakdown</h3>
                  <p className="text-xs text-slate-400">
                    Fires a pulsed 1064nm infrared laser to vaporize microscopic rock points into glowing plasma, analyzing atomic emission wavelengths.
                  </p>
                </div>
                <button
                  onClick={handleFireLaser}
                  disabled={isFiringLaser}
                  className={`px-5 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all ${
                    isFiringLaser
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{isFiringLaser ? 'PULSING LASER (1064nm)...' : 'FIRE SUPERCAM LASER'}</span>
                </button>
              </div>

              {/* Target Mineral Selector */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'basalt', label: 'Volcanic Basalt', loc: 'Jezero Floor', primary: 'Iron & Magnesium (Fe, Mg)' },
                  { id: 'sediment', label: 'Clay Sediment', loc: 'River Delta', primary: 'Silica & Carbonates (Si, Ca)' },
                  { id: 'orange_glass', label: 'Pyroclastic Bead', loc: 'Shorty Crater', primary: 'Titanium & Glass (Ti, O)' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      soundFx.playClick();
                      setLaserTarget(t.id as any);
                      setLaserAnalyzed(false);
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      laserTarget === t.id
                        ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-lg'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold block">{t.label}</span>
                    <span className="text-[10px] text-cyan-300 font-mono block">{t.loc}</span>
                    <span className="text-[9px] text-slate-500 mt-1 block">{t.primary}</span>
                  </button>
                ))}
              </div>

              {/* Spectral Emission Display */}
              <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>EMISSION SPECTRUM (300nm — 850nm)</span>
                  </span>
                  <span className={laserAnalyzed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {laserAnalyzed ? 'SPECTRUM RESOLVED • CONFIRMED' : 'STANDBY FOR LASER DISCHARGE'}
                  </span>
                </div>

                {/* Simulated Spectral Peak Graph */}
                <div className="relative h-32 w-full bg-slate-950/80 rounded-xl border border-white/10 p-3 flex items-end justify-between gap-1 overflow-hidden">
                  {/* Laser Flash Beam Overlay */}
                  {isFiringLaser && (
                    <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center animate-pulse">
                      <div className="w-full h-1 bg-red-400 shadow-[0_0_20px_#ef4444]" />
                    </div>
                  )}

                  {/* Spectral Emission Bars */}
                  {[
                    { elem: 'Fe', h: laserAnalyzed ? (laserTarget === 'basalt' ? 85 : 35) : 10, col: '#ef4444' },
                    { elem: 'Mg', h: laserAnalyzed ? (laserTarget === 'basalt' ? 75 : 25) : 8, col: '#f59e0b' },
                    { elem: 'Si', h: laserAnalyzed ? (laserTarget === 'sediment' ? 95 : 55) : 15, col: '#38bdf8' },
                    { elem: 'Ca', h: laserAnalyzed ? (laserTarget === 'sediment' ? 70 : 40) : 12, col: '#10b981' },
                    { elem: 'Ti', h: laserAnalyzed ? (laserTarget === 'orange_glass' ? 90 : 15) : 6, col: '#a855f7' },
                    { elem: 'O',  h: laserAnalyzed ? 80 : 18, col: '#06b6d4' },
                    { elem: 'Al', h: laserAnalyzed ? 45 : 10, col: '#94a3b8' },
                  ].map((peak, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className="w-full rounded-t transition-all duration-700"
                        style={{
                          height: `${peak.h}%`,
                          backgroundColor: peak.col,
                          boxShadow: laserAnalyzed ? `0 0 12px ${peak.col}` : 'none',
                        }}
                      />
                      <span className="text-[10px] font-mono font-bold text-slate-300">{peak.elem}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: APOLLO 11 LASER RETROREFLECTOR (LRRR)            */}
          {/* ======================================================== */}
          {activeTab === 'retroreflector' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white font-orbitron">Apollo 11 Laser Ranging Retroreflector</h3>
                  <p className="text-xs text-slate-400">
                    Active since July 21, 1969. Measures Earth-Moon distance down to millimeters by bouncing pulsed laser light off 100 quartz corner-cubes.
                  </p>
                </div>

                <button
                  onClick={handleTriggerLaserBounce}
                  disabled={isBouncingLaser}
                  className="px-5 py-2.5 rounded-xl font-bold font-mono text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-glow-cyan flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>{isBouncingLaser ? 'PHOTON PACKET IN TRANSIT...' : 'FIRE EARTH LASER (384,400 km)'}</span>
                </button>
              </div>

              {/* Transit Animation Bar */}
              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-blue-400 font-bold">Earth (McDonald Observatory, TX)</span>
                  <span className="text-slate-400">384,400 km Deep Space Transit</span>
                  <span className="text-amber-400 font-bold">Moon (Tranquility Base LRRR)</span>
                </div>

                <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400 rounded-full transition-all"
                    style={{ width: `${laserProgress}%` }}
                  />
                </div>

                {roundTripTime && (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-between animate-fade-in">
                    <div>
                      <span className="text-xs text-slate-400 font-mono block">MEASURED ROUND-TRIP TIME:</span>
                      <span className="text-2xl font-bold text-white font-orbitron">
                        {roundTripTime} <span className="text-sm font-normal text-cyan-300">seconds</span>
                      </span>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-slate-400 block">Calculated Lunar Distance:</span>
                      <span className="text-emerald-400 font-bold">384,400.124 km (± 2 mm)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: CHANDRAYAAN-3 ChaSTE THERMAL PROBE                */}
          {/* ======================================================== */}
          {activeTab === 'thermal' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white font-orbitron">ChaSTE Lunar Polar Regolith Thermal Gradient</h3>
                <p className="text-xs text-slate-400">
                  Simulate ISRO Vikram lander&apos;s ChaSTE probe driven into polar regolith, discovering extreme temperature insulation.
                </p>
              </div>

              {/* Depth Slider */}
              <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">DRIVE PROBE DEPTH:</span>
                  <span className="text-emerald-400 font-bold text-sm">{probeDepthCm} cm below surface</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={probeDepthCm}
                  onChange={(e) => setProbeDepthCm(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />

                {/* Temperature Readout */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/[0.04]">
                    <span className="text-[10px] text-slate-400 font-mono block">SURFACE TEMPERATURE (0 cm)</span>
                    <span className="text-xl font-bold text-amber-400 font-orbitron">+50°C</span>
                    <span className="text-[10px] text-slate-500 font-mono block">Direct solar radiation</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.04]">
                    <span className="text-[10px] text-slate-400 font-mono block">CURRENT DEPTH TEMP ({probeDepthCm} cm)</span>
                    <span className={`text-xl font-bold font-orbitron ${probeDepthCm > 4 ? 'text-cyan-400' : 'text-amber-300'}`}>
                      {Math.round(50 - probeDepthCm * 6.5)}°C
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {probeDepthCm >= 8 ? 'Extreme sub-zero insulation' : 'Rapid heat decline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: ANIMATED TRAVERSE ROUTE MAPPER                    */}
          {/* ======================================================== */}
          {activeTab === 'traverse' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-orbitron">Apollo 15 Hadley Rille Traverse</h3>
                  <p className="text-xs text-slate-400">
                    Step through the historic 27.9 km journey of Lunar Roving Vehicle (LRV-1) across Mount Hadley Delta.
                  </p>
                </div>
                <button
                  onClick={() => setIsPlayingTraverse(!isPlayingTraverse)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 shadow-lg"
                >
                  {isPlayingTraverse ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingTraverse ? 'PAUSE TRAVERSE' : 'AUTO-PLAY TRAVERSE'}</span>
                </button>
              </div>

              {/* Waypoint Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  { idx: 0, label: 'Station 1', name: 'Falcon LM Touchdown', dist: '0.0 km', sample: 'Descent confirmation' },
                  { idx: 1, label: 'Station 2', name: 'Mount Hadley Delta', dist: '5.2 km', sample: 'Genesis Rock (4.1B yr)' },
                  { idx: 2, label: 'Station 6', name: 'Apennine Front Scarp', dist: '14.8 km', sample: 'Layered breccia block' },
                  { idx: 3, label: 'Station 9', name: 'Hadley Rille Canyon Rim', dist: '27.9 km', sample: '300m basalt cliffs' },
                ].map((s) => (
                  <button
                    key={s.idx}
                    onClick={() => {
                      soundFx.playClick();
                      setTraverseStep(s.idx);
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      traverseStep === s.idx
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-amber-300 font-bold">{s.label} • {s.dist}</span>
                    <span className="text-xs font-bold block text-white mt-0.5">{s.name}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">{s.sample}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: SPACECRAFT SCALE COMPARATOR (Apollo vs Starship)  */}
          {/* ======================================================== */}
          {activeTab === 'scale' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white font-orbitron">Lunar Lander Scale Evolution</h3>
                <p className="text-xs text-slate-400">
                  Compare Apollo 11 Lunar Module (1969) with Artemis III SpaceX Starship Human Landing System (2026+).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-black/60 border border-white/10">
                {/* Apollo LM Column */}
                <div className="space-y-3 text-center border-r border-white/10 pr-6">
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold inline-block">
                    APOLLO 11 LUNAR MODULE
                  </span>
                  <div className="h-44 flex items-end justify-center">
                    <div className="w-16 h-20 rounded-xl bg-cyan-500/40 border border-cyan-400 flex items-center justify-center text-xs font-mono font-bold text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                      7.0 m
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-300 space-y-1 pt-2">
                    <div>Mass: <span className="font-bold text-white">15,103 kg</span></div>
                    <div>Crew: <span className="font-bold text-white">2 Astronauts</span></div>
                    <div>Payload: <span className="font-bold text-white">100 kg</span></div>
                  </div>
                </div>

                {/* Starship HLS Column */}
                <div className="space-y-3 text-center pl-6">
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold inline-block">
                    ARTEMIS III STARSHIP HLS
                  </span>
                  <div className="h-44 flex items-end justify-center">
                    <div className="w-20 h-44 rounded-t-3xl bg-purple-500/40 border border-purple-400 flex items-center justify-center text-sm font-mono font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                      50.0 m
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-300 space-y-1 pt-2">
                    <div>Mass: <span className="font-bold text-white">1,200,000 kg</span></div>
                    <div>Crew: <span className="font-bold text-white">4 Astronauts</span></div>
                    <div>Payload: <span className="font-bold text-white">100,000+ kg</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ScienceSimulatorsModal;
