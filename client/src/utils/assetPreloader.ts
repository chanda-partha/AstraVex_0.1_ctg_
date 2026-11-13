import { useGLTF, useTexture } from '@react-three/drei';

export interface CriticalBootAsset {
  url: string;
  label: string;
  estimatedBytes: number;
  isGLB?: boolean;
}

export interface BootProgressSnapshot {
  percent: number;
  loadedBytes: number;
  totalBytes: number;
  activeLabel: string;
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
}

/**
 * Necessary startup assets only (~9.1 MB total after Draco + WebP compression):
 * Keeps initial entry snappy by preloading ONLY assets mounted on SpaceHomePage + Draco decoder,
 * while secondary surface GLBs and mission MP4s load lazily on demand.
 */
export const CRITICAL_BOOT_ASSETS: CriticalBootAsset[] = [
  { url: '/astravex_logo.png', label: 'Mission emblem', estimatedBytes: 341_212 },
  { url: '/draco/draco_wasm_wrapper.js', label: 'Draco geometry wrapper', estimatedBytes: 58_456 },
  { url: '/draco/draco_decoder.wasm', label: 'Draco WASM decoder', estimatedBytes: 192_420 },
  { url: '/models/iss.glb', label: 'ISS orbital station', estimatedBytes: 461_708, isGLB: true },
  { url: '/models/jwst.glb', label: 'James Webb observatory', estimatedBytes: 1_100_696, isGLB: true },
  { url: '/models/earth.glb', label: 'Earth 3D globe', estimatedBytes: 1_463_348, isGLB: true },
  { url: '/models/mars.glb', label: 'Mars planetary sphere', estimatedBytes: 2_779_828, isGLB: true },
  { url: '/models/moon.glb', label: 'Lunar surface globe', estimatedBytes: 2_751_392, isGLB: true },
];

/**
 * Theater-scoped hardware GLBs. Prefetched during browser idle time once the visitor
 * commits to a theater (launch/landing screens), so the Exploration scene opens warm
 * without blocking boot or competing with the Home scene for bandwidth/GPU.
 */
const THEATER_MODELS: Record<string, string[]> = {
  Mars: [
    '/models/extracted_pano.jpg',
    '/models/perseverance.glb',
    '/models/ingenuity.glb',
    '/models/curiosity.glb',
    '/models/insight.glb',
    '/models/viking_lander.glb',
    '/models/mro.glb',
  ],
  Moon: [
    '/models/apollo_lunar_module.glb',
    '/models/tripo_astronaut_2_stylized_and_animated.glb',
    '/models/mondfahrzeug_lunar_rover.glb',
    '/models/isro_chandrayyan-3_mission_lander_module_vikram.glb',
    '/models/lunar_orbiter_lro.glb',
    '/models/lunar_ladee.glb',
    '/models/lunar_habitat.glb',
    '/models/rocket_saturn_v.glb',
  ],
  DeepSpace: ['/models/jwst.glb', '/models/hubble.glb', '/models/iss.glb', '/models/voyager.glb'],
};

const prefetchedAssets = new Set<string>();

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
};

function warmAssetUrl(url: string): void {
  if (prefetchedAssets.has(url)) return;
  prefetchedAssets.add(url);
  if (/\.(jpe?g|png|webp)$/i.test(url)) {
    useTexture.preload(url);
    return;
  }
  useGLTF.preload(url, '/draco/');
}

export function prefetchTheaterModels(theater: string): void {
  const queue = (THEATER_MODELS[theater] || []).filter((url) => !prefetchedAssets.has(url));
  if (queue.length === 0 || typeof window === 'undefined') return;

  // Immediately warm primary hero assets (e.g. Jezero 8K panorama + Perseverance GLB)
  // so first-time theater entry renders without cold waterfall stalls.
  const immediateCount = Math.min(2, queue.length);
  for (let i = 0; i < immediateCount; i++) {
    const heroUrl = queue.shift();
    if (heroUrl) warmAssetUrl(heroUrl);
  }
  if (queue.length === 0) return;

  const w = window as IdleWindow;
  const schedule = (cb: () => void) =>
    w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout: 900 }) : window.setTimeout(cb, 220);

  // Stagger secondary fleet GLBs smoothly so Draco decode never drops a frame.
  const next = () => {
    const url = queue.shift();
    if (!url) return;
    warmAssetUrl(url);
    if (queue.length > 0) schedule(next);
  };
  schedule(next);
}

