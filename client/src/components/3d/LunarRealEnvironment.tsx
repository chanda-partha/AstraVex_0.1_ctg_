import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// 1. FAST DETERMINISTIC HASH & SEAMLESS 2D FBM NOISE FOR LUNAR REGOLITH
// ============================================================================
function hash2(ix: number, iy: number, seed: number): number {
  let n = (ix * 374761393 + iy * 668265263 + seed * 1442695041) | 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  n = n ^ (n >>> 16);
  return (n >>> 0) / 4294967295;
}

function tileableValueNoise(u: number, v: number, period: number, seed: number): number {
  const x = u * period;
  const y = v * period;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const wx0 = ((x0 % period) + period) % period;
  const wy0 = ((y0 % period) + period) % period;
  const wx1 = (wx0 + 1) % period;
  const wy1 = (wy0 + 1) % period;

  const n00 = hash2(wx0, wy0, seed);
  const n10 = hash2(wx1, wy0, seed);
  const n01 = hash2(wx0, wy1, seed);
  const n11 = hash2(wx1, wy1, seed);

  const nx0 = n00 + sx * (n10 - n00);
  const nx1 = n01 + sx * (n11 - n01);
  return nx0 + sy * (nx1 - nx0);
}

function tileableFbm(u: number, v: number, basePeriod: number, octaves: number, seed: number): number {
  let value = 0;
  let amp = 0.5;
  let norm = 0;
  let freq = basePeriod;
  for (let i = 0; i < octaves; i++) {
    value += tileableValueNoise(u, v, freq, seed + i * 97) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return value / norm;
}

function seededRand(state: { s: number }): number {
  state.s = (state.s * 1664525 + 1013904223) >>> 0;
  return state.s / 4294967295;
}

// ============================================================================
// 2. CACHED 1024x1024 LUNAR REGOLITH PBR TEXTURE SUITE (ALBEDO + NORMAL + ROUGHNESS)
// ============================================================================
export interface LunarPBRTextureSet {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  rockMap: THREE.CanvasTexture;
  rockNormalMap: THREE.CanvasTexture;
}

let cachedLunarPBR: LunarPBRTextureSet | null = null;

export function getLunarPBRTextures(): LunarPBRTextureSet {
  if (cachedLunarPBR) return cachedLunarPBR;

  const size = 512;
  const count = size * size;
  const heightField = new Float32Array(count);
  const ejectaBright = new Float32Array(count);
  const randState = { s: 20260720 };

  // Pass 1: Multi-scale seamless powdery regolith FBM base + soil ripples
  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const macro = tileableFbm(u, v, 8, 4, 11);
      const mid = tileableFbm(u + 0.17, v + 0.31, 32, 3, 29);
      const fine = tileableValueNoise(u, v, 128, 71);
      const micro = tileableValueNoise(u, v, 256, 131);

      const h = macro * 0.44 + mid * 0.30 + fine * 0.16 + micro * 0.10;
      heightField[y * size + x] = h;
    }
  }

  // Pass 2: Stamp 260 wrap-around micro-impact craters into the tile heightfield
  // Gives real Apollo close-up pitted soil & dimpled micro-topography
  const scaleRatio = size / 1024;
  const numMicroCraters = 260;
  for (let c = 0; c < numMicroCraters; c++) {
    const cx = seededRand(randState) * size;
    const cy = seededRand(randState) * size;
    const radiusBias = seededRand(randState);
    // Mix of tiny pits and secondary craters scaled proportionally to texture resolution
    const cr = (4 + Math.pow(radiusBias, 2.4) * 44) * scaleRatio;
    const depth = (0.14 + seededRand(randState) * 0.24) * Math.min(1.3, (4 + Math.pow(radiusBias, 2.4) * 44) / 14);
    const outerR = cr * 1.55;
    const minX = Math.floor(cx - outerR);
    const maxX = Math.ceil(cx + outerR);
    const minY = Math.floor(cy - outerR);
    const maxY = Math.ceil(cy + outerR);
    const isFreshRayed = seededRand(randState) > 0.62;

    for (let py = minY; py <= maxY; py++) {
      const dy = py - cy;
      const wy = ((py % size) + size) % size;
      const rowOffset = wy * size;
      for (let px = minX; px <= maxX; px++) {
        const dx = px - cx;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= outerR) continue;

        const wx = ((px % size) + size) % size;
        const idx = rowOffset + wx;
        const rNorm = dist / cr;

        if (rNorm < 1.0) {
          // Smooth parabolic impact bowl with slight flat central floor
          const bowl = (1.0 - rNorm * rNorm) * depth;
          heightField[idx] -= bowl * 0.85;
          // Raised sharp inner rim at rNorm 0.82..1.0
          if (rNorm > 0.78) {
            const t = (rNorm - 0.78) / 0.22;
            const rimProfile = Math.sin(t * Math.PI * 0.5) * depth * 0.30;
            heightField[idx] += rimProfile;
            if (isFreshRayed) ejectaBright[idx] += 0.14 * t;
          }
        } else {
          // Outer ejecta apron slope + ray brightening
          const outT = (rNorm - 1.0) / 0.55;
          const apron = (1.0 - outT) * (1.0 - outT) * depth * 0.28;
          heightField[idx] += apron;
          if (isFreshRayed) {
            ejectaBright[idx] += (1.0 - outT) * 0.16;
          }
        }
      }
    }
  }

  // Pass 3: Build Albedo, Roughness, Bump, and Tangent-Space Normal canvases
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const albedoCtx = albedoCanvas.getContext('2d')!;
  const albedoImg = albedoCtx.createImageData(size, size);

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const normalCtx = normalCanvas.getContext('2d')!;
  const normalImg = normalCtx.createImageData(size, size);

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const roughCtx = roughCanvas.getContext('2d')!;
  const roughImg = roughCtx.createImageData(size, size);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext('2d')!;
  const bumpImg = bumpCtx.createImageData(size, size);

  const aData = albedoImg.data;
  const nData = normalImg.data;
  const rData = roughImg.data;
  const bData = bumpImg.data;

  const normalStrength = 4.2;

  for (let y = 0; y < size; y++) {
    const ym1 = (y - 1 + size) % size;
    const yp1 = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xm1 = (x - 1 + size) % size;
      const xp1 = (x + 1) % size;
      const idx = y * size + x;
      const pIdx = idx * 4;

      const h = heightField[idx];
      const hL = heightField[y * size + xm1];
      const hR = heightField[y * size + xp1];
      const hU = heightField[ym1 * size + x];
      const hD = heightField[yp1 * size + x];

      // Multi-tap finite difference normal
      const dx = (hR - hL) * normalStrength;
      const dy = (hD - hU) * normalStrength;
      const nx = -dx;
      const ny = -dy;
      const nz = 1.0;
      const invLen = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);

      nData[pIdx] = Math.round(((nx * invLen) * 0.5 + 0.5) * 255);
      nData[pIdx + 1] = Math.round(((ny * invLen) * 0.5 + 0.5) * 255);
      nData[pIdx + 2] = Math.round(((nz * invLen) * 0.5 + 0.5) * 255);
      nData[pIdx + 3] = 255;

      // Authentic Apollo lunar regolith luminance (warm neutral basaltic/anorthositic grey)
      const normH = Math.max(0, Math.min(1, h * 0.85 + 0.1));
      const grainNoise = hash2(x, y, 503);
      const speck =
        grainNoise > 0.985
          ? 24 // Bright feldspar / anorthosite crystal fleck
          : grainNoise < 0.03
            ? -18 // Dark glassy basalt / ilmenite clod
            : (grainNoise - 0.5) * 14;

      // Base lunar albedo: ~95..172 (realistic photographic Moon grey with slight warm mineral bias)
      const baseLum =
        86 +
        normH * 68 +
        Math.min(0.28, ejectaBright[idx]) * 115 +
        speck;

      const r = Math.max(42, Math.min(225, baseLum * 1.015));
      const g = Math.max(42, Math.min(222, baseLum * 1.00));
      const b = Math.max(40, Math.min(218, baseLum * 0.975));

      aData[pIdx] = r;
      aData[pIdx + 1] = g;
      aData[pIdx + 2] = b;
      aData[pIdx + 3] = 255;

      const bumpByte = Math.max(0, Math.min(255, Math.round(normH * 255)));
      bData[pIdx] = bumpByte;
      bData[pIdx + 1] = bumpByte;
      bData[pIdx + 2] = bumpByte;
      bData[pIdx + 3] = 255;

      // Fine regolith dust is matte (225-248), exposed rock rims slightly less rough (195-220)
      const roughByte = Math.max(190, Math.min(250, Math.round(244 - normH * 30 - (grainNoise > 0.98 ? 18 : 0))));
      rData[pIdx] = roughByte;
      rData[pIdx + 1] = roughByte;
      rData[pIdx + 2] = roughByte;
      rData[pIdx + 3] = 255;
    }
  }

  albedoCtx.putImageData(albedoImg, 0, 0);
  normalCtx.putImageData(normalImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);

  const map = new THREE.CanvasTexture(albedoCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(22, 22);
  map.anisotropy = 8;
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(22, 22);
  normalMap.anisotropy = 8;
  normalMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(22, 22);
  roughnessMap.anisotropy = 4;
  roughnessMap.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(22, 22);
  bumpMap.needsUpdate = true;

  // Also create a dedicated 512x512 Vesicular Basalt & Breccia Rock Texture Set
  const rockSize = 512;
  const rHeight = new Float32Array(rockSize * rockSize);
  for (let y = 0; y < rockSize; y++) {
    const v = y / rockSize;
    for (let x = 0; x < rockSize; x++) {
      const u = x / rockSize;
      const crack = Math.abs(tileableFbm(u, v, 6, 4, 809) - 0.5) * 2.0;
      const pit = tileableValueNoise(u, v, 96, 911);
      rHeight[y * rockSize + x] = crack * 0.65 + pit * 0.35;
    }
  }

  const rockAlbedoCanvas = document.createElement('canvas');
  rockAlbedoCanvas.width = rockSize;
  rockAlbedoCanvas.height = rockSize;
  const rAlbedoCtx = rockAlbedoCanvas.getContext('2d')!;
  const rAlbedoImg = rAlbedoCtx.createImageData(rockSize, rockSize);

  const rockNormalCanvas = document.createElement('canvas');
  rockNormalCanvas.width = rockSize;
  rockNormalCanvas.height = rockSize;
  const rNormalCtx = rockNormalCanvas.getContext('2d')!;
  const rNormalImg = rNormalCtx.createImageData(rockSize, rockSize);

  for (let y = 0; y < rockSize; y++) {
    const ym1 = (y - 1 + rockSize) % rockSize;
    const yp1 = (y + 1) % rockSize;
    for (let x = 0; x < rockSize; x++) {
      const xm1 = (x - 1 + rockSize) % rockSize;
      const xp1 = (x + 1) % rockSize;
      const idx = y * rockSize + x;
      const pIdx = idx * 4;
      const rh = rHeight[idx];
      const ddx = (rHeight[y * rockSize + xp1] - rHeight[y * rockSize + xm1]) * 3.5;
      const ddy = (rHeight[yp1 * rockSize + x] - rHeight[ym1 * rockSize + x]) * 3.5;
      const invL = 1 / Math.sqrt(ddx * ddx + ddy * ddy + 1);

      rNormalImg.data[pIdx] = Math.round(((-ddx * invL) * 0.5 + 0.5) * 255);
      rNormalImg.data[pIdx + 1] = Math.round(((-ddy * invL) * 0.5 + 0.5) * 255);
      rNormalImg.data[pIdx + 2] = Math.round(((invL) * 0.5 + 0.5) * 255);
      rNormalImg.data[pIdx + 3] = 255;

      const fleck = hash2(x, y, 773) > 0.96 ? 26 : 0;
      const lum = Math.min(210, 68 + rh * 82 + fleck);
      rAlbedoImg.data[pIdx] = lum;
      rAlbedoImg.data[pIdx + 1] = lum * 0.99;
      rAlbedoImg.data[pIdx + 2] = lum * 0.96;
      rAlbedoImg.data[pIdx + 3] = 255;
    }
  }
  rAlbedoCtx.putImageData(rAlbedoImg, 0, 0);
  rNormalCtx.putImageData(rNormalImg, 0, 0);

  const rockMap = new THREE.CanvasTexture(rockAlbedoCanvas);
  rockMap.wrapS = THREE.RepeatWrapping;
  rockMap.wrapT = THREE.RepeatWrapping;
  rockMap.colorSpace = THREE.SRGBColorSpace;
  rockMap.needsUpdate = true;

  const rockNormalMap = new THREE.CanvasTexture(rockNormalCanvas);
  rockNormalMap.wrapS = THREE.RepeatWrapping;
  rockNormalMap.wrapT = THREE.RepeatWrapping;
  rockNormalMap.needsUpdate = true;

  cachedLunarPBR = {
    map,
    normalMap,
    roughnessMap,
    bumpMap,
    rockMap,
    rockNormalMap,
  };
  return cachedLunarPBR;
}

