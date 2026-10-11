// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { nextRandom, seedFromText } from '../../src/sim/rng';

describe('xorshift32', () => {
  it('produces the known sequence for seed 1', () => {
    let state = 1;
    const values: number[] = [];
    for (let i = 0; i < 3; i += 1) {
      const result = nextRandom(state);
      state = result.state;
      values.push(state);
    }
    expect(values).toEqual([270369, 67634689, 2647435461]);
  });

  it('returns values in [0, 1) and never gets stuck at zero', () => {
    const result = nextRandom(0);
    expect(result.state).not.toBe(0);
    expect(result.value).toBeGreaterThanOrEqual(0);
    expect(result.value).toBeLessThan(1);
  });

  it('derives stable seeds from text', () => {
    expect(seedFromText('fun-01')).toBe(seedFromText('fun-01'));
    expect(seedFromText('fun-01')).not.toBe(seedFromText('fun-02'));
    expect(seedFromText('')).toBe(0x811c9dc5);
  });
});
