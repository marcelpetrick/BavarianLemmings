// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { createTerrain, ONE_WAY_LEFT, ONE_WAY_RIGHT, SLOT, SOLID, STEEL, type Terrain } from '../../src/sim/terrain';
import { HINT_FIXED, HINT_NATURAL, darker, lighter, paintTerrain, steelSlot, styleTexture } from '../../src/sim/texture';

const STYLES = ['dirt', 'fire', 'marble', 'pillar', 'crystal'];

/** A terrain with one solid block from (x0, y0) to (x1, y1), exclusive, all hinted `hint`. */
function block(width: number, height: number, x0: number, y0: number, x1: number, y1: number, hint: number): [Terrain, Uint8Array] {
  const terrain = createTerrain(width, height);
  const hints = new Uint8Array(width * height);
  for (let y = y0; y < y1; y += 1)
    for (let x = x0; x < x1; x += 1) {
      terrain.mask[y * width + x] = SOLID;
      hints[y * width + x] = hint;
    }
  return [terrain, hints];
}

describe('shading steps', () => {
  it('darker and lighter walk along the ramps and stop at the ends', () => {
    expect(darker(SLOT.body)).toBe(SLOT.bodyDark);
    expect(darker(SLOT.outline)).toBe(SLOT.outline);
    expect(darker(SLOT.topLight)).toBe(SLOT.top);
    expect(darker(SLOT.top)).toBe(SLOT.topDark);
    expect(darker(SLOT.topDark)).toBe(SLOT.shadow);
    expect(darker(SLOT.accentLight)).toBe(SLOT.accent);
    expect(darker(SLOT.accent)).toBe(SLOT.deep);
    expect(darker(SLOT.steel)).toBe(SLOT.outline);
    expect(lighter(SLOT.body)).toBe(SLOT.bodyLight);
    expect(lighter(SLOT.highlight)).toBe(SLOT.highlight);
    expect(lighter(SLOT.topDark)).toBe(SLOT.top);
    expect(lighter(SLOT.top)).toBe(SLOT.topLight);
    expect(lighter(SLOT.topLight)).toBe(SLOT.topLight);
    expect(lighter(SLOT.accent)).toBe(SLOT.accentLight);
    expect(lighter(SLOT.accentLight)).toBe(SLOT.accentLight);
    expect(lighter(SLOT.brick)).toBe(SLOT.brick);
  });
});

describe('style textures (V-07)', () => {
  it('falls back to dirt for unknown styles', () => {
    expect(styleTexture('lava')).toBe(styleTexture('dirt'));
  });

  for (const style of STYLES) {
    it(`${style}: lit top, outlined underside, only style slots, rich but deterministic`, () => {
      const [terrain, hints] = block(400, 160, 10, 20, 390, 150, HINT_NATURAL);
      paintTerrain(terrain, hints, style);
      const used = new Set<number>();
      for (let i = 0; i < terrain.colors.length; i += 1) {
        if (terrain.mask[i] === 0) expect(terrain.colors[i]).toBe(0);
        else used.add(terrain.colors[i]!);
      }
      for (const slot of used) {
        expect(slot).toBeGreaterThanOrEqual(1);
        expect(slot).toBeLessThanOrEqual(12);
      }
      expect(used.size).toBeGreaterThanOrEqual(6);
      expect(terrain.colors[149 * 400 + 200]).toBe(SLOT.outline);
      expect([SLOT.highlight, SLOT.topLight]).toContain(terrain.colors[20 * 400 + 200]);
      const again = block(400, 160, 10, 20, 390, 150, HINT_NATURAL);
      paintTerrain(again[0], again[1], style);
      expect(again[0].colors).toEqual(terrain.colors);
    });
  }

  it('does not outline the bottom row of the level (the terrain goes on below it)', () => {
    const [terrain, hints] = block(40, 30, 0, 10, 40, 30, HINT_NATURAL);
    paintTerrain(terrain, hints, 'marble');
    expect(terrain.colors[29 * 40 + 20]).not.toBe(SLOT.outline);
  });
});

describe('piece hints and lighting', () => {
  it('lights a piece slot from the top left and shades its underside', () => {
    const [terrain, hints] = block(20, 20, 5, 5, 15, 15, SLOT.body);
    paintTerrain(terrain, hints, 'dirt');
    const at = (x: number, y: number): number => terrain.colors[y * 20 + x]!;
    expect(at(10, 5)).toBe(SLOT.highlight);
    expect(at(5, 10)).toBe(SLOT.bodyLight);
    expect(at(14, 10)).toBe(SLOT.bodyDark);
    expect(at(10, 10)).toBe(SLOT.body);
    expect(at(10, 13)).toBe(SLOT.bodyDark);
    expect(at(10, 14)).toBe(SLOT.outline);
  });

  it('keeps fixed slots and steel exactly as written', () => {
    const [terrain, hints] = block(20, 20, 5, 5, 15, 15, HINT_FIXED | SLOT.top);
    terrain.mask[10 * 20 + 10] = SOLID | STEEL;
    hints[10 * 20 + 10] = HINT_FIXED | SLOT.steelLight;
    paintTerrain(terrain, hints, 'dirt');
    expect(terrain.colors[5 * 20 + 10]).toBe(SLOT.top);
    expect(terrain.colors[14 * 20 + 10]).toBe(SLOT.top);
    expect(terrain.colors[10 * 20 + 10]).toBe(SLOT.steelLight);
  });

  it('draws arrows on one-way areas in both directions', () => {
    for (const flag of [ONE_WAY_LEFT, ONE_WAY_RIGHT]) {
      const [terrain, hints] = block(48, 40, 0, 0, 48, 40, HINT_NATURAL);
      for (let i = 0; i < terrain.mask.length; i += 1) terrain.mask[i] = SOLID | flag;
      paintTerrain(terrain, hints, 'crystal');
      const arrows = terrain.colors.filter((slot) => slot === SLOT.accentLight).length;
      expect(arrows).toBeGreaterThan(40);
    }
  });
});

describe('steel plates', () => {
  it('draws riveted 16 × 8 plates with lit and shaded rims', () => {
    expect(steelSlot(0, 0, 32, 16)).toBe(SLOT.steelLight);
    expect(steelSlot(15, 3, 32, 16)).toBe(SLOT.steelDark);
    expect(steelSlot(4, 7, 32, 16)).toBe(SLOT.steelDark);
    expect(steelSlot(2, 2, 32, 16)).toBe(SLOT.steelLight);
    expect(steelSlot(3, 3, 32, 16)).toBe(SLOT.steelDark);
    expect(steelSlot(13, 5, 32, 16)).toBe(SLOT.steelLight);
    expect(steelSlot(14, 6, 32, 16)).toBe(SLOT.steelDark);
    expect(steelSlot(7, 4, 32, 16)).toBe(SLOT.steel);
    // A narrow area has no room for rivets, and its own edge closes the plate.
    expect(steelSlot(2, 2, 6, 4)).toBe(SLOT.steel);
    expect(steelSlot(5, 1, 6, 4)).toBe(SLOT.steelDark);
  });
});