// ============================================================================
// 3. DETERMINISTIC MULTI-SCALE 3D LUNAR CRATER & HEIGHTFIELD CATALOG
// ============================================================================
interface LunarCraterSpec {
  x: number;
  z: number;
  r: number;
  depth: number;
}

const LUNAR_3D_CRATERS: LunarCraterSpec[] = [
  // Foreground small crisp impact craters (keep r < 3.4m landing zone clear)
  { x: -6.8, z: -4.2, r: 2.1, depth: 0.34 },
  { x: 5.9, z: 4.6, r: 1.8, depth: 0.28 },
  { x: -4.8, z: 6.4, r: 2.4, depth: 0.38 },
  { x: 7.4, z: -6.2, r: 2.9, depth: 0.46 },
  { x: -9.5, z: 2.5, r: 1.9, depth: 0.30 },
  { x: 2.8, z: -8.8, r: 2.2, depth: 0.35 },
  { x: 10.6, z: 1.8, r: 3.1, depth: 0.48 },
  { x: -1.6, z: 10.2, r: 2.6, depth: 0.42 },

  // Mid-ground craters with prominent ejecta rims (12m - 38m)
  { x: -16.5, z: -13.0, r: 6.5, depth: 1.15 },
  { x: 18.0, z: -14.5, r: 8.2, depth: 1.45 },
  { x: -20.0, z: 15.5, r: 7.4, depth: 1.25 },
  { x: 21.5, z: 16.0, r: 9.0, depth: 1.55 },
  { x: 0.5, z: -22.0, r: 5.8, depth: 1.0 },
  { x: -25.0, z: -2.0, r: 6.2, depth: 1.1 },
  { x: 26.5, z: 3.5, r: 5.4, depth: 0.92 },
  { x: 4.0, z: 24.5, r: 6.8, depth: 1.2 },
  { x: -12.0, z: -26.0, r: 4.5, depth: 0.8 },
  { x: 13.5, z: 28.0, r: 5.0, depth: 0.88 },

  // Outer mare basins (35m - 68m)
  { x: -42.0, z: -32.0, r: 14.5, depth: 2.4 },
  { x: 44.0, z: -36.0, r: 16.0, depth: 2.6 },
  { x: -46.0, z: 34.0, r: 13.0, depth: 2.2 },
  { x: 38.0, z: 42.0, r: 15.0, depth: 2.5 },
  { x: 2.0, z: -50.0, r: 12.5, depth: 2.0 },
  { x: -55.0, z: 4.0, r: 14.0, depth: 2.3 },
  { x: 54.0, z: -6.0, r: 11.5, depth: 1.9 },
  { x: -8.0, z: 52.0, r: 13.5, depth: 2.1 },
];

