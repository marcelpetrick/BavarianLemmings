// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import {
  BASH_TICKS_PER_PIXEL,
  BOMBER_COUNTDOWN_SECONDS,
  BUILDER_BRICKS,
  BUILDER_TICKS_PER_BRICK,
  DIG_TICKS_PER_ROW,
  EXPLOSION_RADIUS,
  LEMMING_HEIGHT,
  MINE_TICKS_PER_STEP,
  OH_NO_TICKS,
  SHRUG_TICKS,
  TICKS_PER_SECOND,
} from '../../src/sim/constants';
import { explode } from '../../src/sim/actions/bombing';
import { step } from '../../src/sim/game';
import type { GameState } from '../../src/sim/state';
import { isSolid } from '../../src/sim/terrain';
import { lemmingAt, stateWith, terrainFromArt } from './helpers';

function run(state: GameState, ticks: number): void {
  for (let i = 0; i < ticks; i += 1) step(state);
}

function ground(width: number, height: number, groundRow: number, fill = '#'): string[] {
  return Array.from({ length: height }, (_, y) => (y >= groundRow ? fill.repeat(width) : '.'.repeat(width)));
}

const BOMB_TICKS = BOMBER_COUNTDOWN_SECONDS * TICKS_PER_SECOND;

describe('blocker (G-06)', () => {
  it('turns walkers from both sides and stays put', () => {
    const blocker = lemmingAt(15, 14, 'blocking', 1, 0);
    const fromLeft = lemmingAt(9, 14, 'walking', 1, 1);
    const fromRight = lemmingAt(21, 14, 'walking', -1, 2);
    const state = stateWith(terrainFromArt(ground(40, 20, 15)), [blocker, fromLeft, fromRight]);
    run(state, 3);
    expect(blocker).toMatchObject({ x: 15, action: 'blocking' });
    expect(fromLeft.dir).toBe(-1);
    expect(fromRight.dir).toBe(1);
  });

  it('is freed when the ground beneath it disappears', () => {
    const state = stateWith(terrainFromArt(ground(40, 30, 15)), [lemmingAt(15, 14, 'blocking')]);
    for (let x = 0; x < 40; x += 1) for (let y = 15; y < 20; y += 1) state.terrain.mask[y * 40 + x] = 0;
    run(state, 1);
    expect(state.lemmings[0]?.action).toBe('falling');
  });
});

describe('bomber (G-05)', () => {
  it('clears a 16-pixel-radius disc and preserves its boundary, steel and other lemmings', () => {
    const bomber = lemmingAt(40, 44);
    const neighbour = lemmingAt(42, 44, 'blocking', 1, 1);
    const art = ground(80, 80, 0);
    art[40] = '#'.repeat(45) + 'S' + '#'.repeat(34);
    const state = stateWith(terrainFromArt(art), [bomber, neighbour]);
    explode(state, bomber);
    const centreY = bomber.y - Math.floor(LEMMING_HEIGHT / 2) + 1;
    expect(EXPLOSION_RADIUS).toBe(16);
    for (const [dx, dy] of [
      [16, 0],
      [-16, 0],
      [0, 16],
      [0, -16],
      [11, 11],
    ]) {
      expect(isSolid(state.terrain, bomber.x + dx!, centreY + dy!)).toBe(false);
    }
    for (const [dx, dy] of [
      [17, 0],
      [-17, 0],
      [0, 17],
      [0, -17],
      [12, 12],
    ]) {
      expect(isSolid(state.terrain, bomber.x + dx!, centreY + dy!)).toBe(true);
    }
    expect(isSolid(state.terrain, 45, 40)).toBe(true);
    expect(neighbour.removed).toBe(false);
    expect(state.events.map((event) => event.type)).toEqual(['explode']);
  });

  it('counts down, says oh no, explodes and leaves a crater; steel survives', () => {
    const art = ground(40, 30, 15);
    art[16] = '#'.repeat(15) + 'S' + '#'.repeat(24);
    const bomber = lemmingAt(15, 14);
    bomber.bombTicks = BOMB_TICKS;
    const state = stateWith(terrainFromArt(art), [bomber]);
    run(state, BOMB_TICKS);
    expect(bomber.action).toBe('ohNo');
    expect(state.events.map((e) => e.type)).toContain('ohNo');
    run(state, OH_NO_TICKS);
    expect(bomber.removed).toBe(true);
    expect(state.died).toBe(1);
    const x = bomber.x;
    expect(isSolid(state.terrain, x, 15)).toBe(false);
    expect(isSolid(state.terrain, 15, 16)).toBe(true);
  });

  it('explodes at once while falling', () => {
    const bomber = lemmingAt(15, 2, 'falling');
    bomber.bombTicks = 1;
    const state = stateWith(terrainFromArt(ground(40, 60, 55)), [bomber]);
    run(state, 1);
    expect(bomber.removed).toBe(true);
  });

  it('does nothing when the countdown ends during an exit or a splat', () => {
    const exiting = lemmingAt(15, 14, 'exiting');
    exiting.bombTicks = 1;
    const state = stateWith(terrainFromArt(ground(40, 20, 15)), [exiting]);
    run(state, 1);
    expect(exiting).toMatchObject({ action: 'exiting', bombTicks: -1, removed: false });
  });
});

