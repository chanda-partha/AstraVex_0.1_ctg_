// Node.js script to synthesize an original Interstellar-inspired atmospheric space ambient soundtrack
// Produces a studio-quality 16-bit 44.1kHz stereo WAV file with organ harmonics, drone, and celestial pads.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_RATE = 44100;
const DURATION_SEC = 45; // 45-second seamless atmospheric loop
const NUM_SAMPLES = SAMPLE_RATE * DURATION_SEC;
const NUM_CHANNELS = 2;
const BYTES_PER_SAMPLE = 2; // 16-bit PCM

console.log(`Generating ${DURATION_SEC}s Interstellar-inspired ambient soundtrack...`);

// Musical chord progression (Frequencies in Hz):
// 1. A minor (A2: 110, C3: 130.81, E3: 164.81, A3: 220) - 11.25s
// 2. F major (F2: 87.31, A2: 110.00, C3: 130.81, F3: 174.61) - 11.25s
// 3. D minor (D2: 73.42, F2: 87.31, A2: 110.00, D3: 146.83) - 11.25s
// 4. E minor (E2: 82.41, G2: 98.00, B2: 123.47, E3: 164.81) - 11.25s
const CHORD_DURATION = DURATION_SEC / 4; // 11.25s each

const chords = [
  // Am
  { bass: 55.0, notes: [110.0, 130.81, 164.81, 220.0, 329.63] },
  // F
  { bass: 43.65, notes: [87.31, 110.0, 130.81, 174.61, 261.63] },
  // Dm
  { bass: 36.71, notes: [73.42, 87.31, 110.0, 146.83, 220.0] },
  // Em
  { bass: 41.20, notes: [82.41, 98.0, 123.47, 164.81, 246.94] },
];

// Helper: Organ / Synth tone with subtle detuned chorus & harmonics
function getHarmonic(t, freq, phase = 0) {
  // Organ drawbars: fundamental (1.0), octave (0.5), twelfth (0.25), second octave (0.15)
  const f1 = Math.sin(2 * Math.PI * freq * t + phase);
  const f2 = Math.sin(2 * Math.PI * (freq * 2.003) * t + phase + 0.1) * 0.45;
  const f3 = Math.sin(2 * Math.PI * (freq * 2.997) * t + phase + 0.3) * 0.22;
  const f4 = Math.sin(2 * Math.PI * (freq * 4.004) * t + phase + 0.5) * 0.12;
  return (f1 + f2 + f3 + f4) / 1.79;
}

const buffer = Buffer.alloc(NUM_SAMPLES * NUM_CHANNELS * BYTES_PER_SAMPLE);

let offset = 0;

