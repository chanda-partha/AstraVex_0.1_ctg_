import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Zap,
  Activity,
  Compass,
  Layers,
  Thermometer,
  Radio,
  Play,
  Pause,
  Wind,
  Orbit,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Flame,
  ArrowDown,
} from 'lucide-react';
import { DestinationType } from '../../types';
import { getTheaterForMission, THEATER_META } from '../../utils/missionCatalog';
import { soundFx } from '../../utils/soundEffects';
import { ModalShell, Button, Badge, Stat } from '../ui';
import { useTourSpotlight } from '../../guide/tourEngine';

interface ScienceSimulatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination?: DestinationType;
  activeMissionId?: string;
  onEarnLabXp?: (experimentId: string) => void;
  onAskAstra?: (prompt: string) => void;
}

type SimulatorTab =
  // Mars Labs
  | 'mars_libs'
  | 'mars_moxie'
  | 'mars_seis'
  | 'mars_ingenuity'
  // Moon Labs
  | 'moon_lrrr'
  | 'moon_chaste'
  | 'moon_traverse'
  | 'moon_scale'
  // Deep Space & Orbital Labs
  | 'ds_jwst'
  | 'ds_voyager'
  | 'ds_orbit';

const TABS_BY_THEATER: Record<
  DestinationType,
  Array<{ id: SimulatorTab; label: string; icon: React.ReactNode }>
> = {
  Mars: [
    { id: 'mars_libs', label: 'SuperCam LIBS', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'mars_moxie', label: 'MOXIE O₂ Reactor', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'mars_seis', label: 'SEIS Marsquakes', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'mars_ingenuity', label: 'Thin-Air Rotor', icon: <Wind className="w-3.5 h-3.5" /> },
  ],
  Moon: [
    { id: 'moon_lrrr', label: 'Laser Retroreflector', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'moon_chaste', label: 'ChaSTE Thermal Probe', icon: <Thermometer className="w-3.5 h-3.5" /> },
    { id: 'moon_traverse', label: 'Traverse & LPR Radar', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'moon_scale', label: 'Gravity & Scale', icon: <Layers className="w-3.5 h-3.5" /> },
  ],
  DeepSpace: [
    { id: 'ds_jwst', label: 'JWST Redshift IR', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'ds_voyager', label: 'Voyager Heliopause', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'ds_orbit', label: 'Keplerian Orbit', icon: <Orbit className="w-3.5 h-3.5" /> },
  ],
};

function defaultTabForMission(theater: DestinationType, missionId?: string): SimulatorTab {
  const m = (missionId || '').toLowerCase();
  if (theater === 'Mars') {
    if (m === 'insight') return 'mars_seis';
    if (m === 'mro') return 'mars_ingenuity';
    return 'mars_libs';
  }
  if (theater === 'Moon') {
    if (m === 'apollo15' || m === 'apollo17' || m === 'change4') return 'moon_traverse';
    if (m === 'chandrayaan3') return 'moon_chaste';
    if (m === 'artemis3') return 'moon_scale';
    return 'moon_lrrr';
  }
  if (m === 'voyager') return 'ds_voyager';
  if (m === 'iss' || m === 'hubble') return 'ds_orbit';
  return 'ds_jwst';
}

