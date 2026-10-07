import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Rocket,
  ArrowRight,
  Compass,
  Globe,
  Radio,
  Tv,
  Orbit,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Maximize2
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { GLBPlanet } from '../components/3d/GLBPlanet';
import { SpaceStationISS3D } from '../components/3d/SpaceStationISS3D';
import { LUNAR_LANDING_SITES, MARS_LANDING_SITES } from './DestinationPage';

// ═══════════════════════════════════════════════════════════════════════════
// ⏱️ LIVING CELESTIAL CLOCK (Organic Epoch-Driven Orbit Engine)
// Eliminates repetitive static starting positions; synchronizes orbital
// progression with real-world time so every visit presents a living vista.
// ═══════════════════════════════════════════════════════════════════════════
const LUNAR_ORBIT_PERIOD_SEC = 120; // 2-minute elegant cinematic orbital revolution
const PHOBOS_ORBIT_PERIOD_SEC = 24;  // Fast Martian moonlet orbit

function getDynamicOrbitalAngle(periodSec: number, seedOffset: number = 0): number {
  const nowSec = Date.now() / 1000 + seedOffset;
  return ((nowSec % periodSec) / periodSec) * Math.PI * 2;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌍 HIGH-DEFINITION REALISTIC EARTH (Centered at [-1.75, -0.08, 0.10])
// Clean NASA Blue Marble, true astronomical silhouette with zero fake glow hoops
// ═══════════════════════════════════════════════════════════════════════════
function RealisticEarth({
  position = [-1.75, -0.08, 0.10],
  onSelect,
}: {
  position?: [number, number, number];
  onSelect?: () => void;
}) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [inspected, setInspected] = useState(false);

  // Physically refined, smooth framerate-independent axial rotation (23.44° tilt)
  useFrame((_, delta) => {
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += delta * 0.024;
    }
  });

  return (
    <group
      ref={earthGroupRef}
      position={position}
      rotation={[0.41, 0, 0]} // 23.44° authentic Earth axial tilt
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
        soundFx.playClick();
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        soundFx.playChirp();
        setInspected(!inspected);
        if (onSelect) onSelect();
      }}
    >
      <GLBPlanet
        modelPath="/models/earth.glb"
        targetRadius={1.30}
        fallbackColor="#1e3a8a"
        isHovered={hovered}
        castShadow={false}
        receiveShadow={false}
      />

      {/* Cape Canaveral / KSC Launch Site Micro Beacon */}
      <group position={[0.66, 0.50, 0.88]}>
        <mesh>
          <sphereGeometry args={[0.016, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {(hovered || inspected) && (
        <Html position={[0, 1.75, 0]} pointerEvents="none" style={{ pointerEvents: 'none' }} center>
          <div className="px-3.5 py-2 rounded-2xl crystal-glass text-xs text-slate-200 shadow-2xl whitespace-nowrap animate-fade-in pointer-events-none select-none border border-cyan-400/40 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-bold text-white font-display">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Planet Earth (Terra)</span>
            </div>
            <div className="text-[10px] text-cyan-300 font-mono mt-0.5">
              Launch Site: Cape Canaveral SLC-41 & LC-39A KSC
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              Home Base • ISS in Low Earth Orbit • Moon in Celestial Orbit
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌕 ORBITING 3D MOON (Luna) - NATURAL ASTRONOMICAL DISTANCE FROM EARTH
// Smooth 3D orbit around Earth, never crowding Mars, with soft lunar light on Earth
// ═══════════════════════════════════════════════════════════════════════════
function OrbitingMoon({
  earthCenter = [-1.75, -0.08, 0.10],
  onSelect,
}: {
  earthCenter?: [number, number, number];
  onSelect: () => void;
}) {
  const moonGroupRef = useRef<THREE.Group>(null);
  const moonSpotLightRef = useRef<THREE.SpotLight>(null);
  const [hovered, setHovered] = useState(false);

  // Dynamic continuous starting angle from real-time epoch (never starts at same angle!)
  const angleRef = useRef<number>(getDynamicOrbitalAngle(LUNAR_ORBIT_PERIOD_SEC));

  // Virtual target for focused lunar illumination beam directed towards Earth
  const earthTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(...earthCenter);
    return obj;
  }, [earthCenter]);

  useFrame((_, delta) => {
    // 60fps smooth framerate-independent orbital movement
    const orbitSpeed = (Math.PI * 2) / LUNAR_ORBIT_PERIOD_SEC; // ~0.052 rad/sec
    angleRef.current += delta * orbitSpeed;
    if (angleRef.current > Math.PI * 2) {
      angleRef.current -= Math.PI * 2;
    }

    const t = angleRef.current;

    // Realistic Astronomical Orbital Geometry:
    // rx = 1.95, rz = 2.15 leaves clear space between Moon and Earth, and over 2.1 units before Mars
    const rx = 1.95;
    const rz = 2.15;
    const inc = 0.35;

    const x = earthCenter[0] + Math.cos(t) * rx;
    const z = earthCenter[2] + Math.sin(t) * rz;
    const y = earthCenter[1] + Math.sin(t) * inc;

    if (moonGroupRef.current) {
      moonGroupRef.current.position.set(x, y, z);
      // Synchronous Tidal Locking: Near side (Apollo 11) permanently faces Earth!
      moonGroupRef.current.lookAt(earthCenter[0], earthCenter[1], earthCenter[2]);
    }

    // Dynamic Moonlight: Spotlight tracks Moon and bathes Earth in soft silver moonlight
    if (moonSpotLightRef.current) {
      moonSpotLightRef.current.position.set(x, y, z);
      moonSpotLightRef.current.target = earthTarget;
    }
  });

  return (
    <>
      {/* Virtual Target for Moonlight Beam */}
      <primitive object={earthTarget} />

      {/* 🌕 DEDICATED MOONLIGHT ILLUMINATION BEAM (Ethereal Silver Radiance Shining onto Earth) */}
      <spotLight
        ref={moonSpotLightRef}
        color="#e0f2fe"
        intensity={2.2}
        distance={8.0}
        angle={0.52}
        penumbra={0.9}
        decay={1.2}
      />

      <group ref={moonGroupRef}>
        <GLBPlanet
          modelPath="/models/moon.glb"
          targetRadius={0.34}
          fallbackColor="#64748b"
          isHovered={hovered}
          castShadow={false}
          receiveShadow={false}
        />

        {/* Apollo 11 Tranquility Base Beacon on Lunar Near Side */}
        <group position={[0.08, 0.12, 0.29]}>
          <mesh>
            <sphereGeometry args={[0.012, 16, 16]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Dedicated smooth, jitter-free spherical raycast hit zone */}
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
          <sphereGeometry args={[0.38, 16, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        {hovered && (
          <Html position={[0, 0.55, 0]} pointerEvents="none" style={{ pointerEvents: 'none' }} center>
            <div className="px-3 py-1.5 rounded-xl crystal-glass text-xs text-slate-200 shadow-xl whitespace-nowrap animate-fade-in pointer-events-none select-none border border-cyan-400/50 backdrop-blur-xl">
              <div className="font-bold text-white font-display flex items-center gap-1.5">
                <span>🌕</span>
                <span>The Moon (Luna)</span>
              </div>
              <div className="text-[10px] text-cyan-300 font-mono">
                Orbiting Earth • 384,400 km • Active Lunar Orbit
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                Tidally Locked Near Side • Click to Inspect
              </div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔴 REALISTIC 3D MARS (Red Planet) - CLEAN PHOTOREALISTIC SURFACE
// Positioned in balanced proximity to Earth, zero fake glow hoops, crisp & grand
// ═══════════════════════════════════════════════════════════════════════════
function RealisticMars({ onSelect }: { onSelect: () => void }) {
  const marsGroupRef = useRef<THREE.Group>(null);
  const phobosGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Dynamic continuous starting angle for Phobos
  const phobosAngleRef = useRef<number>(getDynamicOrbitalAngle(PHOBOS_ORBIT_PERIOD_SEC, 7.3));

  useFrame((_, delta) => {
    // Physically refined, smooth Mars axial rotation (25.19° tilt)
    if (marsGroupRef.current) {
      marsGroupRef.current.rotation.y += delta * 0.028;
    }
    // Mars's natural moon Phobos orbiting in a close, fast trajectory
    if (phobosGroupRef.current) {
      phobosAngleRef.current += delta * 0.26;
      const pt = phobosAngleRef.current;
      const pr = 1.45;
      phobosGroupRef.current.position.set(
        Math.cos(pt) * pr,
        Math.sin(pt) * 0.22,
        Math.sin(pt) * pr
      );
    }
  });

  return (
    <group
      position={[2.10, 0.40, -0.85]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
        soundFx.playClick();
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
      {/* Mars Body with 25.19° Axial Tilt - Pure Clean NASA Model */}
      <group ref={marsGroupRef} rotation={[0.44, 0, 0]}>
        <GLBPlanet
          modelPath="/models/mars.glb"
          targetRadius={1.12}
          fallbackColor="#b91c1c"
          isHovered={hovered}
          castShadow={false}
          receiveShadow={false}
        />

        {/* Jezero Crater Landing Site Beacon (Clean Micro Dot, Zero Light Bleed) */}
        <group position={[0.38, 0.30, 0.90]}>
          <mesh>
            <sphereGeometry args={[0.016, 16, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>

        {/* Olympus Mons Volcano Landmark Beacon (Clean Micro Dot) */}
        <group position={[-0.28, 0.40, 0.85]}>
          <mesh>
            <sphereGeometry args={[0.014, 16, 16]} />
            <meshBasicMaterial color="#f97316" />
          </mesh>
        </group>
      </group>

      {/* Orbiting Martian Moon: Phobos */}
      <group ref={phobosGroupRef}>
        <mesh>
          <sphereGeometry args={[0.026, 8, 8]} />
          <meshStandardMaterial color="#78716c" roughness={0.9} />
        </mesh>
      </group>

      {hovered && (
        <Html position={[0, 1.60, 0]} pointerEvents="none" style={{ pointerEvents: 'none' }} center>
          <div className="px-3 py-1.5 rounded-xl crystal-glass text-xs text-slate-200 shadow-xl whitespace-nowrap animate-fade-in pointer-events-none select-none border border-rose-400/50 backdrop-blur-xl">
            <div className="font-bold text-white font-display flex items-center gap-1.5">
              <span>🔴</span>
              <span>Mars (The Red Planet)</span>
            </div>
            <div className="text-[10px] text-rose-300 font-mono">
              225,000,000 km • Perseverance & Curiosity Active
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              Moons: Phobos & Deimos • Click to Explore
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌟 ADVANCED CELESTIAL LIGHTING RIG
// Warm Directional Sunlight + Earth Atmospheric Rim + Mars Regolith Warm Scatter
// ═══════════════════════════════════════════════════════════════════════════
function AdvancedCelestialLighting() {
  return (
    <>
      {/* Deep Space Cosmic Ambient Fill */}
      <ambientLight intensity={0.38} color="#081024" />

      {/* Primary Directional Sunlight (Warm Solar Radiation, Clean PBR Shading) */}
      <directionalLight
        position={[13, 6, 8]}
        intensity={3.6}
        color="#fffbf2"
      />

      {/* Earth Atmospheric Limb / Crescent Backlight (Fresnel Glow) */}
      <directionalLight
        position={[-9, 1.2, -4]}
        intensity={1.2}
        color="#38bdf8"
      />

      {/* Mars Atmospheric Regolith Warm Backfill */}
      <pointLight
        position={[7.5, 0.5, -3.5]}
        intensity={1.0}
        color="#fb923c"
        distance={9}
      />

      {/* Subdued Starfield with Depth */}
      <Stars
        radius={140}
        depth={65}
        count={9500}
        factor={4.0}
        fade
        speed={0.5}
      />
    </>
  );
}

interface SpaceHomeSceneProps {
  onExplore: (dest?: 'Moon' | 'Mars') => void;
  onWatchLandingVideo?: () => void;
}

export const SpaceHomeScene: React.FC<SpaceHomeSceneProps> = ({ onExplore, onWatchLandingVideo }) => {
  const [isCinematicShow, setIsCinematicShow] = useState(true);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#04060b] select-none font-sans" role="main">

      {/* ═══ 1. 3D WEBGL DEEP SPACE CANVAS ═══ */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0.25, 7.6], fov: 45 }}>
          {/* Advanced Space Lighting */}
          <AdvancedCelestialLighting />

          {/* Clean 3D Bodies: Reduced gap between Earth and Mars, Moon orbiting smoothly */}
          <RealisticEarth position={[-1.75, -0.08, 0.10]} onSelect={() => onExplore('Moon')} />
          <SpaceStationISS3D earthCenter={[-1.75, -0.08, 0.10]} orbitRadius={1.54} />
          <OrbitingMoon earthCenter={[-1.75, -0.08, 0.10]} onSelect={() => onExplore('Moon')} />
          <RealisticMars onSelect={() => onExplore('Mars')} />

          {/* Smooth Ergonomic Camera Controls with 360° Cinematic Tour Show */}
          <OrbitControls
            enableZoom={true}
            minDistance={4.5}
            maxDistance={11.0}
            enablePan={false}
            autoRotate={isCinematicShow}
            autoRotateSpeed={0.65}
            dampingFactor={0.06}
            maxPolarAngle={Math.PI / 1.78}
            minPolarAngle={Math.PI / 2.45}
          />
        </Canvas>
      </div>

      {/* ═══ 2. OVERVIEW HEADS-UP DISPLAY (HUD) ═══ */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-10 pt-20 md:pt-24 pointer-events-none screen-enter">

        {/* Top Mission Telemetry Bar */}
        <div className="w-full flex items-center justify-between pointer-events-auto">
          {/* Status Capsule */}
          <div className="flex items-center gap-3">
            <div className="crystal-glass inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              <span className="text-[11px] text-cyan-300 font-mono tracking-widest font-semibold">
                DSN CARRIER LOCKED
              </span>
              <span className="text-white/15">|</span>
              <span className="text-slate-400 font-mono text-[11px]">
                SOLAR SYSTEM OBSERVATORY
              </span>
            </div>

            {/* 🎥 360° CINEMATIC SHOWCASE TOGGLE PILL */}
            <button
              onClick={() => {
                soundFx.playClick();
                setIsCinematicShow(!isCinematicShow);
              }}
              className={`crystal-glass hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-mono transition-all duration-300 cursor-pointer pointer-events-auto shadow-lg ${isCinematicShow
                  ? 'border-cyan-400/60 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
              title="Toggle 360° Cinematic Showcase Camera Orbit"
            >
              <span className={`w-2 h-2 rounded-full ${isCinematicShow ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="font-bold tracking-wider">
                {isCinematicShow ? '360° SHOW ACTIVE' : '360° SHOW PAUSED'}
              </span>
            </button>
          </div>

          {/* Mission Status Telemetry */}
          <div className="crystal-glass hidden lg:flex items-center gap-4 text-[11px] font-mono text-slate-400 px-4 py-1.5 rounded-full shadow-lg">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">MOON:</span>
              <span className="text-cyan-300 font-semibold">384,400 km</span>
            </div>
            <span className="text-white/15">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">MARS:</span>
              <span className="text-rose-300 font-semibold">225M km</span>
            </div>
            <span className="text-white/15">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold">NASA OPEN DATA</span>
            </div>
          </div>
        </div>

        {/* Main Hero & Telemetry Dock (Bottom Zone) */}
        <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-6 pointer-events-auto pb-4">

          {/* ═══ HERO DOSSIER CARD (Left): CRYSTAL GLASS, ANIMATED & ADVANCED ═══ */}
          <div className="crystal-glass max-w-md w-full rounded-3xl p-5 sm:p-6 space-y-3.5 animate-card-reveal relative overflow-hidden group" role="region" aria-label="Mission Overview">

            {/* Single iridescent rim — this is the primary card so it earns the accent */}
            <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none" />

            {/* Ambient Glow Flare */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/18 transition-colors duration-500" />

            {/* Brand Header: Logo + ASTRAVEX SEE + NASA 2026 */}
            <div className="flex items-center justify-between gap-3 relative z-10 reveal-delay-1">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-white/[0.05] border border-cyan-400/50 backdrop-blur-md flex items-center justify-center p-1.5 shadow-[0_0_20px_rgba(56,189,248,0.3)] flex-shrink-0 group-hover:border-cyan-300 transition-colors">
                  <img
                    src="/astravex_logo.png"
                    alt="ASTRAVEX SEE"
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-orbitron font-extrabold tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent uppercase">
                      ASTRAVEX SEE
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/35 text-[10px] font-mono text-cyan-300 font-bold tracking-wider">
                      NASA 2026
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    3D Telemetry &amp; Planetary Exploration
                  </span>
                </div>
              </div>

              {/* Live Status Pip */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/15 text-[9px] font-mono text-emerald-300 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                <span className="font-bold tracking-wider">ONLINE</span>
              </div>
            </div>

            {/* Mission Tagline */}
            <p className="text-[13px] text-slate-300 leading-relaxed font-sans reveal-delay-2 relative z-10 content-selectable">
              Interactive 3D planetary surfaces &amp; NASA-verified mission telemetry.
            </p>

            {/* Mission Stats Strip */}
            <div className="flex flex-wrap items-center gap-2 reveal-delay-3 relative z-10 text-[11px] font-mono pt-0.5">
              <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-cyan-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-semibold">{LUNAR_LANDING_SITES.length} LUNAR SITES</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-rose-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                <span className="font-semibold">{MARS_LANDING_SITES.length} MARS EXPEDITIONS</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-emerald-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">VERIFIED NASA DATA</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1 reveal-delay-4 relative z-10">
              <button
                onClick={() => {
                  soundFx.playSuccess();
                  onExplore();
                }}
                className="premium-btn-primary group/btn flex-1 px-5 py-3 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-cyan-100 group-hover/btn:rotate-45 transition-transform duration-300" />
                <span>Explore Destinations</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-100 group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>

              {onWatchLandingVideo && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onWatchLandingVideo();
                  }}
                  className="premium-btn-secondary group/btn px-4 py-3 rounded-2xl font-sans text-sm flex items-center gap-2 cursor-pointer"
                  title="Watch Historical Landing Archives"
                >
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium text-slate-200">Landing Video</span>
                </button>
              )}
            </div>

          </div>

          {/* ═══ INTERACTIVE DESTINATION TARGET CARDS (Right) ═══ */}
          <div className="w-full lg:w-72 space-y-2 animate-card-reveal">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 block px-1">
              SELECT DESTINATION
            </span>

            {/* Target Card 1: The Moon */}
            <button
              onClick={() => {
                soundFx.playClick();
                onExplore('Moon');
              }}
              className="w-full crystal-glass p-3.5 rounded-2xl transition-all duration-250 cursor-pointer group hover:border-cyan-400/40 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-lg">
                    🌕
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-200 font-display">
                      The Moon
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      384,400 km · {LUNAR_LANDING_SITES.length} missions
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            {/* Target Card 2: Mars */}
            <button
              onClick={() => {
                soundFx.playClick();
                onExplore('Mars');
              }}
              className="w-full crystal-glass p-3.5 rounded-2xl transition-all duration-250 cursor-pointer group hover:border-rose-400/40 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-lg">
                    🔴
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-rose-200 font-display">
                      Mars
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      225M km · {MARS_LANDING_SITES.length} missions
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            {/* Controls Guidance Capsule */}
            <div className="p-2 rounded-lg bg-white/[0.025] border border-white/[0.06] text-center text-[11px] font-mono text-slate-500">
              Drag to orbit · Hover planets to inspect
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export { SpaceHomeScene as SpaceHomePage };
export default SpaceHomeScene;