describe('builder (G-07)', () => {
  it('lays twelve bricks as a staircase, then shrugs and walks on', () => {
    const builder = lemmingAt(10, 29, 'building');
    builder.bricksLeft = BUILDER_BRICKS;
    const state = stateWith(terrainFromArt(ground(80, 40, 30)), [builder]);
    run(state, BUILDER_TICKS_PER_BRICK);
    expect(isSolid(state.terrain, 10, 29)).toBe(true);
    expect(isSolid(state.terrain, 15, 29)).toBe(true);
    expect(builder).toMatchObject({ x: 12, y: 28, bricksLeft: BUILDER_BRICKS - 1 });
    run(state, BUILDER_TICKS_PER_BRICK * (BUILDER_BRICKS - 1));
    expect(builder).toMatchObject({ action: 'shrugging', x: 10 + 2 * BUILDER_BRICKS, y: 29 - BUILDER_BRICKS, bricksLeft: 0 });
    run(state, SHRUG_TICKS);
    expect(builder.action).toBe('walking');
  });

  it('warns with a different sound for the last bricks', () => {
    const builder = lemmingAt(10, 29, 'building');
    builder.bricksLeft = 2;
    const state = stateWith(terrainFromArt(ground(80, 40, 30)), [builder]);
    run(state, BUILDER_TICKS_PER_BRICK);
    expect(state.events.map((e) => e.type)).toContain('builderWarn');
  });

  it('turns round when it bumps its head', () => {
    const art = ground(80, 40, 30);
    art[19] = '#'.repeat(80);
    const builder = lemmingAt(10, 29, 'building');
    builder.bricksLeft = BUILDER_BRICKS;
    const state = stateWith(terrainFromArt(art), [builder]);
    run(state, BUILDER_TICKS_PER_BRICK);
    expect(builder).toMatchObject({ action: 'walking', dir: -1 });
  });

  it('turns round when the next step is a wall', () => {
    const art = ground(80, 40, 30);
    for (let y = 20; y < 30; y += 1) art[y] = '.'.repeat(12) + '#'.repeat(68);
    const builder = lemmingAt(10, 29, 'building');
    builder.bricksLeft = BUILDER_BRICKS;
    const state = stateWith(terrainFromArt(art), [builder]);
    run(state, BUILDER_TICKS_PER_BRICK);
    expect(builder).toMatchObject({ action: 'walking', dir: -1 });
  });
});

