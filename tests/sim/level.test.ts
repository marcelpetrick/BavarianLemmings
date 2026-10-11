// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildTerrain, parseLevel, validateLevel } from '../../src/sim/level';
import { isSolid, isSteel, ONE_WAY_RIGHT, flagsAt } from '../../src/sim/terrain';

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
    expect(terrain.colors[121 * terrain.width + 10]).toBeLessThan(4);
    expect(terrain.colors[120 * terrain.width + 10]).toBe(4);
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
      'terrain[1].shape: rect, ellipse or polygon expected',
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
