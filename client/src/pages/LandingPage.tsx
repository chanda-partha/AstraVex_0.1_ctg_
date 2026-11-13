import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { DestinationType } from '../types';
import {
  ArrowRight,
  Box,
  Pause,
  Play,
  Tv,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, useGLTF, Line, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { soundFx } from '../utils/soundEffects';
import { audioManager } from '../audio/AudioManager';
import { CanvasErrorBoundary } from '../components/common/CanvasErrorBoundary';
import { CanvasLoadingOverlay, VideoLoadingOverlay } from '../components/common/CanvasLoadingOverlay';
import { useTourSpotlight } from '../guide/tourEngine';
import { getLunarPBRTextures } from '../components/3d/LunarRealEnvironment';
import { Rover3DModel } from '../components/3d/Rover3DModel';
import { OrbitalPlanetBackdrop } from '../components/3d/OrbitalPlanetBackdrop';
import { StarshipHLS3D } from '../components/3d/StarshipHLS3D';
import {
  DetailedYutu2Rover,
  DetailedSurveyor3Lander,
  DetailedPragyanRover,
} from '../components/3d/DetailedSpacecraftModels';
import { Button, IconButton, SegmentedControl } from '../components/ui';
import { getMissionFlightProfile } from '../utils/missionCatalog';
import { fetchMissionVideos, NasaArchiveVideo } from '../services/api';
import { AdaptivePerformance } from '../components/3d/AdaptivePerformance';

function normalizeLandingGLB(scene: THREE.Group, targetSize = 2.4) {
  const c = scene.clone(true);
  const removable: THREE.Object3D[] = [];
  c.traverse((node) => {
    const nName = (node.name || '').toLowerCase();
    const isArrow = nName.endsWith('_arrow') || nName.includes('arc_arrow') || nName.includes('plane003') || nName.includes('unseen');
    if ((node as THREE.Camera).isCamera || (node as THREE.Light).isLight || isArrow) {
      removable.push(node);
      return;
    }
    if ((node as THREE.Mesh).isMesh) {
      const mesh = node as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (mesh.geometry && !mesh.geometry.attributes?.normal) {
        mesh.geometry.computeVertexNormals();
      }
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const nextMats = mats.map((raw) => {
        if (!raw) return raw;
        const std = raw.clone() as THREE.MeshStandardMaterial;
        if (std.map && std.map.colorSpace !== THREE.SRGBColorSpace) {
          std.map.colorSpace = THREE.SRGBColorSpace;
          std.map.needsUpdate = true;
        }
        if ('metalness' in std && 'roughness' in std && std.metalness > 0.88 && std.roughness > 0.88) {
          std.metalness = 0.42;
          std.roughness = 0.46;
        }
        std.needsUpdate = true;
        return std;
      });
      mesh.material = Array.isArray(mesh.material) ? nextMats : nextMats[0];
    }
  });
  removable.forEach((n) => n.parent?.remove(n));
  const box = new THREE.Box3().setFromObject(c);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);
  c.position.x = -center.x;
  c.position.z = -center.z;
  c.position.y = -box.min.y;

  const wrapper = new THREE.Group();
  wrapper.add(c);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  wrapper.scale.setScalar(targetSize / maxDim);
  return wrapper;
}

interface ThrusterPlumeProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  radius?: number;
  colorType?: 'hydrazine' | 'hypergolic';
  intensity?: number;
}

