// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { INSTRUMENTS } from '../../src/audio/fm';
import {
  renderRecipe,
  renderSfx,
  SFX_FOR_EVENT,
  SFX_IDS,
  SFX_RECIPES,
  SIM_EVENT_TYPES,
  VOICE_FOR_EVENT,
  type SfxRecipe,
} from '../../src/audio/sfx';
import { allFinite, peakOf, rms, spectralPeak } from './spectrum';

const RATE = 22050;

describe('renderSfx', () => {
  it.each(SFX_IDS)('%s renders a short, finite buffer at its peak level that ends quietly', (id) => {
    const samples = renderSfx(id, RATE);
    const seconds = samples.length / RATE;
    expect(seconds).toBeGreaterThan(0.02);
    expect(seconds).toBeLessThan(1.5);
    expect(allFinite(samples)).toBe(true);
    expect(peakOf(samples)).toBeCloseTo(SFX_RECIPES[id].peak, 5);
    expect(peakOf(samples)).toBeLessThanOrEqual(1);
    expect(Math.abs(samples[samples.length - 1] ?? 1)).toBeLessThan(0.02);
  });

  it('is deterministic (seeded noise, never Math.random)', () => {
    expect(renderSfx('explode', RATE)).toEqual(renderSfx('explode', RATE));
    expect(renderSfx('drown', RATE)).toEqual(renderSfx('drown', RATE));
  });

  it('scales its length with the sample rate', () => {
    const low = renderSfx('splat', 11025).length;
    const high = renderSfx('splat', 44100).length;
    expect(high / low).toBeCloseTo(4, 1);
  });

  it('makes the builder warning higher than a normal brick', () => {
    const brick = spectralPeak(renderSfx('brick', RATE), RATE, 200, 2000, 2);
    const warn = spectralPeak(renderSfx('brickWarn', RATE), RATE, 200, 2000, 2);
    expect(warn).toBeGreaterThan(brick);
  });

  it('darkens the explosion over time (falling filter cutoff)', () => {
    const samples = renderSfx('explode', RATE);
    const crossings = (from: number, to: number): number => {
      let count = 0;
      for (let i = from + 1; i < to; i++) if (Math.sign(samples[i] ?? 0) !== Math.sign(samples[i - 1] ?? 0)) count++;
      return count;
    };
    const window = 2000;
    const late = Math.round(0.5 * RATE);
    expect(crossings(late, late + window)).toBeLessThan(crossings(0, window));
  });

  it('makes the nuke siren a continuous sound', () => {
    const samples = renderSfx('nuke', RATE);
    expect(rms(samples, Math.round(0.3 * RATE), Math.round(0.9 * RATE))).toBeGreaterThan(0.3);
  });
});

describe('renderRecipe edge cases', () => {
  it('renders a linear sweep and a very short creak and noise burst', () => {
    const recipe: SfxRecipe = {
      peak: 0.5,
      steps: [
        { kind: 'sweep', at: 0, length: 0.2, gain: 1, fromHz: 200, toHz: 400, lfoHz: 0 },
        { kind: 'creak', at: 0, length: 0.0001, gain: 1, rateStartHz: 10, rateEndHz: 20, resonanceHz: 500 },
        { kind: 'bubbles', at: 0, length: 0.01, gain: 1, seed: 9, count: 2 },
      ],
    };
    const samples = renderRecipe(recipe, RATE);
    expect(allFinite(samples)).toBe(true);
    expect(peakOf(samples)).toBeCloseTo(0.5, 5);
  });
});

describe('event mapping', () => {
  it('maps only known simulation events to existing effects', () => {
    for (const [event, sfx] of Object.entries(SFX_FOR_EVENT)) {
      expect(SIM_EVENT_TYPES).toContain(event);
      expect(SFX_IDS).toContain(sfx);
    }
  });

  it('gives every audible game moment a sound and keeps the documented silent ones silent', () => {
    const silent = SIM_EVENT_TYPES.filter((event) => SFX_FOR_EVENT[event] === undefined);
    expect(silent).toEqual(['spawn', 'shrug', 'fellOut', 'end']);
  });

  it('speaks the three voice lines on their events, each with a synthesised fallback', () => {
    expect(VOICE_FOR_EVENT).toEqual({ letsGo: 'letsGo', ohNo: 'ohNo', exit: 'yippee' });
    for (const event of Object.keys(VOICE_FOR_EVENT)) expect(SFX_FOR_EVENT[event]).toBeDefined();
  });

  it('uses only instruments from the bank', () => {
    for (const recipe of Object.values(SFX_RECIPES)) {
      for (const step of recipe.steps) {
        if (step.kind === 'tone') expect(INSTRUMENTS[step.instrument]).toBeDefined();
      }
    }
  });
});
