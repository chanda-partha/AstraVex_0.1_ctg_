import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DestinationType, HardwareItem, MissionData, ResolvedNasaPayload } from '../types';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Rover3DModel } from '../components/3d/Rover3DModel';
import { MarsRealPanorama } from '../components/3d/MarsRealPanorama';
import { LunarRealEnvironment } from '../components/3d/LunarRealEnvironment';
import { CanvasErrorBoundary } from '../components/common/CanvasErrorBoundary';
import * as THREE from 'three';
import {
  Compass,
  BookOpen,
  HelpCircle,
  Info,
  ChevronDown,
  Sun,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  RotateCcw,
  Tv,
  Film,
  Globe
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface MarsExplorationSceneProps {
  destination: DestinationType;
  resolvedData: ResolvedNasaPayload | null;
  onSelectMission: (missionId: string) => void;
  onSelectHardware: (hardwareId: string) => void;
  onOpenHardwareInspect: () => void;
  onOpenStory: () => void;
  onOpenQuiz: () => void;
  onOpenLandingVideo?: () => void;
  onSwitchDestination?: (dest: DestinationType) => void;
  onReturnToDestinations?: () => void;
}

// 🎥 UNIFIED FLUID CAMERA RIG & ORBIT CONTROLLER
// Eliminates camera jitter, controls fighting, and orientation snaps.
// Synchronizes camera position and OrbitControls target simultaneously in useFrame.
// When user starts manual touch/mouse drag, automated transitions yield instantly (zero fighting).
function CameraRig({
  activeHotspotId,
  isMars,
  isStarship,
  resetTrigger,
  autoRotate,
}: {
  activeHotspotId: string;
  isMars: boolean;
  isStarship: boolean;
  resetTrigger: number;
  autoRotate: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Preset cinematic inspection targets (safely cleared outside meshes)
  const targetMap: { [id: string]: { pos: [number, number, number]; lookAt: [number, number, number] } } = {
    // Mars Perseverance & Instruments
    supercam: { pos: [2.4, 2.4, 2.4], lookAt: [0.3, 1.8, 0.7] },
    moxie: { pos: [-2.8, 1.6, 1.8], lookAt: [-0.8, 0.8, 0] },
    pixl: { pos: [-2.2, 1.4, 2.8], lookAt: [-0.3, 0.6, 1.3] },
    rimfax: { pos: [1.8, 1.4, -2.8], lookAt: [0, 0.6, -1.2] },
    ingenuity: { pos: [4.2, 1.8, 2.4], lookAt: [2.6, 0.4, 0.8] },

    // Artemis III Starship HLS & Lunar Base Subsystems
    'hls-crew-cabin': { pos: [4.2, 6.2, 4.2], lookAt: [0, 5.8, 1.0] },
    'hls-elevator': { pos: [2.8, 2.6, 3.2], lookAt: [0, 2.2, 1.3] },
    'hls-solar-wrap': { pos: [-3.8, 4.2, 2.2], lookAt: [-1.2, 3.8, 0] },
    'hls-landing-legs': { pos: [3.8, 1.2, 2.4], lookAt: [1.5, 0.4, 0] },
    'hls-raptor-engines': { pos: [2.8, 1.2, -2.8], lookAt: [0, 0.6, -0.9] },
    'lunar-habitat': { pos: [3.6, 2.2, 3.6], lookAt: [0, 1.2, 0] },

    // LADEE Lunar Orbiter Subsystems
    'ladee-ldex': { pos: [2.2, 1.4, 2.2], lookAt: [0, 0.8, 0.6] },
    'ladee-nms': { pos: [-2.2, 1.2, 1.8], lookAt: [-0.6, 0.5, 0] },
    'ladee-llcd': { pos: [2.4, 1.6, -1.8], lookAt: [0.5, 0.9, -0.4] },

    // Apollo 11 Lunar Module & Surface
    'apollo-astronaut': { pos: [4.2, 2.2, 3.2], lookAt: [2.2, 1.2, 1.2] },
    'lunar-laser-retro': { pos: [-3.8, 1.6, 3.0], lookAt: [-2.2, 0.4, 1.4] },
    'lunar-antenna': { pos: [4.5, 2.2, -1.5], lookAt: [2.6, 1.0, -1.2] },
    'apollo-ascent-stage': { pos: [4.2, 3.8, 4.2], lookAt: [0, 2.5, 0] },
    'eagle-descent-stage': { pos: [4.8, 2.4, 4.8], lookAt: [0, 1.2, 0.4] },
    'apollo-landing-gear': { pos: [-3.8, 1.6, 2.2], lookAt: [-1.3, 0.35, 0] },

    // Apollo 15 LRV
    'apollo15-lrv': { pos: [3.4, 2.0, 3.0], lookAt: [0, 0.6, 0] },
    'apollo15-drill': { pos: [-2.8, 1.8, 1.8], lookAt: [-0.6, 0.6, -0.8] },
    'lrv-antenna': { pos: [2.6, 2.4, 2.6], lookAt: [0.4, 1.6, 0.6] },
    'lrv-camera': { pos: [1.8, 2.0, 2.2], lookAt: [-0.4, 1.2, 0.7] },
    'lrv-astronaut': { pos: [3.6, 2.2, 2.6], lookAt: [1.8, 1.2, 1.2] },

    // Chandrayaan-3 Vikram & Pragyan
    'vikram-lander': { pos: [4.2, 2.4, 4.2], lookAt: [0, 1.4, 0] },
    'pragyan-rover': { pos: [2.8, 1.6, 2.4], lookAt: [0.8, 0.6, 0.6] },
    'chaste-probe': { pos: [-2.6, 1.4, 2.2], lookAt: [-0.7, 0.4, 0.5] },
    'rambha-plasma': { pos: [2.4, 2.2, -2.4], lookAt: [0.5, 1.2, -0.6] },

    // Apollo 17
    'orange-soil-sampler': { pos: [-2.6, 1.4, 2.2], lookAt: [-0.8, 0.5, 0.8] },

    // InSight Mars
    seis: { pos: [2.6, 1.2, 2.2], lookAt: [1.1, 0.15, 0.7] },
    hp3: { pos: [2.2, 1.2, -2.4], lookAt: [0.7, 0.15, -0.9] },
    'solar-arrays': { pos: [-3.8, 1.8, 0], lookAt: [-1.5, 0.65, 0] },
    arm: { pos: [1.8, 1.8, 2.4], lookAt: [0.2, 0.75, 0.8] },

    // Curiosity MSL
    'curiosity-chassis': { pos: [3.6, 2.4, 3.6], lookAt: [0, 1.0, 0] },
    chemcam: { pos: [2.4, 2.4, 2.4], lookAt: [0.3, 1.8, 0.7] },
    mastcam: { pos: [2.2, 2.4, 2.2], lookAt: [0.1, 1.85, 0.6] },
    apxs: { pos: [-2.2, 1.4, 2.8], lookAt: [-0.3, 0.6, 1.3] },

    // JWST & Orbital
    'jwst-mirror': { pos: [3.2, 2.8, 3.6], lookAt: [0, 1.4, 0.4] },
    'jwst-sunshield': { pos: [4.2, 2.0, 3.2], lookAt: [0, 0.2, 0] },
    'jwst-nircam': { pos: [2.6, 2.4, -2.8], lookAt: [0, 1.2, -0.6] },
    'iss-solar': { pos: [4.8, 2.4, 2.2], lookAt: [1.8, 0.6, 0] },
    'iss-lab': { pos: [2.4, 1.8, 2.4], lookAt: [0, 0.4, 0.3] },
    'iss-cupola': { pos: [2.2, 1.4, -2.2], lookAt: [0, 0.1, -0.4] },
    hirise: { pos: [2.6, 1.8, 2.6], lookAt: [0, 0.5, 0.6] },
    'mro-dish': { pos: [2.8, 2.4, -1.8], lookAt: [0.6, 0.9, -0.4] },
    'voyager-dish': { pos: [2.8, 2.2, 2.0], lookAt: [0, 0.9, 0] },
    'golden-record': { pos: [-2.2, 1.6, 1.8], lookAt: [-0.4, 0.4, 0.2] },
  };

  const isTransitioning = useRef(false);

  const defaultPos = useMemo(() => {
    if (isMars) return new THREE.Vector3(4.8, 2.4, 4.8);
    if (isStarship) return new THREE.Vector3(7.2, 5.4, 8.8);
    return new THREE.Vector3(6.5, 3.0, 7.0);
  }, [isMars, isStarship]);

  const defaultLook = useMemo(() => {
    if (isMars) return new THREE.Vector3(0, 0.9, 0);
    if (isStarship) return new THREE.Vector3(0, 3.6, 0);
    return new THREE.Vector3(0, 1.4, 0);
  }, [isMars, isStarship]);

  const targetPos = useRef<THREE.Vector3>(defaultPos.clone());
  const targetLook = useRef<THREE.Vector3>(defaultLook.clone());

  useEffect(() => {
    if (!activeHotspotId || !targetMap[activeHotspotId]) {
      targetPos.current.copy(defaultPos);
      targetLook.current.copy(defaultLook);
      isTransitioning.current = true;
      if (controlsRef.current) {
        controlsRef.current.target.copy(defaultLook);
      }
      return;
    }

    const cfg = targetMap[activeHotspotId];
    targetPos.current.set(...cfg.pos);
    targetLook.current.set(...cfg.lookAt);
    isTransitioning.current = true;
  }, [activeHotspotId, resetTrigger, defaultPos, defaultLook]);

  useFrame((_, delta) => {
    if (!isTransitioning.current || !controlsRef.current) return;

    const step = Math.min(1, delta * 3.6);
    camera.position.lerp(targetPos.current, step);
    controlsRef.current.target.lerp(targetLook.current, step);
    controlsRef.current.update();

    if (
      camera.position.distanceTo(targetPos.current) < 0.04 &&
      controlsRef.current.target.distanceTo(targetLook.current) < 0.04
    ) {
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      minPolarAngle={0.05}
      maxPolarAngle={Math.PI / 2 + 0.05}
      minDistance={0.8}
      maxDistance={40.0}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.75}
      enablePan={true}
      screenSpacePanning={true}
      panSpeed={0.8}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      onStart={() => {
        // Immediate yield to user interaction - zero fighting
        isTransitioning.current = false;
      }}
    />
  );
}

// ☀️ SPECULAR SUNLIGHT SWEEP ENGINE
function CinematicStudioLighting({
  isStudioLighting,
  isMars,
  isSweeping,
}: {
  isStudioLighting: boolean;
  isMars: boolean;
  isSweeping: boolean;
}) {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const sweepAngleRef = useRef(0);

  useFrame((_, delta) => {
    if (isSweeping && dirLightRef.current) {
      sweepAngleRef.current += delta * 2.8;
      const x = Math.cos(sweepAngleRef.current) * 14;
      const z = Math.sin(sweepAngleRef.current) * 14;
      dirLightRef.current.position.set(x, 14, z);
      dirLightRef.current.intensity = 3.6;
    } else if (dirLightRef.current) {
      dirLightRef.current.position.lerp(new THREE.Vector3(12, 18, 12), delta * 2.0);
      dirLightRef.current.intensity = isStudioLighting ? 1.8 : (isMars ? 2.4 : 3.8);
    }
  });

  return (
    <group>
      <ambientLight intensity={isStudioLighting ? 0.6 : (isMars ? 0.55 : 0.22)} />
      <directionalLight
        ref={dirLightRef}
        position={[12, 18, 12]}
        intensity={isStudioLighting ? 1.8 : (isMars ? 2.4 : 3.8)}
        color={isMars && !isStudioLighting ? '#ffdcc7' : '#ffffff'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <pointLight
        position={[-8, 6, -8]}
        intensity={isMars ? 0.4 : 0.15}
        color={isMars ? '#f97316' : '#94a3b8'}
      />
    </group>
  );
}

export const MarsExplorationScene: React.FC<MarsExplorationSceneProps> = ({
  destination,
  resolvedData,
  onSelectMission,
  onSelectHardware,
  onOpenHardwareInspect,
  onOpenStory,
  onOpenQuiz,
  onOpenLandingVideo,
  onSwitchDestination,
  onReturnToDestinations,
}) => {
  const [activeHotspotId, setActiveHotspotId] = useState<string>('');
  const [isCardCollapsed, setIsCardCollapsed] = useState<boolean>(false);
  const [isMissionMenuOpen, setIsMissionMenuOpen] = useState<boolean>(false);
  const [isStudioLighting, setIsStudioLighting] = useState<boolean>(false);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  // ☀️ Specular Light Sweep State
  const [isSweepingLight, setIsSweepingLight] = useState<boolean>(false);

  // Camera reset trigger
  const [cameraResetCounter, setCameraResetCounter] = useState<number>(0);

  // Simulated instrument test activation
  const [isFiringSensor, setIsFiringSensor] = useState<boolean>(false);

  const currentMission = resolvedData?.mission;
  const currentHardware = resolvedData?.hardware;
  const isMars = destination === 'Mars';
  const modelType = currentHardware?.model3dType || (isMars ? 'rover-perseverance' : 'apollo-lunar-module');
  const isStarship = !isMars && (
    modelType.includes('starship') ||
    modelType.includes('artemis') ||
    modelType.includes('hls') ||
    currentMission?.id === 'artemis3'
  );

  // Trigger dynamic specular light sweep across vehicle
  const handleTriggerLightSweep = () => {
    soundFx.playChirp();
    setIsSweepingLight(true);
    setTimeout(() => {
      setIsSweepingLight(false);
      soundFx.playSuccess();
    }, 2800);
  };

  const handleHotspotClick = (id: string) => {
    soundFx.playClick();
    setActiveHotspotId(id);
    onSelectHardware(id);
  };

  const handleMissionSelect = (mId: string) => {
    soundFx.playClick();
    setActiveHotspotId('');
    setCameraResetCounter((c) => c + 1);
    onSelectMission(mId);
    setIsMissionMenuOpen(false);
  };

  const handleResetCamera = () => {
    soundFx.playClick();
    setActiveHotspotId('');
    setCameraResetCounter((c) => c + 1);
  };

  // Simulate laser zap or sensor pulse
  const handleFireSensor = () => {
    soundFx.playChirp();
    setIsFiringSensor(true);
    setTimeout(() => {
      soundFx.playSuccess();
      setIsFiringSensor(false);
    }, 1200);
  };

  return (
    <div className="relative w-full h-screen bg-[#04060b] pt-16 overflow-hidden select-none">

      {/* 3D WebGL Canvas */}
      <div className="absolute inset-0 z-0">
        <CanvasErrorBoundary>
          <Canvas
            camera={{
              position: isMars ? [4.8, 2.4, 4.8] : (isStarship ? [7.2, 5.4, 8.8] : [6.5, 3.0, 7.0]),
              fov: 48,
            }}
            shadows
          >
            {/* Studio vs Natural Sunlight & Animated Sweep */}
            <CinematicStudioLighting
              isStudioLighting={isStudioLighting}
              isMars={isMars}
              isSweeping={isSweepingLight}
            />

            <Stars radius={110} depth={50} count={isMars ? 3000 : 7000} factor={3} fade />

            {/* 🌟 Authentic 100% Distinct Planetary Environments */}
            <CanvasErrorBoundary is3DChild={true}>
              {isMars ? (
                <MarsRealPanorama
                  scale={60}
                  rotationY={0.4}
                />
              ) : (
                <LunarRealEnvironment />
              )}
            </CanvasErrorBoundary>

            {/* 3D Hardware Model with Ground Plane & Contact Shadows */}
            <CanvasErrorBoundary is3DChild={true}>
              <Rover3DModel
                modelType={modelType}
                onSelectHotspot={handleHotspotClick}
                activeHotspotId={activeHotspotId}
                isMars={isMars}
                isMoon={!isMars}
                showHotspots={showHotspots}
                autoRotate={autoRotate}
              />
            </CanvasErrorBoundary>

            {/* Unified Smooth Camera Rig & Frictionless Orbit Controls */}
            <CameraRig
              activeHotspotId={activeHotspotId}
              isMars={isMars}
              isStarship={isStarship}
              resetTrigger={cameraResetCounter}
              autoRotate={autoRotate}
            />
          </Canvas>
        </CanvasErrorBoundary>
      </div>

      {/* ======================================================== */}
      {/* 🚀 CLEAN, FOCUSED, MINIMALIST NASA MISSION HUD            */}
      {/* ======================================================== */}

      {/* 1. TOP CENTER: CLEAN, MINIMAL & REFINED MISSION CONTROL HUD */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto screen-enter">
        <div className="crystal-glass rounded-full px-2.5 py-1.5 flex items-center gap-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] text-xs font-mono">
          
          {/* Active Environment Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] text-[11px] text-slate-200">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isMars ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
              } animate-pulse`}
            />
            <span className="font-semibold tracking-wider">
              {isMars ? 'MARS 360°' : 'MOON 360°'}
            </span>
          </div>

          {/* Landing Video Button */}
          {onOpenLandingVideo && (
            <button
              onClick={() => {
                soundFx.playChirp();
                onOpenLandingVideo();
              }}
              className="px-2.5 py-1 rounded-full text-[11px] text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
              title={isMars ? 'Watch Real NASA Mars EDL Landing Video' : 'Watch Real NASA Apollo 11 Landing Video'}
            >
              <Film className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Video</span>
            </button>
          )}

          {/* Return to Destination Atlas (Enforces Moon/Mars Separation) */}
          {onReturnToDestinations && (
            <button
              onClick={() => {
                soundFx.playClick();
                onReturnToDestinations();
              }}
              className="px-2.5 py-1 rounded-full text-[11px] text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
              title="Return to Planetary Destination Selector"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Destinations</span>
            </button>
          )}

          <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />

          {/* Toggle Telemetry Pins */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowHotspots(!showHotspots);
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
              showHotspots
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-transparent'
            }`}
            title={showHotspots ? 'Hide Telemetry Pins' : 'Show Telemetry Pins'}
          >
            {showHotspots ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Pins</span>
          </button>

          {/* Sun Light Sweep */}
          <button
            onClick={handleTriggerLightSweep}
            className={`px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
              isSweepingLight
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse'
                : 'text-slate-400 hover:text-amber-300 hover:bg-white/[0.06] border border-transparent'
            }`}
            title="Sweep Directional Sunlight Across Spacecraft"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Sun Sweep</span>
          </button>


          {/* Reset Camera View */}
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>


      {/* 2. TOP RIGHT: MISSION SELECTOR DROPDOWN */}
      <div className="absolute top-20 right-6 z-20 pointer-events-auto">
        <div className="relative">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsMissionMenuOpen(!isMissionMenuOpen);
            }}
            className="crystal-glass px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-display hover:border-cyan-400 transition-colors shadow-xl"
          >
            <span className={`w-2 h-2 rounded-full ${isMars ? 'bg-red-400' : 'bg-cyan-400'} animate-pulse`} />
            <span className="text-slate-400">Mission:</span>
            <span className="font-bold text-white font-display">
              {currentMission?.name?.split('(')[0] || 'Mission Studio'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isMissionMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl crystal-glass p-2 shadow-2xl border border-white/20 animate-fade-in space-y-1 font-display z-50">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
                {isMars ? 'AUTHENTIC MARS MISSIONS' : 'AUTHENTIC LUNAR MISSIONS'}
              </div>

              {(isMars
                ? [
                    { id: 'perseverance', label: 'Perseverance & Ingenuity', site: 'Jezero Crater Delta', dest: 'Mars' },
                    { id: 'curiosity', label: 'Curiosity Rover (MSL)', site: 'Gale Crater Mount Sharp', dest: 'Mars' },
                    { id: 'insight', label: 'InSight Mars Lander', site: 'Elysium Planitia', dest: 'Mars' },
                    { id: 'viking', label: 'Viking Lander', site: 'Chryse Planitia', dest: 'Mars' },
                    { id: 'mro', label: 'Mars Reconnaissance Orbiter', site: 'Martian Orbit', dest: 'Mars' },
                  ]
                : [
                    { id: 'artemis3', label: 'Artemis III Starship HLS & Base Camp', site: 'Shackleton Crater (South Pole)', dest: 'Moon' },
                    { id: 'apollo11', label: 'Apollo 11 Lunar Module (Eagle)', site: 'Tranquility Base', dest: 'Moon' },
                    { id: 'apollo15', label: 'Apollo 15 Lunar Roving Vehicle', site: 'Hadley-Apennine Canyon', dest: 'Moon' },
                    { id: 'chandrayaan3', label: 'Chandrayaan-3 Vikram Lander', site: 'Shiv Shakti Point (South Pole)', dest: 'Moon' },
                    { id: 'ladee', label: 'NASA LADEE Lunar Atmosphere Orbiter', site: 'Equatorial Lunar Orbit', dest: 'Moon' },
                    { id: 'apollo17', label: 'Apollo 17 Station & ALSEP', site: 'Taurus-Littrow Valley', dest: 'Moon' },
                    { id: 'lro', label: 'Lunar Reconnaissance Orbiter', site: 'Polar Mapping Orbit', dest: 'Moon' },
                  ]
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMissionSelect(m.id)}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                    currentMission?.id === m.id
                      ? isMars
                        ? 'bg-rose-500/20 text-rose-100 border border-rose-400/50 font-semibold'
                        : 'bg-blue-600/25 text-cyan-100 border border-cyan-400/40 font-semibold'
                      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div>
                    <span className="block font-medium">{m.label}</span>
                    <span className={`text-[10px] ${currentMission?.id === m.id ? 'text-blue-200' : 'text-slate-400'}`}>
                      {m.site}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    m.dest === 'Moon' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {m.dest}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. TOP LEFT: Sleek Transparent Mission Dossier Card */}
      <div className="absolute top-20 left-6 z-20 max-w-xs sm:max-w-sm w-full transition-all pointer-events-auto screen-enter">
        <div className="crystal-glass rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          {/* No iridescent rim here — reserved for single primary card per view */}

          {/* Ambient Glow Flare */}
          <div className={`absolute -top-10 -left-10 w-32 h-32 ${isMars ? 'bg-rose-500/15' : 'bg-cyan-500/15'} rounded-full blur-3xl pointer-events-none`} />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-white/[0.05] border border-cyan-400/35 backdrop-blur-md p-1.5 flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                <img src="/astravex_logo.png" alt="ASTRAVEX" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]" />
              </div>
              <div>
                <span className="text-[11px] font-orbitron tracking-wider uppercase text-cyan-400 font-bold block">
                  ASTRAVEX SEE
                </span>
                <span className="text-[10px] font-mono text-emerald-400 tracking-wider">
                  TELEMETRY ACTIVE
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCardCollapsed(!isCardCollapsed)}
              className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors font-mono cursor-pointer"
            >
              {isCardCollapsed ? 'Expand' : 'Hide'}
            </button>
          </div>

          {!isCardCollapsed && (
            <div className="space-y-3 animate-fade-in font-display relative z-10 content-selectable">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-display">
                  {currentMission?.name || (isMars ? 'Perseverance Rover' : 'Apollo 11')}
                </h1>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Location: <span className="text-slate-200 font-medium">{currentMission?.locationName}</span>
                </p>
              </div>

              {/* Scientific Key-Value Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/[0.08]">
                <div className="p-2 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
                  <span className="text-slate-400 block text-[10px] font-mono">Agency</span>
                  <span className="text-white font-medium text-xs truncate block">{currentMission?.agency || 'NASA'}</span>
                </div>
                <div className="p-2 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
                  <span className="text-slate-400 block text-[10px] font-mono">Landing Date</span>
                  <span className="text-slate-200 font-medium text-xs">{currentMission?.landingDate || 'Historic'}</span>
                </div>
                <div className="p-2 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
                  <span className="text-slate-400 block text-[10px] font-mono">Coordinates</span>
                  <span className="text-cyan-400 font-medium text-xs font-mono">
                    {currentMission?.coordinates ? `${currentMission.coordinates.lat.toFixed(1)}°, ${currentMission.coordinates.lon.toFixed(1)}°` : 'Interplanetary'}
                  </span>
                </div>
                <div className="p-2 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
                  <span className="text-slate-400 block text-[10px] font-mono">Focus Item</span>
                  <span className="text-emerald-400 font-medium text-xs truncate block">
                    {currentHardware?.name?.split(' ')[0] || 'Hardware'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. UNIFIED LUXURY MISSION COMMAND DOCK (Dead Center via Full-Width Flexbox) */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center pointer-events-none px-4 screen-enter">
        <div className="crystal-glass rounded-2xl px-3.5 py-2 sm:px-5 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] font-display transition-all relative overflow-x-auto sm:overflow-visible group pointer-events-auto animate-card-reveal max-w-[96vw]">
          
          {/* Subtle Top Iridescent Rim Glow */}
          <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[2px] pointer-events-none" />

          {/* Left: Active Hardware Focus Telemetry */}
          <div className="flex items-center gap-2.5 pl-0.5 pr-1 flex-shrink min-w-0">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <span className={`w-2.5 h-2.5 rounded-full ${isMars ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]' : 'bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.7)]'} animate-pulse`} />
              <span className={`absolute w-4 h-4 rounded-full border ${isMars ? 'border-amber-400/30' : 'border-cyan-400/30'} animate-ping opacity-35`} />
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-cyan-400/80 uppercase tracking-widest font-mono font-semibold block">
                  ACTIVE FOCUS
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-white font-display truncate block max-w-[160px] sm:max-w-[220px] md:max-w-[280px] lg:max-w-xs tracking-wide">
                {currentHardware?.name || 'NASA Exploration System'}
              </span>
            </div>
          </div>

          {/* Thin Vertical Divider */}
          <div className="hidden md:block h-6 w-[1px] bg-white/10 flex-shrink-0" />

          {/* Center: 3D Scene Controls (Segmented Glass Capsule) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex-shrink-0">
            {/* Natural Sunlight vs Studio Lighting */}
            <button
              onClick={() => {
                soundFx.playClick();
                setIsStudioLighting(!isStudioLighting);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isStudioLighting
                  ? 'bg-blue-600/35 text-blue-200 border border-blue-400/40 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                  : 'hover:bg-white/[0.06] text-slate-300 hover:text-white'
              }`}
              title="Toggle Natural Planetary vs Studio Lighting"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-medium">{isStudioLighting ? 'Studio' : 'Sunlight'}</span>
            </button>

            {/* 360° Orbit Rotation */}
            <button
              onClick={() => {
                soundFx.playClick();
                setAutoRotate(!autoRotate);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                autoRotate
                  ? 'bg-cyan-600/35 text-cyan-200 border border-cyan-400/40 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                  : 'hover:bg-white/[0.06] text-slate-300 hover:text-white'
              }`}
              title="Toggle Slow 360 Exhibition Rotation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-medium">360°</span>
            </button>

            {/* Interactive Sensor Firing Simulator Button */}
            <button
              onClick={handleFireSensor}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isFiringSensor
                  ? 'bg-emerald-400 text-slate-950 scale-95 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse'
                  : 'hover:bg-white/[0.06] text-cyan-300 hover:text-cyan-200'
              }`}
              title="Simulate Laser Zap / Sensor Diagnostic Ping"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">{isFiringSensor ? 'FIRING...' : 'SENSOR'}</span>
            </button>
          </div>

          {/* Thin Vertical Divider */}
          <div className="hidden lg:block h-6 w-[1px] bg-white/10 flex-shrink-0" />

          {/* Right Action Buttons: Specs, Story & Quiz */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenHardwareInspect();
              }}
              className="premium-btn-primary px-3.5 py-1.5 rounded-xl text-white text-xs font-display font-bold flex items-center gap-1.5 shadow-glow-cyan cursor-pointer group/btn"
              title="View Authentic NASA Hardware Specifications"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Specs</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onOpenStory();
              }}
              className="premium-btn-secondary px-3.5 py-1.5 rounded-xl text-slate-200 hover:text-white text-xs font-display font-medium flex items-center gap-1.5 cursor-pointer group/btn"
              title="Read Historical NASA Mission Chronology"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
              <span>Story</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onOpenQuiz();
              }}
              className="premium-btn-secondary px-3.5 py-1.5 rounded-xl border-emerald-400/40 text-emerald-300 hover:text-white text-xs font-display font-medium flex items-center gap-1.5 cursor-pointer group/btn"
              title="Take Interactive Planetary Mission Science Quiz"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quiz</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export { MarsExplorationScene as ExplorationPage };
export { MarsExplorationScene as PlanetaryExplorationScene };
export default MarsExplorationScene;