export function sampleLunarTerrainHeight(x: number, z: number): {
  height: number;
  rimHighlight: number;
  bowlShade: number;
} {
  const distFromCenter = Math.hypot(x, z);

  // Smooth level exploration apron around surface hardware at (0, 0) (r < 5.6m flat, blends to 10.5m)
  const plateauFactor =
    distFromCenter < 5.6
      ? 0
      : distFromCenter < 10.5
        ? (() => {
            const t = (distFromCenter - 5.6) / 4.9;
            return t * t * (3 - 2 * t);
          })()
        : 1;

  // Non-periodic multi-directional mare regolith undulations
  let h =
    Math.sin(x * 0.045 + z * 0.021) * 0.42 +
    Math.cos(z * 0.052 - x * 0.031) * 0.36 +
    Math.sin(x * 0.13 - z * 0.11 + 1.4) * 0.18 +
    Math.cos(x * 0.27 + z * 0.24 + 0.7) * 0.08 +
    Math.sin(x * 0.62 - z * 0.58) * 0.025;

  let rimHighlight = 0;
  let bowlShade = 0;

  for (let i = 0; i < LUNAR_3D_CRATERS.length; i++) {
    const c = LUNAR_3D_CRATERS[i];
    const d = Math.hypot(x - c.x, z - c.z);
    if (d < c.r * 1.65) {
      const n = d / c.r;
      if (n < 1.0) {
        // Parabolic / flat-floored crater cavity
        const cavity = Math.pow(1.0 - n * n, 0.85) * c.depth;
        h -= cavity;
        bowlShade = Math.max(bowlShade, (1.0 - n * 0.7) * 0.22);

        if (n > 0.78) {
          const rimT = (n - 0.78) / 0.22;
          const crest = Math.sin(rimT * Math.PI * 0.5) * (c.depth * 0.28);
          h += crest;
          rimHighlight = Math.max(rimHighlight, rimT * 0.18);
        }
      } else {
        // Outer ejecta blanket slope
        const outT = (n - 1.0) / 0.65;
        const skirt = (1.0 - outT) * (1.0 - outT) * (c.depth * 0.28);
        h += skirt;
        rimHighlight = Math.max(rimHighlight, (1.0 - outT) * 0.15);
      }
    }
  }

  // Enforce strictly level showcase pad inside r < 5.6m so zero terrain geometry overlaps hardware
  h *= plateauFactor;

  // Gentle planetary mare basin rise into distant Apennine lunar hills (r = 55..82m)
  if (distFromCenter > 48) {
    const angle = Math.atan2(z, x);
    const rangeFactor = Math.min(1, (distFromCenter - 48) / 32);
    const massif =
      (Math.sin(angle * 3.0 + 0.5) * 0.45 +
        Math.sin(angle * 7.0 - 1.2) * 0.30 +
        Math.cos(angle * 13.0 + 2.1) * 0.15 +
        0.55) *
      rangeFactor *
      rangeFactor *
      5.2;
    h += massif;
  }

  return { height: h, rimHighlight, bowlShade };
}

