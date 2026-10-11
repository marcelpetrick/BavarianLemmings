// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import {
  createNoise,
  defineInstrument,
  envelopeLevel,
  INSTRUMENT_IDS,
  INSTRUMENTS,
  midiToFrequency,
  mixInto,
  normalise,
  noteSampleCount,
  renderNote,
  waveform,
  type Envelope,
} from '../../src/audio/fm';
import { allFinite, peakOf, rms, spectralPeak } from './spectrum';

const RATE = 22050;
const pureSine = defineInstrument(
  { ratio: 1, level: 0.8, waveform: 'sine', envelope: { attack: 0.01, decay: 0.05, sustain: 0.7, release: 0.05 } },
  { ratio: 1, level: 0, waveform: 'sine', envelope: { attack: 0.01, decay: 0.05, sustain: 0.7, release: 0.05 } },
);

describe('midiToFrequency', () => {
  it('maps A4 to 440 Hz and an octave to a factor of two', () => {
    expect(midiToFrequency(69)).toBe(440);
    expect(midiToFrequency(81)).toBeCloseTo(880, 9);
    expect(midiToFrequency(60)).toBeCloseTo(261.6256, 3);
  });
});

describe('waveform', () => {
  it('produces the four OPL shapes', () => {
    const quarter = Math.PI / 2;
    const threeQuarter = (3 * Math.PI) / 2;
    expect(waveform('sine', quarter)).toBeCloseTo(1);
    expect(waveform('sine', threeQuarter)).toBeCloseTo(-1);
    expect(waveform('halfSine', quarter)).toBeCloseTo(1);
    expect(waveform('halfSine', threeQuarter)).toBe(0);
    expect(waveform('absSine', threeQuarter)).toBeCloseTo(1);
    expect(waveform('square', quarter)).toBeCloseTo(1);
    expect(waveform('square', threeQuarter)).toBeCloseTo(-1);
    expect(Math.abs(waveform('square', 0.6))).toBeGreaterThan(0.9);
  });
});

describe('envelopeLevel', () => {
  const envelope: Envelope = { attack: 0.1, decay: 0.1, sustain: 0.5, release: 0.2 };
  it('rises, decays, sustains and releases to silence', () => {
    expect(envelopeLevel(envelope, -1, 1)).toBe(0);
    expect(envelopeLevel(envelope, 0.05, 1)).toBeCloseTo(0.5);
    expect(envelopeLevel(envelope, 0.1, 1)).toBeCloseTo(1);
    expect(envelopeLevel(envelope, 0.15, 1)).toBeCloseTo(0.75);
    expect(envelopeLevel(envelope, 0.5, 1)).toBeCloseTo(0.5);
    expect(envelopeLevel(envelope, 1.1, 1)).toBeCloseTo(0.25);
    expect(envelopeLevel(envelope, 1.2, 1)).toBeCloseTo(0, 12);
    expect(envelopeLevel(envelope, 5, 1)).toBe(0);
  });
  it('releases from the level reached when the key is let go during the attack', () => {
    expect(envelopeLevel(envelope, 0.05, 0.05)).toBeCloseTo(0.5);
    expect(envelopeLevel(envelope, 0.15, 0.05)).toBeCloseTo(0.25);
  });
  it('treats a zero attack and decay as instant', () => {
    const instant: Envelope = { attack: 0, decay: 0, sustain: 0.3, release: 0.1 };
    expect(envelopeLevel(instant, 0, 1)).toBeCloseTo(0.3);
  });
});

