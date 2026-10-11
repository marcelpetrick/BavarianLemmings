// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { BAVARIAN_SPRITE_PALETTE, CLASSIC_SPRITE_PALETTE } from '../../src/render/palettes';
import { slotsUsed, validateAnimation } from '../../src/render/pixelArt';
import { BAVARIAN_LEMMING_ANIMATIONS } from '../../src/render/sprites/bavarianLemmings';
import { LEMMING_ANIMATION_NAMES, LEMMING_ANIMATIONS } from '../../src/render/sprites/lemmings';

describe('BAVARIAN_LEMMING_ANIMATIONS', () => {
  it('has the same actions as the classic set', () => {
    expect(Object.keys(BAVARIAN_LEMMING_ANIMATIONS).sort()).toEqual([...LEMMING_ANIMATION_NAMES].sort());
  });

  for (const name of LEMMING_ANIMATION_NAMES) {
    it(`${name}: valid, and geometry and frame count equal to classic (V-10, architecture.md 7)`, () => {
      const bavarian = BAVARIAN_LEMMING_ANIMATIONS[name];
      const classic = LEMMING_ANIMATIONS[name];
      expect(validateAnimation(bavarian)).toEqual([]);
      expect({
        width: bavarian.width,
        height: bavarian.height,
        anchorX: bavarian.anchorX,
        anchorY: bavarian.anchorY,
        loop: bavarian.loop,
        frames: bavarian.frames.length,
      }).toEqual({
        width: classic.width,
        height: classic.height,
        anchorX: classic.anchorX,
        anchorY: classic.anchorY,
        loop: classic.loop,
        frames: classic.frames.length,
      });
    });

    it(`${name}: is its own drawing, coloured by both palettes`, () => {
      expect(BAVARIAN_LEMMING_ANIMATIONS[name].frames).not.toEqual(LEMMING_ANIMATIONS[name].frames);
      for (const frame of BAVARIAN_LEMMING_ANIMATIONS[name].frames) {
        for (const slot of slotsUsed(frame)) {
          expect(BAVARIAN_SPRITE_PALETTE).toHaveProperty([slot]);
          expect(CLASSIC_SPRITE_PALETTE).toHaveProperty([slot]);
        }
      }
    });
  }

  it('wears no green hair: the hair slot only peeks out under the hat', () => {
    const hairPixels = (rows: readonly string[]) => rows.join('').split('H').length - 1;
    const walkingClassic = LEMMING_ANIMATIONS.walking.frames[0]!.rows;
    const walkingBavarian = BAVARIAN_LEMMING_ANIMATIONS.walking.frames[0]!.rows;
    expect(hairPixels(walkingBavarian)).toBeLessThan(hairPixels(walkingClassic));
  });
});
