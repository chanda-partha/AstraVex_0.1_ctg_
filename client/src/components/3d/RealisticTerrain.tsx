import React, { useMemo } from 'react';
import * as THREE from 'three';

// Procedural multi-frequency fractal noise
function fbmNoise(x: number, y: number): number {
  let val = 0;
  let amp = 0.5;
  let fx = x;
  let fy = y;
  for (let i = 0; i < 4; i++) {
    val += (Math.sin(fx) * Math.cos(fy) * 0.5 + 0.5) * amp;
    fx = fx * 2.15 + 1.2;
    fy = fy * 2.05 + 0.8;
    amp *= 0.48;
  }
  return val;
}

// Continuous 2D noise generator for realistic terrain displacement
function smoothNoise(x: number, z: number): number {
  return (
    Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.1 +
    Math.sin(x * 0.22 + 1.4) * Math.cos(z * 0.25 + 0.6) * 0.55 +
    Math.sin(x * 0.65) * Math.sin(z * 0.55) * 0.22 +
    Math.sin(x * 1.8 + z * 1.5) * 0.07
  );
}

// Generate photorealistic Martian regolith diffuse & bump maps (Calibrated to NASA Mastcam-Z)
function createMarsPBRTextures(): { diffuse: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const width = 1024;
  const height = 1024;

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  const diffImg = diffCtx.createImageData(width, height);
  const bumpImg = bumpCtx.createImageData(width, height);
  const dData = diffImg.data;
  const bData = bumpImg.data;

  // Calibrated Jezero Crater palette (Deep Basalt to Sunlit Ferric Ochre)
  // Deep Basalt / shadow crevices: [68, 28, 18]
  // Rich Ferric Oxide substrate: [136, 52, 28]
  // Aeolian Sand Dune body: [186, 82, 42]
  // Sunlit Mineral Crest: [218, 122, 68]
  // Pale silica dust / salt specks: [240, 160, 105]

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;

      // 1. Primary macro sand waves
      const macroDune = Math.sin(nx * 14 + ny * 7) * 0.5 + 0.5;

      // 2. High-frequency directional wind ripples (35-degree angle)
      const rippleCoord = (nx * 55 + ny * 35) * Math.PI;
      const ripple = Math.sin(rippleCoord);
      const sharpRipple = Math.pow(Math.abs(ripple), 0.75) * (ripple > 0 ? 1 : 0.2);

      // 3. Multi-octave regolith fractal grain
      const grain = fbmNoise(nx * 40, ny * 40);

      // 4. Cellular pebbles and basalt grit
      const cellX = (nx * 90) % 1;
      const cellY = (ny * 90) % 1;
      const cellDist = Math.sqrt((cellX - 0.5) ** 2 + (cellY - 0.5) ** 2);
      const pebble = cellDist < 0.2 ? (1 - cellDist / 0.2) * 0.4 : 0;

      // 5. Micro noise for realistic soil texture
      const microGrit = ((x * 13 + y * 37) % 17) / 17 * 0.15;

      // Combined height factor for relief and bump mapping
      const heightVal = macroDune * 0.35 + sharpRipple * 0.35 + grain * 0.2 + pebble + microGrit;
      const clampedH = Math.max(0, Math.min(1, heightVal));

      // Color blending across Jezero Crater tonal strata
      let r: number, g: number, b: number;
      if (clampedH < 0.35) {
        // Deep basaltic shadows
        const t = clampedH / 0.35;
        r = 68 + t * (136 - 68);
        g = 28 + t * (52 - 28);
        b = 18 + t * (28 - 18);
      } else if (clampedH < 0.7) {
        // Rich oxidized terra-cotta sand
        const t = (clampedH - 0.35) / 0.35;
        r = 136 + t * (195 - 136);
        g = 52 + t * (88 - 52);
        b = 28 + t * (45 - 28);
      } else {
        // Sunlit ripple crests and mineral dust
        const t = (clampedH - 0.7) / 0.3;
        r = 195 + t * (228 - 195);
        g = 88 + t * (125 - 88);
        b = 45 + t * (72 - 45);
      }

      // Add dark basalt sand grains and tiny bright silica specks
      if ((x * 7 + y * 13) % 29 === 0) {
        // Dark basalt grain
        r *= 0.65;
        g *= 0.65;
        b *= 0.65;
      } else if ((x * 19 + y * 23) % 43 === 0) {
        // Bright salt / quartz speck
        r = Math.min(255, r * 1.25);
        g = Math.min(255, g * 1.25);
        b = Math.min(255, b * 1.25);
      }

      const idx = (y * width + x) * 4;
      // Diffuse map
      dData[idx] = Math.floor(r);
      dData[idx + 1] = Math.floor(g);
      dData[idx + 2] = Math.floor(b);
      dData[idx + 3] = 255;

      // Bump map (Greyscale height relief for 3D light catching)
      const bumpIntensity = Math.floor(clampedH * 255);
      bData[idx] = bumpIntensity;
      bData[idx + 1] = bumpIntensity;
      bData[idx + 2] = bumpIntensity;
      bData[idx + 3] = 255;
    }
  }

  diffCtx.putImageData(diffImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);

  const diffTex = new THREE.CanvasTexture(diffCanvas);
  diffTex.wrapS = THREE.RepeatWrapping;
  diffTex.wrapT = THREE.RepeatWrapping;
  diffTex.repeat.set(16, 16);
  diffTex.colorSpace = THREE.SRGBColorSpace;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.repeat.set(16, 16);

  return { diffuse: diffTex, bump: bumpTex };
}

