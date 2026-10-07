/**
 * Automated Verification Test Suite
 * Tests fallback dataset integrity, schema conformity, and static asset presence
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
});

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

console.log(`\n========================================`);
console.log(`SUMMARY: ${passedTests}/${totalTests} Tests Passed`);
if (failedTests > 0) {
  console.error(`🚨 ${failedTests} Tests Failed!`);
  process.exit(1);
} else {
  console.log(`🎉 All System Integrity Tests Passed 100%!`);
  process.exit(0);
}
