import React, { useRef, useState, useMemo } from 'react';
import { DestinationType } from '../types';
import {
  ArrowRight,
  Compass,
  MapPin,
  Crosshair,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  Rocket
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundFx } from '../utils/soundEffects';
import { GLBPlanet } from '../components/3d/GLBPlanet';

// Spherical coordinates (lat, lon in degrees) to 3D Cartesian coordinates
function latLonToVector3(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

export interface DestinationLandingSite {
  id: string;
  name: string;
  missionName: string;
  year: string;
  lat: number;
  lon: number;
  agency: string;
  details: string;
  tag: string;
  color: 'cyan' | 'amber' | 'emerald' | 'purple' | 'blue' | 'red';
  dest: DestinationType;
}

export const LUNAR_LANDING_SITES: DestinationLandingSite[] = [
  {
    id: 'artemis3',
    name: 'Shackleton Crater Polar Rim',
    missionName: 'Artemis III Starship HLS',
    year: '2026 — Artemis',
    lat: -89.9,
    lon: 0.0,
    agency: 'NASA / SpaceX',
    details: 'First crewed lunar south pole landing with Starship Human Landing System (HLS) and Artemis Base Camp Habitat.',
    tag: 'CREWED SOUTH POLE',
    color: 'cyan',
    dest: 'Moon',
  },
  {
    id: 'ladee',
    name: 'Equatorial Lunar Orbit',
    missionName: 'NASA LADEE Orbiter',
    year: '2013',
    lat: 10.8,
    lon: -91.6,
    agency: 'NASA Ames',
    details: 'Investigated tenuous lunar exospheric dust clouds and demonstrated 622 Mbps laser optical comms.',
    tag: 'LASER COMM & DUST',
    color: 'purple',
    dest: 'Moon',
  },
  {
    id: 'apollo11',
    name: 'Tranquility Base',
    missionName: 'Apollo 11 Eagle',
    year: '1969',
    lat: 0.67,
    lon: 23.47,
    agency: 'NASA',
    details: 'First human landing on the Moon. Returned 21.5 kg of basalt and installed laser reflector.',
    tag: 'FIRST HUMAN STEP',
    color: 'cyan',
    dest: 'Moon',
  },
  {
    id: 'apollo15',
    name: 'Hadley-Apennine Canyon',
    missionName: 'Apollo 15 Falcon & LRV',
    year: '1971',
    lat: 26.13,
    lon: 3.63,
    agency: 'NASA',
    details: 'First Moon Buggy traverse across 27.9 km. Discovered 4.1B year old Genesis Rock.',
    tag: 'FIRST WHEELED ROVER',
    color: 'amber',
    dest: 'Moon',
  },
  {
    id: 'chandrayaan3',
    name: 'Shiv Shakti Point',
    missionName: 'Chandrayaan-3 Vikram & Pragyan',
    year: '2023',
    lat: -69.37,
    lon: 32.35,
    agency: 'ISRO',
    details: 'First historic soft-landing near the lunar south pole. Discovered steep soil heat gradients.',
    tag: 'POLAR SOUTH POLE',
    color: 'emerald',
    dest: 'Moon',
  },
  {
    id: 'apollo17',
    name: 'Taurus-Littrow Valley',
    missionName: 'Apollo 17 Challenger & Station',
    year: '1972',
    lat: 20.19,
    lon: 30.77,
    agency: 'NASA',
    details: 'Final Apollo surface mission. Discovered volcanic orange soil beads at Shorty Crater.',
    tag: 'VOLCANIC PYROCLASTS',
    color: 'purple',
    dest: 'Moon',
  },
  {
    id: 'lro',
    name: 'Lunar Polar Orbit',
    missionName: 'Lunar Reconnaissance Orbiter (LRO)',
    year: '2009',
    lat: -89.9,
    lon: 0.0,
    agency: 'NASA Goddard',
    details: 'Flagship polar mapping satellite. Mapped 99.9% of lunar surface in sub-meter resolution.',
    tag: 'GLOBAL DIGITAL ATLAS',
    color: 'blue',
    dest: 'Moon',
  },
  {
    id: 'change4',
    name: 'Von Kármán Crater',
    missionName: "Chang'e 4 & Yutu-2",
    year: '2019',
    lat: -45.45,
    lon: 177.59,
    agency: 'CNSA',
    details: 'First landing in human history on the Far Side of the Moon, relaying data via Queqiao.',
    tag: 'LUNAR FAR SIDE',
    color: 'amber',
    dest: 'Moon',
  },
  {
    id: 'surveyor3',
    name: 'Ocean of Storms',
    missionName: 'Surveyor 3 & Apollo 12',
    year: '1967',
    lat: -3.01,
    lon: -23.42,
    agency: 'NASA JPL',
    details: 'Robotic trenching arm soft-landing site. Inspected by Apollo 12 astronauts in Nov 1969.',
    tag: 'ROBOT MEETS HUMAN',
    color: 'cyan',
    dest: 'Moon',
  },
];

export const MARS_LANDING_SITES: DestinationLandingSite[] = [
  {
    id: 'perseverance',
    name: 'Jezero Crater River Delta',
    missionName: 'Perseverance & Ingenuity',
    year: '2021 — Active',
    lat: 18.44,
    lon: 77.45,
    agency: 'NASA / JPL-Caltech',
    details: 'Exploring an ancient 3.8-billion-year-old river delta to seek fossil biosignatures and cache rock cores.',
    tag: 'SAMPLE RETURN DELTA',
    color: 'cyan',
    dest: 'Mars',
  },
  {
    id: 'curiosity',
    name: 'Gale Crater, Mount Sharp',
    missionName: 'Curiosity Rover (MSL)',
    year: '2012 — Active',
    lat: -4.59,
    lon: 137.44,
    agency: 'NASA / JPL-Caltech',
    details: 'Nuclear-powered rover climbing Mount Sharp; discovered ancient habitable lakebeds and organic molecules.',
    tag: 'HABITABLE LAKEBED',
    color: 'amber',
    dest: 'Mars',
  },
  {
    id: 'insight',
    name: 'Elysium Planitia Plain',
    missionName: 'InSight Mars Lander',
    year: '2018 — 2022',
    lat: 4.50,
    lon: 135.62,
    agency: 'NASA / CNES / DLR',
    details: 'Geophysical observatory with SEIS dome seismometer; detected over 1,300 marsquakes and mapped the core.',
    tag: 'CORE SEISMOLOGY',
    color: 'purple',
    dest: 'Mars',
  },
  {
    id: 'viking',
    name: 'Chryse Planitia (Golden Plain)',
    missionName: 'Viking 1 Lander',
    year: '1976 — 1982',
    lat: 22.48,
    lon: -47.97,
    agency: 'NASA Langley / JPL',
    details: 'First successful long-term Mars landing; sent first color panoramas and sampled soil for biology.',
    tag: 'HISTORIC FIRST TOUCHDOWN',
    color: 'emerald',
    dest: 'Mars',
  },
];

// 🌕 3D INTERACTIVE MOON WITH LANDING SITE PINS
function InteractiveMoonGlobe({
  activeSiteId,
  onSelectSite,
  targetRotationY,
}: {
  activeSiteId: string;
  onSelectSite: (site: DestinationLandingSite) => void;
  targetRotationY: number;
}) {
  const moonGroupRef = useRef<THREE.Group>(null);
  const MOON_RADIUS = 1.6;

  useFrame((_, delta) => {
    if (moonGroupRef.current) {
      moonGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        moonGroupRef.current.rotation.y,
        targetRotationY,
        delta * 2.2
      );
    }
  });

  return (
    <group ref={moonGroupRef} position={[0, 0, 0]}>
      <GLBPlanet
        modelPath="/models/moon.glb"
        targetRadius={MOON_RADIUS}
        fallbackColor="#64748b"
      />

      {LUNAR_LANDING_SITES.map((site) => {
        const [x, y, z] = latLonToVector3(site.lat, site.lon, MOON_RADIUS * 1.02);
        const isSelected = activeSiteId === site.id;

        const colorMap = {
          cyan: '#38bdf8',
          amber: '#f59e0b',
          emerald: '#34d399',
          purple: '#c084fc',
          blue: '#60a5fa',
          red: '#ef4444',
        };
        const pinColor = colorMap[site.color];

        return (
          <group key={site.id} position={[x, y, z]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                onSelectSite(site);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[isSelected ? 0.055 : 0.035, 16, 16]} />
              <meshBasicMaterial color={pinColor} />
            </mesh>
            <pointLight color={pinColor} intensity={isSelected ? 1.8 : 0.8} distance={1.2} />

            <Html distanceFactor={7} center zIndexRange={[100, 0]}>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onSelectSite(site);
                }}
                className={`cursor-pointer whitespace-nowrap transition-all duration-200 select-none ${
                  isSelected ? 'scale-110 z-50' : 'opacity-85 hover:opacity-100 hover:scale-105'
                }`}
                aria-label={`Select ${site.missionName} at ${site.name}`}
              >
                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold backdrop-blur-xl border transition-all ${
                    isSelected
                      ? 'crystal-glass text-white shadow-[0_0_15px_rgba(56,189,248,0.7)] border-cyan-400 scale-105'
                      : 'bg-white/[0.08] text-slate-300 border-white/20 hover:border-cyan-400/50 hover:bg-white/[0.14]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-400'}`} />
                    <span>{site.missionName.split(' ')[0]}</span>
                  </span>
                </div>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// 🔴 3D INTERACTIVE MARS GLOBE WITH LANDING SITE PINS
function InteractiveMarsGlobe({
  activeSiteId,
  onSelectSite,
  targetRotationY,
}: {
  activeSiteId: string;
  onSelectSite: (site: DestinationLandingSite) => void;
  targetRotationY: number;
}) {
  const marsGroupRef = useRef<THREE.Group>(null);
  const MARS_RADIUS = 1.6;

  useFrame((_, delta) => {
    if (marsGroupRef.current) {
      marsGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        marsGroupRef.current.rotation.y,
        targetRotationY,
        delta * 2.2
      );
    }
  });

  return (
    <group ref={marsGroupRef} position={[0, 0, 0]}>
      <GLBPlanet
        modelPath="/models/mars.glb"
        targetRadius={MARS_RADIUS}
        fallbackColor="#b91c1c"
      />

      {MARS_LANDING_SITES.map((site) => {
        const [x, y, z] = latLonToVector3(site.lat, site.lon, MARS_RADIUS * 1.02);
        const isSelected = activeSiteId === site.id;

        const colorMap = {
          cyan: '#38bdf8',
          amber: '#f59e0b',
          emerald: '#34d399',
          purple: '#c084fc',
          blue: '#60a5fa',
          red: '#ef4444',
        };
        const pinColor = colorMap[site.color];

        return (
          <group key={site.id} position={[x, y, z]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                onSelectSite(site);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[isSelected ? 0.055 : 0.038, 16, 16]} />
              <meshBasicMaterial color={pinColor} />
            </mesh>
            <pointLight color={pinColor} intensity={isSelected ? 1.8 : 0.8} distance={1.2} />

            <Html distanceFactor={7} center zIndexRange={[100, 0]}>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onSelectSite(site);
                }}
                className={`cursor-pointer whitespace-nowrap transition-all duration-200 select-none ${
                  isSelected ? 'scale-110 z-50' : 'opacity-85 hover:opacity-100 hover:scale-105'
                }`}
                aria-label={`Select ${site.missionName} at ${site.name}`}
              >
                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold backdrop-blur-xl border transition-all ${
                    isSelected
                      ? 'crystal-glass text-white shadow-[0_0_15px_rgba(244,63,94,0.7)] border-rose-400 scale-105'
                      : 'bg-white/[0.08] text-slate-300 border-white/20 hover:border-rose-400/50 hover:bg-white/[0.14]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-rose-400 animate-pulse' : 'bg-slate-400'}`} />
                    <span>{site.missionName.split(' ')[0]}</span>
                  </span>
                </div>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

interface DestinationSceneProps {
  onSelectDestination: (dest: DestinationType, missionId?: string, directTo3D?: boolean) => void;
  defaultDestination?: DestinationType;
}

export const DestinationScene: React.FC<DestinationSceneProps> = ({
  onSelectDestination,
  defaultDestination = 'Moon',
}) => {
  const [activeCatalog, setActiveCatalog] = useState<DestinationType>(defaultDestination);
  const [selectedMoonSite, setSelectedMoonSite] = useState<DestinationLandingSite>(LUNAR_LANDING_SITES[0]);
  const [selectedMarsSite, setSelectedMarsSite] = useState<DestinationLandingSite>(MARS_LANDING_SITES[0]);
  const [targetRotationY, setTargetRotationY] = useState<number>(0);

  const selectedSite = activeCatalog === 'Moon' ? selectedMoonSite : selectedMarsSite;
  const currentSites = activeCatalog === 'Moon' ? LUNAR_LANDING_SITES : MARS_LANDING_SITES;

  const handleSelectSite = (site: DestinationLandingSite) => {
    soundFx.playChirp();
    if (activeCatalog === 'Moon') {
      setSelectedMoonSite(site);
    } else {
      setSelectedMarsSite(site);
    }
    const rad = (-site.lon * Math.PI) / 180;
    setTargetRotationY(rad);
  };

  const handleSwitchCatalog = (target: DestinationType) => {
    soundFx.playClick();
    setActiveCatalog(target);
    const initialSite = target === 'Moon' ? selectedMoonSite : selectedMarsSite;
    const rad = (-initialSite.lon * Math.PI) / 180;
    setTargetRotationY(rad);
  };

  // Launch through authentic video sequence
  const handleLaunchWithVideo = () => {
    soundFx.playSuccess();
    onSelectDestination(activeCatalog, selectedSite.id, false);
  };

  // Direct fast entry to 3D surface
  const handleDirect3D = () => {
    soundFx.playChirp();
    onSelectDestination(activeCatalog, selectedSite.id, true);
  };

  return (
    <div className="relative w-full h-screen bg-[#04060b] pt-16 overflow-hidden select-none">

      {/* 3D WebGL Canvas */}
      <div className="absolute inset-0 z-0 bg-[#04060b]">
        <Canvas camera={{ position: [0, 0, 4.4], fov: 45 }} shadows>
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 4, 5]} intensity={2.4} color="#ffffff" />
          <pointLight position={[-6, -4, -4]} intensity={0.3} color="#38bdf8" />
          <Stars radius={100} depth={50} count={6500} factor={3} fade />

          {activeCatalog === 'Moon' ? (
            <InteractiveMoonGlobe
              activeSiteId={selectedMoonSite.id}
              onSelectSite={handleSelectSite}
              targetRotationY={targetRotationY}
            />
          ) : (
            <InteractiveMarsGlobe
              activeSiteId={selectedMarsSite.id}
              onSelectSite={handleSelectSite}
              targetRotationY={targetRotationY}
            />
          )}

          <OrbitControls
            enablePan={true}
            screenSpacePanning={true}
            minDistance={1.8}
            maxDistance={12}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.8}
          />
        </Canvas>
      </div>

      {/* ======================================================== */}
      {/* 1. TOP COMMAND BAR: UNIFIED BALANCED AEROSPACE HEADER    */}
      {/* ======================================================== */}
      <div className="absolute top-20 left-4 right-4 sm:left-6 sm:right-6 z-20 pointer-events-none flex flex-col md:flex-row items-center justify-between gap-3 screen-enter">
        {/* Left: Minimal Surface Atlas Header */}
        <div className="crystal-glass rounded-2xl px-4 py-2 flex items-center gap-2.5 shadow-lg backdrop-blur-xl border border-white/10 pointer-events-auto self-start md:self-auto">
          <span className={`w-2 h-2 rounded-full ${activeCatalog === 'Moon' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'} animate-pulse`} />
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white font-display tracking-wide leading-tight">
              {activeCatalog === 'Moon' ? 'LUNAR SURFACE ATLAS' : 'MARTIAN SURFACE ATLAS'}
            </h1>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Interactive 3D Planetary Touchdown Coordinates
            </p>
          </div>
        </div>

        {/* Center: High-End Destination Selector Pill */}
        <div className="crystal-glass rounded-full p-1.5 flex items-center gap-2 shadow-2xl backdrop-blur-2xl pointer-events-auto">
          <button
            onClick={() => handleSwitchCatalog('Moon')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs font-display font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeCatalog === 'Moon'
                ? 'premium-btn-primary shadow-glow-cyan font-bold text-white'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-200" />
            <span className="font-bold">THE MOON ({LUNAR_LANDING_SITES.length} SITES)</span>
          </button>

          <button
            onClick={() => handleSwitchCatalog('Mars')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs font-display font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeCatalog === 'Mars'
                ? 'premium-btn-mars font-bold text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-200" />
            <span className="font-bold">MARS ({MARS_LANDING_SITES.length} SITES)</span>
          </button>
        </div>

        {/* Right: Active Touchdown Site Telemetry */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl crystal-glass pointer-events-auto text-[11px] font-mono text-slate-300">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>TARGET: <strong className="text-white font-mono font-bold">{selectedSite.missionName.split(' ')[0]}</strong></span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BOTTOM LEFT: SITE DOSSIER BRIEFING CARD (CRYSTAL GLASS) */}
      {/* ======================================================== */}
      <div className="absolute bottom-8 left-4 sm:left-6 z-20 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-full pointer-events-auto animate-clip-reveal screen-enter">
        <div className="crystal-glass rounded-3xl p-5 sm:p-6 space-y-3.5 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] content-selectable">
          {/* Iridescent Rim Light Flow */}
          <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[2px] pointer-events-none" />

          {/* Ambient Glow Flare */}
          <div className={`absolute -top-10 -left-10 w-32 h-32 ${activeCatalog === 'Moon' ? 'bg-cyan-500/15' : 'bg-rose-500/15'} rounded-full blur-3xl pointer-events-none`} />

          <div className="flex items-center justify-between relative z-10">
            <span className={`text-[10px] font-mono px-3 py-1 rounded-full font-bold border ${
              activeCatalog === 'Moon'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30 shadow-glow-cyan'
                : 'bg-red-500/20 text-red-300 border-red-400/30 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
            }`}>
              {selectedSite.tag}
            </span>
            <span className="text-[11px] font-mono text-slate-400">{selectedSite.year}</span>
          </div>

          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white font-display">{selectedSite.missionName}</h2>
            <div className={`flex items-center gap-1.5 text-xs mt-1 font-display ${
              activeCatalog === 'Moon' ? 'text-cyan-300' : 'text-red-300'
            }`}>
              <MapPin className="w-3.5 h-3.5" />
              <span>{selectedSite.name}</span>
            </div>
          </div>

          <p className="text-xs text-slate-200/90 leading-relaxed font-normal relative z-10 line-clamp-3 content-selectable">
            {selectedSite.details}
          </p>

          {/* Coordinates & Agency Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/[0.08] font-mono relative z-10">
            <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
              <span className="text-slate-400 block text-[10px]">COORDINATES</span>
              <span className="text-white font-bold">
                {selectedSite.lat.toFixed(2)}°, {selectedSite.lon.toFixed(2)}°
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
              <span className="text-slate-400 block text-[10px]">SPACE AGENCY</span>
              <span className="text-emerald-400 font-bold">{selectedSite.agency}</span>
            </div>
          </div>

          {/* Action Buttons: Video Journey & Direct 3D */}
          <div className="space-y-2 pt-1 relative z-10">
            {/* Primary Action: Launch Journey with Video */}
            <button
              onClick={handleLaunchWithVideo}
              className={`w-full py-3.5 px-4 rounded-2xl text-white font-bold text-xs font-display flex items-center justify-center gap-2 cursor-pointer relative group/btn ${
                activeCatalog === 'Moon'
                  ? 'premium-btn-primary shadow-glow-cyan'
                  : 'premium-btn-mars shadow-[0_0_25px_rgba(244,63,94,0.5)]'
              }`}
            >
              <Rocket className="w-4 h-4 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
              <span className="tracking-wider">COMMENCE EXPEDITION & WATCH VIDEO</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
            </button>

            {/* Secondary Action: Direct 3D Surface */}
            <button
              onClick={handleDirect3D}
              className="w-full py-2.5 px-4 rounded-xl text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 hover:border-white/20 font-mono text-[11px] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>DIRECT 3D SURFACE ACCESS</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. RIGHT SIDE QUICK SITES LIST (CRYSTAL GLASS)            */}
      {/* ======================================================== */}
      <div className="hidden lg:flex flex-col gap-2 absolute top-36 right-6 z-20 max-w-xs w-full pointer-events-auto screen-enter">
        <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>{activeCatalog.toUpperCase()} TOUCHDOWN SITES</span>
          <span className="text-cyan-400">{currentSites.length} CATALOGED</span>
        </div>
        <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
          {currentSites.map((site) => (
            <button
              key={site.id}
              onClick={() => handleSelectSite(site)}
              className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between border cursor-pointer backdrop-blur-md ${
                selectedSite.id === site.id
                  ? activeCatalog === 'Moon'
                    ? 'crystal-glass border-cyan-400/60 shadow-glow-cyan text-white bg-blue-600/30'
                    : 'crystal-glass border-rose-400/60 shadow-[0_0_15px_rgba(244,63,94,0.35)] text-white bg-rose-600/30'
                  : 'crystal-glass border-white/10 hover:border-white/25 text-slate-300 hover:text-white'
              }`}
            >
              <div>
                <span className="text-xs font-bold block font-display">{site.missionName}</span>
                <span className="text-[10px] text-slate-400 font-mono">{site.name}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${
                selectedSite.id === site.id
                  ? activeCatalog === 'Moon' ? 'text-cyan-400' : 'text-rose-400'
                  : 'text-slate-500'
              }`} />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export { DestinationScene as DestinationPage };
export default DestinationScene;

