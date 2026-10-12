// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildTerrain, parseLevel, validateLevel } from '../../src/sim/level';
import { isSolid, isSteel, ONE_WAY_RIGHT, SLOT, flagsAt } from '../../src/sim/terrain';

const flat: unknown = JSON.parse(readFileSync('assets/levels/test/flat.json', 'utf8'));

function withChanges(changes: Record<string, unknown>): unknown {
  return { ...(flat as Record<string, unknown>), ...changes };
}

describe('level format (L-03)', () => {
  it('accepts the test level and builds its terrain', () => {
    expect(validateLevel(flat)).toEqual([]);
    const level = parseLevel(flat);
    const terrain = buildTerrain(level);
    expect(isSolid(terrain, 10, 125)).toBe(true);
    expect(terrain.colors[121 * terrain.width + 10]).toBe(SLOT.top);
    expect(terrain.colors[120 * terrain.width + 10]).toBe(SLOT.topLight);
    expect(isSolid(terrain, 180, 101)).toBe(true);
    expect(isSolid(terrain, 340, 95)).toBe(true);
    expect(isSolid(terrain, 300, 95)).toBe(false);
    expect(isSolid(terrain, 165, 135)).toBe(false);
    expect(isSteel(terrain, 450, 145)).toBe(true);
    expect(flagsAt(terrain, 10, 145) & ONE_WAY_RIGHT).toBe(ONE_WAY_RIGHT);
  });

  it('rejects anything that is not a level object', () => {
    expect(validateLevel(null)).toEqual(['level: object expected']);
    expect(() => parseLevel([])).toThrow(/invalid level/);
  });

  it('names every wrong field', () => {
    const errors = validateLevel(
      withChanges({
        version: 2,
        id: '',
        rating: 'easy',
        width: 10,
        height: 100,
        lemmings: 0,
        toSave: -1,
        releaseRate: 0,
        timeSeconds: 0,
        startX: -1,
        skills: { climber: 100 },
      }),
    );
    for (const field of [
      'version',
      'id',
      'rating',
      'width',
      'height',
      'lemmings',
      'toSave',
      'releaseRate',
      'timeSeconds',
      'startX',
      'skills.climber',
      'skills.digger',
    ]) {
      expect(
        errors.some((e) => e.startsWith(field)),
        field,
      ).toBe(true);
    }
    expect(validateLevel(withChanges({ skills: 3, lemmings: 'x', toSave: 1 }))).toEqual(
      expect.arrayContaining(['skills: object expected']),
    );
    expect(validateLevel(withChanges({ terrain: {} }))).toEqual(['terrain: list expected']);
  });

  it('checks shapes, steel, one-way areas and objects', () => {
    const errors = validateLevel(
      withChanges({
        terrain: [
          5,
          { shape: 'star' },
          { shape: 'rect', x: 0, y: 0, w: 0, h: 1, erase: 'yes' },
          { shape: 'polygon', points: [[0, 0]] },
          { shape: 'polygon', points: [[0, 0], [1], [2, 'a']] },
        ],
        steel: [1, { x: 0, y: 0, w: 1, h: 1 }],
        oneWay: [2, { x: 0, y: 0, w: 1, h: 1, dir: 'up' }],
        objects: [
          3,
          { type: 'hatch', x: -1, y: 0 },
          { type: 'water', x: 0, y: 0, w: 1, h: 1 },
          { type: 'trap', x: 0, y: 0, w: 1, h: 1 },
          { type: 'balloon' },
        ],
      }),
    );
    expect(errors).toEqual([
      'terrain[0]: object expected',
      'terrain[1].shape: rect, ellipse, polygon, blob, piece expected',
      'terrain[2].erase: boolean expected',
      'terrain[2].w: positive integer expected',
      'terrain[3].points: at least three points expected',
      'terrain[4].points[1]: [x, y] expected',
      'terrain[4].points[2]: [x, y] expected',
      'steel[0]: object expected',
      'oneWay[0]: object expected',
      'oneWay[1].dir: left or right expected',
      'objects[0]: object expected',
      'objects[1]: x and y inside the level expected',
      'objects[3].kind: text expected',
      'objects[4].type: hatch, exit, water or trap expected',
      'objects: at least one exit expected',
    ]);
    expect(validateLevel(withChanges({ objects: [{ type: 'exit', x: 1, y: 1 }] }))).toEqual(['objects: at least one hatch expected']);
  });
});