// Generate photorealistic Lunar regolith diffuse & bump maps
function createMoonPBRTextures(): { diffuse: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const width = 1024;
  const height = 1024;

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  const diffImg = diffCtx.createImageData(width, height);
  const bumpImg = bumpCtx.createImageData(width, height);
  const dData = diffImg.data;
  const bData = bumpImg.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;

      const mareNoise = Math.sin(nx * 16 + ny * 16) * 0.5 + 0.5;
      const grain = fbmNoise(nx * 36, ny * 36);
      const microGrit = ((x * 17 + y * 31) % 19) / 19 * 0.15;

      const heightVal = mareNoise * 0.4 + grain * 0.4 + microGrit * 0.2;
      const gray = Math.floor(75 + heightVal * 105);

      const idx = (y * width + x) * 4;
      dData[idx] = gray;
      dData[idx + 1] = gray;
      dData[idx + 2] = Math.floor(gray * 1.02);
      dData[idx + 3] = 255;

      const bumpIntensity = Math.floor(heightVal * 255);
      bData[idx] = bumpIntensity;
      bData[idx + 1] = bumpIntensity;
      bData[idx + 2] = bumpIntensity;
      bData[idx + 3] = 255;
    }
  }

  diffCtx.putImageData(diffImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);

  const diffTex = new THREE.CanvasTexture(diffCanvas);
  diffTex.wrapS = THREE.RepeatWrapping;
  diffTex.wrapT = THREE.RepeatWrapping;
  diffTex.repeat.set(16, 16);
  diffTex.colorSpace = THREE.SRGBColorSpace;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.repeat.set(16, 16);

  return { diffuse: diffTex, bump: bumpTex };
}