function SupersonicThrusterPlume({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  length = 1.2,
  radius = 0.12,
  colorType = 'hydrazine',
  intensity = 1.0,
}: ThrusterPlumeProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const isHydrazine = colorType === 'hydrazine';
  const sheathColor = isHydrazine ? '#38bdf8' : '#f59e0b';
  const outerColor = isHydrazine ? '#0284c7' : '#ea580c';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const wave = Math.sin(t * 42) * 0.05 + Math.cos(t * 27) * 0.03;
    if (coreRef.current) {
      coreRef.current.scale.y = 1.0 + wave;
      coreRef.current.scale.x = 1.0 + wave * 0.65;
      coreRef.current.scale.z = coreRef.current.scale.x;
    }
    if (lightRef.current) {
      lightRef.current.intensity = (isHydrazine ? 2.5 : 3.0) * intensity * (1.0 + wave * 0.5);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <group position={[0, -length / 2, 0]}>
        <mesh ref={coreRef} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[radius * 0.65, length, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.96} />
        </mesh>
        <mesh scale={[1.35, 1.2, 1.35]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[radius, length * 1.15, 16]} />
          <meshBasicMaterial color={sheathColor} transparent opacity={0.7} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh scale={[1.8, 1.35, 1.8]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[radius * 1.5, length * 1.35, 16]} />
          <meshBasicMaterial color={outerColor} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </mesh>
        {[0.2, 0.45, 0.72].map((fraction, idx) => (
          <mesh key={`shock-${idx}`} position={[0, -fraction * length + length / 2, 0]}>
            <octahedronGeometry args={[radius * 0.45 * (1 - idx * 0.2), 0]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
      <pointLight ref={lightRef} position={[0, -0.2, 0]} color={sheathColor} intensity={2.5 * intensity} distance={6} />
    </group>
  );
}

function GroundDustCloud({ isMars = true }: { isMars?: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 45;

  const [geo, velocities] = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const vels: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.2;
      const dist = 0.3 + Math.random() * 0.6;
      positions[i * 3] = Math.cos(angle) * dist;
      positions[i * 3 + 1] = 0.05 + Math.random() * 0.15;
      positions[i * 3 + 2] = Math.sin(angle) * dist;

      const speed = 1.2 + Math.random() * 1.8;
      vels.push({
        x: Math.cos(angle) * speed,
        y: 0.1 + Math.random() * 0.3,
        z: Math.sin(angle) * speed,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return [geometry, vels];
  }, []);

  useEffect(() => {
    return () => {
      geo.dispose();
    };
  }, [geo]);

  useFrame((_, rawDelta) => {
    if (!particlesRef.current) return;
    const delta = Math.min(rawDelta, 0.1);
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += velocities[i].x * delta;
      pos[i * 3 + 1] += velocities[i].y * delta;
      pos[i * 3 + 2] += velocities[i].z * delta;

      const curDist = Math.hypot(pos[i * 3], pos[i * 3 + 2]);
      if (curDist > 3.8 || pos[i * 3 + 1] > 1.2) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 0.2 + Math.random() * 0.3;
        pos[i * 3] = Math.cos(angle) * dist;
        pos[i * 3 + 1] = 0.05 + Math.random() * 0.1;
        pos[i * 3 + 2] = Math.sin(angle) * dist;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group position={[0, -0.05, 0]}>
      <points ref={particlesRef} geometry={geo}>
        <pointsMaterial size={0.16} color={isMars ? '#d97706' : '#94a3b8'} transparent opacity={0.65} depthWrite={false} />
      </points>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.5, 3.2, 32]} />
        <meshBasicMaterial color={isMars ? '#b45309' : '#64748b'} transparent opacity={0.25} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function NormalizedCraftGLB({
  modelPath,
  targetSize = 2.4,
  position = [0, 0, 0],
}: {
  modelPath: string;
  targetSize?: number;
  position?: [number, number, number];
}) {
  const { scene } = useGLTF(modelPath, '/draco/');
  const cloned = useMemo(() => normalizeLandingGLB(scene, targetSize), [scene, targetSize]);
  return (
    <group position={position}>
      <primitive object={cloned} />
    </group>
  );
}

function SkyCraneDescentPlatform({ firing = true, throttle = 1.0 }: { firing?: boolean; throttle?: number }) {
  const engineNodes: { pos: [number, number, number]; rot: [number, number, number]; boomRot: number }[] = [
    { pos: [0.85, 0.05, 0.85], rot: [-0.65, 0, 0.65], boomRot: Math.PI / 4 },
    { pos: [-0.85, 0.05, 0.85], rot: [-0.65, 0, -0.65], boomRot: -Math.PI / 4 },
    { pos: [0.85, 0.05, -0.85], rot: [0.65, 0, 0.65], boomRot: (3 * Math.PI) / 4 },
    { pos: [-0.85, 0.05, -0.85], rot: [0.65, 0, -0.65], boomRot: -(3 * Math.PI) / 4 },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* Primary Cross-Structured Titanium Descent Frame */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.05, 1.2, 0.24, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.86} roughness={0.28} />
      </mesh>
      {/* Top Gold Kapton Avionics & Propellant Core Ring */}
      <mesh castShadow position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.72, 0.82, 0.14, 16]} />
        <meshStandardMaterial color="#d97706" metalness={0.78} roughness={0.28} />
      </mesh>
      {/* 4 Spherical Hydrazine Monopropellant Tanks & Feed Collars */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, idx) => (
        <mesh
          key={`skycrane-tank-${idx}`}
          position={[Math.cos(ang) * 0.56, 0.42, Math.sin(ang) * 0.56]}
          castShadow
        >
          <sphereGeometry args={[0.17, 16, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.88} roughness={0.22} />
        </mesh>
      ))}
      {/* Ventral Terminal Descent Doppler Radar Phased Array & Winch Hub */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[0.42, 0.06, 0.42]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.76} roughness={0.32} />
      </mesh>
      <mesh position={[0.48, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.84} roughness={0.28} />
      </mesh>
      {engineNodes.map((engine, idx) => (
        <group key={`cluster-${idx}`}>
          {/* Diagonal Outrigger Boom Connecting Core to Thruster Pod */}
          <mesh position={[engine.pos[0] * 0.62, 0.16, engine.pos[2] * 0.62]} rotation={[0, engine.boomRot, 0]} castShadow>
            <boxGeometry args={[0.14, 0.12, 0.62]} />
            <meshStandardMaterial color="#64748b" metalness={0.86} roughness={0.28} />
          </mesh>
          <group position={engine.pos}>
            <mesh position={[0, 0.12, 0]} castShadow>
              <cylinderGeometry args={[0.09, 0.11, 0.14, 14]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.26} />
            </mesh>
            <mesh rotation={engine.rot} castShadow>
              <coneGeometry args={[0.15, 0.34, 18, 1, true]} />
              <meshStandardMaterial color="#0f172a" metalness={0.92} roughness={0.25} side={THREE.DoubleSide} />
            </mesh>
            {firing && (
              <group rotation={engine.rot}>
                <SupersonicThrusterPlume
                  position={[0, -0.16, 0]}
                  length={1.35 * throttle}
                  radius={0.11}
                  colorType="hydrazine"
                  intensity={throttle}
                />
              </group>
            )}
          </group>
        </group>
      ))}
    </group>
  );
}

let cachedMarsTextures: {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} | null = null;

function getMarsPBRTextures() {
  if (cachedMarsTextures) return cachedMarsTextures;
  if (typeof document === 'undefined') return null;

  const size = 256;
  const albedoCanvas = document.createElement('canvas');
  const normCanvas = document.createElement('canvas');
  const roughCanvas = document.createElement('canvas');
  albedoCanvas.width = normCanvas.width = roughCanvas.width = size;
  albedoCanvas.height = normCanvas.height = roughCanvas.height = size;

  const aCtx = albedoCanvas.getContext('2d');
  const nCtx = normCanvas.getContext('2d');
  const rCtx = roughCanvas.getContext('2d');
  if (!aCtx || !nCtx || !rCtx) return null;

  const aImg = aCtx.createImageData(size, size);
  const nImg = nCtx.createImageData(size, size);
  const rImg = rCtx.createImageData(size, size);

  const heights = new Float32Array(size * size);
  const hashMars = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return s - Math.floor(s);
  };
  const tileNoise = (u: number, v: number, p: number) => {
    const gx = u * p;
    const gy = v * p;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const fx = gx - x0;
    const fy = gy - y0;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const wx0 = ((x0 % p) + p) % p;
    const wy0 = ((y0 % p) + p) % p;
    const wx1 = (wx0 + 1) % p;
    const wy1 = (wy0 + 1) % p;
    const n0 = hashMars(wx0, wy0) * (1 - sx) + hashMars(wx1, wy0) * sx;
    const n1 = hashMars(wx0, wy1) * (1 - sx) + hashMars(wx1, wy1) * sx;
    return n0 + sy * (n1 - n0);
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const h =
        tileNoise(u, v, 8) * 0.5 +
        tileNoise(u, v, 16) * 0.3 +
        tileNoise(u, v, 32) * 0.2;
      heights[y * size + x] = h;
      const idx = (y * size + x) * 4;
      const tone = 0.72 + h * 0.45;
      aImg.data[idx] = Math.min(255, Math.round(176 * tone));
      aImg.data[idx + 1] = Math.min(255, Math.round(88 * tone));
      aImg.data[idx + 2] = Math.min(255, Math.round(38 * tone));
      aImg.data[idx + 3] = 255;

      const rough = Math.min(255, Math.max(165, Math.round(238 - h * 48)));
      rImg.data[idx] = rough;
      rImg.data[idx + 1] = rough;
      rImg.data[idx + 2] = rough;
      rImg.data[idx + 3] = 255;
    }
  }

  for (let y = 0; y < size; y++) {
    const ym = (y - 1 + size) % size;
    const yp = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;
      const dx = (heights[y * size + xm] - heights[y * size + xp]) * 2.2;
      const dy = (heights[ym * size + x] - heights[yp * size + x]) * 2.2;
      const len = Math.hypot(dx, dy, 1);
      const idx = (y * size + x) * 4;
      nImg.data[idx] = Math.round(((dx / len) * 0.5 + 0.5) * 255);
      nImg.data[idx + 1] = Math.round(((dy / len) * 0.5 + 0.5) * 255);
      nImg.data[idx + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      nImg.data[idx + 3] = 255;
    }
  }

  aCtx.putImageData(aImg, 0, 0);
  nCtx.putImageData(nImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);

  const setup = (canvas: HTMLCanvasElement, isColor: boolean) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  };

  cachedMarsTextures = {
    map: setup(albedoCanvas, true),
    normalMap: setup(normCanvas, false),
    roughnessMap: setup(roughCanvas, false),
  };
  return cachedMarsTextures;
}

