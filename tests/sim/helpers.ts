// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Test fixtures: terrain drawn as ASCII art, and a game state around it.
 *
 * Legend: `.` empty, `#` dirt, `S` steel, `<` one-way left, `>` one-way right.
 * Row 0 of the art is row 0 of the level.
 */
import { createGame } from '../../src/sim/game';
import { createLemming, type Action, type Direction, type Lemming } from '../../src/sim/lemming';
import type { LevelData, LevelObject } from '../../src/sim/level';
import type { GameState } from '../../src/sim/state';
import { ONE_WAY_LEFT, ONE_WAY_RIGHT, SOLID, STEEL, createTerrain, setPixel, type Terrain } from '../../src/sim/terrain';

export function terrainFromArt(art: readonly string[]): Terrain {
  const width = Math.max(...art.map((row) => row.length));
  const terrain = createTerrain(width, art.length);
  art.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      const char = row.charAt(x);
      if (char === '#') setPixel(terrain, x, y, SOLID, 1);
      if (char === 'S') setPixel(terrain, x, y, SOLID | STEEL, 5);
      if (char === '<') setPixel(terrain, x, y, SOLID | ONE_WAY_LEFT, 1);
      if (char === '>') setPixel(terrain, x, y, SOLID | ONE_WAY_RIGHT, 1);
    }
  });
  return terrain;
}

export function artFromTerrain(terrain: Terrain): string[] {
  const rows: string[] = [];
  for (let y = 0; y < terrain.height; y += 1) {
    let row = '';
    for (let x = 0; x < terrain.width; x += 1) {
      const flags = terrain.mask[y * terrain.width + x] ?? 0;
      row += flags & STEEL ? 'S' : flags & ONE_WAY_LEFT ? '<' : flags & ONE_WAY_RIGHT ? '>' : flags & SOLID ? '#' : '.';
    }
    rows.push(row);
  }
  return rows;
}

export const BASE_LEVEL: LevelData = {
  version: 1,
  id: 'test-fixture',
  name: 'level.test.name',
  inspiredBy: 'test fixture',
  rating: 'test',
  width: 320,
  height: 160,
  lemmings: 1,
  toSave: 1,
  releaseRate: 50,
  timeSeconds: 60,
  skills: { climber: 9, floater: 9, bomber: 9, blocker: 9, builder: 9, basher: 9, miner: 9, digger: 9 },
  style: 'dirt',
  startX: 0,
  terrain: [],
  steel: [],
  oneWay: [],
  objects: [
    { type: 'hatch', x: 10, y: 10 },
    { type: 'exit', x: 300, y: 150 },
  ],
};

/** A state on the given terrain with the given lemmings already in play; no further spawns. */
export function stateWith(terrain: Terrain, lemmings: Lemming[], objects: readonly LevelObject[] = []): GameState {
  const level: LevelData = {
    ...BASE_LEVEL,
    width: terrain.width,
    height: terrain.height,
    lemmings: Math.max(1, lemmings.length),
    objects: [...BASE_LEVEL.objects, ...objects],
  };
  const state = createGame(level);
  Object.assign(state, { terrain });
  state.lemmings = lemmings;
  state.spawned = level.lemmings;
  state.trapReadyTick = level.objects.map(() => 0);
  return state;
}

export function lemmingAt(x: number, y: number, action: Action = 'walking', dir: Direction = 1, id = 0): Lemming {
  const lemming = createLemming(id, x, y, dir);
  lemming.action = action;
  return lemming;
}
