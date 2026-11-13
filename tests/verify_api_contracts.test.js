/**
 * Automated Backend Express API Contract & Security Verification Suite
 * Starts Express app on an ephemeral localhost port (no external network required)
 * and verifies /api/health, /api/nasa/*, /api/ai/* validation, and security headers.
 */

import assert from 'assert';

process.env.ASTRAVEX_TEST_NO_LISTEN = '1';
const { default: app } = await import('../server/server.js');

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

const server = app.listen(0);
await new Promise((resolve) => server.once('listening', resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

try {
  console.log(`\n🌐 Running Express API Contract Tests on ephemeral port ${port}...\n`);

  // 1. /api/health + Security Headers
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthJson = await healthRes.json();
  check('GET /api/health returns 200 OK', healthRes.status === 200 && healthJson.status === 'ok');
  check('GET /api/health reports all 18 NASA datasets', healthJson.datasetCount === 18);
  check(
    'Security headers present & X-Powered-By stripped',
    healthRes.headers.get('x-content-type-options') === 'nosniff' &&
      healthRes.headers.get('x-frame-options') === 'DENY' &&
      healthRes.headers.get('x-powered-by') === null
  );

  // 2. /api/nasa/registry
  const regRes = await fetch(`${baseUrl}/api/nasa/registry`);
  const regJson = await regRes.json();
  check('GET /api/nasa/registry returns registry list', regRes.status === 200 && Array.isArray(regJson.registry) && regJson.count > 0);

  // 3. /api/nasa/missions strict theater filtering
  const moonMissionsRes = await fetch(`${baseUrl}/api/nasa/missions?destination=Moon`);
  const moonMissionsJson = await moonMissionsRes.json();
  const marsMissionsRes = await fetch(`${baseUrl}/api/nasa/missions?destination=Mars`);
  const marsMissionsJson = await marsMissionsRes.json();
  const dsMissionsRes = await fetch(`${baseUrl}/api/nasa/missions?destination=DeepSpace`);
  const dsMissionsJson = await dsMissionsRes.json();

  check('GET /api/nasa/missions?destination=Moon returns 9 Lunar missions', moonMissionsJson.count === 9);
  check('GET /api/nasa/missions?destination=Mars returns 5 Mars missions', marsMissionsJson.count === 5);
  check('GET /api/nasa/missions?destination=DeepSpace returns 4 Deep Space missions', dsMissionsJson.count === 4);

  // 4. /api/nasa/resolve across theaters
  const resolveMoon = await (await fetch(`${baseUrl}/api/nasa/resolve?destination=Moon&mission=chandrayaan3&hardware=vikram-lander`)).json();
  check(
    'GET /api/nasa/resolve resolves Chandrayaan-3 Vikram with ephemerisMeta',
    resolveMoon.mission?.id === 'chandrayaan3' && Boolean(resolveMoon.realTimeTelemetry?.ephemerisMeta?.solverModel)
  );

  // 5. POST /api/ai/chat input validation
  const badChatRes = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '   ' }),
  });
  check('POST /api/ai/chat rejects blank message with HTTP 400', badChatRes.status === 400);

  const okChatRes = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'What does SuperCam measure on Mars?',
      contextData: { destination: 'Mars', mission: resolveMoon.mission },
    }),
  });
  const okChatJson = await okChatRes.json();
  check('POST /api/ai/chat returns valid reply payload', okChatRes.status === 200 && typeof okChatJson.reply === 'string' && okChatJson.reply.length > 10);

  // 6. POST /api/ai/quiz curated mission payload
  const quizRes = await fetch(`${baseUrl}/api/ai/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destination: 'Moon', mission: 'apollo11', hardware: 'eagle-descent-stage', roundSeed: 1 }),
  });
  const quizJson = await quizRes.json();
  check(
    'POST /api/ai/quiz returns 5-question Apollo 11 quiz without Martian leaks',
    quizRes.status === 200 &&
      quizJson.quiz?.questions?.length >= 5 &&
      !JSON.stringify(quizJson.quiz).includes('Olympus Mons')
  );

  // 7. GET /api/nasa/videos returns valid HTTPS .mp4 URLs across missions
  for (const vidMission of ['artemis3', 'curiosity', 'jwst']) {
    const vidRes = await fetch(`${baseUrl}/api/nasa/videos?mission=${vidMission}`);
    const vidJson = await vidRes.json();
    const hasHttpsMp4 =
      Array.isArray(vidJson.videos) &&
      vidJson.videos.length > 0 &&
      vidJson.videos.every(
        (v) => typeof v.videoUrl === 'string' && v.videoUrl.startsWith('https://') && v.videoUrl.includes('.mp4')
      );
    check(`GET /api/nasa/videos?mission=${vidMission} returns valid HTTPS .mp4 clip(s)`, vidRes.status === 200 && hasHttpsMp4);
  }
} finally {
  server.close();
}

console.log(`\n📊 API Contract Verification: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
assert.strictEqual(failed, 0);