function RealisticPlanetarySurface({ isMars }: { isMars: boolean }) {
  const lunarTextures = useMemo(() => (isMars ? null : getLunarPBRTextures()), [isMars]);
  const marsTextures = useMemo(() => (isMars ? getMarsPBRTextures() : null), [isMars]);

  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(80, 80, 72, 72);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.hypot(x, y);
      const elevation =
        Math.sin(x * 0.12) * Math.cos(y * 0.12) * 0.35 +
        Math.sin(x * 0.3 + 1.2) * 0.15 -
        (dist < 4 ? 0.05 : 0);
      pos.setZ(i, elevation);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      terrainGeo.dispose();
    };
  }, [terrainGeo]);

  return (
    <group position={[0, -0.02, 0]}>
      <mesh geometry={terrainGeo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        {isMars ? (
          marsTextures ? (
            <meshStandardMaterial
              map={marsTextures.map}
              normalMap={marsTextures.normalMap}
              roughnessMap={marsTextures.roughnessMap}
              roughness={0.94}
              metalness={0.04}
            />
          ) : (
            <meshStandardMaterial color="#b45309" roughness={0.92} metalness={0.08} />
          )
        ) : !lunarTextures ? (
          <meshStandardMaterial color="#64748b" roughness={0.95} metalness={0.02} />
        ) : (
          <meshStandardMaterial
            map={lunarTextures.map}
            normalMap={lunarTextures.normalMap}
            roughnessMap={lunarTextures.roughnessMap}
            roughness={0.96}
            metalness={0.02}
          />
        )}
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[34, 70, 48]} />
        <meshBasicMaterial color={isMars ? '#9a3412' : '#08090c'} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

function MoonLandingSequence({ missionId, step }: { missionId: string; step: number }) {
  const craftRef = useRef<THREE.Group>(null);
  const id = missionId.toLowerCase();

  useFrame((_, rawDelta) => {
    if (!craftRef.current) return;
    const t = Math.min(1, Math.min(rawDelta, 0.1) * 4.5);
    const targetY = step === 0 ? 1.4 : step === 1 ? 0.85 : step === 2 ? 0.38 : step === 3 ? 0.12 : 0;
    const targetRotZ = step === 0 ? -0.18 : step === 1 ? -0.08 : 0;
    craftRef.current.position.y = THREE.MathUtils.lerp(craftRef.current.position.y, targetY, t);
    craftRef.current.rotation.z = THREE.MathUtils.lerp(craftRef.current.rotation.z, targetRotZ, t);
  });

  const isStarship = id === 'artemis3';
  const isVikram = id === 'chandrayaan3';
  const isYutu2 = id === 'change4';
  const isSurveyor = id === 'surveyor3';

  return (
    <group ref={craftRef}>
      <Suspense fallback={null}>
        {isStarship ? (
          <group scale={[0.35, 0.35, 0.35]}>
            <StarshipHLS3D showHotspots={false} landingMode={true} />
          </group>
        ) : isVikram ? (
          <>
            <NormalizedCraftGLB
              modelPath="/models/isro_chandrayyan-3_mission_lander_module_vikram.glb"
              targetSize={2.45}
            />
            {step === 4 && (
              <group position={[1.45, 0, 0.9]}>
                <DetailedPragyanRover />
              </group>
            )}
          </>
        ) : isYutu2 ? (
          <group scale={[1.15, 1.15, 1.15]}>
            <DetailedYutu2Rover />
          </group>
        ) : isSurveyor ? (
          <group scale={[0.85, 0.85, 0.85]}>
            <DetailedSurveyor3Lander />
          </group>
        ) : (
          <NormalizedCraftGLB modelPath="/models/apollo_lunar_module.glb" targetSize={2.5} />
        )}
      </Suspense>

      {step >= 1 && step <= 3 && !isYutu2 && (
        <group position={[0, 0.35, 0]}>
          <SupersonicThrusterPlume
            position={[0, -0.35, 0]}
            length={step === 2 ? 1.25 : 0.9}
            radius={0.14}
            colorType="hypergolic"
            intensity={step === 2 ? 1.2 : 0.75}
          />
        </group>
      )}
      {(step === 2 || step === 3) && <GroundDustCloud isMars={false} />}
    </group>
  );
}

function Mars3DSimulator({ missionId, step }: { missionId: string; step: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const skyCraneRef = useRef<THREE.Group>(null);
  const bridlesRef = useRef<THREE.Group>(null);
  const id = missionId.toLowerCase();
  const isSkyCrane = id === 'perseverance' || id === 'curiosity';
  const roverModelPath = id === 'curiosity' ? '/models/curiosity.glb' : '/models/perseverance.glb';

  const bridleAnchors = useMemo<
    Array<[[number, number, number], [number, number, number]]>
  >(
    () => [
      [
        [0, 1.92, -0.45],
        [0, 0.72, -0.35],
      ],
      [
        [-0.42, 1.92, 0.35],
        [-0.3, 0.72, 0.28],
      ],
      [
        [0.42, 1.92, 0.35],
        [0.3, 0.72, 0.28],
      ],
    ],
    []
  );

  useFrame((_, rawDelta) => {
    const rawDt = Math.min(rawDelta, 0.1);
    const t = Math.min(1, rawDt * 4.5);
    if (groupRef.current) {
      const targetY = isSkyCrane
        ? step < 2
          ? 0.6
          : step === 2
            ? 0.28
            : 0
        : step === 0
          ? 1.35
          : step === 1
            ? 0.8
            : step === 2
              ? 0.35
              : step === 3
                ? 0.12
                : 0;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, t);
    }

    if (skyCraneRef.current && isSkyCrane) {
      if (step <= 3) {
        skyCraneRef.current.visible = true;
        const targetCraneY = step < 3 ? 1.55 : 1.92;
        skyCraneRef.current.position.x = THREE.MathUtils.lerp(skyCraneRef.current.position.x, 0, rawDt * 3.5);
        skyCraneRef.current.position.y = THREE.MathUtils.lerp(skyCraneRef.current.position.y, targetCraneY, rawDt * 3.5);
        skyCraneRef.current.position.z = THREE.MathUtils.lerp(skyCraneRef.current.position.z, 0, rawDt * 3.5);
        skyCraneRef.current.rotation.z = THREE.MathUtils.lerp(skyCraneRef.current.rotation.z, 0, rawDt * 3.5);
        skyCraneRef.current.rotation.x = THREE.MathUtils.lerp(skyCraneRef.current.rotation.x, 0, rawDt * 3.5);
      } else {
        // Post-touchdown fly-away maneuver (~45° diagonal pitch & thrust clear of landing site)
        skyCraneRef.current.position.x = THREE.MathUtils.lerp(skyCraneRef.current.position.x, -11, rawDt * 1.4);
        skyCraneRef.current.position.y = THREE.MathUtils.lerp(skyCraneRef.current.position.y, 8.5, rawDt * 1.4);
        skyCraneRef.current.position.z = THREE.MathUtils.lerp(skyCraneRef.current.position.z, -6, rawDt * 1.4);
        skyCraneRef.current.rotation.z = THREE.MathUtils.lerp(skyCraneRef.current.rotation.z, 0.42, rawDt * 2.2);
        skyCraneRef.current.rotation.x = THREE.MathUtils.lerp(skyCraneRef.current.rotation.x, -0.25, rawDt * 2.2);
        if (skyCraneRef.current.position.y > 7.2) {
          skyCraneRef.current.visible = false;
        }
      }
    }

    if (bridlesRef.current) {
      bridlesRef.current.visible = step === 3;
    }
  });

  if (!isSkyCrane) {
    const landerPath = id === 'viking' ? '/models/viking_lander.glb' : '/models/insight.glb';
    return (
      <group ref={groupRef}>
        <Suspense fallback={null}>
          <NormalizedCraftGLB modelPath={landerPath} targetSize={2.2} />
        </Suspense>
        {step >= 1 && step <= 3 && (
          <group position={[0, 0.35, 0]}>
            <SupersonicThrusterPlume
              position={[-0.45, -0.25, 0.3]}
              length={0.9}
              radius={0.09}
              colorType="hydrazine"
              intensity={1.0}
            />
            <SupersonicThrusterPlume
              position={[0.45, -0.25, 0.3]}
              length={0.9}
              radius={0.09}
              colorType="hydrazine"
              intensity={1.0}
            />
            <SupersonicThrusterPlume
              position={[0, -0.25, -0.5]}
              length={0.9}
              radius={0.09}
              colorType="hydrazine"
              intensity={1.0}
            />
          </group>
        )}
        {(step === 2 || step === 3) && <GroundDustCloud isMars={true} />}
      </group>
    );
  }

  useEffect(() => {
    if (skyCraneRef.current) {
      skyCraneRef.current.position.set(0, 1.55, 0);
    }
  }, [missionId]);

  return (
    <group ref={groupRef}>
      <group ref={skyCraneRef}>
        <SkyCraneDescentPlatform firing={true} throttle={step >= 4 ? 1.35 : step === 3 ? 0.92 : 1.1} />
      </group>
      <group ref={bridlesRef} visible={step === 3}>
        {bridleAnchors.map((pts, idx) => (
          <Line
            key={`bridle-${idx}`}
            points={pts}
            color="#e2e8f0"
            lineWidth={1.5}
            transparent
            opacity={0.85}
          />
        ))}
      </group>
      {step >= 3 && (
        <Suspense fallback={null}>
          <NormalizedCraftGLB
            modelPath={roverModelPath}
            targetSize={step === 3 ? 1.8 : 1.95}
            position={[0, step === 3 ? 0.05 : 0, 0]}
          />
        </Suspense>
      )}
      {(step === 2 || step === 3) && <GroundDustCloud isMars={true} />}
    </group>
  );
}

function OrbitCaptureSimulator({
  missionId,
  body,
  step,
}: {
  missionId: string;
  body: 'Moon' | 'Mars';
  step: number;
}) {
  const id = missionId.toLowerCase();
  const craftRef = useRef<THREE.Group>(null);
  const modelPath =
    id === 'mro'
      ? '/models/mro.glb'
      : id === 'ladee'
        ? '/models/lunar_ladee.glb'
        : '/models/lunar_orbiter_lro.glb';

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1);
    if (craftRef.current) {
      craftRef.current.rotation.y = THREE.MathUtils.lerp(
        craftRef.current.rotation.y,
        step * 0.25 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.08,
        dt * 2.5
      );
      // Slight pitch backward during retro-burn steps 1 and 2
      const targetPitch = step === 1 || step === 2 ? -0.18 : 0.04;
      craftRef.current.rotation.x = THREE.MathUtils.lerp(craftRef.current.rotation.x, targetPitch, dt * 2.5);
    }
  });

  return (
    <>
      <OrbitalPlanetBackdrop body={body} />
      <group ref={craftRef} position={[0, 0.2, 0]}>
        <Suspense fallback={null}>
          <NormalizedCraftGLB modelPath={modelPath} targetSize={2.4} />
        </Suspense>
        {(step === 1 || step === 2) && (
          <SupersonicThrusterPlume
            position={[0, 0.45, -1.15]}
            rotation={[Math.PI / 2, 0, 0]}
            length={1.5}
            radius={0.13}
            colorType="hypergolic"
            intensity={step === 1 ? 1.25 : 0.9}
          />
        )}
      </group>
      <OrbitControls enablePan={false} minDistance={2.8} maxDistance={11.0} />
    </>
  );
}

