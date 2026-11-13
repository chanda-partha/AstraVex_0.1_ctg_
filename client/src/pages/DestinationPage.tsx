import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { DestinationType } from '../types';
import { ArrowRight, ChevronRight, MapPin } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { soundFx } from '../utils/soundEffects';
import { FloatingMissionFleet3D } from '../components/3d/FloatingMissionFleet3D';
import { CanvasErrorBoundary } from '../components/common/CanvasErrorBoundary';
import { CanvasLoadingOverlay } from '../components/common/CanvasLoadingOverlay';
import { useTourSpotlight } from '../guide/tourEngine';
import { Button, SegmentedControl, Stat } from '../components/ui';
import { AdaptivePerformance } from '../components/3d/AdaptivePerformance';

export interface DestinationLandingSite {
  id: string;
  name: string;
  missionName: string;
  shortLabel: string;
  year: string;
  lat: number;
  lon: number;
  agency: string;
  details: string;
  tag: string;
  dest: DestinationType;
  liveStatus?: 'ACTIVE' | 'PRELAUNCH' | 'HISTORIC';
}

export const LUNAR_LANDING_SITES: DestinationLandingSite[] = [
  {
    id: 'artemis3',
    name: 'Shackleton Crater Polar Rim',
    missionName: 'Artemis III Starship HLS',
    shortLabel: 'Artemis III',
    year: '2027 · Planned',
    lat: -89.9,
    lon: 0.0,
    agency: 'NASA / SpaceX',
    details: 'Planned crewed lunar south pole landing with the Starship Human Landing System and surface habitat.',
    tag: 'Crewed lander',
    dest: 'Moon',
    liveStatus: 'PRELAUNCH',
  },
  {
    id: 'apollo11',
    name: 'Tranquility Base',
    missionName: 'Apollo 11 Eagle',
    shortLabel: 'Apollo 11',
    year: '1969',
    lat: 0.67,
    lon: 23.47,
    agency: 'NASA',
    details: 'First human landing on the Moon. Returned 21.5 kg of lunar basalt and deployed a laser retroreflector.',
    tag: 'Crewed landing',
    dest: 'Moon',
    liveStatus: 'HISTORIC',
  },
  {
    id: 'apollo15',
    name: 'Hadley-Apennine Canyon',
    missionName: 'Apollo 15 Falcon & LRV',
    shortLabel: 'Apollo 15',
    year: '1971',
    lat: 26.13,
    lon: 3.63,
    agency: 'NASA',
    details: 'First Lunar Roving Vehicle traverse across 27.9 km. Recovered the 4.1-billion-year-old Genesis Rock.',
    tag: 'Crewed rover',
    dest: 'Moon',
    liveStatus: 'HISTORIC',
  },
  {
    id: 'chandrayaan3',
    name: 'Shiv Shakti Point',
    missionName: 'Chandrayaan-3 Vikram & Pragyan',
    shortLabel: 'Chandrayaan-3',
    year: '2023',
    lat: -69.37,
    lon: 32.35,
    agency: 'ISRO',
    details: 'First soft landing in the lunar south polar region. Measured steep subsurface regolith thermal gradients.',
    tag: 'Lander & rover',
    dest: 'Moon',
    liveStatus: 'HISTORIC',
  },
  {
    id: 'apollo17',
    name: 'Taurus-Littrow Valley',
    missionName: 'Apollo 17 Challenger & Station',
    shortLabel: 'Apollo 17',
    year: '1972',
    lat: 20.19,
    lon: 30.77,
    agency: 'NASA',
    details: 'Final Apollo surface expedition. Sampled volcanic orange glass soil beads at Shorty Crater.',
    tag: 'Crewed geology',
    dest: 'Moon',
    liveStatus: 'HISTORIC',
  },
  {
    id: 'lro',
    name: 'Lunar Polar Orbit',
    missionName: 'Lunar Reconnaissance Orbiter (LRO)',
    shortLabel: 'LRO Orbit',
    year: '2009 · Active',
    lat: -74.5,
    lon: -38.0,
    agency: 'NASA Goddard',
    details: 'Polar mapping orbiter imaging the lunar surface at sub-meter resolution to characterize landing sites.',
    tag: 'Polar orbiter',
    dest: 'Moon',
    liveStatus: 'ACTIVE',
  },
  {
    id: 'change4',
    name: 'Von Kármán Crater',
    missionName: "Chang'e 4 & Yutu-2",
    shortLabel: "Chang'e 4",
    year: '2019 · Active',
    lat: -45.45,
    lon: 177.59,
    agency: 'CNSA',
    details: 'First spacecraft to land on the lunar far side, relaying surface radar data via the Queqiao satellite.',
    tag: 'Far-side rover',
    dest: 'Moon',
    liveStatus: 'ACTIVE',
  },
  {
    id: 'ladee',
    name: 'Equatorial Lunar Orbit',
    missionName: 'NASA LADEE Orbiter',
    shortLabel: 'LADEE',
    year: '2013',
    lat: 10.8,
    lon: -91.6,
    agency: 'NASA Ames',
    details: 'Studied the lunar exosphere and suspended dust environment while demonstrating 622 Mbps laser communications.',
    tag: 'Exosphere orbiter',
    dest: 'Moon',
    liveStatus: 'HISTORIC',
  },
  {
    id: 'surveyor3',
    name: 'Ocean of Storms',
    missionName: 'Surveyor 3 & Apollo 12',
    shortLabel: 'Surveyor 3',
    year: '1967',
    lat: -3.01,
    lon: -23.42,
    agency: 'NASA JPL',
    details: 'Robotic lander equipped with a soil mechanics surface sampler, later inspected by the Apollo 12 crew.',
    tag: 'Robotic lander',
    dest: 'Moon',
    liveStatus: 'HISTORIC',
  },
];