// ============================================================================
// 4. DISTANT EARTH IN THE AIRLESS BLACK LUNAR SKY
// ============================================================================
function DistantEarthInLunarSky() {
  const earthRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/earth.glb', '/draco/');

  const { clonedEarth, clonedMaterials } = useMemo(() => {
    const c = scene.clone(true);
    const toRemove: THREE.Object3D[] = [];
    const mats: THREE.Material[] = [];

    c.traverse((node) => {
      if (node.type.includes('Camera') || node.type.includes('Light')) {
        toRemove.push(node);
      }
    });
    toRemove.forEach((obj) => obj.parent?.remove(obj));

    c.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        if (mesh.material) {
          const origList = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const nextList = origList.map((orig) => {
            const m = orig.clone();
            const std = m as THREE.MeshStandardMaterial;
            if (std.map) {
              std.map.colorSpace = THREE.SRGBColorSpace;
              std.map.needsUpdate = true;
            }
            m.needsUpdate = true;
            mats.push(m);
            return m;
          });
          mesh.material = Array.isArray(mesh.material) ? nextList : nextList[0];
        }
      }
    });

    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scale = 2.6 / maxDim;
      c.scale.set(scale, scale, scale);
    }
    return { clonedEarth: c, clonedMaterials: mats };
  }, [scene]);

  useEffect(() => {
    return () => {
      clonedMaterials.forEach((m) => m.dispose());
    };
  }, [clonedMaterials]);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += Math.min(delta, 0.1) * 0.035;
    }
  });

  return (
    <group position={[22, 20, -34]}>
      <group ref={earthRef} rotation={[0.42, 0.2, 0.25]}>
        <primitive object={clonedEarth} />
      </group>
      <mesh scale={[1.34, 1.34, 1.34]}>
        <sphereGeometry args={[1.25, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.14}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight color="#60a5fa" intensity={1.5} distance={10} />
    </group>
  );
}