interface LandingSceneProps {
  destination: DestinationType;
  activeMissionId?: string;
  missionName?: string;
  onExploreTerrain: () => void;
}

export const LandingScene: React.FC<LandingSceneProps> = ({
  destination,
  activeMissionId,
  missionName,
  onExploreTerrain,
}) => {
  const isMars = destination === 'Mars';
  const isDeepSpace = destination === 'DeepSpace';
  const resolvedId = (activeMissionId || (isMars ? 'perseverance' : isDeepSpace ? 'jwst' : 'apollo11')).toLowerCase();
  const profile = useMemo(() => getMissionFlightProfile(resolvedId), [resolvedId]);
  const isOrbiter = profile.stage4Kind === 'orbit-capture';

  const resolvedMissionLabel =
    missionName ||
    (isDeepSpace
      ? 'Deep Space Observatory'
      : isMars
        ? 'Mars Mission'
        : 'Lunar Mission');
  const videoRef = useRef<HTMLVideoElement>(null);

  const [archiveVideos, setArchiveVideos] = useState<NasaArchiveVideo[]>([]);
  const activeVideoSrc =
    profile.stage4ArchivalVideo ||
    profile.curatedArrivalVideo ||
    archiveVideos[0]?.videoUrl ||
    null;
  const activeVideoLabel =
    profile.stage4ArchivalLabel ||
    profile.curatedArrivalVideoLabel ||
    archiveVideos[0]?.title ||
    null;

  const hasLocalTrimmedVideo = Boolean(profile.stage4ArchivalVideo);
  const hasArchivalVideo = Boolean(activeVideoSrc);

  // Play mission-specific landing / deployment video by default (interactive 3D remains toggleable)
  const [viewMode, setViewMode] = useState<'video' | '3d'>(hasArchivalVideo ? 'video' : '3d');
  const [videoError, setVideoError] = useState<boolean>(false);
  const [isVideoBuffering, setIsVideoBuffering] = useState<boolean>(hasArchivalVideo);
  const [loadedVideoDuration, setLoadedVideoDuration] = useState<number>(90);

  const videoStart = hasLocalTrimmedVideo ? (isMars ? 25.0 : 0.0) : 0.0;
  const videoEnd = hasLocalTrimmedVideo ? (isMars ? 175.0 : 120.0) : loadedVideoDuration;
  const videoDuration = Math.max(1, videoEnd - videoStart);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(() => hasArchivalVideo && !prefersReducedMotion);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [relativeTime, setRelativeTime] = useState<number>(0);
  const [simStep, setSimStep] = useState<number>(0);
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(true);

  const telemetrySpotlight = useTourSpotlight('landing-telemetry');
  const deploySpotlight = useTourSpotlight('deploy-surface');

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    setArchiveVideos([]);
    if (!profile.stage4ArchivalVideo && !profile.curatedArrivalVideo) {
      fetchMissionVideos(resolvedId, controller.signal).then((vids) => {
        if (mounted && vids.length > 0) {
          setArchiveVideos(vids);
        }
      });
    }
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [resolvedId, profile.stage4ArchivalVideo, profile.curatedArrivalVideo]);

  useEffect(() => {
    setVideoError(false);
    setLoadedVideoDuration(90);
    setViewMode(hasArchivalVideo ? 'video' : '3d');
    setIsMuted(true);
    setIsPlaying(hasArchivalVideo && !prefersReducedMotion);
    setRelativeTime(0);
    setSimStep(0);
    setIsSimPlaying(true);
    audioManager.setDucking(false, 'video');
  }, [destination, resolvedId, hasArchivalVideo]);

  // Smooth auto-progression across 5 3D phases unless paused or completed
  useEffect(() => {
    if (viewMode !== '3d' || !isSimPlaying || simStep >= 4) return;
    const timer = setTimeout(() => {
      setSimStep((prev) => {
        const next = Math.min(4, prev + 1);
        if (next === 4) {
          if (resolvedId === 'apollo11') soundFx.playEagleLanding();
          else soundFx.playSuccess();
          setIsSimPlaying(false);
        } else {
          soundFx.playClick();
        }
        return next;
      });
    }, 3400);
    return () => clearTimeout(timer);
  }, [viewMode, isSimPlaying, simStep, resolvedId]);

  const surfaceOrOrbitalPhases = useMemo((): Array<{
    title: string;
    desc: string;
    alt?: string;
    speed?: string;
  }> => {
    if (isOrbiter) {
      if (resolvedId === 'mro') {
        return [
          { title: 'Phase 1 · Mars Approach & Attitude Turn', desc: 'MRO slews retrograde toward Mars polar corridor for Mars Orbit Insertion.', alt: '2,100 km', speed: '17,900 km/h' },
          { title: 'Phase 2 · 27-Minute MOI Retro-Burn', desc: 'Six 170-N hydrazine thrusters fire continuously to bleed excess heliocentric velocity.', alt: '426 km periapsis', speed: '13,200 km/h' },
          { title: 'Phase 3 · 35-Hour Capture Orbit Locked', desc: 'Gravitational capture achieved; high-gain dish re-establishes Deep Space Network lock.', alt: '44,000 × 426 km', speed: '9,800 km/h' },
          { title: 'Phase 4 · 500-Pass Aerobraking Dip', desc: 'Upper Martian atmosphere gently lowers apoapsis without burning scarce propellant.', alt: '105 km drag pass', speed: '12,100 km/h' },
          { title: 'Phase 5 · Sun-Synchronous Mapping Orbit', desc: 'MRO enters 255 × 320 km near-circular polar orbit with HiRISE nadir-locked.', alt: '285 km nominal', speed: '12,280 km/h' },
        ];
      }
      return [
        { title: 'Phase 1 · Translunar Approach', desc: `${resolvedMissionLabel} aligns for polar/equatorial capture burn on the lunar far side.`, alt: '850 km', speed: '8,200 km/h' },
        { title: 'Phase 2 · Lunar Orbit Insertion (LOI) Burn', desc: 'Main bipropellant engine fires retrograde to enter bound lunar orbit.', alt: '185 km', speed: '6,100 km/h' },
        { title: 'Phase 3 · Capture Ellipse Stabilization', desc: 'Reaction wheels damp attitude residuals as solar array locks onto sunlit tracking.', alt: '215 × 50 km', speed: '5,940 km/h' },
        { title: 'Phase 4 · Periapsis Commissioning Burn', desc: 'Orbital maintenance engines circularize science orbit above target craters.', alt: '55 km', speed: '5,890 km/h' },
        { title: 'Phase 5 · Science Mapping Orbit Active', desc: `${resolvedMissionLabel} optical and thermal instruments begin continuous lunar passes.`, alt: '50 km orbit', speed: '5,880 km/h' },
      ];
    }

    if (resolvedId === 'chandrayaan3') {
      return [
        { title: 'Phase 1 · Rough Braking (30 km Altitude)', desc: 'Four 800-N throttleable liquid engines reduce horizontal speed from 1.68 km/s.', alt: '30 km → 7.4 km', speed: '6,048 km/h' },
        { title: 'Phase 2 · Attitude Hold & Site Imaging', desc: 'Vikram pitches toward vertical while Hazard Detection cameras scan Shiv Shakti Point.', alt: '7.4 km', speed: '1,290 km/h' },
        { title: 'Phase 3 · Fine Braking Vertical Turn', desc: 'Two central engines hold vertical descent as laser altimeters lock onto south pole terrain.', alt: '800 m', speed: '115 km/h' },
        { title: 'Phase 4 · Terminal Hover & Regolith Plume', desc: 'Autonomous guidance checks slope tolerance 150 m above Shiv Shakti Point.', alt: '150 m → 10 m', speed: '7.2 km/h' },
        { title: 'Phase 5 · Soft Touchdown & Pragyan Ramp Ready', desc: 'ISRO confirms soft landing near 69.37°S; Pragyan rover deploys down landing ramp.', alt: '0 m · 69.37°S', speed: '0.0 m/s' },
      ];
    }

    if (resolvedId === 'artemis3') {
      return [
        { title: 'Phase 1 · NRHO De-Orbit Burn', desc: 'Starship HLS departs Gateway NRHO orbit onto polar south-pole descent ellipse.', alt: '100 km', speed: '5,800 km/h' },
        { title: 'Phase 2 · Raptor Braking Descent', desc: 'Gimbaled methalox engines decelerate the 50-meter crewed lander toward Shackleton Rim.', alt: '14 km', speed: '1,450 km/h' },
        { title: 'Phase 3 · High-Ring RCS Switchover', desc: 'Mid-body methalox landing thrusters ignite to avoid regolith ejecta cratering.', alt: '250 m', speed: '42 m/s' },
        { title: 'Phase 4 · Auto-Leveling Gear Approach', desc: 'Autonomous LIDAR levels self-compensating landing legs onto crater rim terrain.', alt: '25 m', speed: '1.8 m/s' },
        { title: 'Phase 5 · Crew Elevator Ready at Shackleton', desc: 'Touchdown confirmed; dual crew elevator prepares Artemis astronauts for lunar EVA.', alt: '0 m · 89.9°S', speed: '0.0 m/s' },
      ];
    }

    if (isMars) {
      return [
        { title: 'Phase 1 · Hypersonic Entry (1,300°C)', desc: `${resolvedMissionLabel} aeroshell dissipates 98% of kinetic energy against upper Martian air.`, alt: '125 km', speed: '19,800 km/h' },
        { title: 'Phase 2 · Supersonic Parachute Deploy', desc: 'Mortar fires supersonic canopy decelerating capsule toward terminal terrain radar lock.', alt: '11 km', speed: '1,480 km/h' },
        { title: 'Phase 3 · Heat Shield Drop & Powered Descent', desc: `${resolvedId === 'insight' || resolvedId === 'viking' ? 'Terminal hydrazine lander engines fire' : 'Descent stage separates and ignites 8 MLE retro-rockets'}.`, alt: '2.1 km', speed: '320 km/h' },
        { title: 'Phase 4 · Terminal Hover / Touchdown Plume', desc: `${resolvedId === 'insight' || resolvedId === 'viking' ? 'Radar altimeter guides final three-leg propulsive touchdown' : 'Sky crane hovers at 20 m lowering rover via nylon bridle tether'}.`, alt: '20 m', speed: '0.8 m/s' },
        { title: 'Phase 5 · Surface Operations Confirmed', desc: `${resolvedMissionLabel} safely settled on Martian regolith; UHF relay active.`, alt: '0 m · Surface', speed: '0.0 m/s' },
      ];
    }

    return [
      { title: 'Phase 1 · Powered Descent Initiation (PDI)', desc: `${resolvedMissionLabel} ignites descent stage over the lunar horizon.`, alt: '15.2 km', speed: '1,680 m/s' },
      { title: 'Phase 2 · Pitch-Over & Radar Lock', desc: 'Landing radar locks altitude and velocity vector over target basalt plains.', alt: '2.2 km', speed: '420 m/s' },
      { title: 'Phase 3 · Hazard Avoidance Approach', desc: 'Fine attitude control avoids boulder-strewn craters on final slant trajectory.', alt: '150 m', speed: '22 m/s' },
      { title: 'Phase 4 · Terminal Dust Plume Descent', desc: 'Surface regolith sweeps radially beneath exhaust pressure at < 2 m/s sink rate.', alt: '15 m', speed: '1.5 m/s' },
      { title: 'Phase 5 · Lunar Contact Light & Engine Cutoff', desc: `${resolvedMissionLabel} touches down upright and initiates surface science commissioning.`, alt: '0 m · Surface', speed: '0.0 m/s' },
    ];
  }, [isOrbiter, resolvedId, resolvedMissionLabel, isMars]);

  const deepSpacePhases = useMemo((): Array<{
    title: string;
    desc: string;
    alt?: string;
    speed?: string;
  }> => {
    const id = resolvedId;
    if (id === 'iss') {
      return [
        { title: 'Phase 1 · Launch & Rendezvous', desc: 'Visiting spacecraft matches the 51.6° orbital plane and 408 km altitude of the International Space Station.' },
        { title: 'Phase 2 · Solar Array Gimbal Lock', desc: 'Photovoltaic wings track the Sun while thermal ammonia radiators reject cabin waste heat.' },
        { title: 'Phase 3 · Truss & Module Docking', desc: 'Robotic Canadarm2 berths visiting modules onto pressurized Destiny and Harmony nodes.' },
        { title: 'Phase 4 · Pressurization & Leak Check', desc: 'Inter-module hatches equalize cabin atmosphere at 101.3 kPa before crew ingress.' },
        { title: 'Phase 5 · Microgravity Science Operations', desc: 'All orbital racks, Cupola observation windows, and external experiment platforms are active.' },
      ];
    }
    if (id === 'hubble') {
      return [
        { title: 'Phase 1 · Payload Bay Grapple', desc: 'Space Shuttle RMS robotic arm lifts Hubble clear of the Discovery cargo bay in 535 km orbit.' },
        { title: 'Phase 2 · Solar Wing Deployment', desc: 'Dual solar arrays unroll to supply 2,800 W across orbital day-night thermal cycles.' },
        { title: 'Phase 3 · High-Gain Antenna Unlock', desc: 'TDRS relay dishes unfold for continuous telemetry downlinks to Goddard Space Flight Center.' },
        { title: 'Phase 4 · Aperture Door Open', desc: 'Protective baffle door latches open to expose the 2.4-meter Ritchey-Chrétien primary mirror.' },
        { title: 'Phase 5 · Fine Guidance Lock', desc: 'Reaction wheels spin up zero-propellant slewing with 0.007 arcsecond pointing stability.' },
      ];
    }
    if (id === 'voyager') {
      return [
        { title: 'Phase 1 · Centaur Escape Separation', desc: 'Star 37E kick stage releases Voyager 1 onto its 17 km/s hyperbolic solar system escape path.' },
        { title: 'Phase 2 · Magnetometer Boom Unfurling', desc: '13-meter fiberglass boom extends to isolate sensitive triaxial magnetometers from bus fields.' },
        { title: 'Phase 3 · RTG Nuclear Spin-Up', desc: 'Three MHW-RTG plutonium-238 generators deliver continuous thermal and electrical power.' },
        { title: 'Phase 4 · Planetary Gravity Assists', desc: 'Jupiter and Saturn slingshots bend the trajectory 35° northward out of the ecliptic plane.' },
        { title: 'Phase 5 · Heliopause Interstellar Entry', desc: 'Voyager 1 crosses the heliopause boundary and broadcasts interstellar plasma telemetry.' },
      ];
    }
    return [
      { title: 'Phase 1 · Ariane 5 Separation & Solar Deploy', desc: 'JWST separates cleanly above Earth and unfolds its solar array to power communications and heaters.' },
      { title: 'Phase 2 · 5-Layer Sunshield Tensioning', desc: 'Kapton membranes unroll to diamond shape, cooling the cold side down to 40 K (-233°C).' },
      { title: 'Phase 3 · Secondary Mirror Tripod Latch', desc: 'Carbon-composite struts extend and lock the secondary mirror 7.6 meters ahead of the primary.' },
      { title: 'Phase 4 · 18-Segment Mirror Phasing', desc: '132 cryo-actuators align the gold-coated beryllium hexagons to nanometer optical tolerance.' },
      { title: 'Phase 5 · Sun-Earth L2 Halo Insertion', desc: 'Mid-course thruster burn inserts JWST into halo orbit 1.5 million km from Earth.' },
    ];
  }, [resolvedId]);

  const deepSpaceModelType = useMemo(() => {
    if (resolvedId === 'iss') return 'iss-station';
    if (resolvedId === 'hubble') return 'hubble-telescope';
    if (resolvedId === 'voyager') return 'voyager-probe';
    return 'jwst-observatory';
  }, [resolvedId]);

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

  const marsMilestones = useMemo(
    () => [
      {
        id: 'entry',
        relTime: 0,
        label: 'Entry',
        title: 'Atmospheric entry',
        speed: '20,000 km/h',
        alt: '125 km',
        desc: 'The heat shield absorbs 1,300°C peak heating as the spacecraft decelerates in the upper Martian atmosphere.',
        transcript: 'JPL Control: "Vehicle reporting hypersonic atmospheric entry. Guidance is active."',
      },
      {
        id: 'parachute',
        relTime: 29,
        label: 'Parachute',
        title: 'Supersonic parachute deployment',
        speed: '1,510 km/h',
        alt: '11.2 km',
        desc: 'A 21.5-meter supersonic parachute inflates in 0.4 seconds to slow the capsule.',
        transcript: 'JPL Control: "Parachute deploy confirmed. Decelerating through Mach 1.5."',
      },
      {
        id: 'radar',
        relTime: 53,
        label: 'Radar lock',
        title: 'Heat shield separation & terrain radar',
        speed: '560 km/h',
        alt: '8.2 km',
        desc: 'The heat shield drops away and Terrain-Relative Navigation cameras lock onto Jezero Crater.',
        transcript: 'JPL Control: "Heat shield separation confirmed. Radar has locked onto Jezero Crater terrain."',
      },
      {
        id: 'sky_crane',
        relTime: 83,
        label: 'Powered descent',
        title: 'Backshell separation & retro-rockets',
        speed: '32 km/h',
        alt: '2.1 km',
        desc: 'The descent stage separates from the parachute and fires eight hydrazine engines.',
        transcript: 'JPL Control: "Descent stage separation. Eight hydrazine retro-rockets firing nominally."',
      },
      {
        id: 'lowering',
        relTime: 111,
        label: 'Sky crane',
        title: 'Sky crane rover lowering',
        speed: '0.75 m/s',
        alt: '20 m',
        desc: 'Hovering 20 meters above the surface, the descent stage lowers Perseverance on nylon bridles.',
        transcript: 'JPL Control: "Sky crane maneuver initiated. Rover is being lowered on bridles."',
      },
      {
        id: 'touchdown',
        relTime: 135,
        label: 'Touchdown',
        title: 'Touchdown confirmed at Jezero Crater',
        speed: '0.0 m/s',
        alt: '0 m · Surface',
        desc: 'Perseverance settles onto Jezero Crater and severs the sky crane bridles.',
        transcript: 'Swati Mohan (JPL): "Touchdown confirmed! Perseverance is safely on the surface of Mars!"',
      },
    ],
    []
  );

  const moonMilestones = useMemo(
    () => [
      {
        id: 'pdi',
        relTime: 0,
        label: 'Ignition',
        title: 'Powered descent initiation',
        speed: '1,680 m/s',
        alt: '15.2 km',
        desc: 'The Lunar Module descent engine ignites and throttles up to 94% to brake from lunar orbit.',
        transcript: 'Aldrin: "Ignition. Ten percent... Throttle up, ninety-four percent."',
      },
      {
        id: 'pitch_over',
        relTime: 28,
        label: 'Pitch-over',
        title: 'Pitch-over & 1202 computer alarm',
        speed: '450 m/s',
        alt: '2,280 m',
        desc: 'Eagle pitches upright to bring the landing site into view; Mission Control confirms GO after a 1202 alarm.',
        transcript: 'Armstrong: "Program alarm... 1202." Duke: "Roger, we copy you on that alarm. We\'re GO."',
      },
      {
        id: 'manual_avoidance',
        relTime: 58,
        label: 'Manual control',
        title: 'Manual boulder field avoidance',
        speed: '25 m/s',
        alt: '150 m',
        desc: 'Seeing boulders around West Crater, Armstrong takes semi-manual control to fly to level ground.',
        transcript: 'Aldrin: "Down two and a half... 200 feet, down four and a half... 160 feet."',
      },
      {
        id: 'fuel_low',
        relTime: 85,
        label: '60 seconds',
        title: 'Final approach & low fuel callout',
        speed: '2.2 m/s',
        alt: '30 m',
        desc: 'Mission Control calls 60 seconds of descent fuel remaining as engine exhaust sweeps lunar dust.',
        transcript: 'Duke: "60 seconds." Aldrin: "Down two and a half. Kicking up some dust."',
      },
      {
        id: 'contact_light',
        relTime: 108,
        label: 'Touchdown',
        title: 'Touchdown at Tranquility Base',
        speed: '0.0 m/s',
        alt: '0 m · Surface',
        desc: 'Lunar surface probes touch down and the descent engine shuts off at Tranquility Base.',
        transcript: 'Aldrin: "Contact light!" Armstrong: "Houston, Tranquility Base here. The Eagle has landed."',
      },
    ],
    []
  );

  const activeSimPhaseList = isDeepSpace ? deepSpacePhases : surfaceOrOrbitalPhases;

  const milestones = useMemo(() => {
    if (hasLocalTrimmedVideo) {
      return isMars ? marsMilestones : moonMilestones;
    }
    const safeDur = Math.max(10, videoDuration);
    return activeSimPhaseList.map((phase, idx) => {
      const cleanedTitle = phase.title.replace(/^Phase\s*\d+\s*·\s*/i, '');
      const shortWord = cleanedTitle.split('·')[0].trim().split(' ').slice(0, 2).join(' ');
      return {
        id: `phase-${idx}`,
        relTime: Number(((idx / Math.max(1, activeSimPhaseList.length)) * safeDur).toFixed(1)),
        label: shortWord || `Phase ${idx + 1}`,
        title: phase.title,
        speed: phase.speed || (isDeepSpace ? 'Nominal' : 'Controlled'),
        alt: phase.alt || (isDeepSpace ? 'Deep Space' : 'Descent'),
        desc: phase.desc,
        transcript: '',
      };
    });
  }, [hasLocalTrimmedVideo, isMars, marsMilestones, moonMilestones, activeSimPhaseList, videoDuration, isDeepSpace]);

  const activeMilestone = useMemo(() => {
    let current = milestones[0];
    for (const m of milestones) {
      if (relativeTime >= m.relTime - 1.5) {
        current = m;
      }
    }
    return current;
  }, [milestones, relativeTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || viewMode !== 'video') return;

    if (hasLocalTrimmedVideo && video.currentTime < videoStart) {
      video.currentTime = videoStart;
    }

    const handleLoadedMetadata = () => {
      if (!hasLocalTrimmedVideo && video.duration && Number.isFinite(video.duration)) {
        setLoadedVideoDuration(video.duration);
      }
      video.playbackRate = playbackSpeed;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        video.pause();
        setIsPlaying(false);
        return;
      }
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    };

    const handleTimeUpdate = () => {
      if (hasLocalTrimmedVideo) {
        if (video.currentTime < videoStart) {
          video.currentTime = videoStart;
        }
        if (video.currentTime >= videoEnd) {
          video.currentTime = videoEnd;
          video.pause();
          setIsPlaying(false);
          setRelativeTime(videoDuration);
          audioManager.setDucking(false, 'video');
          soundFx.playSuccess();
          return;
        }
        const rel = Math.max(0, Math.min(videoDuration, video.currentTime - videoStart));
        setRelativeTime(rel);
      } else {
        setRelativeTime(video.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setRelativeTime(videoDuration);
      audioManager.setDucking(false, 'video');
      soundFx.playSuccess();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [viewMode, videoStart, videoEnd, videoDuration, hasLocalTrimmedVideo, playbackSpeed]);

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

  const handleScrub = (newRelTime: number) => {
    const clampedRel = Math.max(0, Math.min(videoDuration, newRelTime));
    setRelativeTime(clampedRel);
    if (videoRef.current) {
      videoRef.current.currentTime = (hasLocalTrimmedVideo ? videoStart : 0) + clampedRel;
    }
  };

  const handleJumpToMilestone = (relTime: number) => {
    soundFx.playClick();
    handleScrub(relTime);
  };

  const togglePlay = () => {
    soundFx.playClick();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        audioManager.setDucking(false, 'video');
      } else {
        if (hasLocalTrimmedVideo && videoRef.current.currentTime >= videoEnd) {
          videoRef.current.currentTime = videoStart;
        }
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
        audioManager.setDucking(!isMuted, 'video');
      }
    }
  };

  const cycleSpeed = () => {
    soundFx.playClick();
    const speeds = [1.0, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAdvanceSimStep = (nextStep: number) => {
    soundFx.playClick();
    setSimStep(nextStep);
    if (nextStep === 4) {
      if (resolvedId === 'apollo11') {
        soundFx.playEagleLanding();
      } else {
        soundFx.playSuccess();
      }
    }
  };

  const activeSimPhase = activeSimPhaseList[simStep] || activeSimPhaseList[0];

  const primaryCtaLabel = isDeepSpace
    ? 'Explore 3D Spacecraft'
    : isOrbiter
      ? 'Explore Orbital Craft'
      : 'Explore 3D Surface';

  return (
    <div className="relative w-full h-screen bg-[#07090F] flex flex-col justify-between p-4 sm:p-6 pt-20 sm:pt-20 overflow-hidden select-none font-sans">
      {/* 1. Viewport Background (Mission-Exact Video or Vehicle-Exact 3D Simulation) */}
      <div className="absolute inset-0 z-0 bg-[#07090F] flex items-center justify-center overflow-hidden">
        {viewMode === 'video' && activeVideoSrc && !videoError ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              key={activeVideoSrc}
              ref={videoRef}
              src={activeVideoSrc}
              width={1280}
              height={720}
              autoPlay={!prefersReducedMotion}
              playsInline
              preload="metadata"
              muted={isMuted}
              onLoadStart={() => setIsVideoBuffering(true)}
              onWaiting={() => setIsVideoBuffering(true)}
              onSeeking={() => setIsVideoBuffering(true)}
              onLoadedData={() => setIsVideoBuffering(false)}
              onCanPlay={() => setIsVideoBuffering(false)}
              onPlaying={() => {
                setIsVideoBuffering(false);
                setIsPlaying(true);
              }}
              onSeeked={() => setIsVideoBuffering(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => {
                setIsVideoBuffering(false);
                setVideoError(true);
                setIsPlaying(false);
                audioManager.setDucking(false, 'video');
                setViewMode('3d');
              }}
              className="w-full h-full object-cover md:object-contain select-none"
            />
            <VideoLoadingOverlay
              visible={isVideoBuffering}
              label="Buffering archival landing & deployment stream..."
            />
            <div className="absolute inset-0 hud-vignette pointer-events-none" />

            {hasLocalTrimmedVideo && activeMilestone.transcript && (
              <div className="hud-well absolute bottom-[276px] sm:bottom-[264px] left-1/2 -translate-x-1/2 max-w-lg w-[90%] px-4 py-2 rounded-xl text-center text-xs text-slate-200 pointer-events-none animate-fade-in content-selectable">
                <p className="italic text-slate-100">&ldquo;{activeMilestone.transcript}&rdquo;</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-full">
            <CanvasErrorBoundary>
              <Canvas
                camera={{ position: [0, 1.5, 4.9], fov: 46 }}
                dpr={[1, 1.75]}
                gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
                shadows
              >
                <AdaptivePerformance />
                <Environment resolution={128} frames={1} environmentIntensity={0.88}>
                  <Lightformer
                    form="rect"
                    intensity={2.8}
                    color="#fff8eb"
                    position={[8, 10, 8]}
                    scale={[12, 8, 1]}
                    target={[0, 0, 0]}
                  />
                  <Lightformer
                    form="rect"
                    intensity={1.6}
                    color={isMars ? '#fdba74' : '#93c5fd'}
                    position={[-8, 4, -8]}
                    scale={[14, 8, 1]}
                    target={[0, 0, 0]}
                  />
                  <Lightformer
                    form="circle"
                    intensity={1.0}
                    color={isMars ? '#b45309' : '#cbd5e1'}
                    position={[0, -8, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={18}
                  />
                </Environment>
                <ambientLight intensity={isMars ? 0.52 : 0.42} />
                <hemisphereLight args={[isMars ? '#fed7aa' : '#e2e8f0', isMars ? '#451a03' : '#0f172a', 0.65]} />
                <directionalLight position={[8, 14, 6]} intensity={2.8} color={isMars ? '#ffe4d6' : '#ffffff'} castShadow />
                <directionalLight position={[-8, 5, -7]} intensity={1.15} color={isMars ? '#fdba74' : '#7dd3fc'} />
                <pointLight position={[-6, 4, -4]} intensity={0.45} color={isMars ? '#f97316' : '#94a3b8'} />
                <Stars radius={100} depth={50} count={4500} factor={3.5} fade />
                <Suspense fallback={null}>
                  {isDeepSpace ? (
                    <>
                      {(resolvedId === 'iss' || resolvedId === 'hubble') && (
                        <OrbitalPlanetBackdrop body="Earth" />
                      )}
                      <group position={[0, -0.4, 0]}>
                        <Rover3DModel
                          modelType={deepSpaceModelType}
                          missionId={resolvedId}
                          showHotspots={false}
                          autoRotate={true}
                          isMars={false}
                          isMoon={false}
                        />
                      </group>
                      <OrbitControls enablePan={false} minDistance={2.8} maxDistance={11.0} />
                    </>
                  ) : isOrbiter ? (
                    <OrbitCaptureSimulator
                      missionId={resolvedId}
                      body={isMars ? 'Mars' : 'Moon'}
                      step={simStep}
                    />
                  ) : (
                    <>
                      <RealisticPlanetarySurface isMars={isMars} />
                      {isMars ? (
                        <Mars3DSimulator missionId={resolvedId} step={simStep} />
                      ) : (
                        <MoonLandingSequence missionId={resolvedId} step={simStep} />
                      )}
                      <OrbitControls enablePan={false} minDistance={2.4} maxDistance={8.5} maxPolarAngle={Math.PI / 2.05} />
                    </>
                  )}
                </Suspense>
              </Canvas>
            </CanvasErrorBoundary>
            <CanvasLoadingOverlay
              compact
              accent={isMars ? 'amber' : 'cyan'}
              title={isDeepSpace ? 'Streaming orbital craft 3D' : 'Streaming landing spacecraft 3D'}
            />
          </div>
        )}
      </div>

      {/* 2. Top-Left Mode Segmented Control */}
      <div className="relative z-10 w-full flex flex-wrap items-center justify-between gap-2 pointer-events-none screen-enter">
        <div className="pointer-events-auto">
          {hasArchivalVideo && !videoError ? (
            <SegmentedControl<'video' | '3d'>
              ariaLabel="Landing view mode"
              value={viewMode}
              onChange={(next) => {
                soundFx.playClick();
                setViewMode(next);
              }}
              options={[
                {
                  value: 'video',
                  label: hasLocalTrimmedVideo ? 'Archival film' : 'NASA archive film',
                  icon: <Tv className="w-3.5 h-3.5" />,
                },
                {
                  value: '3d',
                  label: isDeepSpace
                    ? '3D deployment'
                    : isOrbiter
                      ? '3D orbit capture'
                      : '3D descent sim',
                  icon: <Box className="w-3.5 h-3.5" />,
                },
              ]}
            />
          ) : isDeepSpace ? (
            <div className="px-3 py-1.5 rounded-xl hud-card text-xs font-mono text-indigo-200 flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Orbital Deployment &amp; Commissioning</span>
            </div>
          ) : isOrbiter ? (
            <div className="px-3 py-1.5 rounded-xl hud-card text-xs font-mono text-slate-200 flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>
                {isMars ? 'Mars Orbit Insertion (MOI)' : 'Lunar Orbit Insertion (LOI)'} · {resolvedMissionLabel}
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl hud-card text-xs font-mono text-slate-200 flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>3D Descent Simulator · {resolvedMissionLabel}</span>
            </div>
          )}
        </div>

        {viewMode === 'video' && activeVideoLabel && !videoError && (
          <div className="px-3 py-1.5 rounded-xl hud-well text-[11px] font-mono text-slate-300 hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="truncate max-w-xs">{activeVideoLabel}</span>
          </div>
        )}
      </div>

      {/* 3. Unified Bottom Media Stage Deck */}
      <div className="relative z-10 max-w-3xl mx-auto w-full pb-1 pointer-events-auto screen-enter">
        {viewMode === 'video' ? (
            <div
            className={`p-4 sm:p-5 rounded-2xl hud-card hud-card-featured tabular-nums space-y-3.5 content-selectable ${telemetrySpotlight.className}`}
          >
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div className="min-w-0 space-y-0.5">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--accent-text)] block">
                    ASTRAVEX //{' '}
                    {isDeepSpace
                      ? `DEPLOYMENT · ${resolvedMissionLabel.toUpperCase()}`
                      : isOrbiter
                        ? `ORBIT INSERTION · ${resolvedMissionLabel.toUpperCase()}`
                        : `EDL · ${resolvedMissionLabel.toUpperCase()}`}
                  </span>
                  <h1 className="font-orbitron text-base sm:text-lg font-bold tracking-[0.04em] uppercase text-white truncate">
                    {activeMilestone.title}
                  </h1>
                  <p className="text-xs text-slate-300/90 mt-0.5 line-clamp-1">{activeMilestone.desc}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 font-mono text-[11px]">
                  <div className="px-2.5 py-1 rounded-lg hud-well text-slate-100">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-slate-400 mr-1.5">ALT</span>
                    <span>{activeMilestone.alt.split('·')[0].trim()}</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg hud-well text-slate-100">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-slate-400 mr-1.5">VEL</span>
                    <span>{activeMilestone.speed}</span>
                  </div>
                </div>
              </div>
              <div className="hud-deck-rule" aria-hidden="true" />
            </div>

            <div className={`grid gap-1.5 ${milestones.length === 6 ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-5'}`}>
              {milestones.map((m, idx) => {
                const isActive = activeMilestone.id === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => handleJumpToMilestone(m.relTime)}
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

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300 tabular-nums w-12">
                {formatTime(relativeTime)}
              </span>
              <input
                type="range"
                min={0}
                max={videoDuration}
                step={0.1}
                value={relativeTime}
                onChange={(e) => handleScrub(parseFloat(e.target.value))}
                aria-label="Landing timeline scrubber"
                className="telemetry-range flex-1"
              />
              <span className="text-xs font-mono text-slate-400 tabular-nums w-12 text-right">
                {formatTime(videoDuration)}
              </span>
            </div>

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

                <IconButton
                  label={isMuted ? 'Unmute audio' : 'Mute audio'}
                  active={!isMuted}
                  onClick={() => {
                    soundFx.playClick();
                    const nextMuted = !isMuted;
                    setIsMuted(nextMuted);
                    if (videoRef.current) {
                      videoRef.current.muted = nextMuted;
                    }
                    audioManager.setDucking(!nextMuted && isPlaying, 'video');
                  }}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </IconButton>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  audioManager.setDucking(false, 'video');
                  soundFx.playSuccess();
                  onExploreTerrain();
                }}
                className={deploySpotlight.className}
              >
                <span className="font-orbitron text-[11px] tracking-[0.06em] uppercase">
                  {primaryCtaLabel}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className={`p-4 sm:p-5 rounded-2xl hud-card hud-card-featured tabular-nums space-y-3 text-left ${telemetrySpotlight.className}`}>
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div className="min-w-0 space-y-0.5">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--accent-text)] block">
                    ASTRAVEX //{' '}
                    {isDeepSpace
                      ? `COMMISSIONING · ${resolvedMissionLabel.toUpperCase()}`
                      : isOrbiter
                        ? `ORBIT INSERTION · ${resolvedMissionLabel.toUpperCase()}`
                        : `3D DESCENT · ${resolvedMissionLabel.toUpperCase()}`}
                  </span>
                  <h2 className="font-orbitron text-base font-bold tracking-[0.04em] uppercase text-white truncate">
                    {activeSimPhase?.title || `Phase ${simStep + 1} of 5`}
                  </h2>
                  {activeSimPhase?.desc && (
                    <p className="text-xs text-slate-300/90 mt-0.5 line-clamp-2">
                      {activeSimPhase.desc}
                    </p>
                  )}
                </div>

                {'alt' in activeSimPhase && activeSimPhase.alt ? (
                  <div className="flex items-center gap-1.5 flex-shrink-0 font-mono text-[11px]">
                    <div className="px-2.5 py-1 rounded-lg hud-well text-slate-100">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-slate-400 mr-1.5">ALT</span>
                      <span>{activeSimPhase.alt}</span>
                    </div>
                    {'speed' in activeSimPhase && activeSimPhase.speed && (
                      <div className="px-2.5 py-1 rounded-lg hud-well text-slate-100">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-400 mr-1.5">VEL</span>
                        <span>{activeSimPhase.speed}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400 shrink-0">
                    Drag to inspect 3D spacecraft
                  </span>
                )}
              </div>
              <div className="hud-deck-rule" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {activeSimPhaseList.map((p, idx) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => {
                    setIsSimPlaying(false);
                    handleAdvanceSimStep(idx);
                  }}
                  className={`px-2.5 py-2 rounded-xl text-left text-xs cursor-pointer truncate hud-row-card ${
                    simStep === idx
                      ? '!bg-[var(--accent-surface)] !border-[var(--accent-border)] text-white shadow-[0_6px_18px_-6px_var(--accent-border)] font-medium'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`font-mono text-[10px] tabular-nums ${simStep === idx ? 'text-[var(--accent-text)]' : 'text-slate-500'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-orbitron text-[10px] tracking-[0.04em] uppercase">
                      Phase
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <IconButton
                  label={isSimPlaying ? 'Pause sequence' : 'Auto-play sequence'}
                  active={isSimPlaying}
                  onClick={() => {
                    soundFx.playClick();
                    if (!isSimPlaying && simStep >= 4) {
                      setSimStep(0);
                    }
                    setIsSimPlaying((p) => !p);
                  }}
                >
                  {isSimPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </IconButton>

                <Button
                  variant="secondary"
                  size="md"
                  disabled={simStep === 0}
                  onClick={() => {
                    setIsSimPlaying(false);
                    handleAdvanceSimStep(Math.max(0, simStep - 1));
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={simStep === 4}
                  onClick={() => {
                    setIsSimPlaying(false);
                    handleAdvanceSimStep(Math.min(4, simStep + 1));
                  }}
                >
                  Next phase
                </Button>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  audioManager.setDucking(false, 'video');
                  soundFx.playSuccess();
                  onExploreTerrain();
                }}
                className={deploySpotlight.className}
              >
                <span className="font-orbitron text-[11px] tracking-[0.06em] uppercase">
                  {primaryCtaLabel}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

useGLTF.preload('/models/perseverance.glb', '/draco/');
useGLTF.preload('/models/apollo_lunar_module.glb', '/draco/');
useGLTF.preload('/models/earth.glb', '/draco/');

export { LandingScene as LandingPage };
export default LandingScene;
