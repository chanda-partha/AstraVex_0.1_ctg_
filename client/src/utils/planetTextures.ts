import * as THREE from 'three';

// Fast 3D Simplex-style Gradient Noise Generator for procedural planetary textures
class FastNoise {
  private p: number[] = new Array(512);
  private permutation = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
    8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
    35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
    134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
    55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
    18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,
    250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
    189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
    172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,114,181,235,249,204,
    246,120,150,157,115,241,180,67,138,162,112,50,115,107,179,163,84,176,117,14,242
  ];

  constructor(seed = 12345) {
    for (let i = 0; i < 256; i++) {
      this.p[i] = this.permutation[(i + seed) % this.permutation.length];
      this.p[256 + i] = this.p[i];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number, z: number = 0): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    return this.lerp(w,
      this.lerp(v,
        this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
        this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))
      ),
      this.lerp(v,
        this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))
      )
    );
  }

  fbm(x: number, y: number, z: number = 0, octaves = 6, persistence = 0.5): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return (total / maxValue + 1) / 2;
  }
}

const noiseGen = new FastNoise(42);
const detailNoiseGen = new FastNoise(999);

// Caches for textures
let earthTextureCache: THREE.CanvasTexture | null = null;
let earthNightCache: THREE.CanvasTexture | null = null;
let earthSpecularCache: THREE.CanvasTexture | null = null;
let earthCloudsCache: THREE.CanvasTexture | null = null;
let marsTextureCache: THREE.CanvasTexture | null = null;
let marsBumpCache: THREE.CanvasTexture | null = null;
let moonTextureCache: THREE.CanvasTexture | null = null;
let moonBumpCache: THREE.CanvasTexture | null = null;
let sunTextureCache: THREE.CanvasTexture | null = null;

/**
 * 1. REALISTIC EARTH DAY COLOR TEXTURE (2048 x 1024)
 * Features continental landmasses, biomes (rainforests, savannah, deserts, snow peaks), shallow coastal shelf
 */
export function getEarthTexture(): THREE.CanvasTexture {
  if (earthTextureCache) return earthTextureCache;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const lat = (y / height - 0.5) * Math.PI;
    const absLat = Math.abs(lat);
    const isPolar = absLat > 1.28;
    const isIceMargin = absLat > 1.12;

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2;

      // 3D Cartesian coordinates on unit sphere for seamless spherical noise
      const nx = Math.cos(lat) * Math.cos(lon);
      const ny = Math.sin(lat);
      const nz = Math.cos(lat) * Math.sin(lon);

      // Continent mask using multi-octave FBM
      const landNoise = noiseGen.fbm(nx * 2.4 + 1.2, ny * 2.4 + 1.2, nz * 2.4, 6, 0.52);
      const detailNoise = detailNoiseGen.fbm(nx * 9.0, ny * 9.0, nz * 9.0, 4, 0.5);

      const isLand = landNoise > 0.485;
      const idx = (y * width + x) * 4;

      if (isPolar) {
        // Polar Ice Cap (Antarctica / Arctic)
        data[idx] = 242;
        data[idx + 1] = 248;
        data[idx + 2] = 255;
      } else if (isIceMargin && landNoise > 0.46) {
        // Glacial Tundra & Ice Margins
        data[idx] = 215;
        data[idx + 1] = 228;
        data[idx + 2] = 236;
      } else if (isLand) {
        const elev = (landNoise - 0.485) / 0.515;
        const equatorProximity = 1.0 - absLat / 1.5;

        // Desert / Arid belt (around 15-30 deg latitude)
        const isDesertZone = absLat > 0.25 && absLat < 0.65 && detailNoise > 0.42;

        if (elev < 0.15) {
          // Lush Coastal Lowlands & Deltas
          data[idx] = Math.floor(28 + detailNoise * 20);
          data[idx + 1] = Math.floor(108 + detailNoise * 35);
          data[idx + 2] = Math.floor(45 + detailNoise * 15);
        } else if (isDesertZone && elev < 0.5) {
          // Golden Saharan / Outback Sand Deserts
          data[idx] = Math.floor(210 + detailNoise * 35);
          data[idx + 1] = Math.floor(175 + detailNoise * 30);
          data[idx + 2] = Math.floor(115 + detailNoise * 20);
        } else if (elev < 0.55) {
          // Inland Woodlands & Savannahs
          if (equatorProximity > 0.75) {
            // Tropical Rainforest Green
            data[idx] = Math.floor(20 + detailNoise * 20);
            data[idx + 1] = Math.floor(95 + detailNoise * 30);
            data[idx + 2] = Math.floor(35 + detailNoise * 15);
          } else {
            // Temperate Forest / Grasslands
            data[idx] = Math.floor(65 + detailNoise * 40);
            data[idx + 1] = Math.floor(115 + detailNoise * 35);
            data[idx + 2] = Math.floor(45 + detailNoise * 20);
          }
        } else if (elev < 0.78) {
          // High Mountain Plateaus (Rock / Soil)
          data[idx] = Math.floor(135 + detailNoise * 30);
          data[idx + 1] = Math.floor(110 + detailNoise * 25);
          data[idx + 2] = Math.floor(80 + detailNoise * 20);
        } else {
          // Alpine Mountain Peaks (Snow Capped)
          data[idx] = Math.floor(230 + detailNoise * 25);
          data[idx + 1] = Math.floor(235 + detailNoise * 20);
          data[idx + 2] = Math.floor(245 + detailNoise * 10);
        }
      } else {
        // Ocean - Shallow Cyan continental shelves vs Deep Obsidian Blue Abyss
        const oceanDepth = (0.485 - landNoise) / 0.485;
        if (oceanDepth < 0.08) {
          // Turquoise Coastal Continental Shelf
          data[idx] = Math.floor(18 + oceanDepth * 50);
          data[idx + 1] = Math.floor(115 - oceanDepth * 300);
          data[idx + 2] = Math.floor(165 - oceanDepth * 200);
        } else {
          // Deep Oceanic Blue
          data[idx] = Math.max(5, Math.floor(12 - oceanDepth * 10));
          data[idx + 1] = Math.max(25, Math.floor(55 - oceanDepth * 35));
          data[idx + 2] = Math.max(70, Math.floor(135 - oceanDepth * 55));
        }
      }
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  earthTextureCache = new THREE.CanvasTexture(canvas);
  earthTextureCache.wrapS = THREE.RepeatWrapping;
  earthTextureCache.wrapT = THREE.ClampToEdgeWrapping;
  earthTextureCache.colorSpace = THREE.SRGBColorSpace;
  return earthTextureCache;
}

