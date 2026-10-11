// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Edge cases of the original behaviour as named fixtures (vision G-13). Each one documents what the
 * simulation does; `[verify]` against a DOS source with the constants (plan M6.123).
 */
import { describe, expect, it } from 'vitest';
import {
  BASH_TICKS_PER_PIXEL,
  BUILDER_TICKS_PER_BRICK,
  CLIMB_TICKS_PER_PIXEL,
  DIG_TICKS_PER_ROW,
  FLOATER_OPEN_DISTANCE,
} from '../../src/sim/constants';
import { step } from '../../src/sim/game';
import type { GameState } from '../../src/sim/state';
import { lemmingAt, stateWith, terrainFromArt } from './helpers';

function run(state: GameState, ticks: number): void {
  for (let i = 0; i < ticks; i += 1) step(state);
}

function ground(width: number, height: number, groundRow: number): string[] {
  return Array.from({ length: height }, (_, y) => (y >= groundRow ? '#'.repeat(width) : '.'.repeat(width)));
}

describe('edge cases (G-13)', () => {
  it('builder meets the ceiling: stops building and walks back', () => {
    const art = ground(60, 40, 30);
    art[18] = '#'.repeat(60);
    const builder = lemmingAt(10, 29, 'building');
    builder.bricksLeft = 12;
    const state = stateWith(terrainFromArt(art), [builder]);
    run(state, BUILDER_TICKS_PER_BRICK * 2);
    expect(builder).toMatchObject({ action: 'walking', dir: -1 });
  });

  it('basher meets steel: turns round, the steel stays', () => {
    const art = ground(60, 30, 20);
    for (let y = 8; y < 20; y += 1) art[y] = '.'.repeat(20) + '#'.repeat(5) + 'S'.repeat(5) + '.'.repeat(30);
    const basher = lemmingAt(17, 19, 'bashing');
    const state = stateWith(terrainFromArt(art), [basher]);
    run(state, BASH_TICKS_PER_PIXEL * 10);
    expect(basher.dir).toBe(-1);
    expect(state.terrain.mask[19 * 60 + 25]).not.toBe(0);
  });

  it('blocker on a crumbling edge: freed when a digger removes the ground, lands on the new floor', () => {
    const blocker = lemmingAt(20, 19, 'blocking', 1, 0);
    const digger = lemmingAt(20, 19, 'digging', 1, 1);
    const state = stateWith(terrainFromArt(ground(40, 40, 20)), [blocker, digger]);
    run(state, DIG_TICKS_PER_ROW * 2);
    expect(blocker.action).not.toBe('blocking');
    expect(blocker.y).toBeGreaterThan(19);
  });

  it('digger into water: drowns when it digs through into the water area', () => {
    const art = ground(40, 40, 20);
    for (let y = 24; y < 40; y += 1) art[y] = '.'.repeat(40);
    const digger = lemmingAt(20, 19, 'digging');
    const state = stateWith(terrainFromArt(art), [digger], [{ type: 'water', x: 0, y: 30, w: 40, h: 10 }]);
    run(state, DIG_TICKS_PER_ROW * 4 + 10);
    expect(digger.action).toBe('drowning');
  });

  it('floater over a trap: the trap still gets it', () => {
    const floater = lemmingAt(20, 0, 'falling');
    floater.floater = true;
    const state = stateWith(
      terrainFromArt(ground(40, 80, 70)),
      [floater],
      [{ type: 'trap', x: 15, y: 60, w: 10, h: 10, kind: 'squasher' }],
    );
    run(state, FLOATER_OPEN_DISTANCE + 40);
    expect(floater.removed).toBe(true);
    expect(state.died).toBe(1);
  });

  it('climber at an overhang: lets go, turns and falls', () => {
    const art = ground(40, 40, 35);
    for (let y = 15; y < 35; y += 1) art[y] = '.'.repeat(20) + '#'.repeat(20);
    art[15] = '.'.repeat(14) + '#'.repeat(26);
    const climber = lemmingAt(19, 34, 'climbing');
    climber.climber = true;
    const state = stateWith(terrainFromArt(art), [climber]);
    run(state, CLIMB_TICKS_PER_PIXEL * 12);
    expect(climber.dir).toBe(-1);
    expect(climber.climber).toBe(true);
  });
});