let cachedMarsPBR: { diffuse: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null = null;
let cachedMoonPBR: { diffuse: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null = null;

interface RealisticTerrainProps {
  isMars: boolean;
}

export const RealisticTerrain: React.FC<RealisticTerrainProps> = ({ isMars }) => {
  const pbrTextures = useMemo(() => {
    if (isMars) {
      if (!cachedMarsPBR) cachedMarsPBR = createMarsPBRTextures();
      return cachedMarsPBR;
    } else {
      if (!cachedMoonPBR) cachedMoonPBR = createMoonPBRTextures();
      return cachedMoonPBR;
    }
  }, [isMars]);

  // Wide 140x140 explorable terrain geometry with natural Martian delta slopes
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(140, 140, 160, 160);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      let height = smoothNoise(x, y);

      // Smooth central clearing under the hardware spawn
      const distFromCenter = Math.sqrt(x * x + y * y);
      if (distFromCenter < 4.0) {
        height *= (distFromCenter / 4.0) * 0.25;
      }

      // Distant rolling crater rim or Martian delta ridges
      if (distFromCenter > 22) {
        height += (distFromCenter - 22) * 0.22 + Math.sin(x * 0.12) * 1.5;
      }

      pos.setZ(i, height);
    }
    geo.computeVertexNormals();
    return geo;
  }, [isMars]);

  // Scatter realistic basalt boulders and gravel clusters
  const rocks = useMemo(() => {
    const items: Array<{
      id: string;
      pos: [number, number, number];
      scale: [number, number, number];
      rot: [number, number, number];
      geoIndex: number;
      tint: string;
    }> = [];

    const numRocks = 78;
    for (let i = 0; i < numRocks; i++) {
      const angle = (i / numRocks) * Math.PI * 2 + (i % 7) * 0.8;
      const radius = 3.8 + ((i * 1.7) % 52);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Keep clear workspace right at spawn
      if (Math.abs(x) < 2.5 && Math.abs(z) < 2.5) continue;

      const y = smoothNoise(x, z) - 0.52;
      const scaleBase = 0.12 + (i % 9) * 0.07;

      // Color variation: dark basalt iron rock vs weathered ochre stone
      const tints = isMars
        ? ['#4a2118', '#381a13', '#682d1c', '#2c150f', '#54261a']
        : ['#2e3846', '#1e293b', '#475569', '#334155'];
      const tint = tints[i % tints.length];

      items.push({
        id: `rock-${i}`,
        pos: [x, y, z],
        scale: [scaleBase * (1.1 + (i % 3) * 0.2), scaleBase * 0.7, scaleBase * (0.9 + (i % 2) * 0.3)],
        rot: [(i * 0.45) % Math.PI, (i * 0.78) % Math.PI, (i * 0.32) % Math.PI],
        geoIndex: i % 4,
        tint,
      });
    }
    return items;
  }, [isMars]);

  return (
    <group position={[0, -0.6, 0]}>
      {/* Primary Realistic PBR Regolith Mesh with Bump Relief */}
      <mesh
        geometry={terrainGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          map={pbrTextures.diffuse}
          bumpMap={pbrTextures.bump}
          bumpScale={isMars ? 0.075 : 0.05}
          roughness={0.92}
          metalness={0.06}
          color="#ffffff"
        />
      </mesh>

      {/* Realistic Scattered Martian / Lunar Boulders */}
      {rocks.map((rock) => (
        <mesh
          key={rock.id}
          position={rock.pos}
          rotation={rock.rot}
          scale={rock.scale}
          castShadow
          receiveShadow
        >
          {rock.geoIndex === 0 && <dodecahedronGeometry args={[1, 1]} />}
          {rock.geoIndex === 1 && <icosahedronGeometry args={[1, 0]} />}
          {rock.geoIndex === 2 && <boxGeometry args={[1.2, 0.75, 1.0]} />}
          {rock.geoIndex === 3 && <octahedronGeometry args={[1, 1]} />}

          <meshStandardMaterial
            color={rock.tint}
            roughness={0.95}
            metalness={0.08}
          />
        </mesh>
      ))}

      {/* Distant Crater Rim Horizon Cylinder */}
      <mesh position={[0, 8, 0]}>
        <cylinderGeometry args={[75, 75, 26, 48, 1, true]} />
        <meshStandardMaterial
          color={isMars ? '#481c12' : '#182030'}
          side={THREE.BackSide}
          roughness={1.0}
        />
      </mesh>
    </group>
  );
};
