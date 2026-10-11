// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { slotsUsed, validateAnimation } from '../../src/render/pixelArt';
import { LEMMING_ANIMATION_NAMES, LEMMING_ANIMATIONS, LEMMING_FRAME_SIZE } from '../../src/render/sprites/lemmings';

/** Frame counts in the style of the original (vision V-05); the minimum we accept per action. */
const EXPECTED_FRAMES = {
  walking: 8,
  falling: 4,
  floating: 8,
  climbing: 8,
  blocking: 16,
  building: 16,
  shrugging: 8,
  bashing: 32,
  mining: 24,
  digging: 16,
  ohNo: 16,
  splatting: 16,
  drowning: 16,
  exiting: 8,
} as const;

const LEMMING_SLOTS = new Set(['H', 'S', 'B', 'C', 'W', 'T', 'K', 'R', 'Y']);

describe('LEMMING_ANIMATIONS (classic)', () => {
  it('has exactly the listed actions', () => {
    expect(Object.keys(LEMMING_ANIMATIONS).sort()).toEqual([...LEMMING_ANIMATION_NAMES].sort());
    expect(Object.keys(EXPECTED_FRAMES).sort()).toEqual([...LEMMING_ANIMATION_NAMES].sort());
  });

  for (const name of LEMMING_ANIMATION_NAMES) {
    describe(name, () => {
      const animation = LEMMING_ANIMATIONS[name];

      it('is valid', () => {
        expect(validateAnimation(animation)).toEqual([]);
      });

      it('is 16 × 16 with the feet anchor at (8, 15)', () => {
        expect([animation.width, animation.height, animation.anchorX, animation.anchorY]).toEqual([
          LEMMING_FRAME_SIZE,
          LEMMING_FRAME_SIZE,
          8,
          15,
        ]);
      });

      it('has the frame count of the original style', () => {
        expect(animation.frames).toHaveLength(EXPECTED_FRAMES[name]);
      });

      it('uses only the lemming colour slots', () => {
        for (const frame of animation.frames) for (const slot of slotsUsed(frame)) expect(LEMMING_SLOTS).toContain(slot);
      });

      it('is animated: consecutive frames are not all the same', () => {
        const distinct = new Set(animation.frames.map((frame) => frame.rows.join('\n')));
        expect(distinct.size).toBeGreaterThan(1);
      });
    });
  }

  it('stands on the anchor row when walking: every walking frame has a pixel on row 15', () => {
    for (const frame of LEMMING_ANIMATIONS.walking.frames) expect(frame.rows[15]).toMatch(/[^.]/);
  });
});
