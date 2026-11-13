import React, { useRef, useState, useMemo, useEffect, useLayoutEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, Html, Line, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowRight, Globe, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { GLBPlanet } from '../components/3d/GLBPlanet';
import { SpaceStationISS3D } from '../components/3d/SpaceStationISS3D';
import { DEEP_SPACE_SITES, LUNAR_LANDING_SITES, MARS_LANDING_SITES } from './DestinationPage';
import { CanvasErrorBoundary } from '../components/common/CanvasErrorBoundary';
import { CanvasLoadingOverlay } from '../components/common/CanvasLoadingOverlay';
import { useTourSpotlight } from '../guide/tourEngine';
import { DestinationType, LiveFleetSummaryPayload } from '../types';
import { AdaptivePerformance } from '../components/3d/AdaptivePerformance';
import { prefetchTheaterModels } from '../utils/assetPreloader';
import {
  formatCompactDistanceKm,
  getEarthMarsDistanceKm,
  getEarthMoonDistanceKm,
} from '../utils/liveTelemetry';

const LUNAR_ORBIT_PERIOD_SEC = 96;
const PHOBOS_ORBIT_PERIOD_SEC = 24;

// Balanced center-right celestial stage: avoids far-right corner crowding and clears the bottom-left theater card
const EARTH_STAGE_POS: [number, number, number] = [0.22, 0.24, 0.28];
const MARS_STAGE_POS: [number, number, number] = [3.42, 0.68, -0.78];
const JWST_STAGE_POS: [number, number, number] = [2.02, -1.16, 1.32];

function getDynamicOrbitalAngle(periodSec: number, seedOffset: number = 0): number {
  const nowSec = Date.now() / 1000 + seedOffset;
  return ((nowSec % periodSec) / periodSec) * Math.PI * 2;
}

function RealisticEarth({
  position = EARTH_STAGE_POS,
}: {
  position?: [number, number, number];
}) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [inspected, setInspected] = useState(false);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += dt * 0.024;
    }
  });

  // Subtle 51.6° inclined LEO orbital path for ISS visibility
  const issOrbitPoints = useMemo<[number, number, number][]>(() => {
    const pts: [number, number, number][] = [];
    const r = 1.54;
    const tilt = new THREE.Euler(0.90, 0.15, 0);
    const v = new THREE.Vector3();
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      v.set(Math.cos(a) * r, 0, Math.sin(a) * r).applyEuler(tilt);
      pts.push([v.x, v.y, v.z]);
    }
    return pts;
  }, []);

  return (
    <group position={position}>
      {/* Faint LEO inclination track around Earth */}
      <Line
        points={issOrbitPoints}
        color="#38bdf8"
        transparent
        opacity={0.22}
        lineWidth={1}
      />

      <group
        ref={earthGroupRef}
        rotation={[0.41, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          soundFx.playClick();
          setInspected((prev) => !prev);
        }}
      >
        <GLBPlanet
          modelPath="/models/earth.glb"
          targetRadius={1.22}
          fallbackColor="#1e3a8a"
          isHovered={hovered}
          castShadow={false}
          receiveShadow={false}
        />

        {/* Kennedy Space Center / Cape Canaveral Marker */}
        <group position={[0.62, 0.47, 0.82]}>
          <mesh>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshBasicMaterial color="#9DB4D3" />
          </mesh>
        </group>

        {(hovered || inspected) && (
          <Html position={[0, 1.62, 0]} pointerEvents="none" style={{ pointerEvents: 'none' }} center>
            <div className="px-3.5 py-2 rounded-xl hud-card text-xs text-slate-200 whitespace-nowrap animate-fade-in pointer-events-none select-none">
              <div className="flex items-center gap-2 font-semibold text-slate-50 font-display">
                <Globe className="w-3.5 h-3.5 text-sky-300" />
                <span>Earth · Launch Origin</span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Kennedy Space Center · Deep Space Network Hub
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

function OrbitingMoon({
  earthCenter = EARTH_STAGE_POS,
  onSelect,
}: {
  earthCenter?: [number, number, number];
  onSelect: () => void;
}) {
  const moonGroupRef = useRef<THREE.Group>(null);
  const moonSpotLightRef = useRef<THREE.SpotLight>(null);
  const [hovered, setHovered] = useState(false);

  // Start Moon on clean upper-front-left quadrant so it frames Earth without overlapping Mars or HUD cards
  const angleRef = useRef<number>(2.15 + (getDynamicOrbitalAngle(LUNAR_ORBIT_PERIOD_SEC) % 0.45));

  const rx = 1.92;
  const rz = 1.56;
  const incY = 0.44;

  const moonOrbitPoints = useMemo<[number, number, number][]>(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 96; i++) {
      const t = (i / 96) * Math.PI * 2;
      pts.push([
        earthCenter[0] + Math.cos(t) * rx,
        earthCenter[1] + Math.sin(t) * incY,
        earthCenter[2] + Math.sin(t) * rz,
      ]);
    }
    return pts;
  }, [earthCenter]);

  const earthTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(...earthCenter);
    return obj;
  }, [earthCenter]);

  useLayoutEffect(() => {
    if (moonSpotLightRef.current) {
      moonSpotLightRef.current.target = earthTarget;
    }
  }, [earthTarget]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const orbitSpeed = (Math.PI * 2) / LUNAR_ORBIT_PERIOD_SEC;
    angleRef.current += delta * orbitSpeed;
    if (angleRef.current > Math.PI * 2) {
      angleRef.current -= Math.PI * 2;
    }

    const t = angleRef.current;
    const x = earthCenter[0] + Math.cos(t) * rx;
    const z = earthCenter[2] + Math.sin(t) * rz;
    const y = earthCenter[1] + Math.sin(t) * incY;

    if (moonGroupRef.current) {
      moonGroupRef.current.position.set(x, y, z);
      moonGroupRef.current.lookAt(earthCenter[0], earthCenter[1], earthCenter[2]);
    }

    if (moonSpotLightRef.current) {
      moonSpotLightRef.current.position.set(x, y, z);
    }
  });

  return (
    <>
      <primitive object={earthTarget} />

      {/* Visible Keplerian lunar orbital ring around Earth */}
      <Line
        points={moonOrbitPoints}
        color="#9DB4D3"
        transparent
        opacity={0.3}
        lineWidth={1}
        dashed
        dashSize={0.14}
        gapSize={0.1}
      />

      <spotLight
        ref={moonSpotLightRef}
        color="#e0f2fe"
        intensity={2.0}
        distance={8.5}
        angle={0.55}
        penumbra={0.9}
        decay={1.2}
      />

      <group ref={moonGroupRef}>
        <GLBPlanet
          modelPath="/models/moon.glb"
          targetRadius={0.44}
          fallbackColor="#64748b"
          isHovered={hovered}
          castShadow={false}
          receiveShadow={false}
        />

        {/* Soft Earthshine fill so lunar highlands remain visible across all phases */}
        <pointLight position={[-0.7, 0.25, 0.85]} color="#bae6fd" intensity={0.9} distance={2.5} />

        {/* Tranquility / Shackleton indicator */}
        <group position={[0.1, 0.14, 0.38]}>
          <mesh>
            <sphereGeometry args={[0.015, 16, 16]} />
            <meshBasicMaterial color="#9DB4D3" />
          </mesh>
        </group>

        {/* Generous invisible pointer hit sphere */}
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playChirp();
            onSelect();
          }}
        >
          <sphereGeometry args={[0.52, 16, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        {/* Clean subtle always-readable badge on hover */}
        {hovered && (
          <Html position={[0, 0.68, 0]} pointerEvents="none" style={{ pointerEvents: 'none' }} center>
            <div className="px-3.5 py-2 rounded-xl hud-card text-xs text-slate-200 whitespace-nowrap animate-fade-in pointer-events-none select-none">
              <div className="font-semibold text-slate-50 font-display">The Moon</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {LUNAR_LANDING_SITES.length} Missions · Click to explore
              </div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

function JWSTBeaconFallback() {
  return (
    <group rotation={[0.35, -0.5, 0.18]}>
      {/* Gold primary mirror hex */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.03, 6]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.88} roughness={0.22} />
      </mesh>
      {/* 5-layer Kapton diamond sunshield proxy */}
      <mesh position={[0, -0.05, 0]} scale={[1.35, 0.08, 0.85]}>
        <octahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial color="#a5b4fc" metalness={0.65} roughness={0.35} />
      </mesh>
    </group>
  );
}

function DeepSpaceObservatoryGLB() {
  const { scene } = useGLTF('/models/jwst.glb', '/draco/');
  const normalizedJwst = useMemo(() => {
    const c = scene.clone(true);
    const removeNodes: THREE.Object3D[] = [];
    c.traverse((n) => {
      if (n.type.includes('Camera') || n.type.includes('Light')) {
        removeNodes.push(n);
      }
    });
    removeNodes.forEach((n) => n.parent?.remove(n));

    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    c.position.set(-center.x, -center.y, -center.z);

    const wrapper = new THREE.Group();
    wrapper.add(c);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    wrapper.scale.setScalar(0.55 / maxDim);
    return wrapper;
  }, [scene]);

  return <primitive object={normalizedJwst} rotation={[0.35, -0.5, 0.18]} />;
}

function DeepSpaceObservatoryBeacon({
  position = JWST_STAGE_POS,
  onSelect,
}: {
  position?: [number, number, number];
  onSelect: () => void;
}) {
  const beaconRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const l2RingPoints = useMemo<[number, number, number][]>(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      pts.push([Math.cos(a) * 0.42, Math.sin(a) * 0.14, Math.sin(a) * 0.42]);
    }
    return pts;
  }, []);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1);
    if (beaconRef.current) {
      beaconRef.current.rotation.y += dt * 0.22;
      beaconRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.85) * 0.06;
    }
  });

  return (
    <group
      ref={beaconRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        soundFx.playChirp();
        onSelect();
      }}
    >
      <Suspense fallback={<JWSTBeaconFallback />}>
        <DeepSpaceObservatoryGLB />
      </Suspense>
      <Line points={l2RingPoints} color="#818cf8" transparent opacity={hovered ? 0.65 : 0.28} lineWidth={1} />
      <pointLight position={[0.4, 0.4, 0.5]} color="#fde68a" intensity={1.1} distance={2.5} />
      <mesh>
        <sphereGeometry args={[0.48, 12, 12]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      {hovered && (
        <Html position={[0, 0.56, 0]} pointerEvents="none" style={{ pointerEvents: 'none' }} center>
          <div className="px-3.5 py-2 rounded-xl hud-card text-xs text-slate-200 whitespace-nowrap animate-fade-in pointer-events-none select-none">
            <div className="font-semibold text-indigo-200 font-display flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sun–Earth L2 · JWST Observatory</span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {DEEP_SPACE_SITES.length} Deep Space Missions · Click to explore
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function RealisticMars({
  position = MARS_STAGE_POS,
  distanceLabel,
  onSelect,
}: {
  position?: [number, number, number];
  distanceLabel: string;
  onSelect: () => void;
}) {
  const marsGroupRef = useRef<THREE.Group>(null);
  const phobosGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const phobosAngleRef = useRef<number>(getDynamicOrbitalAngle(PHOBOS_ORBIT_PERIOD_SEC, 7.3));

  const phobosGeometry = useMemo(() => {
    const geom = new THREE.SphereGeometry(0.03, 24, 18);
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    const stickneyDir = new THREE.Vector3(0.78, 0.32, 0.54).normalize();

    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      const n = v.clone().normalize();
      const ridge =
        0.09 * Math.sin(n.x * 5.2 + n.y * 3.1) * Math.cos(n.z * 4.4) +
        0.05 * Math.sin(n.y * 9.0 + n.z * 6.5);
      const distToStickney = n.distanceTo(stickneyDir);
      const stickneyCrater = distToStickney < 0.42 ? -0.22 * (1 - distToStickney / 0.42) : 0;
      const scale = 1 + ridge + stickneyCrater;
      // Triaxial potato ellipsoid proportions matching Phobos (13.4 x 11.2 x 9.2 km)
      posAttr.setXYZ(i, v.x * 1.24 * scale, v.y * 0.92 * scale, v.z * 0.82 * scale);
    }

    geom.computeVertexNormals();
    return geom;
  }, []);

  useEffect(() => {
    return () => {
      phobosGeometry.dispose();
    };
  }, [phobosGeometry]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    if (marsGroupRef.current) {
      marsGroupRef.current.rotation.y += delta * 0.028;
    }
    if (phobosGroupRef.current) {
      phobosAngleRef.current += delta * 0.26;
      const pt = phobosAngleRef.current;
      const pr = 1.38;
      phobosGroupRef.current.position.set(
        Math.cos(pt) * pr,
        Math.sin(pt) * 0.20,
        Math.sin(pt) * pr
      );
      phobosGroupRef.current.rotation.y = -pt;
    }
  });

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        soundFx.playChirp();
        onSelect();
      }}
    >
      <group ref={marsGroupRef} rotation={[0.44, 0, 0]}>
        <GLBPlanet
          modelPath="/models/mars.glb"
          targetRadius={1.06}
          fallbackColor="#b91c1c"
          isHovered={hovered}
          castShadow={false}
          receiveShadow={false}
        />

        <group position={[0.36, 0.28, 0.86]}>
          <mesh>
            <sphereGeometry args={[0.016, 16, 16]} />
            <meshBasicMaterial color="#D9774B" />
          </mesh>
        </group>

        <group position={[-0.26, 0.38, 0.80]}>
          <mesh>
            <sphereGeometry args={[0.014, 16, 16]} />
            <meshBasicMaterial color="#D9774B" />
          </mesh>
        </group>
      </group>

      <group ref={phobosGroupRef}>
        <mesh geometry={phobosGeometry}>
          <meshStandardMaterial color="#837971" roughness={0.94} metalness={0.04} />
        </mesh>
      </group>

      {hovered && (
        <Html position={[0, 1.52, 0]} pointerEvents="none" style={{ pointerEvents: 'none' }} center>
          <div className="px-3.5 py-2 rounded-xl hud-card text-xs text-slate-200 whitespace-nowrap animate-fade-in pointer-events-none select-none">
            <div className="font-semibold text-slate-50 font-display">Mars Theater</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {distanceLabel} today · Click to explore missions
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Unconstrained responsive OrbitControls rig:
 * No programmatic camera-angle overrides in useFrame — dragging, zooming, and inertia work freely at 60–120 FPS.
 * Balanced lookAt keeps Earth, Moon, ISS, JWST, and Mars centered across the open stage clear of the left theater card.
 */
function HomeCameraRig() {
  const { camera, size } = useThree();
  const controlsRef = useRef<any>(null);
  const isCompact = size.width < 900;

  const targetVec = useMemo(
    () => (isCompact ? new THREE.Vector3(1.1, -0.95, 0) : new THREE.Vector3(-0.32, -0.05, 0)),
    [isCompact]
  );
  const homeCamPos = useMemo(
    () => (isCompact ? new THREE.Vector3(1.1, 0.35, 10.6) : new THREE.Vector3(-0.32, 0.56, 8.85)),
    [isCompact]
  );

  useEffect(() => {
    camera.position.copy(homeCamPos);
    if (controlsRef.current) {
      controlsRef.current.target.copy(targetVec);
      controlsRef.current.update();
    }
  }, [camera, homeCamPos, targetVec]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      enableZoom={true}
      minDistance={4.8}
      maxDistance={13.5}
      enablePan={false}
      rotateSpeed={0.78}
    />
  );
}

function AdvancedCelestialLighting() {
  return (
    <>
      <ambientLight intensity={0.44} color="#0b1530" />
      <directionalLight position={[14, 7, 9]} intensity={3.8} color="#fffbf2" />
      <directionalLight position={[-8, 1.8, 3]} intensity={1.15} color="#38bdf8" />
      <pointLight position={[8.0, 1.0, -3.0]} intensity={1.1} color="#fb923c" distance={10} />
      <Stars radius={140} depth={65} count={5000} factor={4.0} fade speed={0.5} />
    </>
  );
}

interface SpaceHomeSceneProps {
  onExplore: (dest: DestinationType) => void;
  liveFleetData?: LiveFleetSummaryPayload | null;
}

export const SpaceHomeScene: React.FC<SpaceHomeSceneProps> = ({ onExplore, liveFleetData }) => {
  const heroStackRef = useRef<HTMLDivElement | null>(null);
  const kineticWordRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  useEffect(() => {
    if (typeof CSS === 'undefined' || !CSS.supports('animation-delay: calc(sibling-index() * 0.1s)')) {
      [heroStackRef.current, kineticWordRef.current].forEach((container) => {
        if (!container) return;
        Array.from(container.children).forEach((el, index) => {
          (el as HTMLElement).style.setProperty('--sibling-index', String(index + 1));
        });
      });
    }
  }, []);

  const liveDistances = useMemo(() => {
    const moonKm = getEarthMoonDistanceKm();
    const marsEntry = liveFleetData?.missions?.find((m) => m.id === 'perseverance')?.realTimeTelemetry;
    const marsKm = marsEntry?.earthDistanceKm || getEarthMarsDistanceKm();
    return {
      moonLabel: formatCompactDistanceKm(moonKm),
      marsLabel: formatCompactDistanceKm(marsKm),
    };
  }, [liveFleetData]);

  const heroSpotlight = useTourSpotlight('welcome-hero');
  const cardsSpotlight = useTourSpotlight('destination-cards');
  const moonSpotlight = useTourSpotlight('moon-card');
  const marsSpotlight = useTourSpotlight('mars-card');

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#07090F] select-none font-sans" role="main">
      {/* 1. 3D WebGL Deep Space Canvas (Mounts immediately; models stream inside Suspense) */}
      <div className="absolute inset-0 z-0">
        <CanvasErrorBoundary>
          <Canvas
            camera={{ position: [-0.32, 0.56, 8.85], fov: 44 }}
            dpr={[1, 1.75]}
            gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
          >
            <AdaptivePerformance />
            <AdvancedCelestialLighting />
            <Suspense fallback={null}>
              <RealisticEarth position={EARTH_STAGE_POS} />
              <SpaceStationISS3D
                earthCenter={EARTH_STAGE_POS}
                orbitRadius={1.54}
                targetSpan={0.16}
                onSelect={() => {
                  soundFx.playChirp();
                  onExplore('DeepSpace');
                }}
              />
              <OrbitingMoon
                earthCenter={EARTH_STAGE_POS}
                onSelect={() => onExplore('Moon')}
              />
              <DeepSpaceObservatoryBeacon
                position={JWST_STAGE_POS}
                onSelect={() => onExplore('DeepSpace')}
              />
              <RealisticMars
                position={MARS_STAGE_POS}
                distanceLabel={liveDistances.marsLabel}
                onSelect={() => onExplore('Mars')}
              />
            </Suspense>

            <HomeCameraRig />
          </Canvas>
        </CanvasErrorBoundary>

        <CanvasLoadingOverlay accent="cyan" title="Streaming 3D solar system" compact />
      </div>

      {/* 2. Restrained Left-Anchored HUD Overlay (Clean Stage — Moon & Mars Theaters) */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end p-4 sm:p-6 pt-16 pointer-events-none screen-enter">
        <div className="hidden lg:inline-flex items-center gap-2 hud-orbit-hint fixed bottom-5 right-6 z-10 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-80" aria-hidden="true" />
          <span>Drag to orbit · Scroll to zoom · Select a world</span>
        </div>
        {/* Left-Aligned Kinetic Launch Deck & Destination Triggers */}
        <div
          ref={heroStackRef}
          className={`max-w-[356px] w-full home-deck-panel home-stagger-stack rounded-2xl p-4 sm:p-5 space-y-3.5 pointer-events-auto ${heroSpotlight.className}`}
          role="region"
          aria-label="Choose a destination"
        >
          {/* Row 1: Compact Perimeter Status */}
          <div className="home-stagger-row flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-400/90">
              ASTRAVEX // J2000
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-[10px] font-mono tracking-wider text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-beacon" />
              <span>LIVE</span>
            </span>
          </div>

          {/* Row 2: Sculptural Kinetic Typography Lockup */}
          <div className="home-stagger-row space-y-2.5">
            <h1 className="space-y-0.5">
              <span className="sr-only">Select Destination</span>
              <span
                aria-hidden="true"
                className="block text-[10px] font-mono uppercase tracking-[0.3em] text-sky-300/75"
              >
                SELECT
              </span>
              <span aria-hidden="true" className="block home-glaze-sheen">
                <span
                  ref={kineticWordRef}
                  className="home-kinetic-chars text-[24px] sm:text-[26px] font-bold font-orbitron uppercase tracking-[0.1em] text-slate-50 leading-none"
                >
                  {'DESTINATION'.split('').map((char, index) => (
                    <span key={index} className="home-kinetic-char">
                      {char}
                    </span>
                  ))}
                </span>
              </span>
            </h1>
            <div
              aria-hidden="true"
              className="h-px w-full bg-gradient-to-r from-cyan-400/40 via-white/10 to-transparent"
            />
          </div>

          {/* Row 3: Orbital World Launcher Tiles */}
          <div className={`home-stagger-row space-y-2 ${cardsSpotlight.className}`}>
            {/* Target 01: Moon */}
            <button
              type="button"
              onMouseEnter={() => prefetchTheaterModels('Moon')}
              onFocus={() => prefetchTheaterModels('Moon')}
              onClick={() => {
                soundFx.playClick();
                prefetchTheaterModels('Moon');
                onExplore('Moon');
              }}
              className={`w-full px-3.5 py-3 rounded-xl home-world-card hover:border-[#9DB4D3]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9DB4D3]/60 cursor-pointer group flex items-center justify-between gap-3 text-left ${moonSpotlight.className}`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center" aria-hidden="true">
                  <div
                    className="home-world-orb w-9 h-9 rounded-full border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.45),0_4px_14px_rgba(148,163,184,0.18)]"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 28%, #f8fafc 0%, #cbd5e1 38%, #475569 74%, #090d16 100%)',
                    }}
                  />
                  <span className="home-world-ring absolute inset-0 rounded-full border border-[#9DB4D3]/45 border-t-transparent">
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C4D6EC]" />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-mono text-slate-500 tracking-widest">01</span>
                    <h2 className="text-[15px] font-bold font-orbitron uppercase tracking-[0.1em] text-slate-100 group-hover:text-white transition-colors">
                      MOON
                    </h2>
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-slate-400 group-hover:text-slate-200 transition-colors mt-0.5 truncate">
                    {liveDistances.moonLabel} · {LUNAR_LANDING_SITES.length} SITES
                  </div>
                </div>
              </div>
              <span
                aria-hidden="true"
                className="w-7 h-7 rounded-full border border-white/10 bg-white/[0.03] group-hover:border-[#9DB4D3]/45 group-hover:bg-[#9DB4D3]/15 flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <ArrowRight className="home-world-arrow w-3.5 h-3.5 text-slate-400 group-hover:text-[#E2EDF9]" />
              </span>
            </button>

            {/* Target 02: Mars */}
            <button
              type="button"
              onMouseEnter={() => prefetchTheaterModels('Mars')}
              onFocus={() => prefetchTheaterModels('Mars')}
              onClick={() => {
                soundFx.playClick();
                prefetchTheaterModels('Mars');
                onExplore('Mars');
              }}
              className={`w-full px-3.5 py-3 rounded-xl home-world-card hover:border-[#D9774B]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9774B]/60 cursor-pointer group flex items-center justify-between gap-3 text-left ${marsSpotlight.className}`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center" aria-hidden="true">
                  <div
                    className="home-world-orb w-9 h-9 rounded-full border border-white/20 shadow-[inset_0_1px_4px_rgba(254,215,170,0.4),0_4px_14px_rgba(217,119,75,0.22)]"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 28%, #fdba74 0%, #ea580c 42%, #7c2d12 76%, #140703 100%)',
                    }}
                  />
                  <span className="home-world-ring absolute inset-0 rounded-full border border-[#D9774B]/45 border-b-transparent">
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F0A986]" />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-mono text-slate-500 tracking-widest">02</span>
                    <h2 className="text-[15px] font-bold font-orbitron uppercase tracking-[0.1em] text-slate-100 group-hover:text-white transition-colors">
                      MARS
                    </h2>
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-slate-400 group-hover:text-slate-200 transition-colors mt-0.5 truncate">
                    {liveDistances.marsLabel} · {MARS_LANDING_SITES.length} SITES
                  </div>
                </div>
              </div>
              <span
                aria-hidden="true"
                className="w-7 h-7 rounded-full border border-white/10 bg-white/[0.03] group-hover:border-[#D9774B]/45 group-hover:bg-[#D9774B]/15 flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <ArrowRight className="home-world-arrow w-3.5 h-3.5 text-slate-400 group-hover:text-[#F8C4AA]" />
              </span>
            </button>
          </div>

          {/* Row 4: Quiet Orbital Perimeter Note */}
          <div className="home-stagger-row pt-2 border-t border-white/[0.07] flex items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-1 h-1 rounded-full bg-indigo-400/80 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">Click 3D ISS or JWST for Deep Space</span>
            </span>
            <span className="tabular-nums text-slate-400/80 flex-shrink-0">
              {LUNAR_LANDING_SITES.length + MARS_LANDING_SITES.length + DEEP_SPACE_SITES.length} OPS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

useGLTF.preload('/models/jwst.glb', '/draco/');

export { SpaceHomeScene as SpaceHomePage };
export default SpaceHomeScene;
