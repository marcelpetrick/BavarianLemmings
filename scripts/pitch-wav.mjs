#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later
//
// pitch-wav.mjs: make a speech WAV sound like a lemming (faster and higher), without sox.
//
// It reads a 16-bit mono PCM WAV, trims silence at both ends, plays it `factor` times faster by
// linear-interpolation resampling (pitch and speed rise together, like a tape played too fast),
// fades the edges in and out over 5 ms against clicks, and writes a 16-bit mono WAV at the same
// sample rate. The output is deterministic: the same input always gives the same bytes.
//
// Usage:      node scripts/pitch-wav.mjs <input.wav> <output.wav> [factor]   (default factor 1.3)
// Exit codes: 0 = written, 1 = unreadable or unsupported input, 2 = bad usage

import { readFileSync, writeFileSync } from 'node:fs';

const [input, output, factorText = '1.3'] = process.argv.slice(2);
const factor = Number(factorText);
if (!input || !output || !(factor > 0)) {
  console.error('usage: node scripts/pitch-wav.mjs <input.wav> <output.wav> [factor]');
  process.exit(2);
}

/** Find a RIFF chunk by id; returns its data offset and size. */
function findChunk(buffer, id) {
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const size = buffer.readUInt32LE(offset + 4);
    if (buffer.toString('ascii', offset, offset + 4) === id) return { offset: offset + 8, size };
    offset += 8 + size + (size % 2);
  }
  return undefined;
}

let wav;
try {
  wav = readFileSync(input);
} catch (error) {
  console.error(`cannot read ${input}: ${error.message}`);
  process.exit(1);
}
const format = findChunk(wav, 'fmt ');
const data = findChunk(wav, 'data');
if (wav.toString('ascii', 0, 4) !== 'RIFF' || !format || !data) {
  console.error(`${input} is not a WAV file`);
  process.exit(1);
}
const channels = wav.readUInt16LE(format.offset + 2);
const sampleRate = wav.readUInt32LE(format.offset + 4);
const bits = wav.readUInt16LE(format.offset + 14);
if (channels !== 1 || bits !== 16) {
  console.error(`${input}: need 16-bit mono, got ${bits}-bit with ${channels} channels`);
  process.exit(1);
}

// espeak-ng may report a data size larger than the file when writing to a pipe; clamp it.
const sampleCount = Math.floor(Math.min(data.size, wav.length - data.offset) / 2);
const samples = new Float64Array(sampleCount);
for (let i = 0; i < sampleCount; i++) samples[i] = wav.readInt16LE(data.offset + i * 2) / 32768;

// Trim silence: everything below 1 % of full scale at the start and the end.
const threshold = 0.01;
let first = 0;
while (first < sampleCount && Math.abs(samples[first]) < threshold) first++;
let last = sampleCount - 1;
while (last > first && Math.abs(samples[last]) < threshold) last--;
const trimmed = samples.subarray(first, last + 1);

const outCount = Math.max(1, Math.floor(trimmed.length / factor));
const fadeSamples = Math.round(0.005 * sampleRate);
const out = Buffer.alloc(44 + outCount * 2);
out.write('RIFF', 0, 'ascii');
out.writeUInt32LE(36 + outCount * 2, 4);
out.write('WAVEfmt ', 8, 'ascii');
out.writeUInt32LE(16, 16);
out.writeUInt16LE(1, 20); // PCM
out.writeUInt16LE(1, 22); // mono
out.writeUInt32LE(sampleRate, 24);
out.writeUInt32LE(sampleRate * 2, 28);
out.writeUInt16LE(2, 32);
out.writeUInt16LE(16, 34);
out.write('data', 36, 'ascii');
out.writeUInt32LE(outCount * 2, 40);
for (let i = 0; i < outCount; i++) {
  const position = i * factor;
  const index = Math.floor(position);
  const fraction = position - index;
  const a = trimmed[index] ?? 0;
  const b = trimmed[index + 1] ?? a;
  const fade = Math.min(1, i / fadeSamples, (outCount - 1 - i) / fadeSamples);
  const value = (a + (b - a) * fraction) * fade;
  out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(value * 32768))), 44 + i * 2);
}
writeFileSync(output, out);
console.log(`${output}: ${(outCount / sampleRate).toFixed(2)} s at ${sampleRate} Hz`);
