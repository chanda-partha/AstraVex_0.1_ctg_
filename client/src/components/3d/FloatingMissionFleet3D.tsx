import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { DestinationType } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { upgradeISSStationHierarchy } from '../../utils/spaceHardwarePBR';

export interface FleetMissionSite {
  id: string;
  name: string;
  missionName: string;
  shortLabel: string;
  tag: string;
  dest: DestinationType;
  liveStatus?: 'ACTIVE' | 'PRELAUNCH' | 'HISTORIC';
}

interface FloatingMissionFleet3DProps {
  catalog: DestinationType;
  sites: FleetMissionSite[];
  selectedSiteId: string;
  onSelectSite: (siteId: string) => void;
  onEnter3DWorld: (siteId: string) => void;
}

const SCRATCH_TARGET_POS = new THREE.Vector3();
const SCRATCH_TARGET_SCALE = new THREE.Vector3();

function SpacecraftLoadProxy({ color = '#818CF8' }: { color?: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1);
    if (ref.current) {
      ref.current.rotation.y += dt * 0.9;
      ref.current.rotation.x += dt * 0.45;
    }
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.38, 1]} />
      <meshStandardMaterial color={color} wireframe transparent opacity={0.55} />
    </mesh>
  );
}

/**
 * Centered & normalized GLB loader reusing Drei's shared GLTF materials
 */
function NormalizedFloatGLB({
  modelPath,
  targetSize = 1.9,
  baseRotation = [0, 0, 0],
}: {
  modelPath: string;
  targetSize?: number;
  baseRotation?: [number, number, number];
}) {
  const { scene } = useGLTF(modelPath, '/draco/');

  const { wrapper, clonedMats } = useMemo(() => {
    const c = scene.clone(true);
    const removable: THREE.Object3D[] = [];
    const matsToDispose: THREE.Material[] = [];
    const lowerPath = modelPath.toLowerCase();
    const needsDoubleSide =
      lowerPath.includes('jwst') ||
      lowerPath.includes('hubble') ||
      lowerPath.includes('voyager') ||
      lowerPath.includes('lro') ||
      lowerPath.includes('ingenuity');

    c.traverse((node) => {
      const name = (node.name || '').toLowerCase();
      const isMesh = (node as THREE.Mesh).isMesh;
      if (
        node.type.includes('Camera') ||
        node.type.includes('Light') ||
        (!isMesh && (name === 'camera' || name === 'sun' || name === 'sky' || name.startsWith('hemi'))) ||
        name.includes('plane003') ||
        name.includes('untitled.002') ||
        name.includes('untitled.004') ||
        name.includes('unseen') ||
        name.endsWith('_arrow') ||
        name.includes('arc_arrow')
      ) {
        removable.push(node);
      }
    });
    removable.forEach((n) => n.parent?.remove(n));

    if (lowerPath.includes('iss')) {
      upgradeISSStationHierarchy(c, matsToDispose);
    } else {
      c.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          const mesh = node as THREE.Mesh;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          if (mesh.geometry && !mesh.geometry.attributes?.normal) {
            mesh.geometry.computeVertexNormals();
          }
          if (mesh.material) {
            const rawMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            const cloned = rawMats.map((raw) => {
              if (!raw) return raw;
              const m = raw.clone() as THREE.MeshStandardMaterial;
              matsToDispose.push(m);
              if (m.map && m.map.colorSpace !== THREE.SRGBColorSpace) {
                m.map.colorSpace = THREE.SRGBColorSpace;
                m.map.needsUpdate = true;
              }
              if (m.emissiveMap && m.emissiveMap.colorSpace !== THREE.SRGBColorSpace) {
                m.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                m.emissiveMap.needsUpdate = true;
              }
              if (needsDoubleSide) {
                m.side = THREE.DoubleSide;
              }
              if ('metalness' in m && 'roughness' in m && m.metalness > 0.88 && m.roughness > 0.88) {
                const mName = (m.name || '').toLowerCase();
                const isFoil =
                  mName.includes('gold') ||
                  mName.includes('kapton') ||
                  mName.includes('shield') ||
                  mName.includes('foil') ||
                  lowerPath.includes('jwst');
                m.metalness = isFoil ? 0.82 : 0.45;
                m.roughness = isFoil ? 0.24 : 0.46;
                m.envMapIntensity = Math.max(m.envMapIntensity || 1.0, 1.55);
              }
              m.needsUpdate = true;
              return m;
            });
            mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
          }
        }
      });
    }

    const box = new THREE.Box3().setFromObject(c);
    const group = new THREE.Group();
    if (!box.isEmpty() && isFinite(box.min.x)) {
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      c.position.set(-center.x, -center.y, -center.z);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      group.scale.setScalar(targetSize / maxDim);
    }
    group.add(c);
    return { wrapper: group, clonedMats: matsToDispose };
  }, [scene, modelPath, targetSize]);

  useEffect(() => {
    return () => {
      clonedMats.forEach((m) => m.dispose());
    };
  }, [clonedMats]);

  return <primitive object={wrapper} rotation={baseRotation} />;
}

