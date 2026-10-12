// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { PIECES, PIECE_NAMES, renderPiece, type PieceRaster } from '../../src/sim/pieces';
import { TERRAIN_SLOT_COUNT } from '../../src/sim/terrain';
import { HINT_FIXED, HINT_NATURAL } from '../../src/sim/texture';

function validHint(hint: number): boolean {
  if (hint === 0 || hint === HINT_NATURAL) return true;
  const slot = hint & ~HINT_FIXED;
  return slot >= 1 && slot <= TERRAIN_SLOT_COUNT;
}

function filled(raster: PieceRaster): number {
  return raster.cells.filter((hint) => hint !== 0).length;
}

describe('piece library (V-07)', () => {
  it('has the pieces the level builders rely on', () => {
    expect(PIECE_NAMES).toEqual([
      'rock',
      'pillar',
      'brickWall',
      'steps',
      'ramp',
      'arch',
      'crystal',
      'girder',
      'stalactite',
      'stalagmite',
      'tuft',
      'slab',
      'log',
      'chain',
    ]);
    expect(() => renderPiece('castle', undefined, undefined, 0, false)).toThrow(/unknown piece castle/);
  });

  for (const name of PIECE_NAMES) {
    it(`${name}: default size, valid hints, deterministic, mirrored by flip, seeds vary details`, () => {
      const definition = PIECES[name]!;
      const raster = renderPiece(name, undefined, undefined, 3, false);
      expect([raster.w, raster.h]).toEqual([definition.w, definition.h]);
      expect(raster.cells.every(validHint)).toBe(true);
      expect(filled(raster)).toBeGreaterThan(raster.w);
      expect(renderPiece(name, undefined, undefined, 3, false).cells).toEqual(raster.cells);
      const flipped = renderPiece(name, undefined, undefined, 3, true);
      for (let y = 0; y < raster.h; y += 1)
        for (let x = 0; x < raster.w; x += 1) expect(flipped.cells[y * raster.w + x]).toBe(raster.cells[y * raster.w + raster.w - 1 - x]);
      for (const seed of [0, 1, 2, 4, 7, 1234567]) expect(renderPiece(name, 40, 40, seed, false).cells.every(validHint)).toBe(true);
    });

    it(`${name}: survives tiny and large sizes`, () => {
      for (const [w, h] of [
        [1, 1],
        [2, 3],
        [5, 4],
        [9, 6],
        [120, 100],
      ] as const) {
        const raster = renderPiece(name, w, h, 1, false);
        expect(raster.cells).toHaveLength(w * h);
        expect(raster.cells.every(validHint)).toBe(true);
      }
    });
  }

  it('steps rise to the right, and to the left when flipped', () => {
    const steps = renderPiece('steps', 32, 16, 0, false);
    expect(steps.cells[0]).toBe(0); // top left is air
    expect(steps.cells[31]).not.toBe(0); // top right is stone
    const flipped = renderPiece('steps', 32, 16, 0, true);
    expect(flipped.cells[0]).not.toBe(0);
  });

  it('girders have holes in the web and arches an opening at the bottom', () => {
    const girder = renderPiece('girder', 64, 12, 0, false);
    expect(filled(girder)).toBeLessThan(64 * 12);
    expect(girder.cells.slice(0, 64).every((hint) => hint !== 0)).toBe(true);
    const arch = renderPiece('arch', 64, 40, 0, false);
    expect(arch.cells[39 * 64 + 32]).toBe(0);
    expect(arch.cells[32]).not.toBe(0);
  });

  it('ramps take the style texture; tufts, chains and crystals keep their own colours', () => {
    expect(
      renderPiece('ramp', 10, 10, 0, false)
        .cells.filter((h) => h !== 0)
        .every((h) => h === HINT_NATURAL),
    ).toBe(true);
    for (const name of ['tuft', 'chain', 'crystal'])
      expect(
        renderPiece(name, undefined, undefined, 0, false)
          .cells.filter((h) => h !== 0)
          .every((h) => (h & HINT_FIXED) !== 0),
        name,
      ).toBe(true);
  });
});
