import * as THREE from 'three';

export interface SpaceHardwareTextureSuite {
  solarMap: THREE.CanvasTexture;
  solarBump: THREE.CanvasTexture;
  goldFoilMap: THREE.CanvasTexture;
  goldFoilNormal: THREE.CanvasTexture;
  silverFoilMap: THREE.CanvasTexture;
  silverFoilNormal: THREE.CanvasTexture;
  antennaMeshMap: THREE.CanvasTexture;
  antennaMeshBump: THREE.CanvasTexture;
  colorGnomonMap: THREE.CanvasTexture;
}

let cachedSuite: SpaceHardwareTextureSuite | null = null;

function hash2d(ix: number, iy: number, seed: number): number {
  let n = (ix * 374761393 + iy * 668265263 + seed * 1442695041) | 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  n = n ^ (n >>> 16);
  return (n >>> 0) / 4294967295;
}

function buildCrinkledFoilPair(
  kind: 'gold' | 'silver'
): { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture } {
  const size = 512;
  const hField = new Float32Array(size * size);

  // Overlapping multi-frequency diamond-like foil crinkle waves
  const waves = [
    { fx: 6, fy: 9, phase: 0.4, amp: 0.34 },
    { fx: -11, fy: 7, phase: 1.7, amp: 0.28 },
    { fx: 17, fy: -15, phase: 2.3, amp: 0.20 },
    { fx: 29, fy: 23, phase: 0.9, amp: 0.12 },
    { fx: -41, fy: 37, phase: 3.1, amp: 0.06 },
  ];

  for (let y = 0; y < size; y++) {
    const v = (y / size) * Math.PI * 2;
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 2;
      let val = 0;
      for (let w = 0; w < waves.length; w++) {
        const wave = waves[w];
        const s = Math.sin(u * wave.fx + v * wave.fy + wave.phase);
        // Absolute tent-fold ridge creates crisp Kapton blanket creases
        val += Math.abs(s) * wave.amp;
      }
      const micro = hash2d(x >> 1, y >> 1, kind === 'gold' ? 71 : 173) * 0.08;
      hField[y * size + x] = val + micro;
    }
  }

  const aCanvas = document.createElement('canvas');
  aCanvas.width = size;
  aCanvas.height = size;
  const aCtx = aCanvas.getContext('2d')!;
  const aImg = aCtx.createImageData(size, size);

  const nCanvas = document.createElement('canvas');
  nCanvas.width = size;
  nCanvas.height = size;
  const nCtx = nCanvas.getContext('2d')!;
  const nImg = nCtx.createImageData(size, size);

  const strength = 5.5;

  for (let y = 0; y < size; y++) {
    const ym1 = (y - 1 + size) % size;
    const yp1 = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xm1 = (x - 1 + size) % size;
      const xp1 = (x + 1) % size;
      const idx = y * size + x;
      const pIdx = idx * 4;

      const h = hField[idx];
      const dx = (hField[y * size + xp1] - hField[y * size + xm1]) * strength;
      const dy = (hField[yp1 * size + x] - hField[ym1 * size + x]) * strength;
      const nx = -dx;
      const ny = -dy;
      const nz = 1.0;
      const invLen = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);

      nImg.data[pIdx] = Math.round(((nx * invLen) * 0.5 + 0.5) * 255);
      nImg.data[pIdx + 1] = Math.round(((ny * invLen) * 0.5 + 0.5) * 255);
      nImg.data[pIdx + 2] = Math.round(((nz * invLen) * 0.5 + 0.5) * 255);
      nImg.data[pIdx + 3] = 255;

      const shade = Math.max(0.68, Math.min(1.18, 0.72 + h * 0.44));
      if (kind === 'gold') {
        // Luminous aerospace Kapton amber-gold (resists crushing to muddy brown on shadowed faces)
        aImg.data[pIdx] = Math.min(255, Math.round(244 * shade));
        aImg.data[pIdx + 1] = Math.min(255, Math.round(176 * shade));
        aImg.data[pIdx + 2] = Math.min(255, Math.round(46 * shade));
      } else {
        // Aluminized Mylar / crisp brushed titanium-silver foil
        const vCol = Math.min(255, Math.round(212 * shade));
        aImg.data[pIdx] = vCol;
        aImg.data[pIdx + 1] = Math.min(255, Math.round(vCol * 1.01));
        aImg.data[pIdx + 2] = Math.min(255, Math.round(vCol * 1.04));
      }
      aImg.data[pIdx + 3] = 255;
    }
  }

  aCtx.putImageData(aImg, 0, 0);
  nCtx.putImageData(nImg, 0, 0);

  const map = new THREE.CanvasTexture(aCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.anisotropy = 4;
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;

  const normalMap = new THREE.CanvasTexture(nCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(2, 2);
  normalMap.anisotropy = 4;
  normalMap.needsUpdate = true;

  return { map, normalMap };
}

function buildSolarArrayTextures(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const size = 512;
  const aCanvas = document.createElement('canvas');
  aCanvas.width = size;
  aCanvas.height = size;
  const ctx = aCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  // Deep silicon/GaAs sapphire solar cell substrate (legible under vacuum directional light)
  ctx.fillStyle = '#163878';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#d0d0d0';
  bCtx.fillRect(0, 0, size, size);

  const cols = 8;
  const rows = 16;
  const cw = size / cols;
  const ch = size / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw;
      const y = r * ch;
      const shimmer = hash2d(c, r, 401);
      const blue = 132 + Math.round(shimmer * 38);
      const green = 58 + Math.round(shimmer * 22);
      ctx.fillStyle = `rgb(24, ${green}, ${blue})`;
      ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);

      // Crisp silver collector finger trace inside each solar wafer
      ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
      ctx.fillRect(x + 3, y + ch * 0.48, cw - 6, 1.5);

      // Grooved wafer bevel in bump map
      bCtx.fillStyle = '#282828';
      bCtx.fillRect(x, y, cw, 2);
      bCtx.fillRect(x, y, 2, ch);
    }
  }

  // Crisp gold/silver busbar divider every 4 rows
  ctx.fillStyle = 'rgba(226, 232, 240, 0.65)';
  for (let r = 0; r <= rows; r += 4) {
    ctx.fillRect(0, Math.min(size - 3, r * ch), size, 2.5);
  }

  const map = new THREE.CanvasTexture(aCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 4;
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.needsUpdate = true;

  return { map, bumpMap };
}

