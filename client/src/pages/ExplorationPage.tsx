import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import {
  DestinationType,
  LiveFleetSummaryPayload,
  ResolvedNasaPayload,
} from '../types';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Lightformer } from '@react-three/drei';
import {
  Rover3DModel,
  PinHudContext,
  clearHoveredPin,
  getMissionPinSequence,
} from '../components/3d/Rover3DModel';
import { MarsRealPanorama } from '../components/3d/MarsRealPanorama';
import { LunarRealEnvironment } from '../components/3d/LunarRealEnvironment';
import { OrbitalPlanetBackdrop } from '../components/3d/OrbitalPlanetBackdrop';
import { CanvasErrorBoundary } from '../components/common/CanvasErrorBoundary';
import { CanvasLoadingOverlay } from '../components/common/CanvasLoadingOverlay';
import * as THREE from 'three';
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Compass,
  Eye,
  EyeOff,
  FlaskConical,
  HelpCircle,
  Info,
  Loader2,
  LocateFixed,
  Radar,
  RotateCcw,
  Sun,
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import {
  computeMissionLiveTelemetry,
  getMissionScientificDataset,
} from '../utils/liveTelemetry';
import { useTourSpotlight } from '../guide/tourEngine';
import { getMissionsForTheater, isCrewedSurfaceMission, THEATER_META } from '../utils/missionCatalog';
import { IconButton } from '../components/ui';
import { AdaptivePerformance } from '../components/3d/AdaptivePerformance';

