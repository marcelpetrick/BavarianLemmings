// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { findExitSceneryPosition } from '../../src/render/scenery';
import type { LevelData, LevelObject } from '../../src/sim/level';
import { createTerrain, setPixel, SOLID } from '../../src/sim/terrain';
import { BAVARIAN_THEME, CLASSIC_THEME } from '../../src/theme/themes';
import { ALL_LEVELS } from '../../src/levels';
import { buildTerrain } from '../../src/sim/level';
import { BASE_LEVEL } from '../sim/helpers';

const exit: LevelObject = { type: 'exit', x: 160, y: 120 };
const level: LevelData = { ...BASE_LEVEL, objects: [exit] };

function terrainWith(...points: readonly (readonly [number, number])[]) {
  const terrain = createTerrain(level.width, level.height);
  for (const [x, y] of points) setPixel(terrain, x, y, SOLID, 1);
  return terrain;
}

describe('exit scenery placement', () => {
  it('prefers the right side with an air gap, and has no scenery in Classic', () => {
    expect(findExitSceneryPosition(level, terrainWith(), exit, BAVARIAN_THEME)).toEqual({ x: 190, y: 119 });
    expect(findExitSceneryPosition(level, terrainWith(), exit, CLASSIC_THEME)).toBeNull();
    expect(findExitSceneryPosition(level, terrainWith(), { type: 'hatch', x: 10, y: 10 }, BAVARIAN_THEME)).toBeNull();
  });

  it('stands just above a floor instead of burying its opaque base', () => {
    const terrain = terrainWith();
    for (let x = 0; x < level.width; x += 1) setPixel(terrain, x, exit.y, SOLID, 1);
    expect(findExitSceneryPosition(level, terrain, exit, BAVARIAN_THEME)).toEqual({ x: 190, y: 119 });
  });

  it('retains clear maypoles in shipped grounded levels', () => {
    const retained = ALL_LEVELS.filter((item) => item.rating === 'fun').filter((item) => {
      const terrain = buildTerrain(item);
      return item.objects.some((object) => findExitSceneryPosition(item, terrain, object, BAVARIAN_THEME) !== null);
    });
    expect(retained.length).toBeGreaterThanOrEqual(20);
  });

  it('moves left if a single opaque pixel would be buried; omits if both sides are blocked', () => {
    expect(findExitSceneryPosition(level, terrainWith([189, 80]), exit, BAVARIAN_THEME)).toEqual({ x: 130, y: 119 });
    expect(findExitSceneryPosition(level, terrainWith([189, 80], [129, 80]), exit, BAVARIAN_THEME)).toBeNull();
  });

  it('allows terrain behind transparent sprite pixels', () => {
    expect(findExitSceneryPosition(level, terrainWith([186, 60]), exit, BAVARIAN_THEME)).toEqual({ x: 190, y: 119 });
  });

  it.each([
    [
      { type: 'exit', x: 300, y: 120 },
      { x: 270, y: 119 },
    ],
    [
      { type: 'exit', x: 20, y: 120 },
      { x: 50, y: 119 },
    ],
    [{ type: 'exit', x: 160, y: 20 }, null],
    [{ type: 'exit', x: 160, y: 170 }, null],
  ] as const)('does not clip scenery outside any level edge: %o', (edgeExit, expected) => {
    expect(findExitSceneryPosition({ ...level, objects: [edgeExit] }, terrainWith(), edgeExit, BAVARIAN_THEME)).toEqual(expected);
  });

  it('omits at the left edge when the right candidate is buried', () => {
    const edgeExit: LevelObject = { type: 'exit', x: 20, y: 120 };
    expect(findExitSceneryPosition({ ...level, objects: [edgeExit] }, terrainWith([49, 80]), edgeExit, BAVARIAN_THEME)).toBeNull();
  });

  it.each([
    { type: 'hatch', x: 190, y: 80 },
    { type: 'exit', x: 190, y: 100 },
    { type: 'water', x: 186, y: 80, w: 8, h: 10 },
    { type: 'trap', kind: 'squasher', x: 186, y: 80, w: 8, h: 10 },
  ] satisfies LevelObject[])('keeps clear of other objects: %o', (obstacle) => {
    expect(findExitSceneryPosition({ ...level, objects: [exit, obstacle] }, terrainWith(), exit, BAVARIAN_THEME)).toEqual({
      x: 130,
      y: 119,
    });
  });

  it('checks all animation frames, including opaque pixels absent from the first frame', () => {
    const scenery = { width: 2, height: 1, anchorX: 0, anchorY: 0, loop: true, frames: [{ rows: ['.A'] }, { rows: ['A.'] }] };
    expect(findExitSceneryPosition(level, terrainWith([186, 119]), exit, { ...BAVARIAN_THEME, exitScenery: scenery })).toEqual({
      x: 132,
      y: 119,
    });
  });
});