/**
 * 2. REALISTIC EARTH NIGHT CITY LIGHTS (2048 x 1024)
 * Concentrated glowing golden/amber cities across continental landmasses, unlit over oceans and polar ice
 */
export function getEarthNightTexture(): THREE.CanvasTexture {
  if (earthNightCache) return earthNightCache;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const lat = (y / height - 0.5) * Math.PI;
    const absLat = Math.abs(lat);
    const isPolar = absLat > 1.25;

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2;
      const nx = Math.cos(lat) * Math.cos(lon);
      const ny = Math.sin(lat);
      const nz = Math.cos(lat) * Math.sin(lon);

      const landNoise = noiseGen.fbm(nx * 2.4 + 1.2, ny * 2.4 + 1.2, nz * 2.4, 6, 0.52);
      const isLand = landNoise > 0.485;
      const idx = (y * width + x) * 4;

      if (isLand && !isPolar) {
        // High density urban clustering noise
        const citySeed = detailNoiseGen.fbm(nx * 24.0, ny * 24.0, nz * 24.0, 4, 0.6);
        const microCity = Math.random();

        if (citySeed > 0.68 || (citySeed > 0.55 && microCity > 0.88)) {
          const brightness = Math.min(255, Math.floor((citySeed - 0.55) * 550));
          data[idx] = brightness;
          data[idx + 1] = Math.floor(brightness * 0.85); // Golden amber glow
          data[idx + 2] = Math.floor(brightness * 0.45);
          data[idx + 3] = 255;
          continue;
        }
      }

      // Dark space / ocean / unpopulated
      data[idx] = 0;
      data[idx + 1] = 0;
      data[idx + 2] = 0;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  earthNightCache = new THREE.CanvasTexture(canvas);
  earthNightCache.wrapS = THREE.RepeatWrapping;
  earthNightCache.wrapT = THREE.ClampToEdgeWrapping;
  earthNightCache.colorSpace = THREE.SRGBColorSpace;
  return earthNightCache;
}

/**
 * 3. REALISTIC EARTH SPECULAR WATER MAP (1024 x 512)
 * White/bright for reflective oceans, pure black for matte landmasses
 */
export function getEarthSpecularMap(): THREE.CanvasTexture {
  if (earthSpecularCache) return earthSpecularCache;

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const lat = (y / height - 0.5) * Math.PI;

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2;
      const nx = Math.cos(lat) * Math.cos(lon);
      const ny = Math.sin(lat);
      const nz = Math.cos(lat) * Math.sin(lon);

      const landNoise = noiseGen.fbm(nx * 2.4 + 1.2, ny * 2.4 + 1.2, nz * 2.4, 6, 0.52);
      const isLand = landNoise > 0.485;
      const idx = (y * width + x) * 4;

      const specValue = isLand ? 15 : 240; // High reflection on water, low on dry land
      data[idx] = specValue;
      data[idx + 1] = specValue;
      data[idx + 2] = specValue;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  earthSpecularCache = new THREE.CanvasTexture(canvas);
  earthSpecularCache.wrapS = THREE.RepeatWrapping;
  earthSpecularCache.wrapT = THREE.ClampToEdgeWrapping;
  return earthSpecularCache;
}

