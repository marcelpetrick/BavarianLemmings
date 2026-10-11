// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import {
  BAVARIAN_SPRITE_PALETTE,
  BAVARIAN_TERRAIN_COLORS,
  BAVARIAN_TERRAIN_NAMES,
  CLASSIC_SPRITE_PALETTE,
  CLASSIC_TERRAIN_COLORS,
  SPRITE_SLOTS,
  TERRAIN_SLOTS,
  TERRAIN_STYLES,
} from '../../src/render/palettes';
import { rasterize, slotsUsed, type Animation } from '../../src/render/pixelArt';
import { ICONS } from '../../src/render/sprites/icons';
import { LEMMING_ANIMATIONS } from '../../src/render/sprites/lemmings';
import { OBJECT_ANIMATIONS } from '../../src/render/sprites/objects';

const HEX = /^#[0-9a-f]{6}$/;

const ALL_SPRITES: [string, Animation][] = [
  ...Object.entries(LEMMING_ANIMATIONS).map(([name, animation]): [string, Animation] => [`lemming ${name}`, animation]),
  ...Object.entries(OBJECT_ANIMATIONS).map(([name, animation]): [string, Animation] => [`object ${name}`, animation]),
  ...Object.entries(ICONS).map(([name, animation]): [string, Animation] => [`icon ${name}`, animation]),
];

describe('sprite palettes', () => {
  for (const [paletteName, palette] of [
    ['classic', CLASSIC_SPRITE_PALETTE],
    ['bavarian', BAVARIAN_SPRITE_PALETTE],
  ] as const) {
    it(`${paletteName} defines exactly the documented slots as #rrggbb`, () => {
      expect(Object.keys(palette).sort()).toEqual(Object.keys(SPRITE_SLOTS).sort());
      for (const color of Object.values(palette)) expect(color).toMatch(HEX);
    });

    it(`${paletteName} covers every slot used by every sprite, and every sprite rasterizes`, () => {
      for (const [name, animation] of ALL_SPRITES) {
        for (const frame of animation.frames) {
          for (const slot of slotsUsed(frame)) expect(palette, `${name} uses '${slot}'`).toHaveProperty([slot]);
          expect(rasterize(frame, palette, true)).toHaveLength(animation.width * animation.height * 4);
        }
      }
    });
  }

  it('gives the Bavarian theme its white and blue', () => {
    expect(BAVARIAN_SPRITE_PALETTE.W).toBe('#ffffff');
    expect(BAVARIAN_SPRITE_PALETTE.D).toBe('#0066b3');
  });
});

describe('terrain colours', () => {
  for (const [themeName, colors] of [
    ['classic', CLASSIC_TERRAIN_COLORS],
    ['bavarian', BAVARIAN_TERRAIN_COLORS],
  ] as const) {
    it(`${themeName} has slots 1 to 7 for every style`, () => {
      expect(Object.keys(colors).sort()).toEqual([...TERRAIN_STYLES].sort());
      for (const style of TERRAIN_STYLES) {
        expect(Object.keys(colors[style]).map(Number)).toEqual([...TERRAIN_SLOTS]);
        for (const slot of TERRAIN_SLOTS) expect(colors[style][slot]).toMatch(HEX);
      }
    });
  }

  it('names the Bavarian counterpart of every style and recolours each one', () => {
    for (const style of TERRAIN_STYLES) {
      expect(BAVARIAN_TERRAIN_NAMES[style]).not.toBe('');
      expect(BAVARIAN_TERRAIN_COLORS[style]).not.toEqual(CLASSIC_TERRAIN_COLORS[style]);
    }
  });
});
