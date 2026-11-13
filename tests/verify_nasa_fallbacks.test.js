/**
 * Automated Verification Test Suite
 * Tests fallback dataset integrity, schema conformity, and static asset presence
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VERIFIED_NASA_MISSIONS, SUBSYSTEM_REGISTRY, resolveHardwareForMission } from '../server/services/nasaRegistry.js';
import { CURATED_MISSION_QUIZZES, buildCuratedQuizPayload } from '../server/data/missionQuizzes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('🧪 RUNNING NASA MISSION EXPLORER INTEGRITY TESTS\n');

// 1. Audio Assets Test
console.log('▶ Test Suite 1: Critical Telemetry Sound Assets');
const requiredSounds = [
  'ui_click.wav',
  'telemetry_chime.wav',
  'quindar_beep.wav',
  'rocket_thrust.wav',
  'mission_success.wav',
  'telemetry_alert.wav',
  'eagle_has_landed.ogg'
];

requiredSounds.forEach(sound => {
  const soundPath = path.join(projectRoot, 'client', 'public', 'sounds', sound);
  const exists = fs.existsSync(soundPath);
  assert(exists, `Sound file ${sound} exists at client/public/sounds/${sound}`);
  if (exists) {
    const stat = fs.statSync(soundPath);
    const header = fs.readFileSync(soundPath).subarray(0, 4).toString('latin1');
    const validHeader = sound.endsWith('.ogg')
      ? header === 'OggS'
      : header === 'RIFF';
    assert(stat.size > 1024 && validHeader, `Sound file ${sound} is non-corrupt (${stat.size} bytes, header="${header}")`);
  }
});

// Check guided tour MP3 audio integrity (stored in client/public/sounds/)
const soundsDir = path.join(projectRoot, 'client', 'public', 'sounds');
const tourFiles = fs.existsSync(soundsDir) ? fs.readdirSync(soundsDir).filter(f => f.endsWith('.mp3')) : [];
assert(tourFiles.length >= 18, `Studio guided narration directory contains all tracks (${tourFiles.length} found)`);
const allTourValid = tourFiles.every(f => {
  const p = path.join(soundsDir, f);
  const buf = fs.readFileSync(p);
  return buf.length > 2048 && (buf.subarray(0, 3).toString('latin1') === 'ID3' || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0));
});
assert(allTourValid, 'All guided tour .mp3 files are valid MP3/ID3 audio (>2 KB)');

// Check all TOUR_TRACKS targets exist via useTourSpotlight across client/src
const tourEngineSrc = fs.readFileSync(path.join(projectRoot, 'client', 'src', 'guide', 'tourEngine.ts'), 'utf8');
const trackSectionMatch = tourEngineSrc.match(/export const TOUR_TRACKS[\s\S]*?^};/m);
const declaredTargets = new Set();
if (trackSectionMatch) {
  const targetsMatch = trackSectionMatch[0].matchAll(/targets:\s*\[([^\]]*)\]/g);
  for (const tm of targetsMatch) {
    for (const idMatch of tm[1].matchAll(/'([^']+)'/g)) {
      declaredTargets.add(idMatch[1]);
    }
  }
}
const wiredSpotlights = new Set();
function walkSrc(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSrc(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      for (const m of content.matchAll(/useTourSpotlight\('([^']+)'\)/g)) {
        wiredSpotlights.add(m[1]);
      }
    }
  }
}
walkSrc(path.join(projectRoot, 'client', 'src'));
const missingSpotlights = [...declaredTargets].filter(t => !wiredSpotlights.has(t));
assert(declaredTargets.size > 0 && missingSpotlights.length === 0, `All ${declaredTargets.size} tour spotlight targets are wired to UI elements (${missingSpotlights.length} missing)`);

// Check 3D hotspot pin parity in server & client registries
const pinSources =
  fs.readFileSync(path.join(projectRoot, 'client', 'src', 'components', '3d', 'Rover3DModel.tsx'), 'utf8') +
  '\n' +
  fs.readFileSync(path.join(projectRoot, 'client', 'src', 'components', '3d', 'StarshipHLS3D.tsx'), 'utf8');
const pinIds = new Set();
for (const m of pinSources.matchAll(/<CyberHotspotPin[\s\S]*?id="([^"]+)"/g)) {
  pinIds.add(m[1]);
}
const regIds = new Set();
for (const m of VERIFIED_NASA_MISSIONS) {
  for (const hw of m.hardware || []) regIds.add(hw.id.toLowerCase());
}
for (const k of Object.keys(SUBSYSTEM_REGISTRY)) regIds.add(k.toLowerCase());
const missingPinServer = [...pinIds].filter(p => !regIds.has(p.toLowerCase()));
const fallbackSrc = fs.readFileSync(path.join(projectRoot, 'client', 'src', 'utils', 'nasaDataFallback.ts'), 'utf8');
const fbIds = new Set();
for (const m of fallbackSrc.matchAll(/id:\s*'([^']+)'/g)) fbIds.add(m[1].toLowerCase());
const missingPinClient = [...pinIds].filter(p => !fbIds.has(p.toLowerCase()));
assert(pinIds.size >= 60 && missingPinServer.length === 0 && missingPinClient.length === 0, `All ${pinIds.size} 3D hotspot pins resolve in both server & client registries`);
assert(VERIFIED_NASA_MISSIONS.some(m => m.id === 'voyager') && typeof resolveHardwareForMission === 'function', 'Voyager mission & resolveHardwareForMission registered cleanly');

// 2. Critical 3D Models Test
console.log('\n▶ Test Suite 2: Core 3D Planetary & Hardware Models');
const requiredModels = [
  'earth.glb',
  'mars.glb',
  'moon.glb',
  'perseverance.glb',
  'curiosity.glb',
  'apollo_lunar_module.glb',
  'ingenuity.glb',
  'isro_chandrayyan-3_mission_lander_module_vikram.glb',
  'iss.glb',
  'jwst.glb',
  'tripo_astronaut_2_stylized_and_animated.glb',
  'rocket_saturn_v.glb',
  'extracted_pano.jpg'
];

requiredModels.forEach(model => {
  const modelPath = path.join(projectRoot, 'client', 'public', 'models', model);
  const exists = fs.existsSync(modelPath);
  assert(exists, `3D Asset ${model} exists at client/public/models/${model}`);
});

// 3. Videos Test
console.log('\n▶ Test Suite 3: Historical Mission Video Sequences');
const requiredVideos = [
  'apollo11_landing.mp4',
  'mars_edl_landing.mp4',
  'mars_launch_journey.mp4',
  'moon_launch_journey.mp4'
];

requiredVideos.forEach(video => {
  const videoPath = path.join(projectRoot, 'client', 'public', 'videos', video);
  const exists = fs.existsSync(videoPath);
  assert(exists, `Video asset ${video} exists at client/public/videos/${video}`);
});

// 4. Server Route Files Test
console.log('\n▶ Test Suite 4: Backend API Services & Routes');
const serverFiles = [
  'server.js',
  'routes/nasa.js',
  'routes/ai.js',
  'services/nasaRegistry.js',
  'services/nasaDataResolver.js',
  'services/aiService.js'
];

serverFiles.forEach(file => {
  const filePath = path.join(projectRoot, 'server', file);
  const exists = fs.existsSync(filePath);
  assert(exists, `Backend file ${file} exists`);
});

// 5. Client Pages & Architecture Test
console.log('\n▶ Test Suite 5: Frontend Modular Architecture');
const clientFiles = [
  'src/pages/SpaceHomePage.tsx',
  'src/pages/DestinationPage.tsx',
  'src/pages/EarthLaunchPage.tsx',
  'src/pages/LandingPage.tsx',
  'src/pages/ExplorationPage.tsx',
  'src/services/api.ts',
  'src/components/common/CanvasErrorBoundary.tsx',
  'src/components/skeleton/StoryModalSkeleton.tsx',
  'src/components/skeleton/QuizModalSkeleton.tsx',
  'src/components/skeleton/HardwareInspectSkeleton.tsx',
  'src/components/skeleton/DataRegistrySkeleton.tsx',
  'src/components/skeleton/ScreenSkeleton.tsx'
];

clientFiles.forEach(file => {
  const filePath = path.join(projectRoot, 'client', file);
  const exists = fs.existsSync(filePath);
  assert(exists, `Client module ${file} exists`);
});

// 6. Destination Theater Isolation & Curated Quiz Integrity Test
console.log('\n▶ Test Suite 6: Pure Destination Separation, Science Lab & Curated Quizzes');
const allMissionIds = VERIFIED_NASA_MISSIONS.map(m => m.id);
const coveredQuizMissions = allMissionIds.filter(
  id => CURATED_MISSION_QUIZZES[id] && Array.isArray(CURATED_MISSION_QUIZZES[id].questions) && CURATED_MISSION_QUIZZES[id].questions.length >= 5
);
assert(
  coveredQuizMissions.length === allMissionIds.length,
  `CURATED_MISSION_QUIZZES covers all ${allMissionIds.length} NASA missions with >=5 questions each (${coveredQuizMissions.length}/${allMissionIds.length})`
);

const totalQuizQuestions = Object.values(CURATED_MISSION_QUIZZES).reduce(
  (sum, entry) => sum + (entry.questions ? entry.questions.length : 0),
  0
);
assert(totalQuizQuestions >= 90, `Curated quiz bank contains 90+ mission questions (${totalQuizQuestions} found)`);

const moonLeakTerms = ['olympus mons', 'valles marineris', 'gusev crater', 'jezero', 'perseverance', 'ingenuity'];
const marsLeakTerms = ['tranquility base', 'shackleton', 'hadley rille', 'apollo 11', 'chandrayaan'];
const moonQuizText = Object.values(CURATED_MISSION_QUIZZES)
  .filter(e => e.theater === 'Moon')
  .map(e => JSON.stringify(e).toLowerCase())
  .join('\n');
const marsQuizText = Object.values(CURATED_MISSION_QUIZZES)
  .filter(e => e.theater === 'Mars')
  .map(e => JSON.stringify(e).toLowerCase())
  .join('\n');
const moonHasMarsLeak = moonLeakTerms.some(term => moonQuizText.includes(term));
const marsHasMoonLeak = marsLeakTerms.some(term => marsQuizText.includes(term));
assert(!moonHasMarsLeak && !marsHasMoonLeak, 'Zero cross-theater quiz contamination between Moon and Mars banks');

const deepSpaceIds = ['jwst', 'hubble', 'iss', 'voyager'];
const deepSpaceValid = deepSpaceIds.every(id => CURATED_MISSION_QUIZZES[id]?.theater === 'DeepSpace');
const builtSampleQuiz = buildCuratedQuizPayload(
  { mission: { id: 'apollo11', name: 'Apollo 11', destination: 'Moon' }, hardware: { id: 'eagle-descent-stage', name: 'Eagle Descent Stage' }, destination: 'Moon' },
  2
);
assert(
  deepSpaceValid && builtSampleQuiz && builtSampleQuiz.questions.length === 5 && builtSampleQuiz.roundSeed === 2,
  'DeepSpace quizzes isolated cleanly & buildCuratedQuizPayload generates seeded 5-question rounds'
);

const missionCatalogPath = path.join(projectRoot, 'client', 'src', 'utils', 'missionCatalog.ts');
const explorationSrc = fs.readFileSync(path.join(projectRoot, 'client', 'src', 'pages', 'ExplorationPage.tsx'), 'utf8');
const scienceLabSrc = fs.readFileSync(path.join(projectRoot, 'client', 'src', 'components', 'simulators', 'ScienceSimulatorsModal.tsx'), 'utf8');
assert(
  fs.existsSync(missionCatalogPath) &&
    explorationSrc.includes('getMissionsForTheater') &&
    !explorationSrc.includes('missionGroups') &&
    scienceLabSrc.includes('getTheaterForMission') &&
    scienceLabSrc.includes('ds_jwst'),
  'Frontend mission switcher & Science Lab strictly isolate Mars, Moon, and DeepSpace theaters'
);

console.log(`\n========================================`);
console.log(`SUMMARY: ${passedTests}/${totalTests} Tests Passed`);
if (failedTests > 0) {
  console.error(`🚨 ${failedTests} Tests Failed!`);
  process.exit(1);
} else {
  console.log(`🎉 All System Integrity Tests Passed 100%!`);
  process.exit(0);
}