/** Cinematic dock action: icon + label, accent glow, sliding sheen, optional primary emphasis. */
const DockAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  hint?: string;
  primary?: boolean;
  className?: string;
  onClick: () => void;
}> = ({ icon, label, hint, primary = false, className = '', onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={hint || label}
    className={`dock-action ${primary ? 'dock-action--primary' : ''} ${className}`}
  >
    <span className="dock-action__icon" aria-hidden="true">
      {icon}
    </span>
    <span className="dock-action__label">{label}</span>
  </button>
);

interface MarsExplorationSceneProps {
  destination: DestinationType;
  resolvedData: ResolvedNasaPayload | null;
  liveFleetData?: LiveFleetSummaryPayload | null;
  isLoadingData?: boolean;
  health?: number;
  score?: number;
  isLiveDataOpen?: boolean;
  onOpenLiveData?: () => void;
  onSelectMission: (missionId: string) => void;
  onSelectHardware: (hardwareId: string) => void;
  onOpenHardwareInspect: () => void;
  onOpenStory: () => void;
  onOpenSimulators?: () => void;
  onOpenQuiz: () => void;
  onSwitchTheater?: () => void;
}

function CameraRig({
  activeHotspotId,
  missionId,
  isMars,
  isStarship,
  isOrbiter,
  isSpaceborne,
  resetTrigger,
  autoRotate,
}: {
  activeHotspotId: string;
  missionId?: string;
  isMars: boolean;
  isStarship: boolean;
  isOrbiter: boolean;
  isSpaceborne: boolean;
  resetTrigger: number;
  autoRotate: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const targetMap = useMemo<
    Record<string, { pos: [number, number, number]; lookAt: [number, number, number] }>
  >(
    () => ({
      supercam: { pos: [2.2, 2.2, 2.2], lookAt: [0.25, 1.7, 0.65] },
      moxie: { pos: [-2.6, 1.4, 1.6], lookAt: [-0.75, 0.75, 0] },
      pixl: { pos: [-2.0, 1.3, 2.7], lookAt: [-0.25, 0.55, 1.25] },
      rimfax: { pos: [1.6, 1.3, -2.6], lookAt: [0, 0.55, -1.15] },
      ingenuity: { pos: [4.1, 1.5, 2.1], lookAt: [2.6, 0.45, 0.8] },
      'rotor-system': { pos: [3.2, 1.35, 1.8], lookAt: [2.4, 0.55, 0.75] },
      'hls-crew-cabin': { pos: [4.2, 6.2, 4.2], lookAt: [0, 5.8, 1.0] },
      'hls-elevator': { pos: [2.8, 2.6, 3.2], lookAt: [0, 2.2, 1.3] },
      'hls-solar-wrap': { pos: [-3.8, 4.2, 2.2], lookAt: [-1.2, 3.8, 0] },
      'hls-landing-legs': { pos: [3.8, 1.2, 2.4], lookAt: [1.5, 0.4, 0] },
      'hls-raptor-engines': { pos: [2.8, 1.2, -2.8], lookAt: [0, 0.6, -0.9] },
      'hls-astronaut': { pos: [4.2, 2.2, 3.6], lookAt: [2.6, 1.4, 1.8] },
      'hls-antenna': { pos: [-4.2, 2.4, 4.2], lookAt: [-2.6, 1.6, 2.2] },
      'lunar-habitat': { pos: [3.6, 2.2, 3.6], lookAt: [0, 1.2, 0] },
      'ladee-ldex': { pos: [2.3, 2.1, 2.4], lookAt: [0, 1.8, 0.72] },
      'ladee-nms': { pos: [-2.4, 1.9, 1.8], lookAt: [-0.72, 1.6, 0] },
      'ladee-llcd': { pos: [2.5, 2.6, -2.0], lookAt: [0.68, 2.3, -0.35] },
      'lroc-camera': { pos: [2.8, 2.3, 2.8], lookAt: [0, 1.9, 0.55] },
      'diviner-radiometer': { pos: [-2.8, 2.5, 1.8], lookAt: [-0.75, 2.1, -0.25] },
      'apollo-astronaut': { pos: [4.2, 2.2, 3.2], lookAt: [2.2, 1.2, 1.2] },
      'lunar-laser-retro': { pos: [-3.8, 1.6, 3.0], lookAt: [-2.2, 0.4, 1.4] },
      'lunar-antenna': { pos: [4.5, 2.2, -1.5], lookAt: [2.5, 1.0, -1.2] },
      'apollo-ascent-stage': { pos: [4.2, 3.8, 4.2], lookAt: [0, 2.35, 0] },
      'eagle-descent-stage': { pos: [4.8, 2.4, 4.8], lookAt: [0, 0.95, 1.2] },
      'apollo-landing-gear': { pos: [-3.8, 1.6, 2.2], lookAt: [-1.4, 0.35, 0] },
      'apollo15-lrv': { pos: [3.4, 2.0, 3.0], lookAt: [0, 0.9, 0] },
      'apollo15-drill': { pos: [-2.8, 1.7, -2.0], lookAt: [-0.6, 0.6, -0.75] },
      'lrv-antenna': { pos: [2.6, 2.4, 2.6], lookAt: [0.4, 1.55, 0.55] },
      'lrv-camera': { pos: [-2.0, 2.0, 2.4], lookAt: [-0.4, 1.15, 0.65] },
      'lrv-astronaut': { pos: [3.8, 2.2, 2.8], lookAt: [1.9, 1.35, 1.1] },
      'vikram-lander': { pos: [4.2, 2.8, 4.2], lookAt: [0, 1.8, 0] },
      'pragyan-rover': { pos: [3.6, 1.4, 2.9], lookAt: [2.05, 0.55, 1.45] },
      'chaste-probe': { pos: [-2.8, 1.4, 2.3], lookAt: [-1.05, 0.5, 0.65] },
      'rambha-plasma': { pos: [2.6, 2.3, -2.4], lookAt: [0.65, 1.55, -0.65] },
      'orange-soil-sampler': { pos: [-2.7, 1.4, 2.9], lookAt: [-1.05, 0.45, 1.35] },
      'apollo17-lrv': { pos: [3.8, 1.9, 2.0], lookAt: [1.55, 0.85, -0.15] },
      'yutu2-rover': { pos: [2.8, 1.8, 2.8], lookAt: [0.04, 1.05, 0.25] },
      'lpr-radar': { pos: [1.8, 1.3, -2.5], lookAt: [-0.12, 0.55, -0.78] },
      'surveyor3-sampler': { pos: [2.6, 1.4, 2.6], lookAt: [1.08, 0.4, 1.0] },
      'surveyor3-tv': { pos: [2.8, 2.2, 2.4], lookAt: [0.26, 1.48, 0.22] },
      seis: { pos: [2.5, 1.15, 2.1], lookAt: [1.05, 0.25, 0.7] },
      hp3: { pos: [2.1, 1.15, -2.3], lookAt: [0.7, 0.22, -0.9] },
      'solar-arrays': { pos: [-3.4, 1.65, 1.0], lookAt: [-1.35, 0.72, 0] },
      arm: { pos: [1.7, 1.7, 2.3], lookAt: [0.2, 0.85, 0.75] },
      'viking-rtg': { pos: [2.6, 1.6, -2.4], lookAt: [0, 0.85, -0.6] },
      'viking-sampler': { pos: [2.6, 1.3, 2.6], lookAt: [0.6, 0.45, 0.8] },
      'curiosity-chassis': { pos: [3.6, 2.2, 3.6], lookAt: [0, 1.0, 0] },
      chemcam: { pos: [2.2, 2.5, 2.2], lookAt: [0.28, 1.95, 0.65] },
      mastcam: { pos: [2.0, 2.4, 2.0], lookAt: [-0.08, 1.88, 0.6] },
      apxs: { pos: [-2.0, 1.3, 2.7], lookAt: [-0.28, 0.6, 1.25] },
      hirise: { pos: [2.8, 1.95, 2.8], lookAt: [0, 1.45, 0.55] },
      'mro-dish': { pos: [3.0, 2.95, -2.4], lookAt: [0.3, 2.45, -0.35] },
      'jwst-mirror': { pos: [3.8, 3.2, 4.2], lookAt: [0, 2.25, 0.35] },
      'jwst-primary-mirror': { pos: [3.8, 3.2, 4.2], lookAt: [0, 2.25, 0.35] },
      'jwst-sunshield': { pos: [4.8, 2.2, 4.6], lookAt: [0, 1.15, 0] },
      'jwst-nircam': { pos: [3.2, 2.8, -3.2], lookAt: [0, 2.05, -0.55] },
      'hubble-primary-mirror': { pos: [3.8, 3.8, 4.0], lookAt: [0, 3.0, 0.6] },
      'hubble-solar-arrays': { pos: [4.4, 3.5, 2.8], lookAt: [1.45, 2.8, 0] },
      'iss-solar': { pos: [4.8, 4.6, 4.2], lookAt: [0.7, 4.4, 1.75] },
      'iss-lab': { pos: [3.6, 4.0, 3.6], lookAt: [0, 3.55, 0.45] },
      'iss-cupola': { pos: [3.0, 3.1, -3.0], lookAt: [0, 2.75, -0.45] },
      'voyager-dish': { pos: [3.2, 2.6, 2.6], lookAt: [0, 1.85, 0] },
      'golden-record': { pos: [-2.4, 2.0, 2.2], lookAt: [-0.4, 1.4, 0.25] },
      'saturn-s1c': { pos: [4.2, 2.0, 4.2], lookAt: [0, 1.2, 0] },
      'apollo-csm': { pos: [3.8, 4.5, 3.8], lookAt: [0, 4.0, 0] },
    }),
    []
  );

  const minComfortFocusDist = useMemo(() => {
    if (isStarship) return 5.6;
    if (isSpaceborne) return 4.6;
    if (isOrbiter) return 3.85;
    return 4.25;
  }, [isStarship, isSpaceborne, isOrbiter]);

  const isTransitioning = useRef(false);

  const defaultPos = useMemo(() => {
    if (isStarship) return new THREE.Vector3(7.2, 5.4, 8.8);
    if (isSpaceborne) return new THREE.Vector3(6.2, 3.4, 6.2);
    if (isOrbiter) return new THREE.Vector3(4.2, 2.95, 4.4);
    if (isMars) return new THREE.Vector3(4.8, 2.4, 4.8);
    return new THREE.Vector3(6.0, 2.8, 6.2);
  }, [isMars, isStarship, isOrbiter, isSpaceborne]);

  const defaultLook = useMemo(() => {
    if (isStarship) return new THREE.Vector3(0, 3.6, 0);
    if (isSpaceborne) return new THREE.Vector3(0, 2.4, 0);
    if (isOrbiter) return new THREE.Vector3(0, 1.45, 0);
    if (isMars) return new THREE.Vector3(0, 0.9, 0);
    return new THREE.Vector3(0, 1.35, 0);
  }, [isMars, isStarship, isOrbiter, isSpaceborne]);

  const targetPos = useRef<THREE.Vector3>(defaultPos.clone());
  const targetLook = useRef<THREE.Vector3>(defaultLook.clone());

  useEffect(() => {
    let rawPos: [number, number, number] | null = null;
    let rawLook: [number, number, number] | null = null;

    if (missionId === 'apollo17' && activeHotspotId === 'apollo-astronaut') {
      rawPos = [-3.4, 2.1, 2.0];
      rawLook = [-1.72, 1.3, 0.35];
    } else if (missionId === 'apollo17' && activeHotspotId === 'lunar-antenna') {
      rawPos = [1.8, 2.0, 1.8];
      rawLook = [-0.45, 1.15, -0.95];
    } else if (activeHotspotId && targetMap[activeHotspotId]) {
      rawPos = targetMap[activeHotspotId].pos;
      rawLook = targetMap[activeHotspotId].lookAt;
    }

    if (!rawPos || !rawLook) {
      targetPos.current.copy(defaultPos);
      targetLook.current.copy(defaultLook);
      isTransitioning.current = true;
      return;
    }

    // Frame the subsystem WITH spacecraft context rather than zooming straight into polygons
    const blendedLook = new THREE.Vector3(
      rawLook[0] * 0.72,
      rawLook[1],
      rawLook[2] * 0.72
    );
    const offset = new THREE.Vector3(rawPos[0], rawPos[1], rawPos[2]).sub(
      new THREE.Vector3(rawLook[0], rawLook[1], rawLook[2])
    );
    const rawDist = offset.length();
    if (rawDist < 0.01) {
      offset.set(1, 0.45, 1);
    }
    offset.normalize();

    const safeDist = Math.max(rawDist, minComfortFocusDist);
    const computedPos = blendedLook.clone().addScaledVector(offset, safeDist);

    if (!isOrbiter && !isSpaceborne) {
      // Prevent low floor pins from sinking the camera down onto surface dust
      computedPos.y = Math.max(computedPos.y, Math.max(1.4, blendedLook.y + 0.65));
    }

    targetPos.current.copy(computedPos);
    targetLook.current.copy(blendedLook);
    isTransitioning.current = true;
  }, [activeHotspotId, missionId, resetTrigger, defaultPos, defaultLook, targetMap, minComfortFocusDist, isOrbiter, isSpaceborne]);

  useFrame((_, delta) => {
    if (!isTransitioning.current || !controlsRef.current) return;

    const step = Math.min(1, delta * 3.8);
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
      maxPolarAngle={isSpaceborne ? Math.PI * 0.92 : isOrbiter ? Math.PI * 0.72 : Math.PI / 2 - 0.03}
      minDistance={isStarship ? 3.2 : isSpaceborne ? 2.6 : 2.3}
      maxDistance={isOrbiter ? 13.5 : 40.0}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.75}
      enablePan={true}
      screenSpacePanning={true}
      panSpeed={0.8}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
}

function CinematicStudioLighting({
  isStudioLighting,
  isMars,
  isOrbiter,
}: {
  isStudioLighting: boolean;
  isMars: boolean;
  isOrbiter: boolean;
}) {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const defaultLightPos = useMemo(
    () =>
      new THREE.Vector3(
        isOrbiter ? 20 : isMars ? 12 : 24,
        isOrbiter ? 18 : isMars ? 18 : 11.5,
        isOrbiter ? 12 : isMars ? 12 : 18
      ),
    [isMars, isOrbiter]
  );

  useEffect(() => {
    if (dirLightRef.current) {
      dirLightRef.current.intensity = isStudioLighting ? 2.0 : (isMars ? 2.4 : 3.2);
    }
  }, [isStudioLighting, isMars]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    if (dirLightRef.current) {
      dirLightRef.current.position.lerp(defaultLightPos, dt * 2.0);
    }
  });

  return (
    <group>
      <ambientLight intensity={isStudioLighting ? 0.66 : (isMars ? 0.56 : isOrbiter ? 0.34 : 0.26)} />
      <hemisphereLight
        args={[
          isStudioLighting ? '#e2e8f0' : isOrbiter ? '#93c5fd' : '#e2e8f0',
          isMars ? '#9a4f2b' : isOrbiter ? '#1e293b' : '#262930',
          isStudioLighting ? 0.38 : isMars ? 0.32 : isOrbiter ? 0.36 : 0.26,
        ]}
      />
      <directionalLight
        ref={dirLightRef}
        position={isOrbiter ? [20, 18, 12] : isMars ? [12, 18, 12] : [24, 11.5, 18]}
        intensity={isStudioLighting ? 2.1 : (isMars ? 2.45 : 3.2)}
        color={isMars && !isStudioLighting ? '#ffdcc7' : '#fffdf7'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={75}
        shadow-bias={-0.0002}
        shadow-normalBias={0.03}
      />
      {/* Dedicated Cool/Solar Opposing Rim Light for Crisp Metallic & Solar Array Silhouettes */}
      <directionalLight
        position={isOrbiter ? [-18, 12, -16] : [-14, 10, -14]}
        intensity={isStudioLighting ? 1.15 : isOrbiter ? 1.35 : 0.85}
        color={isMars && !isStudioLighting ? '#93c5fd' : '#e0f2fe'}
      />
      <pointLight
        position={[-8, 6, -8]}
        intensity={isMars ? 0.55 : isOrbiter ? 0.55 : 0.32}
        color={isMars ? '#f97316' : '#cbd5e1'}
      />
    </group>
  );
}

function OrbitalStarfield({
  isOrbiter,
  isMars,
}: {
  isOrbiter: boolean;
  isMars: boolean;
}) {
  const starGroupRef = useRef<THREE.Group>(null);
  const deltaQuat = useMemo(() => new THREE.Quaternion(), []);
  const trackAxis = useMemo(() => new THREE.Vector3(0.76, 0.14, -0.63).normalize(), []);

  useFrame((_, delta) => {
    if (!isOrbiter || !starGroupRef.current) return;
    const dt = Math.min(delta, 0.1);
    deltaQuat.setFromAxisAngle(trackAxis, dt * 0.004);
    starGroupRef.current.quaternion.premultiply(deltaQuat);
  });

  return (
    <group ref={starGroupRef}>
      <Stars radius={120} depth={60} count={isOrbiter ? 4800 : isMars ? 2400 : 4200} factor={3.2} fade />
    </group>
  );
}

interface ExplorationDossierCardProps {
  activeMissionId: string;
  currentMission: ResolvedNasaPayload['mission'] | undefined;
  resolvedData: ResolvedNasaPayload | null;
  liveFleetData?: LiveFleetSummaryPayload | null;
  isLoadingData?: boolean;
  isMars: boolean;
  health: number;
  score: number;
  isCardCollapsed: boolean;
  onToggleCollapsed: () => void;
  isLiveDataOpen: boolean;
  onOpenLiveData?: () => void;
  dossierSpotlightClass: string;
  liveTriggerSpotlightClass: string;
}

const ExplorationDossierCard: React.FC<ExplorationDossierCardProps> = React.memo(({
  activeMissionId,
  currentMission,
  resolvedData,
  liveFleetData,
  isLoadingData = false,
  isMars,
  health,
  score,
  isCardCollapsed,
  onToggleCollapsed,
  isLiveDataOpen,
  onOpenLiveData,
  dossierSpotlightClass,
  liveTriggerSpotlightClass,
}) => {
  // Isolate the 5s ephemeris ticker here so the WebGL <Canvas> never re-renders on live clock ticks
  const [liveTick, setLiveTick] = useState<number>(() => Date.now());
  const [failedPreviewUrls, setFailedPreviewUrls] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const id = setInterval(() => setLiveTick(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setFailedPreviewUrls({});
  }, [activeMissionId]);

  const matchedResolved =
    resolvedData?.mission?.id?.toLowerCase() === activeMissionId.toLowerCase()
      ? resolvedData
      : null;

  const fleetTelemetryForMission = currentMission
    ? liveFleetData?.missions?.find(
        (m) => m.id.toLowerCase() === currentMission.id.toLowerCase()
      )?.realTimeTelemetry
    : undefined;

  const mergedTelemetryBase = useMemo(() => {
    const a = matchedResolved?.realTimeTelemetry;
    const b = fleetTelemetryForMission;
    if (!a && !b) return undefined;
    return {
      ...b,
      ...a,
      roverManifest: a?.roverManifest || b?.roverManifest,
      liveCoords: a?.liveCoords || b?.liveCoords,
      updates: a?.updates?.length ? a.updates : b?.updates,
      isLiveApi: Boolean(a?.isLiveApi || b?.isLiveApi),
      feedSource: a?.isLiveApi ? a.feedSource : b?.feedSource || a?.feedSource,
    };
  }, [matchedResolved?.realTimeTelemetry, fleetTelemetryForMission]);

  const liveTelemetry = useMemo(() => {
    if (!currentMission) return mergedTelemetryBase || null;
    return computeMissionLiveTelemetry(
      currentMission,
      liveTick,
      mergedTelemetryBase
    );
  }, [currentMission, mergedTelemetryBase, liveTick]);

  const missionLivePreview = useMemo(() => {
    const dataset = getMissionScientificDataset(activeMissionId, liveTick);
    const seen = new Set<string>();
    const urls: Array<{ url: string; title: string; camera: string; dateLabel?: string; fromApi?: boolean }> = [];

    // Prioritize live API captures & mission-specific resolved photos BEFORE static curated dataset
    for (const img of matchedResolved?.images || []) {
      if (img.imageUrl && !seen.has(img.imageUrl) && !failedPreviewUrls[img.imageUrl]) {
        seen.add(img.imageUrl);
        urls.push({
          url: img.imageUrl,
          title: img.title,
          camera: img.source || 'NASA Live API',
          dateLabel: img.date,
          fromApi: true,
        });
      }
    }
    for (const ph of dataset.latestPhotos) {
      if (ph.imageUrl && !seen.has(ph.imageUrl) && !failedPreviewUrls[ph.imageUrl]) {
        seen.add(ph.imageUrl);
        urls.push({
          url: ph.imageUrl,
          title: ph.title,
          camera: ph.camera,
          dateLabel: ph.solOrDate,
          fromApi: false,
        });
      }
    }

    return {
      hero: urls[0] || null,
      count: urls.length,
    };
  }, [activeMissionId, liveTick, matchedResolved?.images, failedPreviewUrls]);

  return (
    <div className="absolute top-[72px] left-4 sm:left-6 z-20 max-w-[332px] w-[calc(100%-2rem)] sm:w-full pointer-events-auto screen-enter">
      <div className={`hud-card hud-card-featured rounded-2xl p-4 space-y-3 ${dossierSpotlightClass}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                liveTelemetry?.statusCategory === 'ACTIVE'
                  ? 'bg-emerald-400 live-beacon'
                  : 'bg-[var(--accent-primary)]'
              }`}
            />
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-slate-400 truncate">
              {isLoadingData
                ? 'SYNCING NASA FEED...'
                : `ASTRAVEX // ${liveTelemetry?.statusLabel || 'TELEMETRY'}`}
            </span>
            {isLoadingData && (
              <Loader2 className="w-3 h-3 animate-spin text-[var(--accent-primary)] flex-shrink-0" />
            )}
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="text-slate-300 hover:text-white text-[10px] font-mono uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full hud-well hover:border-[var(--accent-border)] transition-colors cursor-pointer"
          >
            {isCardCollapsed ? 'Expand' : 'Hide'}
          </button>
        </div>

        {!isCardCollapsed && (
          <div className="space-y-3 animate-fade-in content-selectable">
            {missionLivePreview.hero && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenLiveData?.();
                }}
                aria-controls="live-nasa-drawer"
                aria-expanded={isLiveDataOpen}
                className={`group relative w-full aspect-[16/9] rounded-xl border border-slate-400/20 bg-[#05070C] text-left cursor-pointer block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${liveTriggerSpotlightClass}`}
                title="Open live mission imagery and telemetry"
              >
                <div className="relative w-full h-full rounded-[inherit] overflow-hidden">
                  <img
                    key={missionLivePreview.hero.url}
                    src={missionLivePreview.hero.url}
                    alt={missionLivePreview.hero.title}
                    onError={() => {
                      const broken = missionLivePreview.hero?.url;
                      if (broken) {
                        setFailedPreviewUrls((prev) => ({ ...prev, [broken]: true }));
                      }
                    }}
                    className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#050811] via-[#050811]/60 to-transparent"
                  />
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#050811]/85 backdrop-blur-md border border-white/[0.12] text-[10px] font-mono uppercase tracking-wider text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-beacon" />
                      <span>
                        {liveTelemetry?.isLiveApi || missionLivePreview.hero.fromApi ? 'Live NASA' : 'Archive'} · {missionLivePreview.count} captures
                      </span>
                    </span>
                    <span className="w-6 h-6 rounded-full bg-[#050811]/85 backdrop-blur-md border border-white/[0.12] flex items-center justify-center text-slate-300 group-hover:text-white group-hover:border-[var(--accent-border)] transition-all">
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                  <div className="absolute inset-x-2.5 bottom-2">
                    <span className="block text-[10px] font-mono text-[var(--accent-text)] truncate">
                      {missionLivePreview.hero.camera}
                      {missionLivePreview.hero.dateLabel ? ` · ${missionLivePreview.hero.dateLabel}` : ''}
                    </span>
                    <span className="block text-xs font-medium text-white truncate">
                      {missionLivePreview.hero.title}
                    </span>
                  </div>
                </div>
              </button>
            )}

            <div className="space-y-1">
              <h1 className="font-orbitron text-sm sm:text-base font-bold uppercase tracking-[0.04em] text-white leading-snug">
                {currentMission?.name || (isMars ? 'Perseverance Rover' : 'Apollo 11')}
              </h1>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                {currentMission?.locationName}
              </p>
              <div className="pt-1">
                <div className="hud-deck-rule" aria-hidden="true" />
              </div>
            </div>

            {liveTelemetry && (
              <div className="grid grid-cols-3 gap-1.5 font-mono text-xs tabular-nums">
                <div className="px-2.5 py-2 rounded-xl hud-well">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-[0.14em]">Clock</span>
                  <span className="text-slate-100 font-semibold truncate block mt-0.5 text-[11px]">
                    {liveTelemetry.marsSol !== undefined
                      ? `Sol ${liveTelemetry.marsSol.toLocaleString()}`
                      : liveTelemetry.missionElapsedText}
                  </span>
                </div>
                <div className="px-2.5 py-2 rounded-xl hud-well">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-[0.14em]">Distance</span>
                  <span className="text-slate-100 font-semibold truncate block mt-0.5 text-[11px]">
                    {liveTelemetry.earthDistanceLabel}
                  </span>
                </div>
                <div className="px-2.5 py-2 rounded-xl hud-well">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-[0.14em]">Signal</span>
                  <span className="text-slate-100 font-semibold truncate block mt-0.5 text-[11px]">
                    {liveTelemetry.signalDelayLabel}
                  </span>
                </div>
              </div>
            )}

            <details className="rounded-xl hud-well px-3 py-2 text-xs">
              <summary className="cursor-pointer text-xs text-slate-300 hover:text-white select-none flex items-center justify-between font-medium">
                <span>Specs &amp; coordinates</span>
                <span className="text-slate-400 font-mono">{currentMission?.agency}</span>
              </summary>
              <div className="grid grid-cols-2 gap-2 pt-2.5 mt-2 border-t border-white/[0.08] font-mono text-xs">
                <div>
                  <span className="text-slate-400 block">Landing date</span>
                  <span className="text-slate-100 font-medium">
                    {currentMission?.landingDate || 'Historic'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Coordinates</span>
                  <span className="text-slate-100 font-medium">
                    {currentMission?.coordinates
                      ? `${currentMission.coordinates.lat.toFixed(1)}°, ${currentMission.coordinates.lon.toFixed(1)}°`
                      : 'Orbital'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">
                    {isCrewedSurfaceMission(activeMissionId) && activeMissionId !== 'iss'
                      ? 'Suit O₂'
                      : activeMissionId === 'iss'
                        ? 'Life support'
                        : 'Bus health'}
                  </span>
                  <span className="text-slate-100 font-medium">{health}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Science XP</span>
                  <span className="text-slate-100 font-medium">{score} XP</span>
                </div>
                {liveTelemetry?.ephemerisMeta && (
                  <div className="col-span-2 pt-1.5 border-t border-white/[0.06]">
                    <span className="text-slate-400 block">Ephemeris solver · JD {liveTelemetry.ephemerisMeta.julianDate.toFixed(1)}</span>
                    <span className="text-slate-200 text-[11px] font-medium truncate block">
                      {liveTelemetry.ephemerisMeta.solverModel}
                    </span>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
});

export const MarsExplorationScene: React.FC<MarsExplorationSceneProps> = ({
  destination,
  resolvedData,
  liveFleetData,
  isLoadingData = false,
  health = 100,
  score = 150,
  isLiveDataOpen = false,
  onOpenLiveData,
  onSelectMission,
  onSelectHardware,
  onOpenHardwareInspect,
  onOpenStory,
  onOpenSimulators,
  onOpenQuiz,
  onSwitchTheater,
}) => {
  const [activeHotspotId, setActiveHotspotId] = useState<string>('');
  const [isCardCollapsed, setIsCardCollapsed] = useState<boolean>(false);
  const [isMissionMenuOpen, setIsMissionMenuOpen] = useState<boolean>(false);
  const [isStudioLighting, setIsStudioLighting] = useState<boolean>(false);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [cameraResetCounter, setCameraResetCounter] = useState<number>(0);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stageSpotlight = useTourSpotlight('surface-stage');
  const dossierSpotlight = useTourSpotlight('mission-dossier');
  const liveTriggerSpotlight = useTourSpotlight('live-data-trigger');
  const pinsSpotlight = useTourSpotlight('pins-toggle');
  const sensorSpotlight = useTourSpotlight('btn-sensor');
  const specsSpotlight = useTourSpotlight('btn-specs');
  const storySpotlight = useTourSpotlight('btn-story');
  const quizSpotlight = useTourSpotlight('btn-quiz');

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, []);

  const currentMission = resolvedData?.mission;
  const currentHardware = resolvedData?.hardware;
  const modelType = currentHardware?.model3dType || (destination === 'Mars' ? 'rover-perseverance' : 'apollo-lunar-module');
  const isSpaceborne =
    modelType.includes('iss') ||
    modelType.includes('jwst') ||
    modelType.includes('hubble') ||
    modelType.includes('voyager') ||
    currentMission?.id === 'hubble' ||
    currentMission?.id === 'voyager' ||
    currentMission?.id === 'jwst' ||
    currentMission?.id === 'iss' ||
    currentMission?.destination === 'Orbital' ||
    currentMission?.destination === 'DeepSpace' ||
    currentMission?.destination === 'Astrophysics';
  const isMarsOrbiter =
    modelType.includes('mro') ||
    modelType.includes('orbiter-mars') ||
    currentMission?.id === 'mro';
  const isLunarOrbiter =
    modelType.includes('lro') ||
    modelType.includes('ladee') ||
    currentMission?.id === 'lro' ||
    currentMission?.id === 'ladee';
  const isEarthOrbiter =
    modelType.includes('iss') ||
    modelType.includes('hubble') ||
    currentMission?.id === 'iss' ||
    currentMission?.id === 'hubble';
  const isOrbiter = isSpaceborne || isMarsOrbiter || isLunarOrbiter;
  const isMars = !isSpaceborne && destination === 'Mars';
  const isStarship = !isMars && !isOrbiter && (
    modelType.includes('starship') ||
    modelType.includes('artemis') ||
    modelType.includes('hls') ||
    currentMission?.id === 'artemis3'
  );

  const activeMissionId =
    currentMission?.id ||
    (destination === 'Mars'
      ? 'perseverance'
      : destination === 'DeepSpace'
        ? 'jwst'
        : 'apollo11');

  const missionPins = useMemo(
    () => getMissionPinSequence(activeMissionId, modelType),
    [activeMissionId, modelType]
  );

  const activePinIndex = useMemo(
    () => missionPins.findIndex((p) => p.id === activeHotspotId),
    [missionPins, activeHotspotId]
  );

  useEffect(() => {
    if (!showHotspots) {
      clearHoveredPin(0);
    }
  }, [showHotspots]);

  const handleHotspotClick = (id: string) => {
    soundFx.playClick();
    clearHoveredPin(500);
    if (activeHotspotId === id) {
      setActiveHotspotId('');
      setCameraResetCounter((c) => c + 1);
      return;
    }
    setActiveHotspotId(id);
    onSelectHardware(id);
  };

  const handleCyclePin = (dir: -1 | 1) => {
    if (missionPins.length === 0) return;
    soundFx.playClick();
    clearHoveredPin(500);
    const baseIdx = activePinIndex >= 0 ? activePinIndex : dir > 0 ? -1 : 0;
    const nextIdx = (baseIdx + dir + missionPins.length) % missionPins.length;
    const nextPin = missionPins[nextIdx];
    if (nextPin) {
      setActiveHotspotId(nextPin.id);
      onSelectHardware(nextPin.id);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      if (e.key === 'Escape' && activeHotspotId) {
        clearHoveredPin(500);
        setActiveHotspotId('');
        setCameraResetCounter((c) => c + 1);
      } else if (e.key === 'ArrowRight' && activeHotspotId && missionPins.length > 1) {
        e.preventDefault();
        const baseIdx = activePinIndex >= 0 ? activePinIndex : 0;
        const nextPin = missionPins[(baseIdx + 1) % missionPins.length];
        if (nextPin) {
          soundFx.playClick();
          clearHoveredPin(500);
          setActiveHotspotId(nextPin.id);
          onSelectHardware(nextPin.id);
        }
      } else if (e.key === 'ArrowLeft' && activeHotspotId && missionPins.length > 1) {
        e.preventDefault();
        const baseIdx = activePinIndex >= 0 ? activePinIndex : 0;
        const nextPin = missionPins[(baseIdx - 1 + missionPins.length) % missionPins.length];
        if (nextPin) {
          soundFx.playClick();
          clearHoveredPin(500);
          setActiveHotspotId(nextPin.id);
          onSelectHardware(nextPin.id);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeHotspotId, activePinIndex, missionPins, onSelectHardware]);

  const handleMissionSelect = (mId: string) => {
    soundFx.playClick();
    clearHoveredPin(500);
    setActiveHotspotId('');
    setCameraResetCounter((c) => c + 1);
    onSelectMission(mId);
    setIsMissionMenuOpen(false);
  };

  const handleResetCamera = () => {
    soundFx.playClick();
    clearHoveredPin(520);
    setActiveHotspotId('');
    setCameraResetCounter((c) => c + 1);
  };

  const handleFireSensorScan = () => {
    soundFx.playChirp();
    soundFx.playQuindar();
    const targetName = currentHardware?.name || currentMission?.name || 'Active subsystem';
    setScanNotice(`Sensor sweep locked · ${targetName}`);
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    scanTimerRef.current = setTimeout(() => {
      setScanNotice(null);
      scanTimerRef.current = null;
    }, 2800);
  };

  const theaterMissions = useMemo(
    () => getMissionsForTheater(destination),
    [destination]
  );
  const theaterInfo = THEATER_META[destination];

  return (
    <div className={`relative w-full h-screen bg-[#07090F] pt-14 overflow-hidden select-none font-sans ${stageSpotlight.className}`}>
      {/* 1. 3D WebGL Canvas (Mounts immediately; 3D models stream smoothly inside Suspense) */}
      <div
        className="absolute inset-0 z-0"
        onPointerDown={(e) => {
          if (!(e.target as HTMLElement | null)?.closest('button')) {
            clearHoveredPin(0);
          }
        }}
        onWheel={() => clearHoveredPin(0)}
      >
        <CanvasErrorBoundary>
          <Canvas
            camera={{
              position: isStarship
                ? [7.2, 5.4, 8.8]
                : isSpaceborne
                  ? [6.2, 3.4, 6.2]
                  : isOrbiter
                    ? [4.2, 2.95, 4.4]
                    : isMars
                      ? [4.8, 2.4, 4.8]
                      : [6.0, 2.8, 6.2],
              fov: 48,
            }}
            dpr={[1, 1.75]}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.08,
            }}
            shadows
          >
            <AdaptivePerformance />
            <Environment
              resolution={256}
              frames={1}
              environmentIntensity={
                isStudioLighting ? 1.25 : isOrbiter ? 1.15 : isMars ? 0.92 : 0.85
              }
            >
              {/* Soft zenith sky ring so 100% metalness/gloss panels never reflect dead black */}
              <Lightformer
                form="ring"
                intensity={1.15}
                color={isMars && !isOrbiter ? '#fde68a' : '#dbeafe'}
                position={[0, 12, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={28}
              />
              {/* Warm Solar Key Panel */}
              <Lightformer
                form="rect"
                intensity={3.5}
                color="#fff8eb"
                position={[10, 8, 8]}
                scale={[14, 10, 1]}
                target={[0, 1, 0]}
              />
              {/* Aerospace Cool Edge-Rim Panel */}
              <Lightformer
                form="rect"
                intensity={2.2}
                color={isMars && !isOrbiter ? '#fdba74' : '#93c5fd'}
                position={[-10, 4, -8]}
                scale={[16, 10, 1]}
                target={[0, 1, 0]}
              />
              {/* Opposing Specular Fill Panel */}
              <Lightformer
                form="rect"
                intensity={1.45}
                color={isMars && !isOrbiter ? '#fed7aa' : '#e2e8f0'}
                position={[9, 3, -9]}
                scale={[12, 8, 1]}
                target={[0, 1, 0]}
              />
              {/* Planetary Albedo / Regolith / Earthshine Bounce */}
              <Lightformer
                form="circle"
                intensity={isOrbiter ? 1.55 : isMars ? 1.35 : 0.95}
                color={isMars && !isOrbiter ? '#c2410c' : isOrbiter ? '#38bdf8' : '#cbd5e1'}
                position={[0, -8, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={22}
              />
            </Environment>

            <CinematicStudioLighting
              isStudioLighting={isStudioLighting}
              isMars={isMars && !isOrbiter}
              isOrbiter={isOrbiter}
            />

            <OrbitalStarfield isOrbiter={isOrbiter} isMars={isMars} />

            <CanvasErrorBoundary is3DChild={true}>
              <Suspense fallback={null}>
                {isEarthOrbiter ? (
                  <OrbitalPlanetBackdrop body="Earth" />
                ) : isMarsOrbiter ? (
                  <OrbitalPlanetBackdrop body="Mars" />
                ) : isLunarOrbiter ? (
                  <OrbitalPlanetBackdrop body="Moon" />
                ) : !isOrbiter ? (
                  isMars ? (
                    <MarsRealPanorama scale={60} rotationY={0.4} />
                  ) : (
                    <LunarRealEnvironment />
                  )
                ) : null}
              </Suspense>
            </CanvasErrorBoundary>

            <CanvasErrorBoundary is3DChild={true}>
              <Suspense fallback={null}>
                <PinHudContext.Provider
                  value={{
                    onDismiss: handleResetCamera,
                    onInspectSpecs: () => {
                      soundFx.playClick();
                      onOpenHardwareInspect();
                    },
                    onCycle: handleCyclePin,
                    activeIndex: activePinIndex,
                    totalPins: missionPins.length,
                  }}
                >
                  <Rover3DModel
                    modelType={modelType}
                    missionId={currentMission?.id}
                    onSelectHotspot={handleHotspotClick}
                    activeHotspotId={activeHotspotId}
                    isMars={isMars}
                    isMoon={!isMars && !isSpaceborne}
                    showHotspots={showHotspots}
                    autoRotate={autoRotate}
                  />
                </PinHudContext.Provider>
              </Suspense>
            </CanvasErrorBoundary>

            <CameraRig
              activeHotspotId={activeHotspotId}
              missionId={currentMission?.id}
              isMars={isMars}
              isStarship={isStarship}
              isOrbiter={isOrbiter}
              isSpaceborne={isSpaceborne}
              resetTrigger={cameraResetCounter}
              autoRotate={autoRotate}
            />
          </Canvas>
        </CanvasErrorBoundary>

        <CanvasLoadingOverlay
          accent={isMars ? 'amber' : 'cyan'}
          title={
            isMars
              ? 'Loading Mars 3D scene'
              : isOrbiter
                ? 'Loading orbital spacecraft'
                : 'Loading lunar 3D scene'
          }
          compact={true}
          forceActive={isLoadingData}
        />
      </div>

      {/* Atmospheric Edge Vignette */}
      <div className="absolute inset-0 z-[5] pointer-events-none hud-vignette" />

      {/* ZONE 1: Top-Left Collapsible Mission Info Panel (Facts Only) */}
      <ExplorationDossierCard
        activeMissionId={activeMissionId}
        currentMission={currentMission}
        resolvedData={resolvedData}
        liveFleetData={liveFleetData}
        isLoadingData={isLoadingData}
        isMars={isMars}
        health={health}
        score={score}
        isCardCollapsed={isCardCollapsed}
        onToggleCollapsed={() => setIsCardCollapsed((prev) => !prev)}
        isLiveDataOpen={isLiveDataOpen}
        onOpenLiveData={onOpenLiveData}
        dossierSpotlightClass={dossierSpotlight.className}
        liveTriggerSpotlightClass={liveTriggerSpotlight.className}
      />

      {/* ZONE 2: Top-Right Mission Switcher */}
      <div className="absolute top-[72px] right-4 sm:right-6 z-20 flex flex-col items-end gap-2.5 pointer-events-none max-w-[calc(100vw-2rem)]">
        <div className="relative pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setIsMissionMenuOpen(!isMissionMenuOpen);
            }}
            className="group hud-card hud-card-featured px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs hover:border-[var(--accent-border)] hover:-translate-y-[1px] transition-all duration-150 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--accent-primary)] transition-transform duration-300 group-hover:rotate-45" />
            <span className="font-orbitron text-[11px] font-bold uppercase tracking-[0.04em] text-white">
              {currentMission?.name?.split('(')[0] || 'Select mission'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isMissionMenuOpen ? 'rotate-180 text-slate-200' : ''
              }`}
            />
          </button>

          {isMissionMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-76 max-h-[65vh] overflow-y-auto rounded-2xl hud-modal hud-card-featured p-3 animate-fade-in space-y-2.5 z-50">
              <div className="space-y-1.5">
                <div className="px-1.5 pb-1.5 flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-slate-400">
                    ASTRAVEX // {theaterInfo.title.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                    {theaterMissions.length} OPS
                  </span>
                </div>
                <div className="hud-deck-rule mb-1.5" aria-hidden="true" />
                {theaterMissions.map((m, idx) => {
                  const isSelected = currentMission?.id === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => handleMissionSelect(m.id)}
                      className={`group w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between gap-2.5 cursor-pointer hud-row-card ${
                        isSelected
                          ? '!bg-[var(--accent-surface)] !border-[var(--accent-border)] text-white font-semibold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <span
                          className={`font-mono text-[10px] tabular-nums w-4 flex-shrink-0 ${
                            isSelected ? 'text-[var(--accent-text)]' : 'text-slate-500'
                          }`}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <span className="block font-orbitron text-[11px] tracking-[0.03em] uppercase truncate">
                            {m.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 truncate block">
                            {m.site}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {onSwitchTheater && (
                <div className="pt-2 space-y-2">
                  <div className="hud-deck-rule" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsMissionMenuOpen(false);
                      onSwitchTheater();
                    }}
                    className="w-full px-3 py-2 rounded-xl hud-row-card text-left text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--accent-text)] flex items-center justify-between cursor-pointer"
                  >
                    <span>Switch Theater (Moon / Mars / Deep)</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ZONE 3: Bottom-Center Cinematic Mission Dock */}
      <div className="absolute bottom-5 left-0 right-0 z-20 flex flex-col items-center gap-2.5 pointer-events-none px-3 sm:px-4">
        {scanNotice && (
          <div className="scan-toast pointer-events-none">
            <span className="scan-toast__ring" aria-hidden="true" />
            <Radar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{scanNotice}</span>
          </div>
        )}

        <div className="mission-dock pointer-events-auto dock-reveal">
          {/* Active subsystem readout */}
          <div className="hidden md:flex items-center gap-2.5 pl-1 pr-1.5 min-w-0">
            <span className="dock-orb" aria-hidden="true" />
            <div className="text-left min-w-0">
              <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
                SUBSYSTEM
              </span>
              <span className="font-orbitron text-[11px] font-bold uppercase tracking-[0.04em] text-white truncate block max-w-[180px]">
                {currentHardware?.name || 'Primary spacecraft'}
              </span>
            </div>
          </div>

          <span className="dock-divider hidden md:block" aria-hidden="true" />

          {/* View toggles */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <IconButton
              label={showHotspots ? 'Hide subsystem markers' : 'Show subsystem markers'}
              active={showHotspots}
              onClick={() => {
                soundFx.playClick();
                setShowHotspots(!showHotspots);
              }}
              className={`dock-icon ${pinsSpotlight.className}`}
            >
              {showHotspots ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </IconButton>

            <IconButton
              label={isStudioLighting ? 'Switch to natural sunlight' : 'Switch to studio lighting'}
              active={isStudioLighting}
              onClick={() => {
                soundFx.playClick();
                setIsStudioLighting(!isStudioLighting);
              }}
              className="dock-icon"
            >
              <Sun className="w-4 h-4" />
            </IconButton>

            <IconButton
              label={autoRotate ? 'Stop auto-rotation' : 'Auto-rotate 360°'}
              active={autoRotate}
              onClick={() => {
                soundFx.playClick();
                setAutoRotate(!autoRotate);
              }}
              className="dock-icon"
            >
              <RotateCcw className={`w-4 h-4 ${autoRotate ? 'animate-spin-slow' : ''}`} />
            </IconButton>

            <IconButton label="Reset camera view" onClick={handleResetCamera} className="dock-icon">
              <LocateFixed className="w-4 h-4" />
            </IconButton>
          </div>

          <span className="dock-divider" aria-hidden="true" />

          {/* Feature actions (Scan, Specs, Story, Lab, Quiz) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <DockAction
              icon={<Radar className="w-4 h-4" />}
              label="Scan"
              hint="Trigger onboard spectrometer and radar scan"
              onClick={handleFireSensorScan}
              className={sensorSpotlight.className}
            />

            <DockAction
              primary
              icon={<Info className="w-4 h-4" />}
              label="Specs"
              hint="Inspect hardware specifications"
              onClick={() => {
                soundFx.playClick();
                onOpenHardwareInspect();
              }}
              className={specsSpotlight.className}
            />

            <DockAction
              icon={<BookOpen className="w-4 h-4" />}
              label="Story"
              hint="Open the AI mission story"
              onClick={() => {
                soundFx.playClick();
                onOpenStory();
              }}
              className={storySpotlight.className}
            />

            {onOpenSimulators && (
              <DockAction
                icon={<FlaskConical className="w-4 h-4" />}
                label="Lab"
                hint="Open theater science lab"
                onClick={() => {
                  soundFx.playClick();
                  onOpenSimulators();
                }}
              />
            )}

            <DockAction
              icon={<HelpCircle className="w-4 h-4" />}
              label="Quiz"
              hint="Test your mission knowledge"
              onClick={() => {
                soundFx.playClick();
                onOpenQuiz();
              }}
              className={quizSpotlight.className}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { MarsExplorationScene as ExplorationPage };
export { MarsExplorationScene as PlanetaryExplorationScene };
export default MarsExplorationScene;
