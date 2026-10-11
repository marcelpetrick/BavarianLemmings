// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import {
  COLOR_BRICK,
  addBrickPixel,
  canRemove,
  cloneTerrain,
  flagsAt,
  isSolid,
  isSteel,
  removePixel,
  setPixel,
  SOLID,
} from '../../src/sim/terrain';
import { artFromTerrain, terrainFromArt } from './helpers';

describe('terrain', () => {
  const art = ['....', '.#S.', '<>##'];

  it('round-trips through ASCII art', () => {
    expect(artFromTerrain(terrainFromArt(art))).toEqual(art);
  });

  it('treats the level sides as solid steel and above/below as empty', () => {
    const terrain = terrainFromArt(art);
    expect(isSolid(terrain, -1, 1)).toBe(true);
    expect(isSteel(terrain, 4, 1)).toBe(true);
    expect(isSolid(terrain, 1, -1)).toBe(false);
    expect(isSolid(terrain, 1, 3)).toBe(false);
    expect(flagsAt(terrain, 0, 0)).toBe(0);
  });

  it('never removes steel and respects one-way direction', () => {
    const terrain = terrainFromArt(art);
    expect(canRemove(terrain, 2, 1, 1)).toBe(false);
    expect(canRemove(terrain, 0, 2, 1)).toBe(false);
    expect(canRemove(terrain, 0, 2, -1)).toBe(true);
    expect(canRemove(terrain, 1, 2, -1)).toBe(false);
    expect(canRemove(terrain, 1, 2, 1)).toBe(true);
    expect(canRemove(terrain, 1, 2, 0)).toBe(true);
    expect(removePixel(terrain, 2, 1, 0)).toBe(false);
    expect(removePixel(terrain, 1, 1, 0)).toBe(true);
    expect(removePixel(terrain, 0, 0, 0)).toBe(true);
    expect(isSolid(terrain, 1, 1)).toBe(false);
  });

  it('adds bricks only into empty pixels inside the level', () => {
    const terrain = terrainFromArt(art);
    addBrickPixel(terrain, 0, 0);
    addBrickPixel(terrain, 1, 1);
    addBrickPixel(terrain, -5, 0);
    expect(terrain.colors[0]).toBe(COLOR_BRICK);
    expect(terrain.colors[terrain.width + 1]).toBe(1);
  });

  it('ignores writes outside the level and clones independently', () => {
    const terrain = terrainFromArt(art);
    setPixel(terrain, 99, 99, SOLID, 1);
    const copy = cloneTerrain(terrain);
    removePixel(copy, 1, 1, 0);
    expect(isSolid(terrain, 1, 1)).toBe(true);
    expect(isSolid(copy, 1, 1)).toBe(false);
  });
});