export const MARS_LANDING_SITES: DestinationLandingSite[] = [
  {
    id: 'perseverance',
    name: 'Jezero Crater River Delta',
    missionName: 'Perseverance & Ingenuity',
    shortLabel: 'Perseverance',
    year: '2021 · Active',
    lat: 18.44,
    lon: 77.45,
    agency: 'NASA / JPL-Caltech',
    details: 'Exploring an ancient river delta in Jezero Crater to search for biosignatures and cache rock core samples.',
    tag: 'Surface rover',
    dest: 'Mars',
    liveStatus: 'ACTIVE',
  },
  {
    id: 'curiosity',
    name: 'Gale Crater, Mount Sharp',
    missionName: 'Curiosity Rover (MSL)',
    shortLabel: 'Curiosity',
    year: '2012 · Active',
    lat: -4.59,
    lon: 137.44,
    agency: 'NASA / JPL-Caltech',
    details: 'Ascending Mount Sharp inside Gale Crater, where it confirmed ancient freshwater lake environments.',
    tag: 'Surface rover',
    dest: 'Mars',
    liveStatus: 'ACTIVE',
  },
  {
    id: 'mro',
    name: 'Sun-Synchronous Polar Mars Orbit',
    missionName: 'Mars Reconnaissance Orbiter (MRO)',
    shortLabel: 'MRO Orbit',
    year: '2006 · Active',
    lat: 42.5,
    lon: 112.0,
    agency: 'NASA JPL / UArizona',
    details: 'Reconnaissance orbiter carrying the HiRISE telescope, SHARAD ice radar, and primary surface relay radios.',
    tag: 'Polar orbiter',
    dest: 'Mars',
    liveStatus: 'ACTIVE',
  },
  {
    id: 'insight',
    name: 'Elysium Planitia Plain',
    missionName: 'InSight Mars Lander',
    shortLabel: 'InSight',
    year: '2018 – 2022',
    lat: 4.50,
    lon: 135.62,
    agency: 'NASA / CNES / DLR',
    details: 'Geophysical lander whose SEIS seismometer recorded over 1,300 marsquakes and measured the Martian core.',
    tag: 'Geophysics lander',
    dest: 'Mars',
    liveStatus: 'HISTORIC',
  },
  {
    id: 'viking',
    name: 'Chryse Planitia',
    missionName: 'Viking 1 Lander',
    shortLabel: 'Viking 1',
    year: '1976 – 1982',
    lat: 22.48,
    lon: -47.97,
    agency: 'NASA Langley / JPL',
    details: 'First spacecraft to operate long-term on the Martian surface, returning panoramic imagery and soil analyses.',
    tag: 'Surface lander',
    dest: 'Mars',
    liveStatus: 'HISTORIC',
  },
];

