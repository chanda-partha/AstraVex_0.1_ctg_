const fs = require('fs');
const path = require('path');

const sampleRate = 44100;

function createWavHeader(dataLength, sampleRate = 44100, numChannels = 1, bitsPerSample = 16) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

function writeWav(filename, samples) {
  const dataLength = samples.length * 2;
  const header = createWavHeader(dataLength, sampleRate, 1, 16);
  const data = Buffer.alloc(dataLength);

  for (let i = 0; i < samples.length; i++) {
    // Clamp to -1.0 to 1.0
    const s = Math.max(-1, Math.min(1, samples[i]));
    // Convert to 16-bit signed PCM
    const val = s < 0 ? s * 32768 : s * 32767;
    data.writeInt16LE(Math.floor(val), i * 2);
  }

  const outPath = path.join(__dirname, '../../client/public/sounds', filename);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, Buffer.concat([header, data]));
  console.log(`Generated ${filename} (${samples.length} samples, ${(samples.length / sampleRate).toFixed(2)}s)`);
}

// 1. UI Soft Tactile Click (Subtle Apple/Tesla-style haptic tap, ~35ms)
function generateClick() {
  const duration = 0.035;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 120); // Fast organic decay
    // Dual damped sine frequencies for warm physical acoustic presence
    const body = Math.sin(2 * Math.PI * 420 * t) * 0.6 + Math.sin(2 * Math.PI * 180 * t) * 0.4;
    samples[i] = body * env * 0.25; // Gentle, not piercing
  }
  writeWav('ui_click.wav', samples);
}

// 2. High-End Mission Control Glass Chime (Harmonic Rhodes/Marimba chord, ~0.65s)
function generateChime() {
  const duration = 0.65;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);
  const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Pristine harmonic chord)

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = 0;
    freqs.forEach((f, idx) => {
      const noteDelay = idx * 0.035;
      if (t >= noteDelay) {
        const noteT = t - noteDelay;
        const env = Math.exp(-noteT * 7.5);
        // Rich warm bell with soft fundamental and octave harmonic
        const note = Math.sin(2 * Math.PI * f * noteT) * 0.7 + Math.sin(2 * Math.PI * f * 2 * noteT) * 0.2;
        val += note * env;
      }
    });
    samples[i] = val * 0.18; // Soft, smooth master gain
  }
  writeWav('telemetry_chime.wav', samples);
}

// 3. Authentic NASA Quindar Roger Tone & Radio Burst (~0.12s)
function generateQuindarTone() {
  const duration = 0.12;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Envelope with smooth 5ms attack and decay to prevent clicking
    let env = 1.0;
    if (t < 0.008) env = t / 0.008;
    else if (t > duration - 0.015) env = (duration - t) / 0.015;

    // Authentic 2525Hz Apollo Quindar intro tone with subtle warm saturation
    const tone = Math.sin(2 * Math.PI * 2525 * t);
    // Tiny hint of analog radio tape noise
    const noise = (Math.random() * 2 - 1) * 0.02;
    samples[i] = (tone * 0.85 + noise) * env * 0.08; // Quiet, authentic background volume
  }
  writeWav('quindar_beep.wav', samples);
}

// 4. Heavy Deep Space Rocket Thruster / Engine Ignition Rumble (~2.5s)
function generateThruster() {
  const duration = 2.5;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  // Brownian random walk for heavy subsonic bass
  let brown = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const white = Math.random() * 2 - 1;
    brown = (brown + 0.02 * white) / 1.02;

    // Smooth envelope: 0.3s ramp up, sustain, smooth roll-off
    let env = 1.0;
    if (t < 0.3) env = t / 0.3;
    else env = Math.exp(-(t - 0.3) * 1.2);

    // Deep sub-harmonics at 38Hz and 65Hz for room-shaking cinematic presence
    const sub1 = Math.sin(2 * Math.PI * 38 * t);
    const sub2 = Math.sin(2 * Math.PI * 65 * t);

    samples[i] = (brown * 3.5 + sub1 * 0.4 + sub2 * 0.2) * env * 0.28;
  }
  writeWav('rocket_thrust.wav', samples);
}

// 5. Mission Success Confirmation (Warm C-Major Aerospace triad, ~0.8s)
function generateSuccess() {
  const duration = 0.8;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);
  const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = 0;
    notes.forEach((f, idx) => {
      const delay = idx * 0.04;
      if (t >= delay) {
        const noteT = t - delay;
        const env = Math.exp(-noteT * 6.0);
        val += Math.sin(2 * Math.PI * f * noteT) * env;
      }
    });
    samples[i] = val * 0.16;
  }
  writeWav('mission_success.wav', samples);
}

// 6. Gentle Telemetry Alert (Soft, non-jarring low tone, ~0.25s)
function generateAlert() {
  const duration = 0.25;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 10);
    // Smooth dual tone, not a screeching alarm
    const val = Math.sin(2 * Math.PI * 350 * t) * 0.7 + Math.sin(2 * Math.PI * 450 * t) * 0.3;
    samples[i] = val * env * 0.12;
  }
  writeWav('telemetry_alert.wav', samples);
}

// Run all
console.log('Generating high-end audio assets...');
generateClick();
generateChime();
generateQuindarTone();
generateThruster();
generateSuccess();
generateAlert();
console.log('Done!');