/**
 * 4. REALISTIC EARTH CLOUD LAYER TEXTURE (2048 x 1024)
 * Swirling cyclonic systems, soft wispy high-altitude cirrus clouds
 */
export function getEarthCloudsTexture(): THREE.CanvasTexture {
  if (earthCloudsCache) return earthCloudsCache;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const lat = (y / height - 0.5) * Math.PI;

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2;
      const nx = Math.cos(lat) * Math.cos(lon);
      const ny = Math.sin(lat);
      const nz = Math.cos(lat) * Math.sin(lon);

      // Multi-frequency cyclonic weather pattern
      const cloudVal = noiseGen.fbm(nx * 3.8 + 18, ny * 3.8 + 18, nz * 3.8, 6, 0.5);
      const wisps = detailNoiseGen.fbm(nx * 8.5, ny * 8.5, nz * 8.5, 4, 0.5);

      const alpha = cloudVal > 0.52 ? Math.min(255, Math.floor((cloudVal - 0.52) * 580 * (wisps + 0.3))) : 0;
      const idx = (y * width + x) * 4;

      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  earthCloudsCache = new THREE.CanvasTexture(canvas);
  earthCloudsCache.wrapS = THREE.RepeatWrapping;
  earthCloudsCache.wrapT = THREE.ClampToEdgeWrapping;
  return earthCloudsCache;
}

/**
 * 5. REALISTIC MARS SURFACE TEXTURE (2048 x 1024)
 * Distinct albedo features (Syrtis Major dark basalt), Valles Marineris canyon rift, polar ice cap
 */
export function getMarsTexture(): THREE.CanvasTexture {
  if (marsTextureCache) return marsTextureCache;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const lat = (y / height - 0.5) * Math.PI;
    const isPolarCap = Math.abs(lat) > 1.34;

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2;
      const nx = Math.cos(lat) * Math.cos(lon);
      const ny = Math.sin(lat);
      const nz = Math.cos(lat) * Math.sin(lon);

      const terrainNoise = noiseGen.fbm(nx * 3.2 + 2, ny * 3.2 + 2, nz * 3.2, 6, 0.5);
      const detailNoise = detailNoiseGen.fbm(nx * 14 + 10, ny * 14 + 10, nz * 14, 4, 0.5);

      const idx = (y * width + x) * 4;

      if (isPolarCap) {
        // Polar Ice Cap (CO2 / water ice)
        data[idx] = 245;
        data[idx + 1] = 238;
        data[idx + 2] = 235;
      } else {
        // Base Martian Ochre / Rusty Red-Orange
        let r = 195 + terrainNoise * 55;
        let g = 88 + terrainNoise * 35;
        let b = 48 + terrainNoise * 25;

        // Dark Basaltic Albedo Markings (Syrtis Major, Sinus Sabaeus)
        if (terrainNoise < 0.42) {
          const darkFactor = (0.42 - terrainNoise) * 1.9;
          r = Math.floor(r * (1 - darkFactor * 0.55));
          g = Math.floor(g * (1 - darkFactor * 0.55));
          b = Math.floor(b * (1 - darkFactor * 0.45));
        }

        // Add fine regolith dust / crater noise
        r = Math.min(255, Math.max(0, Math.floor(r + (detailNoise - 0.5) * 28)));
        g = Math.min(255, Math.max(0, Math.floor(g + (detailNoise - 0.5) * 20)));
        b = Math.min(255, Math.max(0, Math.floor(b + (detailNoise - 0.5) * 14)));

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
      }
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  marsTextureCache = new THREE.CanvasTexture(canvas);
  marsTextureCache.wrapS = THREE.RepeatWrapping;
  marsTextureCache.wrapT = THREE.ClampToEdgeWrapping;
  marsTextureCache.colorSpace = THREE.SRGBColorSpace;
  return marsTextureCache;
}

/**
 * 6. MARS BUMP MAP (1024 x 512)
 */