export const DEEP_SPACE_SITES: DestinationLandingSite[] = [
  {
    id: 'jwst',
    name: 'Sun-Earth L2 Halo Orbit (1.5M km)',
    missionName: 'James Webb Space Telescope',
    shortLabel: 'JWST · L2',
    year: '2021 · Active',
    lat: 0.0,
    lon: 145.0,
    agency: 'NASA / ESA / CSA',
    details: 'Infrared observatory at the Sun-Earth L2 Lagrange point, imaging the earliest galaxies and exoplanet atmospheres.',
    tag: 'Infrared observatory',
    dest: 'DeepSpace',
    liveStatus: 'ACTIVE',
  },
  {
    id: 'hubble',
    name: 'Low Earth Orbit (535 km · 28.5°)',
    missionName: 'Hubble Space Telescope',
    shortLabel: 'Hubble · LEO',
    year: '1990 · Active',
    lat: 28.5,
    lon: -65.0,
    agency: 'NASA / ESA',
    details: 'UV-visible space observatory whose deep fields and Cepheid measurements pinned down cosmic expansion.',
    tag: 'Optical observatory',
    dest: 'DeepSpace',
    liveStatus: 'ACTIVE',
  },
  {
    id: 'iss',
    name: 'Low Earth Orbit (408 km · 51.6°)',
    missionName: 'International Space Station',
    shortLabel: 'ISS · 408 km',
    year: '1998 · Active',
    lat: 51.6,
    lon: -20.0,
    agency: 'NASA / Partners',
    details: 'Permanently crewed orbital research laboratory completing 15.5 orbits around Earth every 24 hours.',
    tag: 'Crewed station',
    dest: 'DeepSpace',
    liveStatus: 'ACTIVE',
  },
  {
    id: 'voyager',
    name: 'Interstellar Medium (165+ AU)',
    missionName: 'Voyager 1 Interstellar Probe',
    shortLabel: 'Voyager 1',
    year: '1977 · Active',
    lat: 35.0,
    lon: 55.0,
    agency: 'NASA / JPL-Caltech',
    details: 'Humanity’s farthest spacecraft beyond the heliopause, sampling interstellar plasma and carrying the Golden Record.',
    tag: 'Interstellar probe',
    dest: 'DeepSpace',
    liveStatus: 'ACTIVE',
  },
];

function getSitesForCatalog(catalog: DestinationType): DestinationLandingSite[] {
  if (catalog === 'Moon') return LUNAR_LANDING_SITES;
  if (catalog === 'DeepSpace') return DEEP_SPACE_SITES;
  return MARS_LANDING_SITES;
}

function latLonToVector3(lat: number, lon: number, radius: number): [number, number, number] {
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);
  const x = radius * Math.cos(latRad) * Math.sin(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.cos(lonRad);
  return [x, y, z];
}

