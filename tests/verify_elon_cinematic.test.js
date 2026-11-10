// Verification test suite for ELON AI Space Mission Guide & Cinematic Audio Engine
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { answerElon } from '../server/services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log('\n🛸 RUNNING ELON AI & CINEMATIC AUDIO VERIFICATION TESTS\n');

  // Test Suite 1: Cinematic Audio Asset Verification
  console.log('▶ Test Suite 1: Cinematic Background Music & Audio Files');
  const musicPath = path.join(ROOT_DIR, 'client/public/sounds/astravex_cinematic_music.wav');
  assert(fs.existsSync(musicPath), 'astravex_cinematic_music.wav exists in client/public/sounds');
  const stat = fs.statSync(musicPath);
  assert(stat.size > 1000000, `Audio file size is valid (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);

  const audioManagerPath = path.join(ROOT_DIR, 'client/src/audio/AudioManager.ts');
  assert(fs.existsSync(audioManagerPath), 'client/src/audio/AudioManager.ts exists');

  // Test Suite 2: ELON Modular Architecture
  console.log('\n▶ Test Suite 2: ELON Modular Component Structure');
  const elonFiles = [
    'client/src/elon/ElonAssistant.tsx',
    'client/src/elon/ElonVoice.ts',
    'client/src/elon/ElonConversation.ts',
    'client/src/elon/elonPrompt.ts',
    'client/src/elon/ElonAssistant.css',
  ];
  for (const f of elonFiles) {
    assert(fs.existsSync(path.join(ROOT_DIR, f)), `File ${f} exists`);
  }

  // Test Suite 3: ELON Conversation Engine & Stage Fallbacks
  console.log('\n▶ Test Suite 3: ELON Dialogue & Dynamic Name Greeting');

  // Welcome stage
  const welcomeRes = await answerElon("", "Explorer", "welcome");
  assert(welcomeRes && welcomeRes.reply.includes("ELON") && welcomeRes.reply.includes("ASTRAVEX"), 'ELON generates valid cinematic welcome dialogue');

  // Ask name stage
  const askNameRes = await answerElon("", "Explorer", "ask_name");
  assert(askNameRes && askNameRes.reply.includes("name"), 'ELON asks for explorer name');

  // Step 3: Personalized greeting with dynamic name (e.g. Partha)
  const greetingRes = await answerElon("", "Partha", "greeting");
  assert(greetingRes && greetingRes.reply.includes("Partha"), 'ELON dynamically inserts explorer name ("Partha")');
  assert(greetingRes.reply.includes("Moon") && greetingRes.reply.includes("Mars"), 'Personalized greeting introduces Moon and Mars exploration');

  // Step 4: Space Intro
  const introRes = await answerElon("", "Partha", "space_intro");
  assert(introRes && introRes.reply.includes("exploration"), 'ELON generates space exploration introduction');

  // Step 5: Mission Briefing
  const briefRes = await answerElon("", "Partha", "mission_brief");
  assert(briefRes && briefRes.reply.includes("Commander Partha") && briefRes.reply.includes("Moon"), 'ELON briefs Commander Partha on Moon and Mars mission options');

  // Astronomy Q&A
  const moonRes = await answerElon("Tell me about the Moon", "Partha", "general");
  assert(moonRes && moonRes.reply.includes("384,400"), 'ELON answers lunar facts with verified distance (384,400 km)');

  // Test Suite 4: Security & Stateless Architecture
  console.log('\n▶ Test Suite 4: Temporary State & Security Integrity');
  const appContent = fs.readFileSync(path.join(ROOT_DIR, 'client/src/App.tsx'), 'utf-8');
  assert(!appContent.includes('firebase/auth'), 'No Firebase authentication introduced');
  assert(!appContent.includes('createUserWithEmailAndPassword'), 'No account registration introduced');
  assert(!appContent.includes('password'), 'No passwords collected');

  console.log(`\n========================================`);
  console.log(`SUMMARY: ${passedCount}/${totalCount} Tests Passed`);
  if (passedCount === totalCount) {
    console.log(`🎉 All ELON Verification Tests Passed 100%!\n`);
  }
}

runTests().catch(err => {
  console.error("Test runner error:", err);
  process.exit(1);
});