function buildAntennaMeshTextures(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const size = 256;
  const aCanvas = document.createElement('canvas');
  aCanvas.width = size;
  aCanvas.height = size;
  const ctx = aCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#b0b0b0';
  bCtx.fillRect(0, 0, size, size);

  // Slotted wave-guide feed slots & structural rib lattice (like Surveyor high-gain array)
  const step = 16;
  for (let y = 0; y < size; y += step) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, y, size, 1.5);
    bCtx.fillStyle = '#404040';
    bCtx.fillRect(0, y, size, 2);
    for (let x = 0; x < size; x += step) {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x + 4, y + 5, 8, 3);
      bCtx.fillStyle = '#202020';
      bCtx.fillRect(x + 4, y + 5, 8, 3);
    }
  }
  for (let x = 0; x < size; x += step * 2) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x, 0, 1.5, size);
  }

  const map = new THREE.CanvasTexture(aCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.needsUpdate = true;

  return { map, bumpMap };
}

function buildApolloGnomonChart(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 124);

  // Apollo photometric grayscale & Munsell primary color reference patches
  const swatches = ['#0f172a', '#475569', '#94a3b8', '#e2e8f0', '#dc2626', '#16a34a', '#2563eb'];
  const sw = 236 / swatches.length;
  swatches.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.fillRect(10 + i * sw, 14, sw - 4, 52);
  });

  // Millimeter scale ticks along bottom bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(10, 78, 236, 4);
  for (let x = 10; x <= 246; x += 12) {
    ctx.fillRect(x, 82, 2, x % 36 === 10 ? 22 : 12);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function getSpaceHardwareTextures(): SpaceHardwareTextureSuite {
  if (cachedSuite) return cachedSuite;

  const gold = buildCrinkledFoilPair('gold');
  const silver = buildCrinkledFoilPair('silver');
  const solar = buildSolarArrayTextures();
  const antenna = buildAntennaMeshTextures();
  const gnomon = buildApolloGnomonChart();

  cachedSuite = {
    solarMap: solar.map,
    solarBump: solar.bumpMap,
    goldFoilMap: gold.map,
    goldFoilNormal: gold.normalMap,
    silverFoilMap: silver.map,
    silverFoilNormal: silver.normalMap,
    antennaMeshMap: antenna.map,
    antennaMeshBump: antenna.bumpMap,
    colorGnomonMap: gnomon,
  };
  return cachedSuite;
}

/**
 * Enhances untextured CAD-exported GLB materials (e.g., LADEE, LRO, ISS, JWST, Viking)
 * with realistic spacecraft PBR textures, foil normal crinkles, solar wafer grids, and metallic speculars.
 */
export function polishUntexturedHardwareMaterial(mat: THREE.Material): void {
  if (!(mat instanceof THREE.MeshStandardMaterial)) return;
  if (mat.map) return; // Never overwrite bespoke artist-baked diffuse textures

  const name = (mat.name || '').toLowerCase();
  const suite = getSpaceHardwareTextures();

  if (name.includes('solar') && !name.includes('back') && !name.includes('bracket') && !name.includes('edge')) {
    mat.map = suite.solarMap;
    mat.bumpMap = suite.solarBump;
    mat.bumpScale = 0.015;
    mat.roughness = 0.24;
    mat.metalness = 0.28;
    mat.color.set('#ffffff');
  } else if (
    name.includes('gold') ||
    name.includes('mli') ||
    name.includes('kapton') ||
    name.includes('bronze') ||
    name.includes('amber')
  ) {
    mat.map = suite.goldFoilMap;
    mat.normalMap = suite.goldFoilNormal;
    mat.normalScale.set(0.85, 0.85);
    mat.roughness = 0.28;
    mat.metalness = 0.56;
    mat.color.set('#ffffff');
    mat.emissive.set('#451a03');
    mat.emissiveIntensity = 0.1;
  } else if (name.includes('silver') || name.includes('foil') || name.includes('chrome') || name.includes('alumin')) {
    mat.map = suite.silverFoilMap;
    mat.normalMap = suite.silverFoilNormal;
    mat.normalScale.set(0.75, 0.75);
    mat.roughness = 0.28;
    mat.metalness = 0.72;
    mat.color.set('#f8fafc');
  } else if (name.includes('dish') || name.includes('antenna')) {
    mat.map = suite.antennaMeshMap;
    mat.bumpMap = suite.antennaMeshBump;
    mat.bumpScale = 0.012;
    mat.roughness = 0.35;
    mat.metalness = 0.55;
  } else if (name.includes('black') || name.includes('carbon') || name.includes('dkgrey')) {
    mat.roughness = 0.42;
    mat.metalness = 0.45;
  }

  mat.needsUpdate = true;
}

/**
 * Strips detached export disks (`y > 28`), synthesizes planar UVs when absent,
 * and applies multi-material aerospace PBR finishes across monochrome `iss.glb`.
 */
export function upgradeISSStationHierarchy(
  root: THREE.Object3D,
  matsToDispose: THREE.Material[]
): void {
  const suite = getSpaceHardwareTextures();
  const junkNodes: THREE.Object3D[] = [];
  const tmpBox = new THREE.Box3();
  const tmpSize = new THREE.Vector3();
  const tmpCenter = new THREE.Vector3();

  root.updateMatrixWorld(true);
  root.traverse((node) => {
    const nName = (node.name || '').toLowerCase();
    if (nName.startsWith('bendedtru') || nName.startsWith('pcylinder')) {
      tmpBox.setFromObject(node);
      if (!tmpBox.isEmpty() && tmpBox.min.y > 28) {
        junkNodes.push(node);
      }
    }
  });
  junkNodes.forEach((obj) => obj.parent && obj.parent.remove(obj));

  root.traverse((node) => {
    if (!(node as THREE.Mesh).isMesh) return;
    const mesh = node as THREE.Mesh;
    const geom = mesh.geometry;
    if (!geom) return;

    if (!geom.attributes.normal) {
      geom.computeVertexNormals();
    }
    geom.computeBoundingBox();
    const bb = geom.boundingBox;
    if (!bb) return;
    bb.getSize(tmpSize);
    bb.getCenter(tmpCenter);

    if (!geom.attributes.uv && geom.attributes.position) {
      const pos = geom.attributes.position;
      const uvs = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        uvs[i * 2] = (pos.getY(i) + 4) * 0.28;
        uvs[i * 2 + 1] = (pos.getZ(i) + 24) * 0.28;
      }
      geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    }

    const isSolarBlanket = tmpSize.x < 0.85 && tmpSize.y > 18 && tmpSize.z > 25;
    const isRadiatorWing =
      !isSolarBlanket && tmpSize.z > 32 && tmpSize.y < 7.5 && tmpCenter.y > 9;
    const isCentralTruss = !isSolarBlanket && tmpSize.z > 14 && tmpSize.y < 3.2;
    const isTrussBoom = !isSolarBlanket && !isRadiatorWing && tmpSize.z > 25;
    const isGoldBlanketJoint =
      !isSolarBlanket &&
      Math.abs(tmpCenter.z) < 4.5 &&
      (tmpCenter.y < 3.0 || (tmpCenter.y > 13.5 && tmpSize.z > 3));

    let mat: THREE.MeshStandardMaterial;
    if (isSolarBlanket) {
      mat = new THREE.MeshStandardMaterial({
        map: suite.solarMap,
        bumpMap: suite.solarBump,
        bumpScale: 0.015,
        color: new THREE.Color('#60a5fa'),
        metalness: 0.65,
        roughness: 0.24,
        emissive: new THREE.Color('#172554'),
        emissiveIntensity: 0.28,
        side: THREE.DoubleSide,
      });
    } else if (isRadiatorWing) {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f8fafc'),
        metalness: 0.16,
        roughness: 0.34,
        side: THREE.DoubleSide,
      });
    } else if (isCentralTruss || isTrussBoom) {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(isCentralTruss ? '#94a3b8' : '#cbd5e1'),
        normalMap: suite.silverFoilNormal,
        normalScale: new THREE.Vector2(0.18, 0.18),
        metalness: 0.72,
        roughness: 0.30,
        side: THREE.DoubleSide,
      });
    } else if (isGoldBlanketJoint) {
      mat = new THREE.MeshStandardMaterial({
        map: suite.goldFoilMap,
        normalMap: suite.goldFoilNormal,
        normalScale: new THREE.Vector2(0.42, 0.42),
        color: new THREE.Color('#fbbf24'),
        metalness: 0.78,
        roughness: 0.26,
        side: THREE.DoubleSide,
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#e2e8f0'),
        normalMap: suite.silverFoilNormal,
        normalScale: new THREE.Vector2(0.22, 0.22),
        metalness: 0.42,
        roughness: 0.34,
        side: THREE.DoubleSide,
      });
    }

    mat.needsUpdate = true;
    matsToDispose.push(mat);
    mesh.material = mat;
  });
}