// ============================================================================
// 5. SCULPTED VESICULAR BASALT BOULDERS + INSTANCED REGOLITH COBBLES
// ============================================================================
function createSculptedRockGeometry(seedOffset: number): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const dir = v.clone().normalize();
    // Fracture planes & ridge displacement (authentic broken basalt breccia silhouette)
    const ridge1 = Math.sin(dir.x * 3.8 + dir.y * 2.7 + seedOffset) * 0.18;
    const ridge2 = Math.cos(dir.z * 4.5 - dir.x * 2.1 + seedOffset * 1.7) * 0.14;
    const ridge3 = Math.sin(dir.y * 6.2 + dir.z * 5.4 + seedOffset * 2.3) * 0.07;
    const flattenBottom = dir.y < -0.25 ? 0.72 : 1.0;
    const disp = (1.0 + ridge1 + ridge2 + ridge3) * flattenBottom;
    v.multiplyScalar(disp);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

function LunarRocksAndCobbles() {
  const textures = useMemo(() => getLunarPBRTextures(), []);
  const cobbleMeshRef = useRef<THREE.InstancedMesh>(null);
  const rockNormalScale = useMemo(() => new THREE.Vector2(1.1, 1.1), []);

  const rockGeometries = useMemo(
    () => [
      createSculptedRockGeometry(1.1),
      createSculptedRockGeometry(3.7),
      createSculptedRockGeometry(7.3),
      createSculptedRockGeometry(11.9),
    ],
    []
  );

  useEffect(() => {
    return () => {
      rockGeometries.forEach((g) => g.dispose());
    };
  }, [rockGeometries]);

  const boulders = useMemo(() => {
    const specs = [
      { x: 5.9, z: -3.5, sx: 0.42, sy: 0.24, sz: 0.36, ry: 0.6, geoIdx: 0 },
      { x: -6.2, z: 2.9, sx: 0.52, sy: 0.30, sz: 0.44, ry: -0.4, geoIdx: 1 },
      { x: 6.4, z: 4.6, sx: 0.65, sy: 0.34, sz: 0.52, ry: 1.1, geoIdx: 2 },
      { x: -5.2, z: -5.4, sx: 0.46, sy: 0.25, sz: 0.42, ry: -1.2, geoIdx: 3 },
      { x: 2.8, z: 6.8, sx: 0.32, sy: 0.19, sz: 0.28, ry: 0.4, geoIdx: 0 },
      { x: -7.2, z: -1.9, sx: 0.74, sy: 0.40, sz: 0.62, ry: 2.1, geoIdx: 1 },
      { x: 8.6, z: -5.4, sx: 0.85, sy: 0.46, sz: 0.72, ry: -0.8, geoIdx: 2 },
      { x: -3.4, z: 6.4, sx: 0.36, sy: 0.22, sz: 0.32, ry: 1.5, geoIdx: 3 },
      { x: 11.4, z: 6.8, sx: 0.96, sy: 0.52, sz: 0.80, ry: 0.3, geoIdx: 0 },
      { x: -11.2, z: -7.6, sx: 1.05, sy: 0.56, sz: 0.88, ry: -1.9, geoIdx: 1 },
      { x: 14.5, z: -10.8, sx: 1.15, sy: 0.62, sz: 0.94, ry: 0.9, geoIdx: 2 },
      { x: -14.8, z: 11.2, sx: 1.25, sy: 0.66, sz: 1.02, ry: 2.6, geoIdx: 3 },
      { x: 4.5, z: -12.6, sx: 0.78, sy: 0.42, sz: 0.66, ry: -0.3, geoIdx: 0 },
      { x: -9.2, z: 8.9, sx: 0.68, sy: 0.36, sz: 0.58, ry: 1.8, geoIdx: 1 },
      { x: 17.8, z: 9.2, sx: 1.10, sy: 0.58, sz: 0.92, ry: -2.4, geoIdx: 2 },
      { x: -18.5, z: -16.4, sx: 1.40, sy: 0.72, sz: 1.15, ry: 0.7, geoIdx: 3 },
    ];
    return specs.map((s) => {
      const { height } = sampleLunarTerrainHeight(s.x, s.z);
      // Embed bottom 28% into the loose regolith so rocks never hover
      return {
        ...s,
        y: height + s.sy * 0.32,
      };
    });
  }, []);

  // Populate 180 instanced lunar pebbles & rock chips in 1 draw call
  const cobbleCount = 180;

  React.useLayoutEffect(() => {
    const mesh = cobbleMeshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const rand = { s: 19690720 };

    for (let i = 0; i < cobbleCount; i++) {
      const angle = seededRand(rand) * Math.PI * 2;
      const dist = 5.4 + Math.pow(seededRand(rand), 0.72) * 32;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const { height } = sampleLunarTerrainHeight(x, z);

      const sBase = 0.05 + Math.pow(seededRand(rand), 2.0) * 0.16;
      const sy = sBase * (0.45 + seededRand(rand) * 0.4);
      dummy.position.set(x, height + sy * 0.28, z);
      dummy.rotation.set(
        (seededRand(rand) - 0.5) * 0.4,
        seededRand(rand) * Math.PI * 2,
        (seededRand(rand) - 0.5) * 0.4
      );
      dummy.scale.set(sBase * (0.9 + seededRand(rand) * 0.5), sy, sBase * (0.9 + seededRand(rand) * 0.5));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      {/* Large & Medium Sculpted Lunar Basalt Boulders */}
      {boulders.map((rock, idx) => (
        <mesh
          key={`lunar-boulder-${idx}`}
          geometry={rockGeometries[rock.geoIdx]}
          position={[rock.x, rock.y, rock.z]}
          scale={[rock.sx, rock.sy, rock.sz]}
          rotation={[0.08 * Math.sin(idx), rock.ry, 0.06 * Math.cos(idx)]}
          castShadow
          receiveShadow
          raycast={() => null}
        >
          <meshStandardMaterial
            map={textures.rockMap}
            normalMap={textures.rockNormalMap}
            normalScale={rockNormalScale}
            color="#8e9198"
            roughness={0.92}
            metalness={0.04}
          />
        </mesh>
      ))}

      {/* Instanced Regolith Pebbles & Breccia Fragments (180 rocks, 1 draw call) */}
      <instancedMesh
        ref={cobbleMeshRef}
        args={[rockGeometries[0], undefined, cobbleCount]}
        castShadow
        receiveShadow
        raycast={() => null}
      >
        <meshStandardMaterial
          map={textures.rockMap}
          normalMap={textures.rockNormalMap}
          color="#9699a0"
          roughness={0.94}
          metalness={0.03}
        />
      </instancedMesh>
    </group>
  );
}

// ============================================================================
// 6. HIGH-RESOLUTION TEXTURED CRATERED LUNAR REGOLITH SURFACE + MASSIF HORIZON
// ============================================================================
function LunarCrateredTerrain() {
  const textures = useMemo(() => getLunarPBRTextures(), []);
  const terrainNormalScale = useMemo(() => new THREE.Vector2(1.45, 1.45), []);
  const horizonNormalScale = useMemo(() => new THREE.Vector2(0.8, 0.8), []);

  const terrainGeo = useMemo(() => {
    const size = 164;
    const segments = 176;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.hypot(x, z);

      const { height, rimHighlight, bowlShade } = sampleLunarTerrainHeight(x, z);
      pos.setY(i, height);

      // Macro geological mare/highland albedo mottling (breaks tiled texture repetition!)
      const mareMottle =
        Math.sin(x * 0.085 + 0.4) * Math.cos(z * 0.075 - 0.9) * 0.10 +
        Math.sin(x * 0.19 - z * 0.16) * 0.06;

      // Subtle exhaust blast radial scour & compacted pad shadow near (0, 0)
      const blastScour =
        dist < 5.5
          ? Math.sin(Math.atan2(z, x) * 14.0) * 0.045 * Math.max(0, 1 - dist / 5.5) -
            0.05 * Math.max(0, 1 - dist / 3.8)
          : 0;

      // Natural horizon curvature luminance roll-off past 64m so edge merges invisibly into black space
      const horizonFade =
        dist > 60
          ? Math.max(0.06, 1.0 - Math.pow((dist - 60) / 28, 1.45) * 0.94)
          : 1.0;

      const shade = Math.max(
        0.06,
        Math.min(1.22, (0.94 + mareMottle + rimHighlight - bowlShade + blastScour) * horizonFade)
      );

      colors[i * 3] = shade;
      colors[i * 3 + 1] = shade;
      colors[i * 3 + 2] = shade * 0.99;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Sculpted 360-degree Distant Lunar Apennine Horizon Silhouette Skirt
  const horizonGeo = useMemo(() => {
    const radialSegs = 12;
    const thetaSegs = 96;
    const geo = new THREE.RingGeometry(74, 158, thetaSegs, radialSegs);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.hypot(x, z);
      const angle = Math.atan2(z, x);
      const t = Math.max(0, Math.min(1, (r - 74) / 84));

      // World-space planar UVs matching main PlaneGeometry (164m) seamlessly
      uv.setXY(i, x / 164 + 0.5, z / 164 + 0.5);

      // Rolling Apollo Taurus-Littrow / Apennine mountains peaking around mid-ring, tapering down at infinity
      const mountainRidge =
        Math.sin(angle * 3.0 + 0.5) * 3.2 +
        Math.sin(angle * 7.0 - 1.2) * 2.1 +
        Math.cos(angle * 13.0 + 2.1) * 1.1 +
        Math.sin(angle * 23.0 + 0.7) * 0.45 +
        4.6;

      const archProfile = Math.sin(t * Math.PI) * mountainRidge;
      const horizonDrop = -t * t * 3.5;
      pos.setY(i, archProfile + horizonDrop);

      const lum = Math.max(0.0, (1.0 - Math.pow(t, 1.15)) * 0.42);
      colors[i * 3] = lum;
      colors[i * 3 + 1] = lum;
      colors[i * 3 + 2] = lum;
    }

    uv.needsUpdate = true;
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      terrainGeo.dispose();
      horizonGeo.dispose();
    };
  }, [terrainGeo, horizonGeo]);

  return (
    <group position={[0, -0.006, 0]}>
      {/* Main Photorealistic Textured Cratered Regolith Mesh */}
      <mesh geometry={terrainGeo} receiveShadow raycast={() => null}>
        <meshStandardMaterial
          map={textures.map}
          normalMap={textures.normalMap}
          normalScale={terrainNormalScale}
          roughnessMap={textures.roughnessMap}
          roughness={0.96}
          metalness={0.02}
          vertexColors
        />
      </mesh>

      {/* Distant 3D Lunar Mountain Rim fading smoothly into airless black space */}
      <mesh geometry={horizonGeo} position={[0, -0.1, 0]} receiveShadow raycast={() => null}>
        <meshStandardMaterial
          map={textures.map}
          normalMap={textures.normalMap}
          normalScale={horizonNormalScale}
          roughness={0.98}
          metalness={0.0}
          vertexColors
        />
      </mesh>
    </group>
  );
}

// ============================================================================
// 7. UNBLURRED SOLAR DISK ALIGNED WITH LUNAR KEY SUNLIGHT [24, 11.5, 18]
// ============================================================================
function VacuumSunMarker() {
  return (
    <group position={[72, 34.5, 54]}>
      <mesh>
        <sphereGeometry args={[2.1, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh scale={[1.45, 1.45, 1.45]}>
        <sphereGeometry args={[2.1, 32, 32]} />
        <meshBasicMaterial
          color="#fef9c3"
          transparent
          opacity={0.32}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ============================================================================
// 🌕 COMPLETE PHOTOREALISTIC LUNAR SURFACE ENVIRONMENT
// ============================================================================
export const LunarRealEnvironment: React.FC = () => {
  return (
    <group>
      {/* 1. Textured, normal-mapped, cratered lunar regolith + distant Apennine massif horizon */}
      <LunarCrateredTerrain />

      {/* 2. Sculpted vesicular basalt boulders + 180 instanced breccia pebbles */}
      <LunarRocksAndCobbles />

      {/* 3. Earth hanging in the airless black lunar sky */}
      <DistantEarthInLunarSky />

      {/* 4. Vacuum blazing Sun matching shadow angle */}
      <VacuumSunMarker />
    </group>
  );
};

export default LunarRealEnvironment;
