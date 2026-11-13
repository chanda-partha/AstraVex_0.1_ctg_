/**
 * Automated Astrodynamics, Ephemeris & Mission Flight Profile Verification Suite
 * Validates J2000 orbital mechanics against JPL Horizons reference epochs,
 * Vis-Viva velocities, L2 halo modulation, and 18-mission flight gating.
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';
import {
  getEarthMarsDistanceKm,
  getEarthMoonDistanceKm,
  getJwstL2Telemetry,
  computeVisVivaVelocityKmh,
  getJulianMetadata,
  computeMissionLiveTelemetry,
} from '../server/services/liveTelemetryEngine.js';
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

console.log('\n🛰️ Running Astrodynamics & Flight Profile Verification...\n');

// 1. JPL J2000 Earth-Mars Solver against historical epochs (within J2000 Keplerian 2-body ~5% tolerance)
const dPerseverance = getEarthMarsDistanceKm(Date.parse('2021-02-18T20:55:00Z')); // ~204.7M km real
check(
  `J2000 Earth-Mars at Perseverance Landing (2021-02-18): ${(dPerseverance / 1e6).toFixed(2)}M km`,
  dPerseverance > 190_000_000 && dPerseverance < 220_000_000,
  `Expected ~204.7M km, got ${dPerseverance}`
);

const dOpposition2022 = getEarthMarsDistanceKm(Date.parse('2022-12-01T02:00:00Z')); // ~81.5M km real closest approach
check(
  `J2000 Earth-Mars at 2022 Closest Approach (2022-12-01): ${(dOpposition2022 / 1e6).toFixed(2)}M km`,
  dOpposition2022 > 76_000_000 && dOpposition2022 < 89_000_000,
  `Expected ~81.5M km, got ${dOpposition2022}`
);

const dOpposition2025 = getEarthMarsDistanceKm(Date.parse('2025-01-12T00:00:00Z')); // ~96.1M km real
check(
  `J2000 Earth-Mars at 2025 Opposition (2025-01-12): ${(dOpposition2025 / 1e6).toFixed(2)}M km`,
  dOpposition2025 > 88_000_000 && dOpposition2025 < 105_000_000,
  `Expected ~96.1M km, got ${dOpposition2025}`
);

// 2. Earth-Moon anomalistic distance bounds
const dMoon = getEarthMoonDistanceKm(Date.now());
check(
  `Earth-Moon instant distance within perigee/apogee bounds: ${dMoon.toLocaleString()} km`,
  dMoon >= 356_000 && dMoon <= 407_000
);

// 3. Vis-Viva Orbital Velocities
const vIss = computeVisVivaVelocityKmh(398600.4418, 6371 + 418.4, 6371 + 418.4);
check(
  `Vis-Viva ISS circular velocity (~27,576 km/h): ${vIss} km/h`,
  vIss >= 27400 && vIss <= 27750
);

const vLro = computeVisVivaVelocityKmh(4902.8001, 1737.4 + 50, 1737.4 + 115);
check(
  `Vis-Viva LRO elliptical velocity: ${vLro} km/h`,
  vLro >= 5600 && vLro <= 6200
);

const vMro = computeVisVivaVelocityKmh(42828.3752, 3389.5 + 285, 3389.5 + 287.5);
check(
  `Vis-Viva MRO Mars polar velocity: ${vMro} km/h`,
  vMro >= 12000 && vMro <= 12600
);

// 4. JWST Sun-Earth L2 Halo variation & ephemeris metadata across all 18 missions
const jwst0 = getJwstL2Telemetry(Date.UTC(2026, 0, 1));
const jwst90 = getJwstL2Telemetry(Date.UTC(2026, 3, 1));
check(
  `JWST L2 Halo distance varies smoothly over 90d (${jwst0.distanceKm} vs ${jwst90.distanceKm})`,
  jwst0.distanceKm !== jwst90.distanceKm &&
    jwst0.distanceKm >= 1_350_000 &&
    jwst0.distanceKm <= 1_650_000
);

const jdJ2000 = getJulianMetadata(Date.UTC(2000, 0, 1, 12, 0, 0));
check('Julian Date at J2000.0 equals 2451545.0', jdJ2000.julianDate === 2451545.0);

let allTelemetryValid = true;
for (const m of VERIFIED_NASA_MISSIONS) {
  const rt = computeMissionLiveTelemetry(m, null, Date.now());
  const expectedDelay = Number((rt.earthDistanceKm / 299792.458).toFixed(2));
  if (Math.abs(rt.signalDelaySeconds - expectedDelay) > 0.02 || !rt.ephemerisMeta?.solverModel) {
    allTelemetryValid = false;
    console.error(`Invalid ephemeris/delay for ${m.id}`);
  }
}
check('All 18 verified NASA missions compute consistent light-delay & ephemerisMeta', allTelemetryValid);

// 5. Static Mission Flight Profile Gating Invariants (missionCatalog.ts)
const catalogSrc = fs.readFileSync(path.join(ROOT, 'client/src/utils/missionCatalog.ts'), 'utf8');
check(
  'Orbiter missions (mro, lro, ladee) strictly gated to orbit-capture',
  catalogSrc.includes("mro:") &&
    catalogSrc.includes("lro:") &&
    catalogSrc.includes("ladee:") &&
    (catalogSrc.match(/stage4Kind:\s*'orbit-capture'/g) || []).length === 3
);
check(
  'Only Apollo 11 & Perseverance use local stage4ArchivalVideo footage',
  (catalogSrc.match(/stage4ArchivalVideo:\s*'\/videos\//g) || []).length === 2
);
check(
  'Client ISS longitude formula matches continuous server wrap (no erratic sign flip)',
  !fs
    .readFileSync(path.join(ROOT, 'client/src/utils/liveTelemetry.ts'), 'utf8')
    .includes('Math.sign(Math.cos(phase * 0.5)')
);

const homePageSrc = fs.readFileSync(path.join(ROOT, 'client/src/pages/SpaceHomePage.tsx'), 'utf8');
check(
  'SpaceHomePage OrbitControls are unconstrained (no setAzimuthalAngle useFrame camera lock)',
  !homePageSrc.includes('setAzimuthalAngle') &&
    homePageSrc.includes('JWSTBeaconFallback') &&
    homePageSrc.includes('<Suspense fallback={<JWSTBeaconFallback />}>')
);
check(
  'All 18 missions have dedicated launch and arrival video feeds in missionCatalog.ts',
  (catalogSrc.match(/curatedArrivalVideo:|stage4ArchivalVideo:\s*'\/videos\//g) || []).length === 18 &&
    (catalogSrc.match(/curatedLaunchVideo:|launchArchivalVideo:\s*'\/videos\//g) || []).length === 18
);

console.log(`\n📊 Ephemeris & Flight Gating Verification: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
assert.strictEqual(failed, 0);

