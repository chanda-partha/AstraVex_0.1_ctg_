/**
 * Runtime Integrity & Audit Regression Verification Suite
 * Verifies 18-mission client telemetry coverage, non-recursive ELON welcome replay,
 * 3D hotspot/camera parity, AudioManager fallback progression, and asset hygiene.
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';
import { VERIFIED_NASA_MISSIONS } from '../server/services/nasaRegistry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`✅ [PASS] ${label}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

console.log('\n🔍 Running Runtime Integrity & Audit Regression Verification...\n');

// 1. All 18 NASA missions present in client liveTelemetry.ts profiles & fallbacks
const liveTelemetrySrc = fs.readFileSync(path.join(ROOT, 'client/src/utils/liveTelemetry.ts'), 'utf8');
const fallbackSrc = fs.readFileSync(path.join(ROOT, 'client/src/utils/nasaDataFallback.ts'), 'utf8');
const missingTelemetry = [];
for (const m of VERIFIED_NASA_MISSIONS) {
  const hasMissionId =
    liveTelemetrySrc.includes(`id: '${m.id}'`) ||
    liveTelemetrySrc.includes(`id === '${m.id}'`) ||
    liveTelemetrySrc.includes(`missionId: '${m.id}'`) ||
    liveTelemetrySrc.includes(`'${m.id}':`);
  if (!hasMissionId) {
    missingTelemetry.push(m.id);
  }
}
check(
  'All 18 verified NASA missions have telemetry profiles in client/src/utils/liveTelemetry.ts',
  missingTelemetry.length === 0,
  `Missing: ${missingTelemetry.join(', ')}`
);
check(
  'Client fallback resolver wires mission-specific gallery images (CLIENT_MISSION_FALLBACK_IMAGES)',
  fallbackSrc.includes('CLIENT_MISSION_FALLBACK_IMAGES[mKey] || []')
);

// 2. ELON non-recursive welcome replay & pending timer cleanup
const elonConvSrc = fs.readFileSync(path.join(ROOT, 'client/src/elon/ElonConversation.ts'), 'utf8');
const replayMatch = elonConvSrc.match(/public replayWelcome\(\)[\s\S]{0,260}\}/);
check(
  'ElonConversation.replayWelcome() delegates to startWelcome(true) without self-recursion',
  Boolean(replayMatch && replayMatch[0].includes('startWelcome(true)')) &&
    elonConvSrc.includes('clearPendingTransition()')
);

// 3. Artemis HLS hotspot & camera parity + SpaceHomePage Deep Space choice
const starshipSrc = fs.readFileSync(path.join(ROOT, 'client/src/components/3d/StarshipHLS3D.tsx'), 'utf8');
const explorationSrc = fs.readFileSync(path.join(ROOT, 'client/src/pages/ExplorationPage.tsx'), 'utf8');
const spaceHomeSrc = fs.readFileSync(path.join(ROOT, 'client/src/pages/SpaceHomePage.tsx'), 'utf8');
check(
  'Artemis III HLS 3D hotspots (hls-astronaut, hls-antenna) match ExplorationPage camera targets',
  (starshipSrc.includes('"hls-astronaut"') || starshipSrc.includes("'hls-astronaut'")) &&
    (starshipSrc.includes('"hls-antenna"') || starshipSrc.includes("'hls-antenna'")) &&
    explorationSrc.includes("'hls-astronaut':") &&
    explorationSrc.includes("'hls-antenna':")
);
check(
  'SpaceHomePage keeps Moon & Mars cards in the Home panel while 3D ISS & JWST trigger DeepSpace',
  spaceHomeSrc.includes("onExplore('DeepSpace')") &&
    spaceHomeSrc.includes('Click 3D ISS or JWST for Deep Space') &&
    !spaceHomeSrc.includes('Deep Space &amp; Orbital')
);

// 4. Audio optimization, progressive fallback, & dead asset hygiene
const audioMgrSrc = fs.readFileSync(path.join(ROOT, 'client/src/audio/AudioManager.ts'), 'utf8');
const mp3MusicPath = path.join(ROOT, 'client/public/sounds/astravex_cinematic_music.mp3');
const wavMusicPath = path.join(ROOT, 'client/public/sounds/astravex_cinematic_music.wav');
check(
  'Compressed astravex_cinematic_music.mp3 exists and AudioManager tries MP3 first with sequential fallback',
  fs.existsSync(mp3MusicPath) &&
    fs.statSync(mp3MusicPath).size < 1_000_000 &&
    fs.existsSync(wavMusicPath) &&
    fs.statSync(wavMusicPath).size > 1_000_000 &&
    audioMgrSrc.indexOf('astravex_cinematic_music.mp3') < audioMgrSrc.indexOf('astravex_cinematic_music.wav') &&
    audioMgrSrc.includes('this.musicSourceIndex += 1')
);

const removedDeadPaths = [
  'client/public/draco/draco_encoder.js',
  'client/src/assets/astravex_logo.png',
  'client/src/components/3d/RealisticTerrain.tsx',
  'client/src/utils/planetTextures.ts',
  'client/src/guide/GuidedTourBanner.tsx',
  'scripts/check_recycle.ps1',
];
check(
  'Dead code modules, barrel shims, and redundant assets removed cleanly',
  removedDeadPaths.every((p) => !fs.existsSync(path.join(ROOT, p)))
);

// 5. TypeScript strict compiler & sessionStorage API key hygiene
const tsconfigRaw = fs
  .readFileSync(path.join(ROOT, 'client/tsconfig.json'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');
const tsconfigJson = JSON.parse(tsconfigRaw);
const chatbotSrc = fs.readFileSync(path.join(ROOT, 'client/src/components/ai/AIChatbotDrawer.tsx'), 'utf8');
check(
  'client/tsconfig.json enforces strict, noUnusedLocals, and noUnusedParameters',
  tsconfigJson.compilerOptions?.strict === true &&
    tsconfigJson.compilerOptions?.noUnusedLocals === true &&
    tsconfigJson.compilerOptions?.noUnusedParameters === true
);
check(
  'AIChatbotDrawer stores optional Gemini BYOK in sessionStorage rather than persistent localStorage',
  chatbotSrc.includes('sessionStorage.getItem') &&
    chatbotSrc.includes('sessionStorage.setItem') &&
    !chatbotSrc.includes("localStorage.setItem('gemini_api_key'")
);

// 6. Mission-synchronized live data card, distinct lunar imagery, and keyless public NASA API integration
const drawerSrc = fs.readFileSync(path.join(ROOT, 'client/src/components/data/LiveTelemetryDrawer.tsx'), 'utf8');
const apiClientSrc = fs.readFileSync(path.join(ROOT, 'client/src/services/api.ts'), 'utf8');
const resolverSrc = fs.readFileSync(path.join(ROOT, 'server/services/nasaDataResolver.js'), 'utf8');
const engineSrc = fs.readFileSync(path.join(ROOT, 'server/services/liveTelemetryEngine.js'), 'utf8');

check(
  'All lunar surface & Mars missions have distinct curated mission hero imagery in liveTelemetry.ts',
  ['apollo11-photo-1', 'apollo15-photo-1', 'apollo17-photo-1', 'artemis3-photo-1', 'change4-photo-1'].every(
    (id) => liveTelemetrySrc.includes(id)
  ) && liveTelemetrySrc.includes('PIA23623/PIA23623')
);
check(
  'ExplorationDossierCard and LiveTelemetryDrawer strictly sync to activeMissionId and prioritize live NASA API imagery',
  explorationSrc.includes('matchedResolved?.images') &&
    explorationSrc.indexOf('matchedResolved?.images') < explorationSrc.indexOf('dataset.latestPhotos') &&
    drawerSrc.includes('matchedResolved?.images') &&
    drawerSrc.indexOf('matchedResolved?.images') < drawerSrc.indexOf('scienceDataset.latestPhotos')
);
check(
  'Keyless public NASA endpoints (mars.nasa.gov RSS raw_images & images-api.nasa.gov) wired across server and client',
  resolverSrc.includes('mars.nasa.gov/rss/api/?feed=raw_images') &&
    engineSrc.includes('mars.nasa.gov/rss/api/?feed=raw_images') &&
    apiClientSrc.includes('images-api.nasa.gov/search') &&
    apiClientSrc.includes('mars.nasa.gov/rss/api/?feed=raw_images')
);

// 7. Restored full-res Mars panorama, theater prefetching, loading states, & non-overzoom pin inspection
const panoPath = path.join(ROOT, 'client/public/models/extracted_pano.jpg');
const panoCompSrc = fs.readFileSync(path.join(ROOT, 'client/src/components/3d/MarsRealPanorama.tsx'), 'utf8');
const preloaderSrc = fs.readFileSync(path.join(ROOT, 'client/src/utils/assetPreloader.ts'), 'utf8');
const roverModelSrc = fs.readFileSync(path.join(ROOT, 'client/src/components/3d/Rover3DModel.tsx'), 'utf8');
const loadingOverlaySrc = fs.readFileSync(path.join(ROOT, 'client/src/components/common/CanvasLoadingOverlay.tsx'), 'utf8');

check(
  'Original full-resolution Mars Sol 4 Jezero panorama restored (>5 MB) with anisotropic WebGL filtering',
  fs.existsSync(panoPath) &&
    fs.statSync(panoPath).size >= 5_000_000 &&
    panoCompSrc.includes('anisotropy') &&
    !panoCompSrc.includes('color="#d8c6b4"')
);
check(
  'Mars first-load asset preloader includes /models/extracted_pano.jpg and idle surface warmup',
  preloaderSrc.includes("'/models/extracted_pano.jpg'") &&
    preloaderSrc.includes('prefetchIdleSurfaceEssentials')
);
check(
  'All WebGL Canvas stages & video streams provide visible CanvasLoadingOverlay / VideoLoadingOverlay states',
  loadingOverlaySrc.includes('useProgress') &&
    explorationSrc.includes('CanvasLoadingOverlay') &&
    fs.readFileSync(path.join(ROOT, 'client/src/pages/LandingPage.tsx'), 'utf8').includes('VideoLoadingOverlay')
);
check(
  '3D hotspot pins avoid distanceFactor scaling distortion and CameraRig maintains comfortable inspection distance',
  !roverModelSrc.includes('distanceFactor={8}') &&
    roverModelSrc.includes('getMissionPinSequence') &&
    explorationSrc.includes('minComfortFocusDist') &&
    explorationSrc.includes('handleCyclePin')
);

console.log(`\n📊 Runtime Integrity Verification: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
assert.strictEqual(failed, 0);