for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;

  // Determine current and next chord for smooth interpolation
  const chordIdx = Math.floor(t / CHORD_DURATION) % chords.length;
  const nextChordIdx = (chordIdx + 1) % chords.length;
  const localT = (t % CHORD_DURATION) / CHORD_DURATION;

  // Smooth cross-fade transition between chords (cosine ease)
  const crossfadeWindow = 0.25; // 25% of chord duration is transition
  let wNext = 0;
  let wCurr = 1;
  if (localT > 1 - crossfadeWindow) {
    const fadeProg = (localT - (1 - crossfadeWindow)) / crossfadeWindow;
    wNext = 0.5 * (1 - Math.cos(Math.PI * fadeProg));
    wCurr = 1 - wNext;
  }

  const curr = chords[chordIdx];
  const next = chords[nextChordIdx];

  // Deep Organ Sub-Bass Pedal Tone (with slow breathing LFO modulation)
  const lfoBreath = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.08 * t);
  const bassL = (getHarmonic(t, curr.bass, 0) * wCurr + getHarmonic(t, next.bass, 0) * wNext) * 0.42 * lfoBreath;
  const bassR = (getHarmonic(t, curr.bass, 0.2) * wCurr + getHarmonic(t, next.bass, 0.2) * wNext) * 0.42 * lfoBreath;

  // Chord notes layer
  let chordL = 0;
  let chordR = 0;

  for (let n = 0; n < curr.notes.length; n++) {
    const freqCurr = curr.notes[n];
    const freqNext = next.notes[n];
    const panOffset = (n % 2 === 0 ? 0.15 : -0.15); // gentle stereo width
    
    // Slow swell per chord
    const noteSwell = 0.8 + 0.2 * Math.sin(2 * Math.PI * 0.12 * t + n * 0.8);
    
    const sampleCurrL = getHarmonic(t, freqCurr, panOffset) * noteSwell;
    const sampleCurrR = getHarmonic(t, freqCurr, -panOffset) * noteSwell;
    const sampleNextL = getHarmonic(t, freqNext, panOffset) * noteSwell;
    const sampleNextR = getHarmonic(t, freqNext, -panOffset) * noteSwell;

    chordL += (sampleCurrL * wCurr + sampleNextL * wNext) * 0.12;
    chordR += (sampleCurrR * wCurr + sampleNextR * wNext) * 0.12;
  }

  // Celestial high shimmer (celestial bell / glass organ tone)
  const shimmerLFO = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.05 * t);
  const shimmerFreq = 440.0; // A4
  const shimmerL = Math.sin(2 * Math.PI * shimmerFreq * t) * 0.04 * shimmerLFO;
  const shimmerR = Math.sin(2 * Math.PI * (shimmerFreq * 1.002) * t + 0.4) * 0.04 * shimmerLFO;

  // Master mix
  let sampleL = (bassL + chordL + shimmerL);
  let sampleR = (bassR + chordR + shimmerR);

  // Seamless loop cross-fade at very beginning and very end (first & last 2 seconds)
  const loopFadeTime = 2.0;
  if (t < loopFadeTime) {
    const fadeFactor = t / loopFadeTime;
    sampleL *= fadeFactor;
    sampleR *= fadeFactor;
  } else if (t > DURATION_SEC - loopFadeTime) {
    const fadeFactor = (DURATION_SEC - t) / loopFadeTime;
    sampleL *= fadeFactor;
    sampleR *= fadeFactor;
  }

  // Soft master limiter / gentle saturation
  sampleL = Math.tanh(sampleL * 1.35) * 0.75;
  sampleR = Math.tanh(sampleR * 1.35) * 0.75;

  // Convert float (-1.0 to 1.0) to 16-bit integer
  const intL = Math.max(-32768, Math.min(32767, Math.floor(sampleL * 32767)));
  const intR = Math.max(-32768, Math.min(32767, Math.floor(sampleR * 32767)));

  buffer.writeInt16LE(intL, offset);
  offset += 2;
  buffer.writeInt16LE(intR, offset);
  offset += 2;
}

// Construct WAV Header (44 bytes standard PCM header)
const header = Buffer.alloc(44);
const dataSize = buffer.length;
const fileSize = 36 + dataSize;

// ChunkID "RIFF"
header.write('RIFF', 0);
// ChunkSize
header.writeUInt32LE(fileSize, 4);
// Format "WAVE"
header.write('WAVE', 8);
// Subchunk1ID "fmt "
header.write('fmt ', 12);
// Subchunk1Size 16
header.writeUInt32LE(16, 16);
// AudioFormat 1 (PCM)
header.writeUInt16LE(1, 20);
// NumChannels 2
header.writeUInt16LE(NUM_CHANNELS, 22);
// SampleRate 44100
header.writeUInt32LE(SAMPLE_RATE, 24);
// ByteRate = SampleRate * NumChannels * BitsPerSample/8
header.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * BYTES_PER_SAMPLE, 28);
// BlockAlign = NumChannels * BitsPerSample/8
header.writeUInt16LE(NUM_CHANNELS * BYTES_PER_SAMPLE, 32);
// BitsPerSample 16
header.writeUInt16LE(16, 34);
// Subchunk2ID "data"
header.write('data', 36);
// Subchunk2Size
header.writeUInt32LE(dataSize, 40);

const outputPath = path.resolve(__dirname, '../client/public/sounds/astravex_cinematic_music.wav');
fs.writeFileSync(outputPath, Buffer.concat([header, buffer]));

console.log(`✅ Successfully synthesized authentic cinematic soundtrack: ${outputPath} (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB)`);