describe('terrain toolkit shapes (M6.126)', () => {
  const build = (terrain: unknown[], extra: Record<string, unknown> = {}) =>
    buildTerrain(parseLevel(withChanges({ terrain, steel: [], oneWay: [], ...extra })));

  it('validates blob, piece, rough and seed', () => {
    const errors = validateLevel(
      withChanges({
        terrain: [
          { shape: 'blob', x: 0, y: 0, w: 10, h: 10, rough: 0.5, seed: 3 },
          { shape: 'blob', x: 0, y: 0, w: 0, h: 10, rough: 2, seed: -1 },
          { shape: 'piece', piece: 'pillar', x: 4, y: 5 },
          { shape: 'piece', piece: 'pillar', x: 4, y: 5, w: 8, h: 30, flip: true, seed: 1, erase: false },
          { shape: 'piece', piece: 'castle', x: 'a', y: 5, w: 0, flip: 'no' },
          {
            shape: 'polygon',
            points: [
              [0, 0],
              [9, 0],
              [9, 9],
            ],
            rough: 'x',
          },
        ],
      }),
    );
    expect(errors).toEqual([
      'terrain[1].seed: integer 0..2147483647 expected',
      'terrain[1].rough: number 0..1 expected',
      'terrain[1].w: positive integer expected',
      expect.stringMatching(/^terrain\[4\]\.piece: one of rock, pillar, .*chain expected$/),
      'terrain[4].x: integer expected',
      'terrain[4].w: positive integer expected',
      'terrain[4].flip: boolean expected',
      'terrain[5].rough: number 0..1 expected',
    ]);
  });

  it('builds a blob inside its box, the same for the same seed', () => {
    const blob = { shape: 'blob', x: 100, y: 40, w: 80, h: 40, seed: 5 };
    const a = build([blob]);
    expect(isSolid(a, 140, 60)).toBe(true);
    expect(isSolid(a, 99, 60)).toBe(false);
    expect(isSolid(a, 181, 60)).toBe(false);
    expect(build([blob]).mask).toEqual(a.mask);
    expect(build([{ ...blob, seed: 6, rough: 1 }]).mask).not.toEqual(a.mask);
    // Without a seed, the position is the seed: still deterministic.
    const unseeded = { shape: 'blob', x: 100, y: 40, w: 80, h: 40 };
    expect(build([unseeded]).mask).toEqual(build([unseeded]).mask);
  });

  it('roughens polygons only when asked', () => {
    const points = [
      [100, 140],
      [160, 60],
      [220, 140],
    ];
    const smooth = build([{ shape: 'polygon', points }]);
    const rough = build([{ shape: 'polygon', points, rough: 1 }]);
    expect(rough.mask).not.toEqual(smooth.mask);
    expect(build([{ shape: 'polygon', points, rough: 0 }]).mask).toEqual(smooth.mask);
  });

  it('places, flips, clips and erases pieces', () => {
    const steps = build([{ shape: 'piece', piece: 'steps', x: 100, y: 100, w: 32, h: 16 }]);
    expect(isSolid(steps, 101, 101)).toBe(false);
    expect(isSolid(steps, 131, 101)).toBe(true);
    const flipped = build([{ shape: 'piece', piece: 'steps', x: 100, y: 100, w: 32, h: 16, flip: true }]);
    expect(isSolid(flipped, 101, 101)).toBe(true);
    const clipped = build([{ shape: 'piece', piece: 'slab', x: -10, y: 155, w: 30, h: 8 }]);
    expect(isSolid(clipped, 0, 156)).toBe(true);
    const erased = build([
      { shape: 'rect', x: 0, y: 100, w: 480, h: 60 },
      { shape: 'piece', piece: 'arch', x: 100, y: 100, erase: true },
    ]);
    expect(isSolid(erased, 132, 105)).toBe(false);
    expect(isSolid(erased, 132, 139)).toBe(true); // the arch's opening was not part of the piece
  });

  it('textures steel as plates and keeps it steel', () => {
    const terrain = build([], { steel: [{ x: 10, y: 100, w: 32, h: 16 }] });
    expect(isSteel(terrain, 10, 100)).toBe(true);
    expect(terrain.colors[100 * terrain.width + 10]).toBe(SLOT.steelLight);
    expect(terrain.colors[107 * terrain.width + 20]).toBe(SLOT.steelDark);
  });
});