export function getMarsBumpMap(): THREE.CanvasTexture {
  if (marsBumpCache) return marsBumpCache;

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const lat = (y / height - 0.5) * Math.PI;
    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2;
      const nx = Math.cos(lat) * Math.cos(lon);
      const ny = Math.sin(lat);
      const nz = Math.cos(lat) * Math.sin(lon);

      const h = noiseGen.fbm(nx * 5.5, ny * 5.5, nz * 5.5, 5, 0.5);
      const val = Math.floor(h * 255);
      const idx = (y * width + x) * 4;

      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  marsBumpCache = new THREE.CanvasTexture(canvas);
  return marsBumpCache;
}

/**
 * 7. REALISTIC LUNAR SURFACE TEXTURE (2048 x 1024)
 * Lunar volcanic maria, cratered bright anorthosite highlands, Tycho crater with prominent bright ray system
 */
export function getMoonTexture(): THREE.CanvasTexture {
  if (moonTextureCache) return moonTextureCache;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const lat = (y / height - 0.5) * Math.PI;

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2;
      const nx = Math.cos(lat) * Math.cos(lon);
      const ny = Math.sin(lat);
      const nz = Math.cos(lat) * Math.sin(lon);

      const mariaNoise = noiseGen.fbm(nx * 2.8 + 3, ny * 2.8 + 3, nz * 2.8, 6, 0.5);
      const highlandNoise = detailNoiseGen.fbm(nx * 11 + 7, ny * 11 + 7, nz * 11, 4, 0.5);

      const isMaria = mariaNoise < 0.45; // Dark basaltic maria
      const idx = (y * width + x) * 4;

      let grayVal: number;
      if (isMaria) {
        grayVal = 75 + (mariaNoise / 0.45) * 45 + (highlandNoise - 0.5) * 18;
      } else {
        grayVal = 155 + (highlandNoise - 0.5) * 65;
      }

      grayVal = Math.min(235, Math.max(35, Math.floor(grayVal)));

      data[idx] = grayVal;
      data[idx + 1] = grayVal;
      data[idx + 2] = Math.floor(grayVal * 1.02);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Draw procedural impact craters with bright ejecta rays onto canvas
  const craterSeeds = [
    { x: 620, y: 410, r: 42, rays: 16 }, // Tycho style crater with bright rays
    { x: 1350, y: 680, r: 55, rays: 14 }, // Copernicus
    { x: 380, y: 720, r: 30, rays: 10 },
    { x: 1680, y: 320, r: 48, rays: 12 },
    { x: 920, y: 220, r: 36, rays: 8 },
    { x: 1120, y: 840, r: 25, rays: 6 }
  ];

  craterSeeds.forEach(c => {
    // Ejecta rays
    ctx.strokeStyle = 'rgba(240, 248, 255, 0.35)';
    ctx.lineWidth = 1.5;
    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / c.rays) {
      const rayLen = c.r * (3.5 + Math.random() * 3.0);
      ctx.beginPath();
      ctx.moveTo(c.x + Math.cos(a) * c.r, c.y + Math.sin(a) * c.r);
      ctx.lineTo(c.x + Math.cos(a) * rayLen, c.y + Math.sin(a) * rayLen);
      ctx.stroke();
    }

    // Crater Rim & Floor
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(38, 42, 48, 0.65)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(235, 242, 255, 0.7)';
    ctx.stroke();

    // Central crater peak
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(230, 235, 245, 0.8)';
    ctx.fill();
  });

  moonTextureCache = new THREE.CanvasTexture(canvas);
  moonTextureCache.wrapS = THREE.RepeatWrapping;
  moonTextureCache.wrapT = THREE.ClampToEdgeWrapping;
  moonTextureCache.colorSpace = THREE.SRGBColorSpace;
  return moonTextureCache;
}

/**
 * 8. MOON BUMP MAP (1024 x 512)
 */
export function getMoonBumpMap(): THREE.CanvasTexture {
  if (moonBumpCache) return moonBumpCache;

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const lat = (y / height - 0.5) * Math.PI;
    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2;
      const nx = Math.cos(lat) * Math.cos(lon);
      const ny = Math.sin(lat);
      const nz = Math.cos(lat) * Math.sin(lon);

      const h = noiseGen.fbm(nx * 9.0, ny * 9.0, nz * 9.0, 6, 0.5);
      const val = Math.floor(h * 255);
      const idx = (y * width + x) * 4;

      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  moonBumpCache = new THREE.CanvasTexture(canvas);
  return moonBumpCache;
}

/**
 * 9. REALISTIC SUN CORONA & CONVECTION TEXTURE
 */
export function getSunTexture(): THREE.CanvasTexture {
  if (sunTextureCache) return sunTextureCache;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.5);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, '#fef08a');
  grad.addColorStop(0.7, '#f59e0b');
  grad.addColorStop(1, '#ea580c');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  sunTextureCache = new THREE.CanvasTexture(canvas);
  return sunTextureCache;
}