function GlobeSiteMarker({
  site,
  isSelected,
  globeRadius,
  onSelect,
  onHoverChange,
}: {
  site: DestinationLandingSite;
  isSelected: boolean;
  globeRadius: number;
  onSelect: () => void;
  onHoverChange: (hovered: boolean) => void;
}) {
  const isOrbital = site.id === 'lro' || site.id === 'ladee' || site.id === 'mro';
  const markerRadius = isOrbital ? globeRadius + 0.34 : globeRadius + 0.025;
  const pos = useMemo(
    () => latLonToVector3(site.lat, site.lon, markerRadius),
    [site.lat, site.lon, markerRadius]
  );

  const markerGroupRef = useRef<THREE.Group>(null);
  const pinBtnRef = useRef<HTMLButtonElement>(null);
  const lastStateRef = useRef<{ opacity: string; pe: string }>({ opacity: '', pe: '' });
  const scratch = useMemo(
    () => ({
      worldPos: new THREE.Vector3(),
      globeCenter: new THREE.Vector3(),
      normalVec: new THREE.Vector3(),
      viewVec: new THREE.Vector3(),
    }),
    []
  );

  useFrame(({ camera }) => {
    const group = markerGroupRef.current;
    const btn = pinBtnRef.current;
    if (!group || !btn) return;

    group.getWorldPosition(scratch.worldPos);
    if (group.parent) {
      group.parent.getWorldPosition(scratch.globeCenter);
    } else {
      scratch.globeCenter.set(0, 0, 0);
    }

    scratch.normalVec.copy(scratch.worldPos).sub(scratch.globeCenter).normalize();
    scratch.viewVec.copy(camera.position).sub(scratch.worldPos).normalize();

    const facing = scratch.normalVec.dot(scratch.viewVec);
    // Smooth rear-hemisphere attenuation so occluded back-face pins do not clutter front labels
    const minBackOpacity = isSelected ? 0.32 : 0.12;
    const rawOpacity =
      facing >= 0.12
        ? 1
        : facing <= -0.12
          ? minBackOpacity
          : minBackOpacity + ((facing + 0.12) / 0.24) * (1 - minBackOpacity);
    const nextOpacity = rawOpacity.toFixed(2);
    const nextPe = facing > -0.04 ? 'auto' : 'none';

    if (lastStateRef.current.opacity !== nextOpacity) {
      btn.style.opacity = nextOpacity;
      lastStateRef.current.opacity = nextOpacity;
    }
    if (lastStateRef.current.pe !== nextPe) {
      btn.style.pointerEvents = nextPe;
      lastStateRef.current.pe = nextPe;
    }
  });

  return (
    <group ref={markerGroupRef} position={pos}>
      <mesh>
        <sphereGeometry args={[isSelected ? 0.048 : 0.032, 12, 12]} />
        <meshBasicMaterial color={isSelected ? '#38bdf8' : site.dest === 'Mars' ? '#D9774B' : '#9DB4D3'} />
      </mesh>
      <Html position={[0, 0.1, 0]} center zIndexRange={[30, 0]}>
        <button
          ref={pinBtnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onMouseEnter={() => onHoverChange(true)}
          onMouseLeave={() => onHoverChange(false)}
          className="cursor-pointer whitespace-nowrap select-none transition-transform duration-150 hover:scale-105"
        >
          <div
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium backdrop-blur-md border transition-all flex items-center gap-1.5 ${
              isSelected
                ? 'bg-slate-900/95 border-[var(--accent-border)] text-slate-50 shadow-lg scale-105'
                : 'bg-slate-950/75 border-white/15 text-slate-300 hover:text-white hover:border-white/35'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSelected
                  ? 'bg-sky-400 animate-pulse'
                  : site.liveStatus === 'ACTIVE'
                    ? 'bg-emerald-400'
                    : 'bg-slate-400'
              }`}
            />
            <span>{site.shortLabel}</span>
          </div>
        </button>
      </Html>
    </group>
  );
}

function ExactRadiusPlanetInner({
  modelPath,
  targetRadius,
}: {
  modelPath: string;
  targetRadius: number;
}) {
  const { scene } = useGLTF(modelPath, '/draco/');

  const { wrapper, clonedMaterials } = useMemo(() => {
    const c = scene.clone(true);
    const matsToDispose: THREE.Material[] = [];
    const removable: THREE.Object3D[] = [];
    c.traverse((node) => {
      if (node.type.includes('Camera') || node.type.includes('Light') || node.name === 'Camera') {
        removable.push(node);
      }
    });
    removable.forEach((n) => n.parent?.remove(n));

    c.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Measure exact outer spherical radius directly from mesh vertices so rotated spheres never under-scale
    let maxDistSq = 0;
    const v = new THREE.Vector3();
    c.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        if (mesh.material) {
          const cloneMat = (m: THREE.Material) => {
            const cloned = m.clone();
            cloned.side = THREE.FrontSide;
            cloned.depthWrite = true;
            if (cloned instanceof THREE.MeshStandardMaterial && cloned.map) {
              cloned.map.colorSpace = THREE.SRGBColorSpace;
              cloned.map.anisotropy = 8;
              cloned.map.needsUpdate = true;
            }
            matsToDispose.push(cloned);
            return cloned;
          };
          mesh.material = Array.isArray(mesh.material)
            ? mesh.material.map(cloneMat)
            : cloneMat(mesh.material);
        }
        const posAttr = mesh.geometry?.attributes?.position;
        if (posAttr) {
          const step = Math.max(1, Math.floor(posAttr.count / 1200));
          for (let i = 0; i < posAttr.count; i += step) {
            v.fromBufferAttribute(posAttr, i).applyMatrix4(mesh.matrixWorld).sub(center);
            const dSq = v.lengthSq();
            if (dSq > maxDistSq) maxDistSq = dSq;
          }
        }
      }
    });

    const trueRadius = Math.sqrt(maxDistSq) || 1;
    const root = new THREE.Group();
    c.position.set(-center.x, -center.y, -center.z);
    root.scale.setScalar(targetRadius / trueRadius);
    root.add(c);
    return { wrapper: root, clonedMaterials: matsToDispose };
  }, [scene, targetRadius]);

  useEffect(() => {
    return () => {
      clonedMaterials.forEach((m) => m.dispose());
    };
  }, [clonedMaterials]);

  return <primitive object={wrapper} />;
}

/**
 * Interactive 3D Planetary Globe for Moon and Mars landing-zone selection
 */
function InteractivePlanetGlobe({
  catalog,
  sites,
  selectedSiteId,
  onSelectSite,
}: {
  catalog: 'Moon' | 'Mars';
  sites: DestinationLandingSite[];
  selectedSiteId: string;
  onSelectSite: (siteId: string) => void;
}) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const [anyPinHovered, setAnyPinHovered] = useState(false);

  const globeRadius = 1.84;
  const modelPath = catalog === 'Moon' ? '/models/moon.glb' : '/models/mars.glb';
  const fallbackColor = catalog === 'Moon' ? '#94a3b8' : '#b45309';

  // Orient starting longitude cleanly toward front-left hemisphere clear of right HUD panel
  useEffect(() => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y = catalog === 'Mars' ? -1.85 : -0.35;
    }
  }, [catalog]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1);
    if (globeGroupRef.current && !anyPinHovered) {
      globeGroupRef.current.rotation.y += dt * 0.055;
    }
  });

  return (
    <group ref={globeGroupRef}>
      <Suspense
        fallback={
          <mesh>
            <sphereGeometry args={[globeRadius, 48, 48]} />
            <meshStandardMaterial color={fallbackColor} roughness={0.75} />
          </mesh>
        }
      >
        <ExactRadiusPlanetInner modelPath={modelPath} targetRadius={globeRadius} />
      </Suspense>

      {/* Polar & Equatorial Orbiter Reference Rings */}
      <mesh rotation={[Math.PI * 0.44, 0.28, 0.4]}>
        <torusGeometry args={[globeRadius + 0.34, 0.0045, 8, 96]} />
        <meshBasicMaterial
          color={catalog === 'Moon' ? '#9DB4D3' : '#D9774B'}
          transparent
          opacity={0.28}
        />
      </mesh>
      {catalog === 'Moon' && (
        <mesh rotation={[Math.PI * 0.52, -0.18, 0]}>
          <torusGeometry args={[globeRadius + 0.48, 0.0035, 8, 96]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.22} />
        </mesh>
      )}

      {sites.map((site) => (
        <GlobeSiteMarker
          key={site.id}
          site={site}
          isSelected={site.id === selectedSiteId}
          globeRadius={globeRadius}
          onSelect={() => onSelectSite(site.id)}
          onHoverChange={setAnyPinHovered}
        />
      ))}
    </group>
  );
}

interface DestinationSceneProps {
  onSelectDestination: (dest: DestinationType, missionId?: string, directTo3D?: boolean) => void;
  defaultDestination?: DestinationType;
  onCatalogChange?: (dest: DestinationType) => void;
}

export const DestinationScene: React.FC<DestinationSceneProps> = ({
  onSelectDestination,
  defaultDestination = 'Moon',
  onCatalogChange,
}) => {
  const [activeCatalog, setActiveCatalog] = useState<DestinationType>(defaultDestination);
  const [selectedMoonSite, setSelectedMoonSite] = useState<DestinationLandingSite>(LUNAR_LANDING_SITES[0]);
  const [selectedMarsSite, setSelectedMarsSite] = useState<DestinationLandingSite>(MARS_LANDING_SITES[0]);
  const [selectedDeepSpaceSite, setSelectedDeepSpaceSite] = useState<DestinationLandingSite>(DEEP_SPACE_SITES[0]);

  const dossierSpotlight = useTourSpotlight('site-dossier');
  const listSpotlight = useTourSpotlight('site-list');
  const commenceSpotlight = useTourSpotlight('commence-btn');
  const direct3DSpotlight = useTourSpotlight('direct-3d-btn');

  useEffect(() => {
    setActiveCatalog(defaultDestination);
  }, [defaultDestination]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  const selectedSite =
    activeCatalog === 'Moon'
      ? selectedMoonSite
      : activeCatalog === 'DeepSpace'
        ? selectedDeepSpaceSite
        : selectedMarsSite;
  const currentSites = getSitesForCatalog(activeCatalog);

  const handleSelectSite = (site: DestinationLandingSite) => {
    soundFx.playClick();
    if (activeCatalog === 'Moon') {
      setSelectedMoonSite(site);
    } else if (activeCatalog === 'DeepSpace') {
      setSelectedDeepSpaceSite(site);
    } else {
      setSelectedMarsSite(site);
    }
  };

  const handleSwitchCatalog = (target: DestinationType) => {
    setActiveCatalog(target);
    onCatalogChange?.(target);
  };

  const handleBeginMission = (missionIdOverride?: string) => {
    soundFx.playSuccess();
    onSelectDestination(activeCatalog, missionIdOverride || selectedSite.id, false);
  };

  const handleEnter3DWorld = (missionIdOverride?: string) => {
    soundFx.playSuccess();
    onSelectDestination(activeCatalog, missionIdOverride || selectedSite.id, true);
  };

  return (
    <div className="relative w-full h-screen bg-[#07090F] pt-14 overflow-hidden select-none">
      {/* 1. 3D Planetary Globe (Moon & Mars) / Floating 3D Spacecraft Fleet (DeepSpace Only) */}
      <div className="absolute inset-0 z-0 bg-[#07090F]">
        <CanvasErrorBoundary>
          <Canvas
            camera={{ position: [0, 0.35, 5.85], fov: 44 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
          >
            <AdaptivePerformance maxDpr={1.5} />
            <ambientLight intensity={0.48} color="#cbd5e1" />
            <hemisphereLight args={['#f1f5f9', '#090d16', 0.85]} />
            <directionalLight position={[6, 5, 6]} intensity={2.85} color="#fffbf2" />
            <directionalLight position={[-6, 3, -5]} intensity={1.35} color="#7dd3fc" />
            <directionalLight position={[0, -5, -4]} intensity={0.6} color="#818cf8" />
            <pointLight position={[0, -3, 3]} intensity={0.65} color="#38bdf8" />

            <Stars radius={110} depth={55} count={4500} factor={3.2} fade speed={0.45} />

            <Suspense fallback={null}>
              {activeCatalog === 'DeepSpace' ? (
                <FloatingMissionFleet3D
                  catalog="DeepSpace"
                  sites={DEEP_SPACE_SITES}
                  selectedSiteId={selectedSite.id}
                  onSelectSite={(id) => {
                    const found = DEEP_SPACE_SITES.find((s) => s.id === id);
                    if (found) handleSelectSite(found);
                  }}
                  onEnter3DWorld={(id) => handleEnter3DWorld(id)}
                />
              ) : (
                <InteractivePlanetGlobe
                  catalog={activeCatalog}
                  sites={currentSites}
                  selectedSiteId={selectedSite.id}
                  onSelectSite={(id) => {
                    const found = currentSites.find((s) => s.id === id);
                    if (found) handleSelectSite(found);
                  }}
                />
              )}
            </Suspense>

            <OrbitControls
              enablePan={activeCatalog === 'DeepSpace'}
              screenSpacePanning={true}
              minDistance={2.8}
              maxDistance={11.5}
              enableDamping
              dampingFactor={0.07}
              rotateSpeed={0.75}
            />
          </Canvas>
        </CanvasErrorBoundary>

        <CanvasLoadingOverlay
          accent={activeCatalog === 'Mars' ? 'amber' : 'cyan'}
          title={
            activeCatalog === 'DeepSpace'
              ? 'Loading deep-space mission fleet'
              : `Loading ${activeCatalog} orbital globe`
          }
          compact
        />
      </div>

      {/* 2. Mission Selector & Active Craft Dossier */}
      <div className="relative z-10 w-full h-full p-4 sm:p-6 flex flex-col lg:flex-row items-stretch lg:items-start justify-end lg:justify-between gap-4 pointer-events-none screen-enter">
        <div className="hidden xl:inline-flex items-center gap-2 hud-orbit-hint fixed bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] opacity-80" aria-hidden="true" />
          <span>Drag globe to inspect · Click pin or mission</span>
        </div>
        {/* Selected Mission Details Card (Bottom-Left on Desktop, Bottom on Mobile) */}
        <div className="lg:self-end max-w-[408px] w-full pointer-events-auto">
          <div
            className={`hud-card hud-card-featured rounded-2xl p-4 sm:p-5 space-y-3.5 content-selectable ${dossierSpotlight.className}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-400">
                ASTRAVEX // {selectedSite.tag.toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full hud-well px-2.5 py-0.5 font-mono text-[10px] text-slate-300">
                {selectedSite.liveStatus === 'ACTIVE' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 live-beacon" aria-hidden="true" />
                )}
                <span>{selectedSite.year}</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <div
                className="font-mono text-[10px] tracking-[0.2em] uppercase"
                style={{ color: 'var(--accent-text)' }}
              >
                {activeCatalog === 'DeepSpace'
                  ? 'OBSERVATORY // TELEMETRY'
                  : `${activeCatalog.toUpperCase()} // TARGET SITE`}
              </div>
              <h1 className="font-orbitron text-lg sm:text-xl font-bold tracking-[0.04em] uppercase text-white leading-snug">
                {selectedSite.missionName}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent-text)] flex-shrink-0" />
                <span className="truncate">{selectedSite.name}</span>
              </div>
              <div className="pt-1">
                <div className="hud-deck-rule" aria-hidden="true" />
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-300/90 leading-relaxed font-sans">
              {selectedSite.details}
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <Stat
                label="Coordinates"
                value={`${selectedSite.lat.toFixed(1)}°, ${selectedSite.lon.toFixed(1)}°`}
                mono={true}
              />
              <Stat label="Agency" value={selectedSite.agency} mono={false} />
            </div>

            <div className="pt-1 flex flex-wrap sm:flex-nowrap items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleBeginMission()}
                className={`flex-1 whitespace-nowrap group justify-between ${commenceSpotlight.className}`}
              >
                <span className="font-orbitron text-[11px] tracking-[0.06em] uppercase">
                  Commence Expedition
                </span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleEnter3DWorld()}
                className={`flex-shrink-0 whitespace-nowrap group ${direct3DSpotlight.className}`}
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] transition-transform duration-150 group-hover:translate-x-0.5">
                  {activeCatalog === 'DeepSpace' ? 'Direct 3D Space' : 'Direct 3D Surface'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mission Catalog Panel (Right Column on Desktop, Compact List on Mobile) */}
        <div
          className={`w-full lg:w-[356px] hud-card hud-card-featured rounded-2xl p-4 space-y-3 pointer-events-auto ${listSpotlight.className}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-400">
              ASTRAVEX // MANIFEST
            </span>
            <span className="font-mono text-[10px] text-slate-400 tabular-nums">
              {currentSites.length} OPS
            </span>
          </div>

          <SegmentedControl
            ariaLabel="Destination catalog"
            value={activeCatalog}
            onChange={handleSwitchCatalog}
            className="w-full"
            options={[
              { value: 'Moon', label: `Moon (${LUNAR_LANDING_SITES.length})` },
              { value: 'Mars', label: `Mars (${MARS_LANDING_SITES.length})` },
              { value: 'DeepSpace', label: `Deep (${DEEP_SPACE_SITES.length})` },
            ]}
          />

          <div className="hud-deck-rule" aria-hidden="true" />

          <div className="space-y-1.5 max-h-[28vh] lg:max-h-[54vh] overflow-y-auto pr-0.5">
            {currentSites.map((site, idx) => {
              const isSelected = selectedSite.id === site.id;
              const numLabel = String(idx + 1).padStart(2, '0');
              return (
                <button
                  type="button"
                  key={site.id}
                  onClick={() => handleSelectSite(site)}
                  className={`group w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-2.5 cursor-pointer hud-row-card ${
                    isSelected
                      ? '!bg-[var(--accent-surface)] !border-[var(--accent-border)] text-white shadow-[0_8px_22px_-8px_var(--accent-border)]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span
                      className={`font-mono text-[10px] tabular-nums w-5 flex-shrink-0 ${
                        isSelected ? 'text-[var(--accent-text)] font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {numLabel}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-orbitron text-[11px] font-bold tracking-[0.04em] uppercase truncate">
                          {site.missionName}
                        </span>
                        {site.liveStatus === 'ACTIVE' && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 live-beacon"
                            title="Active mission"
                          />
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 group-hover:text-slate-300 truncate block mt-0.5 transition-colors">
                        {site.name} · {site.year}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                      isSelected
                        ? 'border-[var(--accent-border)] bg-[var(--accent-surface)] text-white'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 group-hover:text-white group-hover:border-white/25'
                    }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export { DestinationScene as DestinationPage };
export default DestinationScene;