export const ScienceSimulatorsModal: React.FC<ScienceSimulatorsModalProps> = ({
  isOpen,
  onClose,
  destination = 'Mars',
  activeMissionId = 'perseverance',
  onEarnLabXp,
  onAskAstra,
}) => {
  const effectiveTheater = useMemo(
    () => getTheaterForMission(activeMissionId, destination),
    [activeMissionId, destination]
  );

  const [activeTab, setActiveTab] = useState<SimulatorTab>(() =>
    defaultTabForMission(effectiveTheater, activeMissionId)
  );
  const [completedLabs, setCompletedLabs] = useState<Record<string, boolean>>({});

  // Mars 1: LIBS
  const [marsTarget, setMarsTarget] = useState<'seitah_olivine' | 'jezero_clay' | 'gale_hematite'>('jezero_clay');
  const [isFiringLaser, setIsFiringLaser] = useState(false);
  const [laserAnalyzed, setLaserAnalyzed] = useState(false);

  // Mars 2: MOXIE
  const [moxieTempC, setMoxieTempC] = useState(800);
  const [moxieRunning, setMoxieRunning] = useState(false);
  const [moxieSeconds, setMoxieSeconds] = useState(0);

  // Mars 3: SEIS
  const [quakeAngleDeg, setQuakeAngleDeg] = useState(42);
  const [seisAnalyzed, setSeisAnalyzed] = useState(false);

  // Mars 4: Ingenuity
  const [rotorRpm, setRotorRpm] = useState(2537);

  // Moon 1: LRRR
  const [isBouncingLaser, setIsBouncingLaser] = useState(false);
  const [laserProgress, setLaserProgress] = useState(0);
  const [roundTripTime, setRoundTripTime] = useState<number | null>(null);
  const [recessionYears, setRecessionYears] = useState(55);

  // Moon 2: ChaSTE
  const [probeDepthCm, setProbeDepthCm] = useState(0);
  const [lunarZone, setLunarZone] = useState<'polar_rim' | 'equator_noon' | 'ps_shadow'>('polar_rim');

  // Moon 3: Lunar Traverse
  const [traverseMission, setTraverseMission] = useState<'apollo15' | 'apollo17' | 'change4'>('apollo15');
  const [traverseStep, setTraverseStep] = useState(0);
  const [isPlayingTraverse, setIsPlayingTraverse] = useState(false);

  // Moon 4: Vacuum Drop
  const [isDropping, setIsDropping] = useState(false);
  const [dropProgress, setDropProgress] = useState(0);
  const [dropDone, setDropDone] = useState(false);

  // DeepSpace 1: JWST
  const [redshiftZ, setRedshiftZ] = useState(11.5);

  // DeepSpace 2: Voyager
  const [voyagerYear, setVoyagerYear] = useState(2026);

  // DeepSpace 3: Keplerian Orbit
  const [orbitAltitudeKm, setOrbitAltitudeKm] = useState(408);

  const laserTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bounceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moxieIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropRafRef = useRef<number | null>(null);
  const labSpotlight = useTourSpotlight('modal-lab');

  const markLabComplete = (expId: string) => {
    setCompletedLabs((prev) => (prev[expId] ? prev : { ...prev, [expId]: true }));
    onEarnLabXp?.(`${effectiveTheater}::${expId}`);
  };

  const clearSimulatorTimers = () => {
    if (laserTimerRef.current) {
      clearTimeout(laserTimerRef.current);
      laserTimerRef.current = null;
    }
    if (bounceIntervalRef.current) {
      clearInterval(bounceIntervalRef.current);
      bounceIntervalRef.current = null;
    }
    if (moxieIntervalRef.current) {
      clearInterval(moxieIntervalRef.current);
      moxieIntervalRef.current = null;
    }
    if (dropRafRef.current !== null) {
      cancelAnimationFrame(dropRafRef.current);
      dropRafRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      clearSimulatorTimers();
      setIsFiringLaser(false);
      setIsBouncingLaser(false);
      setIsPlayingTraverse(false);
      setMoxieRunning(false);
      setIsDropping(false);
    }
    return () => {
      clearSimulatorTimers();
    };
  }, [isOpen]);

  useEffect(() => {
    clearSimulatorTimers();
    setActiveTab(defaultTabForMission(effectiveTheater, activeMissionId));
    setLaserAnalyzed(false);
    setRoundTripTime(null);
    setDropDone(false);
    setDropProgress(0);
    setSeisAnalyzed(false);
    if (activeMissionId === 'apollo17') setTraverseMission('apollo17');
    else if (activeMissionId === 'change4') setTraverseMission('change4');
    else setTraverseMission('apollo15');
    if (activeMissionId === 'hubble') setOrbitAltitudeKm(535);
    else if (activeMissionId === 'iss') setOrbitAltitudeKm(408);
  }, [effectiveTheater, activeMissionId, isOpen]);

  useEffect(() => {
    if (!isPlayingTraverse) return;
    const timer = setInterval(() => {
      setTraverseStep((s) => (s + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, [isPlayingTraverse]);

  if (!isOpen) return null;

  const tabs = TABS_BY_THEATER[effectiveTheater];
  const theaterInfo = THEATER_META[effectiveTheater];

  const handleFireMarsLaser = () => {
    soundFx.playChirp();
    if (laserTimerRef.current) clearTimeout(laserTimerRef.current);
    setIsFiringLaser(true);
    setLaserAnalyzed(false);
    laserTimerRef.current = setTimeout(() => {
      laserTimerRef.current = null;
      soundFx.playSuccess();
      setIsFiringLaser(false);
      setLaserAnalyzed(true);
      markLabComplete('mars_libs');
    }, 1050);
  };

  const handleToggleMoxie = () => {
    soundFx.playClick();
    if (moxieRunning) {
      if (moxieIntervalRef.current) {
        clearInterval(moxieIntervalRef.current);
        moxieIntervalRef.current = null;
      }
      setMoxieRunning(false);
      return;
    }
    setMoxieRunning(true);
    markLabComplete('mars_moxie');
    moxieIntervalRef.current = setInterval(() => {
      setMoxieSeconds((s) => s + 1);
    }, 1000);
  };

  const handleTriggerLaserBounce = () => {
    soundFx.playChirp();
    if (bounceIntervalRef.current) clearInterval(bounceIntervalRef.current);
    setIsBouncingLaser(true);
    setLaserProgress(0);
    setRoundTripTime(null);
    let progress = 0;
    bounceIntervalRef.current = setInterval(() => {
      progress += 4;
      setLaserProgress(progress);
      if (progress >= 100) {
        if (bounceIntervalRef.current) {
          clearInterval(bounceIntervalRef.current);
          bounceIntervalRef.current = null;
        }
        setIsBouncingLaser(false);
        const distanceKm = 384400 + (recessionYears * 0.038) / 1000;
        const calculatedRttSec = Number(((2 * distanceKm) / 299792.458).toFixed(6));
        setRoundTripTime(calculatedRttSec);
        soundFx.playSuccess();
        markLabComplete('moon_lrrr');
      }
    }, 35);
  };

  const handleTriggerVacuumDrop = () => {
    soundFx.playChirp();
    if (dropRafRef.current !== null) {
      cancelAnimationFrame(dropRafRef.current);
      dropRafRef.current = null;
    }
    setIsDropping(true);
    setDropDone(false);
    setDropProgress(0);
    const startMs = performance.now();
    const durationMs = 1240;
    const stepFrame = (nowMs: number) => {
      const normalizedT = Math.min(1, (nowMs - startMs) / durationMs);
      // Free-fall displacement in lunar vacuum scales as y ~ 0.5 * g * t^2
      setDropProgress(normalizedT * normalizedT * 100);
      if (normalizedT < 1) {
        dropRafRef.current = requestAnimationFrame(stepFrame);
      } else {
        dropRafRef.current = null;
        setIsDropping(false);
        setDropDone(true);
        soundFx.playSuccess();
        markLabComplete('moon_scale');
      }
    };
    dropRafRef.current = requestAnimationFrame(stepFrame);
  };

  const askAstraAboutLab = (topic: string, contextMetrics: string) => {
    soundFx.playClick();
    onClose();
    onAskAstra?.(
      `[SCIENCE LAB (${theaterInfo.title.toUpperCase()}) — ${topic}]\nLive Simulator Parameters: ${contextMetrics}\nPlease explain the underlying spacecraft engineering and physics behind this measurement.`
    );
  };

  // Computed physics values
  const moxieRateGPerHr = Math.max(
    0,
    Number((((moxieTempC - 620) / 180) * 10.5).toFixed(1))
  );
  const seisPTimeSec = Math.round(quakeAngleDeg * 8.4);
  const seisSTimeSec = Math.round(quakeAngleDeg * 14.9);
  const seisDeltaSec = seisSTimeSec - seisPTimeSec;

  const marsLiftRatio = Number(((rotorRpm / 2537) ** 2 * 1.0).toFixed(2));
  const rotorTipMach = Number(((rotorRpm * 0.605 * (Math.PI / 30)) / 240).toFixed(2));

  const zoneStartTemp =
    lunarZone === 'equator_noon' ? 120 : lunarZone === 'ps_shadow' ? -173 : 50;
  const zoneDeepTemp =
    lunarZone === 'equator_noon' ? 35 : lunarZone === 'ps_shadow' ? -220 : -12;
  const chasteTempAtDepth = Math.round(
    zoneStartTemp - (zoneStartTemp - zoneDeepTemp) * Math.pow(probeDepthCm / 10, 0.72)
  );

  // Deep Space physics
  const restWavelengthNm = 500; // visible cyan/green starlight (H-beta / [OIII])
  const observedMicrons = Number(((restWavelengthNm / 1000) * (1 + redshiftZ)).toFixed(2));
  const voyagerAu = Number((Math.max(1, (voyagerYear - 1977) * 3.57)).toFixed(1));
  const voyagerLightHours = Number(((voyagerAu * 499) / 3600).toFixed(1));
  const voyagerRtgWatts = Math.max(
    180,
    Math.round(470 * Math.pow(0.5, (voyagerYear - 1977) / 87.7) * Math.pow(0.992, voyagerYear - 1977))
  );

  const earthR = 6371;
  const earthMu = 398600.4;
  const orbitR = earthR + orbitAltitudeKm;
  const orbitalVelKmS = Number(Math.sqrt(earthMu / orbitR).toFixed(2));
  const orbitalPeriodMin = Number(((2 * Math.PI * Math.sqrt(Math.pow(orbitR, 3) / earthMu)) / 60).toFixed(1));
  const sunrisesPerDay = Math.max(1, Math.round(1440 / orbitalPeriodMin));

  const TRAVERSE_DATA = {
    apollo15: {
      title: 'Apollo 15 · Hadley-Apennine Canyon (27.9 km)',
      desc: 'LRV-1 traversed volcanic lava plains and mountain scarps in July–August 1971.',
      steps: [
        { label: 'Station 1', name: 'Falcon LM Touchdown', dist: '0.0 km', sample: 'Mare Imbrium basalt plain' },
        { label: 'Station 2', name: 'Mount Hadley Delta', dist: '5.2 km', sample: 'Genesis Rock (Sample 15415, 4.1B yr)' },
        { label: 'Station 6', name: 'Apennine Front Scarp', dist: '14.8 km', sample: 'Highland impact breccia ledges' },
        { label: 'Station 9', name: 'Hadley Rille Rim', dist: '27.9 km', sample: '300m deep exposed lava strata' },
      ],
    },
    apollo17: {
      title: 'Apollo 17 · Taurus-Littrow Valley (35.9 km)',
      desc: 'Crewed lunar distance record (110.5 kg samples) by Eugene Cernan & Harrison Schmitt.',
      steps: [
        { label: 'Station 1', name: 'Challenger LM Site', dist: '0.0 km', sample: 'ALSEP & heat flow array' },
        { label: 'Station 4', name: 'Shorty Crater Rim', dist: '7.4 km', sample: 'Orange glass beads (Sample 74220)' },
        { label: 'Station 6', name: 'North Massif Boulder', dist: '21.6 km', sample: 'Deep-crust Troctolite 76535' },
        { label: 'Station 9', name: 'Van Serg Crater', dist: '35.9 km', sample: 'Map-taped LRV fender trek' },
      ],
    },
    change4: {
      title: "Chang'e 4 & Yutu-2 · Von Kármán Crater Far Side",
      desc: 'Lunar Penetrating Radar & Queqiao L2 relay inside South Pole–Aitken Basin.',
      steps: [
        { label: 'Sol 1', name: 'Chang’e 4 Ramp Rollout', dist: '0 m', sample: '0–12m fine regolith dust layer' },
        { label: 'Month 6', name: 'Mantle Ejecta Field', dist: '240 m', sample: 'Olivine & low-Ca pyroxene spectra' },
        { label: 'Year 2', name: 'LPR 40m Tomography', dist: '680 m', sample: 'Coarse ancient ejecta strata' },
        { label: 'Year 5', name: 'Deep Crater Survey', dist: '1,600+ m', sample: 'Queqiao L2 far-side relay link' },
      ],
    },
  };

  return (
    <ModalShell
      id="science-simulators-modal"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      eyebrow={`Science Lab · ${theaterInfo.title} Theater`}
      title={
        effectiveTheater === 'Mars'
          ? 'Martian Instrument & Physics Simulators'
          : effectiveTheater === 'Moon'
            ? 'Lunar Instrument & Physics Simulators'
            : 'Deep Space & Orbital Physics Simulators'
      }
      subtitle={`Strictly scoped to verified ${theaterInfo.shortLabel} missions (+25 XP per completed experiment)`}
      statusBadge={{
        label: `${Object.keys(completedLabs).filter((k) => k.startsWith(effectiveTheater === 'Mars' ? 'mars_' : effectiveTheater === 'Moon' ? 'moon_' : 'ds_')).length}/${tabs.length} Verified`,
        tone: 'accent',
      }}
    >
      <div className={`space-y-5 rounded-2xl p-2 -m-2 ${labSpotlight.className}`}>
        {/* Theater-Isolated Lab Tab Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const done = Boolean(completedLabs[tab.id]);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--accent-surface)] border-[var(--accent-border)] text-white'
                    : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MARS LAB 1: SUPERCAM LIBS SPECTROMETRY (STRICTLY MARS ROCKS)    */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'mars_libs' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">
                  SuperCam LIBS Martian Rock Spectrometry
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Pulse a 1064 nm laser onto Martian outcrops to vaporize rock into plasma and read habitability minerals.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleFireMarsLaser}
                disabled={isFiringLaser}
                icon={<Zap className="w-4 h-4" />}
              >
                {isFiringLaser ? 'Vaporizing rock...' : 'Fire 1064 nm Laser'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'jezero_clay',
                  label: 'Jezero Delta Clay',
                  loc: 'Belva & Neretva Fan · Mars',
                  primary: 'Phyllosilicates, Silica & Carbonates',
                },
                {
                  id: 'seitah_olivine',
                  label: 'Séítah Olivine Basalt',
                  loc: 'Jezero Crater Floor · Mars',
                  primary: 'Magnesium-Iron Silicates (Fe, Mg)',
                },
                {
                  id: 'gale_hematite',
                  label: 'Gale Hematite Ridge',
                  loc: 'Vera Rubin Ridge · Mount Sharp',
                  primary: 'Oxidized Iron & Hydrated Sulfates',
                },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setMarsTarget(t.id as typeof marsTarget);
                    setLaserAnalyzed(false);
                  }}
                  className={`p-4 rounded-xl text-left border transition-colors cursor-pointer space-y-1 ${
                    marsTarget === t.id
                      ? 'bg-[var(--accent-surface)] border-[var(--accent-border)] text-white'
                      : 'hud-well text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-semibold block text-white">{t.label}</span>
                  <span className="text-xs text-[var(--accent-text)] font-mono block">{t.loc}</span>
                  <span className="text-xs text-slate-400 block">{t.primary}</span>
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-5 rounded-xl hud-well space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span>Martian Plasma Emission Spectrum (300–850 nm)</span>
                </span>
                <Badge tone={laserAnalyzed ? 'success' : 'neutral'}>
                  {laserAnalyzed ? 'Mineral Signature Resolved (+25 XP)' : 'Standby for laser pulse'}
                </Badge>
              </div>

              <div className="relative h-36 w-full bg-slate-950 rounded-xl border border-slate-800 p-3 flex items-end justify-between gap-2 overflow-hidden">
                {isFiringLaser && (
                  <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center animate-pulse">
                    <div className="w-full h-0.5 bg-orange-400" />
                  </div>
                )}
                {[
                  { elem: 'Fe', h: laserAnalyzed ? (marsTarget === 'gale_hematite' ? 92 : marsTarget === 'seitah_olivine' ? 74 : 42) : 10, col: '#D9774B' },
                  { elem: 'Mg', h: laserAnalyzed ? (marsTarget === 'seitah_olivine' ? 88 : 34) : 8, col: '#f59e0b' },
                  { elem: 'Si', h: laserAnalyzed ? (marsTarget === 'jezero_clay' ? 94 : 62) : 14, col: '#9DB4D3' },
                  { elem: 'Ca', h: laserAnalyzed ? (marsTarget === 'jezero_clay' ? 76 : 36) : 12, col: '#34d399' },
                  { elem: 'S', h: laserAnalyzed ? (marsTarget === 'gale_hematite' ? 80 : 28) : 7, col: '#fbbf24' },
                  { elem: 'Al', h: laserAnalyzed ? (marsTarget === 'jezero_clay' ? 68 : 30) : 9, col: '#cbd5e1' },
                  { elem: 'O', h: laserAnalyzed ? 82 : 16, col: '#64748b' },
                ].map((peak) => (
                  <div key={peak.elem} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      className="w-full rounded-t transition-all duration-700"
                      style={{ height: `${peak.h}%`, backgroundColor: peak.col }}
                    />
                    <span className="text-xs font-mono font-semibold text-slate-300">{peak.elem}</span>
                  </div>
                ))}
              </div>
              {onAskAstra && (
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => askAstraAboutLab('SuperCam LIBS Spectrometry', `Mars sample target=${marsTarget}`)}
                    icon={<MessageSquare className="w-3.5 h-3.5" />}
                  >
                    Ask Astra about this Martian rock
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MARS LAB 2: MOXIE SOLID-OXIDE OXYGEN REACTOR                    */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'mars_moxie' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">
                  MOXIE Martian Atmosphere Oxygen Reactor
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Compress Mars&apos;s 95% CO₂ atmosphere (~6.1 mbar) and split oxygen via solid-oxide electrolysis: 2 CO₂ → 2 CO + O₂.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleToggleMoxie}
                icon={moxieRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              >
                {moxieRunning ? 'Pause Electrolysis' : 'Start SOXE Cell'}
              </Button>
            </div>

            <div className="p-5 rounded-xl hud-well space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Solid-Oxide Cell Operating Temperature</span>
                <span className="text-white font-semibold">{moxieTempC}°C (Nominal ~800°C)</span>
              </div>
              <input
                type="range"
                min={650}
                max={850}
                step={10}
                value={moxieTempC}
                onChange={(e) => {
                  setMoxieTempC(parseInt(e.target.value, 10));
                  markLabComplete('mars_moxie');
                }}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Stat label="Pure O₂ Production Rate" value={`${moxieRateGPerHr} g/hr`} mono />
                <Stat
                  label="Cumulative Session Yield (10x Rate)"
                  value={`${((moxieRateGPerHr / 3600) * moxieSeconds * 10).toFixed(3)} g O₂`}
                  mono
                />
                <Stat
                  label="Human Support Ratio"
                  value={moxieRateGPerHr >= 9 ? '~1.5 small-animal metabolic rate' : 'Below optimal threshold'}
                />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Across 16 runs on Perseverance, MOXIE produced <strong>122 grams of oxygen</strong> at up to 98% purity. Scaling MOXIE 200x will fill ascent-vehicle liquid oxygen tanks for the first human Mars return rocket!
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MARS LAB 3: INSIGHT SEIS MARSQUAKE WAVE SIMULATOR               */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'mars_seis' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">
                  InSight SEIS Interior Wave &amp; Marsquake Lab
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Measure P-wave vs S-wave travel separation from Cerberus Fossae faults to probe Mars&apos;s crust, mantle &amp; molten core.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  soundFx.playChirp();
                  setSeisAnalyzed(true);
                  markLabComplete('mars_seis');
                }}
                icon={<Activity className="w-4 h-4" />}
              >
                Log Marsquake Event
              </Button>
            </div>

            <div className="p-5 rounded-xl hud-well space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Epicentral Angular Distance (Δ)</span>
                <span className="text-white font-semibold">{quakeAngleDeg}° (~{Math.round(quakeAngleDeg * 59.2).toLocaleString()} km from Elysium)</span>
              </div>
              <input
                type="range"
                min={15}
                max={95}
                step={1}
                value={quakeAngleDeg}
                onChange={(e) => setQuakeAngleDeg(parseInt(e.target.value, 10))}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Stat label="Primary P-Wave Arrival" value={`${seisPTimeSec} s`} mono />
                <Stat label="Shear S-Wave Arrival" value={`${seisSTimeSec} s`} mono />
                <Stat label="S − P Separation (Δt)" value={`${seisDeltaSec} s`} sublabel="Confirms core shadow at >100°" mono />
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-white/[0.06] text-xs text-slate-300 flex items-center justify-between">
                <span>
                  {quakeAngleDeg > 80
                    ? 'Core-reflected ScS waves isolate Mars’s liquid iron-alloy core (~1,830 km radius).'
                    : 'Crustal reflections constrain Elysium Planitia crust thickness between 39 and 72 km.'}
                </span>
                {seisAnalyzed && <Badge tone="success">Logged (+25 XP)</Badge>}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MARS LAB 4: INGENUITY THIN-AIR AERODYNAMICS                     */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'mars_ingenuity' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white font-display">
                Ingenuity Thin-Air Martian Rotor Physics
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Mars air density is just 0.020 kg/m³ (~1% of Earth) paired with 3.72 m/s² gravity — requiring 2,500+ RPM counter-rotating blades.
              </p>
            </div>
            <div className="p-5 rounded-xl hud-well space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Carbon-Fiber Rotor Speed</span>
                <span className="text-white font-semibold">{rotorRpm} RPM</span>
              </div>
              <input
                type="range"
                min={1800}
                max={2800}
                step={25}
                value={rotorRpm}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setRotorRpm(val);
                  if (val >= 2450) markLabComplete('mars_ingenuity');
                }}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Stat label="Mars Hover Thrust Ratio" value={`${marsLiftRatio}x`} sublabel={marsLiftRatio >= 1 ? 'Positive climb margin' : 'Insufficient lift'} mono />
                <Stat label="Blade Tip Speed" value={`Mach ${rotorTipMach}`} sublabel="Mars sound speed ~240 m/s" mono />
                <Stat label="Flight Status" value={rotorRpm >= 2450 ? 'Airborne Hover Ready' : 'Spin Up > 2,450 RPM'} />
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MOON LAB 1: APOLLO LASER RETROREFLECTOR & RECESSION            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'moon_lrrr' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">
                  Apollo Laser Ranging Retroreflector (LRRR)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Active since July 21, 1969. Measures Earth–Moon distance to millimeter precision off 100 fused-silica corner cubes.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleTriggerLaserBounce}
                disabled={isBouncingLaser}
                icon={<Play className="w-4 h-4" />}
              >
                {isBouncingLaser ? 'Photons in transit...' : 'Fire Earth Laser (384,400 km)'}
              </Button>
            </div>

            <div className="p-5 rounded-xl hud-well space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>McDonald / Apache Point Observatory</span>
                <span className="text-slate-400">299,792 km/s</span>
                <span>Tranquility Base LRRR</span>
              </div>
              <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-primary)] rounded-full transition-all"
                  style={{ width: `${laserProgress}%` }}
                />
              </div>

              <div className="pt-2 space-y-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Project Tidal Lunar Drift (+3.8 cm / year)</span>
                  <span className="text-white font-semibold">+{recessionYears} Years → +{(recessionYears * 0.038).toFixed(2)} meters farther</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={recessionYears}
                  onChange={(e) => setRecessionYears(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--accent-primary)] cursor-pointer"
                />
              </div>

              {roundTripTime !== null && (() => {
                const distanceKm = 384400 + (recessionYears * 0.038) / 1000;
                const liveRtt = Number(((2 * distanceKm) / 299792.458).toFixed(6));
                return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Stat label="Measured Round-Trip Light Time" value={`${liveRtt} s`} mono />
                  <Stat label="Laser-Ranged Distance" value={`${distanceKm.toFixed(6)} km (±2 mm)`} mono />
                </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MOON LAB 2: CHANDRAYAAN-3 ChaSTE POLAR REGOLITH THERMAL PROBE   */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'moon_chaste' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white font-display">
                ChaSTE Polar Regolith Thermal Insulation Profile
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Drive the Vikram ChaSTE needle probe into vacuum dust and compare steep insulation across lunar illumination regimes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'polar_rim', label: 'Shiv Shakti (69°S)', desc: '+50°C surface rim' },
                { id: 'equator_noon', label: 'Equatorial Noon', desc: '+120°C direct sun' },
                { id: 'ps_shadow', label: 'Shackleton Shadow', desc: '−173°C cryogenic trap' },
              ].map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setLunarZone(z.id as typeof lunarZone);
                  }}
                  className={`p-3 rounded-xl text-left border cursor-pointer transition-colors ${
                    lunarZone === z.id
                      ? 'bg-[var(--accent-surface)] border-[var(--accent-border)] text-white'
                      : 'hud-well text-slate-300'
                  }`}
                >
                  <div className="text-xs font-semibold">{z.label}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">{z.desc}</div>
                </button>
              ))}
            </div>

            <div className="p-5 rounded-xl hud-well space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">ChaSTE Subsurface Probe Depth</span>
                <span className="text-white font-semibold">{probeDepthCm} cm below regolith</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={probeDepthCm}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setProbeDepthCm(val);
                  if (val >= 6) markLabComplete('moon_chaste');
                }}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Stat label="Surface Temp (0 cm)" value={`${zoneStartTemp > 0 ? `+${zoneStartTemp}` : zoneStartTemp}°C`} mono />
                <Stat
                  label={`Probe Depth (${probeDepthCm} cm)`}
                  value={`${chasteTempAtDepth > 0 ? `+${chasteTempAtDepth}` : chasteTempAtDepth}°C`}
                  sublabel={probeDepthCm >= 6 ? 'Strong vacuum dust insulation confirmed' : 'Push probe deeper'}
                  mono
                />
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MOON LAB 3: LUNAR EVA TRAVERSE & LPR SUBSURFACE RADAR           */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'moon_traverse' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">
                  {TRAVERSE_DATA[traverseMission].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  {TRAVERSE_DATA[traverseMission].desc}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsPlayingTraverse((p) => !p);
                  markLabComplete('moon_traverse');
                }}
                icon={isPlayingTraverse ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              >
                {isPlayingTraverse ? 'Pause Route' : 'Auto-Play Route'}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['apollo15', 'apollo17', 'change4'] as const).map((mKey) => (
                <button
                  key={mKey}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setTraverseMission(mKey);
                    setTraverseStep(0);
                    markLabComplete('moon_traverse');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                    traverseMission === mKey
                      ? 'bg-[var(--accent-surface)] border-[var(--accent-border)] text-white'
                      : 'hud-well text-slate-300'
                  }`}
                >
                  {mKey === 'apollo15' ? 'Apollo 15 LRV-1' : mKey === 'apollo17' ? 'Apollo 17 Shorty' : "Chang'e 4 LPR"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {TRAVERSE_DATA[traverseMission].steps.map((s, idx) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setTraverseStep(idx);
                    markLabComplete('moon_traverse');
                  }}
                  className={`p-4 rounded-xl text-left border transition-colors cursor-pointer space-y-1 ${
                    traverseStep === idx
                      ? 'bg-[var(--accent-surface)] border-[var(--accent-border)] text-white'
                      : 'hud-well text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-mono text-[var(--accent-text)] font-semibold block">
                    {s.label} · {s.dist}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold block text-white">{s.name}</span>
                  <span className="text-xs text-slate-400 block">{s.sample}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MOON LAB 4: VACUUM GRAVITY DROP & LANDER SCALE                  */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'moon_scale' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">
                  Lunar Gravity Drop (1.62 m/s²) &amp; Lander Scale
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Reproduce David Scott&apos;s Apollo 15 vacuum hammer-and-feather drop and compare lunar landers to scale.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleTriggerVacuumDrop}
                disabled={isDropping}
                icon={<ArrowDown className="w-4 h-4" />}
              >
                {isDropping ? 'Falling in Vacuum...' : 'Run Hammer & Feather Drop'}
              </Button>
            </div>

            <div className="p-4 rounded-xl hud-well space-y-3">
              <div className="grid grid-cols-2 gap-4 h-24 bg-slate-950 rounded-xl border border-slate-800 p-3 relative overflow-hidden">
                <div className="flex flex-col items-center relative">
                  <span className="text-[11px] font-mono text-slate-400">1.3 kg Geological Hammer</span>
                  <div
                    className="w-5 h-3 rounded bg-slate-200 absolute"
                    style={{ top: `${22 + dropProgress * 0.6}%` }}
                  />
                </div>
                <div className="flex flex-col items-center relative">
                  <span className="text-[11px] font-mono text-slate-400">30 g Falcon Feather</span>
                  <div
                    className="w-6 h-1.5 rounded-full bg-amber-300 absolute"
                    style={{ top: `${22 + dropProgress * 0.6}%` }}
                  />
                </div>
              </div>
              {dropDone && (
                <div className="text-xs font-mono text-emerald-300 text-center">
                  Simultaneous impact confirmed at t = 1.24 s from 1.25 m · Zero atmospheric drag (+25 XP)
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl hud-well">
              {[
                { name: 'Vikram (Chandrayaan-3)', height: '2.0 m', meters: 2.0, mass: '1,749 kg' },
                { name: 'Apollo 11 Eagle LM', height: '7.0 m', meters: 7.0, mass: '15,103 kg' },
                { name: 'Artemis III Starship HLS', height: '50.0 m', meters: 50.0, mass: '1,200 t' },
              ].map((l) => {
                const barHeightPx = Math.max(6, Math.round((l.meters / 50) * 144));
                return (
                <div key={l.name} className="text-center space-y-2">
                  <div className="h-36 flex items-end justify-center">
                    <div
                      className="w-14 rounded-t-xl bg-slate-700/80 border border-slate-500 flex items-end justify-center pb-1 text-[10px] font-mono text-white leading-none"
                      style={{ height: `${barHeightPx}px` }}
                    >
                      {l.height}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-white">{l.name}</div>
                  <div className="text-[11px] font-mono text-slate-400">{l.mass}</div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* DEEP SPACE LAB 1: JWST COSMOLOGICAL REDSHIFT                    */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ds_jwst' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white font-display">
                JWST Cosmological Redshift &amp; Infrared Translator
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Slide galaxy redshift (z) to see how cosmic expansion stretches 500 nm visible starlight into Webb&apos;s NIRCam &amp; MIRI infrared bands.
              </p>
            </div>
            <div className="p-5 rounded-xl hud-well space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Cosmological Redshift (z)</span>
                <span className="text-white font-semibold">z = {redshiftZ.toFixed(1)} ({redshiftZ >= 10 ? 'Cosmic Dawn' : redshiftZ >= 3 ? 'Peak Star Formation' : 'Nearby Universe'})</span>
              </div>
              <input
                type="range"
                min={0}
                max={14}
                step={0.5}
                value={redshiftZ}
                onChange={(e) => {
                  setRedshiftZ(parseFloat(e.target.value));
                  markLabComplete('ds_jwst');
                }}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Stat label="Observed Wavelength" value={`${observedMicrons} µm`} mono />
                <Stat
                  label="JWST Instrument Band"
                  value={observedMicrons > 5 ? 'MIRI (5–28 µm Cryo 6.7 K)' : observedMicrons > 0.6 ? 'NIRCam (0.6–5 µm Gold Mirror)' : 'Hubble Optical Band'}
                />
                <Stat label="Sunshield Gradient" value="+85°C Sun → −233°C Shade" mono />
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* DEEP SPACE LAB 2: VOYAGER HELIOPAUSE & LIGHT DELAY              */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ds_voyager' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white font-display">
                Voyager 1 Interstellar Distance &amp; RTG Power Timeline
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Scrub Voyager 1&apos;s trajectory from 1977 launch through Jupiter/Saturn gravity assists and the 2012 Heliopause into interstellar space.
              </p>
            </div>
            <div className="p-5 rounded-xl hud-well space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Mission Year</span>
                <span className="text-white font-semibold">{voyagerYear} ({voyagerYear >= 2012 ? 'Interstellar Medium' : voyagerYear >= 1980 ? 'Heliosphere Cruise' : 'Outer Planet Flybys'})</span>
              </div>
              <input
                type="range"
                min={1977}
                max={2026}
                step={1}
                value={voyagerYear}
                onChange={(e) => {
                  setVoyagerYear(parseInt(e.target.value, 10));
                  markLabComplete('ds_voyager');
                }}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Stat label="Heliocentric Range" value={`${voyagerAu} AU`} sublabel={`${(voyagerAu * 0.1496).toFixed(1)} billion km`} mono />
                <Stat label="One-Way Radio Delay" value={`${voyagerLightHours} hours`} sublabel={`Round trip ${(voyagerLightHours * 2).toFixed(1)} hrs`} mono />
                <Stat label="MHW-RTG Electrical Bus" value={`${voyagerRtgWatts} W`} sublabel="Started 470 W in 1977" mono />
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* DEEP SPACE LAB 3: ISS & HUBBLE KEPLERIAN ORBITAL MECHANICS      */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ds_orbit' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">
                  Keplerian Earth Orbit Mechanics Lab
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Adjust orbital altitude to see how velocity and orbital period vary from ISS (408 km) and Hubble (535 km) to Geostationary satellites.
                </p>
              </div>
              <div className="flex gap-1.5">
                {[
                  { label: 'ISS (408 km)', alt: 408 },
                  { label: 'Hubble (535 km)', alt: 535 },
                  { label: 'GEO (35,786 km)', alt: 35786 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setOrbitAltitudeKm(preset.alt);
                      markLabComplete('ds_orbit');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer ${
                      orbitAltitudeKm === preset.alt
                        ? 'bg-[var(--accent-surface)] border-[var(--accent-border)] text-white'
                        : 'hud-well text-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl hud-well space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Orbital Altitude Above Sea Level</span>
                <span className="text-white font-semibold">{orbitAltitudeKm.toLocaleString()} km</span>
              </div>
              <input
                type="range"
                min={350}
                max={35786}
                step={25}
                value={orbitAltitudeKm}
                onChange={(e) => {
                  setOrbitAltitudeKm(parseInt(e.target.value, 10));
                  markLabComplete('ds_orbit');
                }}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Stat label="Circular Orbital Speed" value={`${orbitalVelKmS} km/s`} sublabel={`${Math.round(orbitalVelKmS * 3600).toLocaleString()} km/h`} mono />
                <Stat
                  label="Orbital Period"
                  value={orbitalPeriodMin >= 120 ? `${(orbitalPeriodMin / 60).toFixed(1)} hrs` : `${orbitalPeriodMin} min`}
                  mono
                />
                <Stat label="Sunrises per 24h" value={`${sunrisesPerDay} cycles`} mono />
              </div>
            </div>
          </div>
        )}

        {/* Shared Interactive Footer */}
        {onAskAstra && (
          <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span className="font-mono">
              Theater lock: <strong className="text-slate-200">{theaterInfo.title}</strong>
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                askAstraAboutLab(
                  tabs.find((t) => t.id === activeTab)?.label || activeTab,
                  `mission=${activeMissionId}, tab=${activeTab}, moxieTempC=${moxieTempC}, moxieSec=${moxieSeconds}, quakeAngle=${quakeAngleDeg}, rotorRpm=${rotorRpm}, recessionYr=${recessionYears}, probeDepthCm=${probeDepthCm}, lunarZone=${lunarZone}`
                )
              }
              icon={<MessageSquare className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
            >
              Discuss experiment with Astra
            </Button>
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export default ScienceSimulatorsModal;