/**
 * Quietly warms primary Mars & Moon hero surface textures/models during idle time
 * after initial Home boot settles, slashing first-time transition latency.
 */
export function prefetchIdleSurfaceEssentials(): void {
  if (typeof window === 'undefined') return;
  const essentials = [
    '/models/extracted_pano.jpg',
    '/models/perseverance.glb',
    '/models/apollo_lunar_module.glb',
  ].filter((url) => !prefetchedAssets.has(url));
  if (essentials.length === 0) return;

  const w = window as IdleWindow;
  const schedule = (cb: () => void) =>
    w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout: 1400 }) : window.setTimeout(cb, 350);

  const step = () => {
    const url = essentials.shift();
    if (!url) return;
    warmAssetUrl(url);
    if (essentials.length > 0) schedule(step);
  };
  schedule(step);
}

async function fetchWithByteProgress(
  asset: CriticalBootAsset,
  onBytes: (loaded: number, knownTotal: number) => void,
  signal: AbortSignal
): Promise<void> {
  const res = await fetch(asset.url, { cache: 'default', signal });
  if (!res.ok) {
    onBytes(asset.estimatedBytes, asset.estimatedBytes);
    return;
  }

  const headerLen = Number(res.headers.get('content-length') || 0);
  const expected = headerLen > 0 ? headerLen : asset.estimatedBytes;

  if (!res.body) {
    await res.arrayBuffer();
    onBytes(expected, expected);
    return;
  }

  const reader = res.body.getReader();
  let received = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value?.byteLength || 0;
      onBytes(received, Math.max(expected, received));
    }
  } finally {
    reader.releaseLock();
  }

  const finalSize = received > 0 ? received : expected;
  onBytes(finalSize, finalSize);
}

/**
 * Streams and warms critical Home 3D + Draco assets into HTTP & GLTF caches,
 * reporting byte-level progress with graceful network timeout protection.
 */
export async function preloadCriticalBootAssets(
  onProgress: (snapshot: BootProgressSnapshot) => void,
  signal: AbortSignal
): Promise<void> {
  const totalCount = CRITICAL_BOOT_ASSETS.length;
  const loadedPerAsset = CRITICAL_BOOT_ASSETS.map(() => 0);
  const totalPerAsset = CRITICAL_BOOT_ASSETS.map((a) => a.estimatedBytes);
  const doneFlags = CRITICAL_BOOT_ASSETS.map(() => false);
  let activeLabel = CRITICAL_BOOT_ASSETS[0]?.label || 'Initializing telemetry';

  const emit = (complete = false) => {
    const loadedBytes = loadedPerAsset.reduce((sum, v) => sum + v, 0);
    const totalBytes = totalPerAsset.reduce((sum, v) => sum + v, 0);
    const completedCount = doneFlags.filter(Boolean).length;
    const rawPct = totalBytes > 0 ? Math.round((loadedBytes / totalBytes) * 100) : 100;
    const percent = complete ? 100 : Math.min(99, Math.max(0, rawPct));

    onProgress({
      percent,
      loadedBytes: complete ? totalBytes : loadedBytes,
      totalBytes,
      activeLabel: complete ? 'All primary 3D systems online' : activeLabel,
      completedCount: complete ? totalCount : completedCount,
      totalCount,
      isComplete: complete,
    });
  };

  emit(false);

  const tasks = CRITICAL_BOOT_ASSETS.map(async (asset, idx) => {
    try {
      await fetchWithByteProgress(
        asset,
        (loaded, knownTotal) => {
          loadedPerAsset[idx] = loaded;
          totalPerAsset[idx] = knownTotal;
          activeLabel = asset.label;
          emit(false);
        },
        signal
      );
      if (asset.isGLB && !signal.aborted) {
        useGLTF.preload(asset.url, '/draco/');
      }
    } catch (_) {
      // Never block app startup on an individual non-fatal fetch error
      loadedPerAsset[idx] = totalPerAsset[idx];
    } finally {
      doneFlags[idx] = true;
      emit(false);
    }
  });

  await Promise.allSettled(tasks);
  if (!signal.aborted) {
    emit(true);
  }
}

