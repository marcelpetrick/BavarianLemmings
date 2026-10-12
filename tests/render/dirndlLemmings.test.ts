// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { BAVARIAN_SPRITE_PALETTE } from '../../src/render/palettes';
import { slotsUsed, validateAnimation } from '../../src/render/pixelArt';
import { BAVARIAN_LEMMING_ANIMATIONS } from '../../src/render/sprites/bavarianLemmings';
import { DIRNDL_LEMMING_ANIMATIONS } from '../../src/render/sprites/dirndlLemmings';
import { LEMMING_ANIMATION_NAMES } from '../../src/render/sprites/lemmings';

describe('Dirndl poses (V-10)', () => {
  for (const name of LEMMING_ANIMATION_NAMES) {
    it(`${name}: preserves every pose geometry and timing with its own costume`, () => {
      const original = BAVARIAN_LEMMING_ANIMATIONS[name];
      const dirndl = DIRNDL_LEMMING_ANIMATIONS[name];
      expect(validateAnimation(dirndl)).toEqual([]);
      expect({ ...dirndl, frames: [] }).toEqual({ ...original, frames: [] });
      expect(dirndl.frames).toHaveLength(original.frames.length);
      expect(dirndl.frames).not.toEqual(original.frames);
      for (const pose of dirndl.frames) for (const slot of slotsUsed(pose)) expect(BAVARIAN_SPRITE_PALETTE[slot], slot).toBeDefined();
    });
  }

  it('draws a blue skirt with a white apron and brown shoes in the walking pose', () => {
    const rows = DIRNDL_LEMMING_ANIMATIONS.walking.frames[0]!.rows;
    expect(rows[12]).toContain('DWDD');
    expect(rows[15]).toContain('B');
    expect(rows.join('')).not.toContain('N');
  });
});