describe('renderNote', () => {
  it('has its spectral peak at the note frequency', () => {
    for (const midi of [57, 69, 76]) {
      const frequency = midiToFrequency(midi);
      const samples = renderNote(pureSine, frequency, 0.5, RATE);
      const peak = spectralPeak(samples, RATE, 100, 2000, 1);
      expect(Math.abs(peak - frequency)).toBeLessThanOrEqual(2);
    }
  });

  it('keeps the fundamental as the peak for an FM lead voice', () => {
    const frequency = midiToFrequency(69);
    const samples = renderNote(INSTRUMENTS.flute, frequency, 0.5, RATE);
    expect(Math.abs(spectralPeak(samples, RATE, 100, 4000, 1) - frequency)).toBeLessThanOrEqual(2);
  });

  it('covers the held time plus the release and ends in silence', () => {
    const samples = renderNote(pureSine, 440, 0.25, RATE);
    expect(samples.length).toBe(noteSampleCount(pureSine, 0.25, RATE));
    expect(samples.length).toBe(Math.ceil(0.3 * RATE));
    expect(samples[samples.length - 1]).toBe(0);
    expect(rms(samples, samples.length - 20)).toBeLessThan(0.01);
    expect(rms(samples, 0, Math.round(0.25 * RATE))).toBeGreaterThan(0.3);
  });

  it('is deterministic', () => {
    expect(renderNote(INSTRUMENTS.snare, 200, 0.1, RATE)).toEqual(renderNote(INSTRUMENTS.snare, 200, 0.1, RATE));
  });

  it('renders every instrument in the bank without NaN and inside [-1, 1]', () => {
    expect(INSTRUMENT_IDS.length).toBeGreaterThanOrEqual(10);
    for (const id of INSTRUMENT_IDS) {
      for (const midi of [36, 60, 84]) {
        const samples = renderNote(INSTRUMENTS[id], midiToFrequency(midi), 0.3, RATE);
        expect(allFinite(samples), id).toBe(true);
        expect(peakOf(samples), id).toBeLessThanOrEqual(1);
        expect(peakOf(samples), id).toBeGreaterThan(0.05);
        expect(samples[samples.length - 1], id).toBe(0);
      }
    }
  });

  it('glides the pitch down during a sweep', () => {
    const kick = renderNote(INSTRUMENTS.kick, 55, 0.2, RATE);
    const start = kick.slice(0, Math.round(0.03 * RATE));
    const end = kick.slice(Math.round(0.08 * RATE), Math.round(0.16 * RATE));
    expect(spectralPeak(start, RATE, 40, 1000, 5)).toBeGreaterThan(spectralPeak(end, RATE, 40, 1000, 5));
  });

  it('always returns at least one sample', () => {
    expect(renderNote(pureSine, 440, 0, 1).length).toBe(1);
  });
});

describe('createNoise', () => {
  it('is deterministic per seed, spans [-1, 1] and averages near zero', () => {
    const a = createNoise(42);
    const b = createNoise(42);
    const c = createNoise(43);
    let sum = 0;
    let differs = false;
    for (let i = 0; i < 10000; i++) {
      const value = a();
      expect(value).toBe(b());
      if (value !== c()) differs = true;
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
      sum += value;
    }
    expect(differs).toBe(true);
    expect(Math.abs(sum / 10000)).toBeLessThan(0.05);
  });
  it('replaces the forbidden xorshift seed 0 with a fixed one', () => {
    expect(createNoise(0)()).not.toBe(0);
  });
});

describe('mixInto and normalise', () => {
  it('adds with an offset and a gain, dropping what does not fit', () => {
    const target = new Float32Array([1, 1, 1]);
    mixInto(target, new Float32Array([1, 2, 3]), 1, 0.5);
    expect(Array.from(target)).toEqual([1, 1.5, 2]);
    mixInto(target, new Float32Array([4, 4]), -1, 1);
    expect(Array.from(target)).toEqual([5, 1.5, 2]);
  });
  it('scales to the requested peak and leaves silence alone', () => {
    expect(Array.from(normalise(new Float32Array([0.5, -0.25]), 1))).toEqual([1, -0.5]);
    expect(Array.from(normalise(new Float32Array(2), 1))).toEqual([0, 0]);
  });
});