describe('basher (G-07, G-08)', () => {
  function wallLevel(wall: string): string[] {
    const art = ground(60, 30, 20);
    for (let y = 8; y < 20; y += 1) art[y] = '.'.repeat(20) + wall.repeat(10) + '.'.repeat(30);
    return art;
  }

  it('tunnels through a wall and walks on when it is through', () => {
    const basher = lemmingAt(17, 19, 'bashing');
    const state = stateWith(terrainFromArt(wallLevel('#')), [basher]);
    run(state, BASH_TICKS_PER_PIXEL * 14);
    expect(isSolid(state.terrain, 22, 19)).toBe(false);
    run(state, BASH_TICKS_PER_PIXEL * 20);
    expect(basher.action).toBe('walking');
    expect(basher.x).toBeGreaterThan(30);
  });

  it('stops with nothing to bash', () => {
    const basher = lemmingAt(5, 19, 'bashing');
    const state = stateWith(terrainFromArt(ground(60, 30, 20)), [basher]);
    run(state, BASH_TICKS_PER_PIXEL);
    expect(basher.action).toBe('walking');
  });

  it('turns round at steel and at a one-way wall pointing against it', () => {
    for (const wall of ['S', '<']) {
      const basher = lemmingAt(17, 19, 'bashing');
      const state = stateWith(terrainFromArt(wallLevel(wall)), [basher]);
      run(state, BASH_TICKS_PER_PIXEL);
      expect(basher).toMatchObject({ action: 'walking', dir: -1 });
      expect(state.events.map((e) => e.type)).toContain('steel');
    }
  });

  it('bashes through a one-way wall in its direction', () => {
    const basher = lemmingAt(17, 19, 'bashing');
    const state = stateWith(terrainFromArt(wallLevel('>')), [basher]);
    run(state, BASH_TICKS_PER_PIXEL * 4);
    expect(basher.action).toBe('bashing');
  });

  it('turns at a blocker', () => {
    const basher = lemmingAt(17, 19, 'bashing', 1, 0);
    const blocker = lemmingAt(20, 19, 'blocking', 1, 1);
    const state = stateWith(terrainFromArt(ground(60, 30, 20)), [basher, blocker]);
    run(state, BASH_TICKS_PER_PIXEL);
    expect(basher).toMatchObject({ action: 'walking', dir: -1 });
  });

  it('falls when the tunnel floor ends', () => {
    const art = wallLevel('#');
    art[20] = '#'.repeat(19) + '.'.repeat(41);
    for (let y = 21; y < 30; y += 1) art[y] = '#'.repeat(19) + '.'.repeat(41);
    const basher = lemmingAt(18, 19, 'bashing');
    const state = stateWith(terrainFromArt(art), [basher]);
    run(state, BASH_TICKS_PER_PIXEL * 2);
    expect(basher.action).toBe('falling');
  });
});

describe('miner (G-07)', () => {
  it('digs diagonally down', () => {
    const miner = lemmingAt(10, 19, 'mining');
    const state = stateWith(terrainFromArt(ground(60, 40, 20)), [miner]);
    run(state, MINE_TICKS_PER_STEP * 5);
    expect(miner).toMatchObject({ action: 'mining', x: 15, y: 24 });
    expect(isSolid(state.terrain, 15, 24)).toBe(false);
    expect(isSolid(state.terrain, 15, 25)).toBe(true);
  });

  it('stops at steel', () => {
    const art = ground(60, 40, 20);
    art[20] = '#'.repeat(11) + 'S' + '#'.repeat(48);
    const miner = lemmingAt(10, 19, 'mining');
    const state = stateWith(terrainFromArt(art), [miner]);
    run(state, MINE_TICKS_PER_STEP);
    expect(miner.action).toBe('walking');
  });

  it('falls when it mines out of the bottom of a thin floor', () => {
    const art = ground(60, 40, 20);
    for (let y = 22; y < 40; y += 1) art[y] = '.'.repeat(60);
    const miner = lemmingAt(10, 19, 'mining');
    const state = stateWith(terrainFromArt(art), [miner]);
    run(state, MINE_TICKS_PER_STEP * 2);
    expect(miner.action).toBe('falling');
  });
});

describe('digger (G-07)', () => {
  it('digs straight down and falls through the bottom of the layer', () => {
    const art = ground(40, 60, 20);
    for (let y = 30; y < 60; y += 1) art[y] = '.'.repeat(40);
    art[55] = '#'.repeat(40);
    const digger = lemmingAt(20, 19, 'digging');
    const state = stateWith(terrainFromArt(art), [digger]);
    run(state, DIG_TICKS_PER_ROW * 3);
    expect(digger).toMatchObject({ action: 'digging', y: 22 });
    expect(isSolid(state.terrain, 16, 20)).toBe(false);
    expect(isSolid(state.terrain, 24, 20)).toBe(false);
    expect(isSolid(state.terrain, 25, 20)).toBe(true);
    run(state, DIG_TICKS_PER_ROW * 8);
    expect(digger.action).toBe('falling');
  });

  it('stops at steel', () => {
    const art = ground(40, 30, 20);
    art[20] = '#'.repeat(18) + 'S' + '#'.repeat(21);
    const digger = lemmingAt(20, 19, 'digging');
    const state = stateWith(terrainFromArt(art), [digger]);
    run(state, DIG_TICKS_PER_ROW);
    expect(digger.action).toBe('walking');
  });
});