/**
 * Active Deep Space instrument telemetry waves & optical/plasma animations
 */
function DeepSpaceActivityEffect({
  missionId,
  accentHex,
  isSelected,
}: {
  missionId: string;
  accentHex: string;
  isSelected: boolean;
}) {
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const scanBeamRef = useRef<THREE.Mesh>(null);
  const hgaWaveRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (pulseRingRef.current) {
      const cycle = (t * 0.52) % 1;
      const scale = 0.72 + cycle * 0.86;
      pulseRingRef.current.scale.set(scale, scale, scale);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (isSelected ? 0.36 : 0.16) * (1 - cycle);
    }
    if (scanBeamRef.current) {
      scanBeamRef.current.rotation.y = Math.sin(t * 1.1) * 0.45;
      const mat = scanBeamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.13 + Math.sin(t * 2.5) * 0.05;
    }
    if (hgaWaveRef.current) {
      const waveCycle = (t * 0.85) % 1;
      const s = 0.35 + waveCycle * 0.95;
      hgaWaveRef.current.scale.set(s, s, s);
      const mat = hgaWaveRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 * (1 - waveCycle);
    }
  });

  return (
    <group>
      {/* Expanding radar/telemetry ring beneath spacecraft */}
      <mesh ref={pulseRingRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.78, 0]}>
        <ringGeometry args={[0.72, 0.76, 48]} />
        <meshBasicMaterial color={accentHex} transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>

      {/* Hubble UV/Optical observation sweep cone */}
      {missionId === 'hubble' && (
        <mesh ref={scanBeamRef} position={[0, -0.45, 0.38]} rotation={[0.7, 0, 0]}>
          <coneGeometry args={[0.38, 0.82, 22, 1, true]} />
          <meshBasicMaterial
            color="#60a5fa"
            transparent
            opacity={0.14}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Voyager 1 Deep Space Network X-Band telemetry wave */}
      {missionId === 'voyager' && (
        <mesh ref={hgaWaveRef} position={[0, 0.35, 0.52]} rotation={[0.2, 0, 0]}>
          <ringGeometry args={[0.32, 0.36, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function DeepSpaceCraftVisual({
  missionId,
  isSelected,
}: {
  missionId: string;
  isSelected: boolean;
}) {
  switch (missionId) {
    case 'jwst':
      return (
        <>
          <NormalizedFloatGLB modelPath="/models/jwst.glb" targetSize={1.98} baseRotation={[0.26, -0.45, 0.08]} />
          <pointLight position={[0.45, 0.55, 0.65]} color="#fbbf24" intensity={isSelected ? 1.5 : 0.7} distance={3.5} />
        </>
      );
    case 'hubble':
      return <NormalizedFloatGLB modelPath="/models/hubble.glb" targetSize={1.92} baseRotation={[0.22, 0.35, -0.18]} />;
    case 'iss':
      return <NormalizedFloatGLB modelPath="/models/iss.glb" targetSize={2.08} baseRotation={[0.24, -0.38, 0.08]} />;
    case 'voyager':
      return <NormalizedFloatGLB modelPath="/models/voyager.glb" targetSize={1.94} baseRotation={[0.18, 0.45, 0.14]} />;
    default:
      return <NormalizedFloatGLB modelPath="/models/jwst.glb" targetSize={1.9} />;
  }
}

/**
 * Unobstructed Deep Space formation slots for the 3 non-selected observatories
 */
function getDeepSpaceSiblingPosition(siblingIdx: number): [number, number, number] {
  const slots: [number, number, number][] = [
    [-2.05, 1.18, -1.45],
    [0.08, 1.48, -1.95],
    [1.82, -1.04, -1.25],
  ];
  return slots[siblingIdx % slots.length];
}

function FloatingSpacecraftNode({
  site,
  isSelected,
  siblingIdx,
  indexSeed,
  accentHex,
  onSelect,
  onEnter3DWorld,
}: {
  site: FleetMissionSite;
  isSelected: boolean;
  siblingIdx: number;
  indexSeed: number;
  accentHex: string;
  onSelect: () => void;
  onEnter3DWorld: () => void;
}) {
  const slotRef = useRef<THREE.Group>(null);
  const animRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const initialPos = useMemo<[number, number, number]>(
    () => (isSelected ? [0, -0.05, 1.25] : getDeepSpaceSiblingPosition(siblingIdx)),
    // Initial placement only so re-selection glides smoothly
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const targetCoords = useMemo<[number, number, number]>(
    () => (isSelected ? [0, -0.05, 1.25] : getDeepSpaceSiblingPosition(siblingIdx)),
    [isSelected, siblingIdx]
  );

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1);
    const t = state.clock.elapsedTime;
    const phase = indexSeed * 1.4;

    if (slotRef.current) {
      SCRATCH_TARGET_POS.set(targetCoords[0], targetCoords[1], targetCoords[2]);
      slotRef.current.position.lerp(SCRATCH_TARGET_POS, Math.min(1, dt * 4.2));

      const s = isSelected ? 0.98 : hovered ? 0.56 : 0.48;
      SCRATCH_TARGET_SCALE.set(s, s, s);
      slotRef.current.scale.lerp(SCRATCH_TARGET_SCALE, Math.min(1, dt * 5.0));
    }

    if (animRef.current) {
      // Zero-gravity orbital stationkeeping float + continuous attitude dynamics
      animRef.current.position.y =
        Math.sin(t * (isSelected ? 1.0 : 0.85) + phase) * (isSelected ? 0.065 : 0.085);

      if (site.id === 'voyager') {
        animRef.current.rotation.y += dt * (isSelected ? 0.34 : 0.48);
        animRef.current.rotation.z = Math.sin(t * 0.6 + phase) * 0.08;
      } else if (site.id === 'hubble') {
        animRef.current.rotation.y += dt * (isSelected ? 0.18 : 0.24);
        animRef.current.rotation.x = Math.sin(t * 0.72 + phase) * 0.12;
      } else if (site.id === 'iss') {
        animRef.current.rotation.y += dt * (isSelected ? 0.14 : 0.18);
        animRef.current.rotation.z = Math.sin(t * 0.45 + phase) * 0.06;
      } else {
        // JWST slow halo stationkeeping roll
        animRef.current.rotation.y += dt * (isSelected ? 0.16 : 0.15);
        animRef.current.rotation.z = Math.sin(t * 0.55 + phase) * 0.045;
      }
    }
  });

  return (
    <group ref={slotRef} position={initialPos}>
      <group ref={animRef}>
        <Suspense fallback={<SpacecraftLoadProxy color={accentHex} />}>
          <DeepSpaceCraftVisual missionId={site.id} isSelected={isSelected} />
        </Suspense>

        <DeepSpaceActivityEffect missionId={site.id} accentHex={accentHex} isSelected={isSelected} />
      </group>

      {(isSelected || hovered) && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.78, 0]}>
          <ringGeometry args={[0.88, 0.92, 48]} />
          <meshBasicMaterial
            color={accentHex}
            transparent
            opacity={isSelected ? 0.42 : 0.28}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Raycast hit volume */}
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
          if (isSelected) {
            soundFx.playSuccess();
            onEnter3DWorld();
          } else {
            soundFx.playClick();
            onSelect();
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          soundFx.playSuccess();
          onEnter3DWorld();
        }}
      >
        <sphereGeometry args={[1.05, 14, 14]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {(!isSelected || hovered) && (
        <Html position={[0, isSelected ? -1.06 : -0.95, 0]} center zIndexRange={[50, 0]}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isSelected) {
                soundFx.playSuccess();
                onEnter3DWorld();
              } else {
                soundFx.playClick();
                onSelect();
              }
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="cursor-pointer whitespace-nowrap select-none transition-transform duration-150 hover:scale-105"
          >
            <div
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium backdrop-blur-md border transition-colors ${
                hovered || isSelected
                  ? 'bg-slate-900/95 border-[var(--accent-border)] text-slate-50 shadow-lg'
                  : 'bg-slate-950/70 border-white/15 text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{site.shortLabel}</span>
                {hovered && (
                  <span className="text-[10px] font-mono text-[var(--accent-text)] ml-1">
                    {isSelected ? '· Enter 3D →' : '· Focus'}
                  </span>
                )}
              </span>
            </div>
          </button>
        </Html>
      )}
    </group>
  );
}

export const FloatingMissionFleet3D: React.FC<FloatingMissionFleet3DProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  onEnter3DWorld,
}) => {
  const accentHex = '#818CF8';
  const siblings = useMemo(
    () => sites.filter((s) => s.id !== selectedSiteId),
    [sites, selectedSiteId]
  );

  return (
    <group>
      {sites.map((site, idx) => {
        const isSelected = site.id === selectedSiteId;
        const siblingIdx = isSelected ? -1 : siblings.findIndex((s) => s.id === site.id);
        return (
          <FloatingSpacecraftNode
            key={site.id}
            site={site}
            isSelected={isSelected}
            siblingIdx={siblingIdx}
            indexSeed={idx}
            accentHex={accentHex}
            onSelect={() => onSelectSite(site.id)}
            onEnter3DWorld={() => onEnter3DWorld(site.id)}
          />
        );
      })}
    </group>
  );
};
