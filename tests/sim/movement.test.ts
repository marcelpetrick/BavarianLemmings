// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { CLIMB_TICKS_PER_PIXEL, FLOATER_OPEN_DISTANCE, SPLAT_FALL_HEIGHT, SPLAT_TICKS } from '../../src/sim/constants';
import { step } from '../../src/sim/game';
import type { GameState } from '../../src/sim/state';
import { lemmingAt, stateWith, terrainFromArt } from './helpers';

function run(state: GameState, ticks: number): void {
  for (let i = 0; i < ticks; i += 1) step(state);
}

/** A level of `height` rows with ground filling the rows from `groundRow` down. */
function ground(width: number, height: number, groundRow: number): string[] {
  return Array.from({ length: height }, (_, y) => (y >= groundRow ? '#'.repeat(width) : '.'.repeat(width)));
}

describe('walker (G-02)', () => {
  it('walks one pixel per tick on flat ground', () => {
    const state = stateWith(terrainFromArt(ground(30, 20, 15)), [lemmingAt(5, 14)]);
    run(state, 3);
    expect(state.lemmings[0]).toMatchObject({ x: 8, y: 14, action: 'walking' });
  });

  it('steps up a rise of up to six pixels', () => {
    const art = ground(30, 20, 15);
    for (let y = 9; y < 15; y += 1) art[y] = '.'.repeat(10) + '#'.repeat(20);
    const state = stateWith(terrainFromArt(art), [lemmingAt(8, 14)]);
    run(state, 2);
    expect(state.lemmings[0]).toMatchObject({ x: 10, y: 8 });
  });

  it('turns at a wall of seven pixels, and a climber starts climbing', () => {
    const art = ground(30, 20, 15);
    for (let y = 8; y < 15; y += 1) art[y] = '.'.repeat(10) + '#'.repeat(20);
    const walker = lemmingAt(9, 14);
    const climber = lemmingAt(9, 14, 'walking', 1, 1);
    climber.climber = true;
    const state = stateWith(terrainFromArt(art), [walker, climber]);
    run(state, 1);
    expect(walker).toMatchObject({ x: 9, dir: -1, action: 'walking' });
    expect(climber).toMatchObject({ x: 9, action: 'climbing' });
  });

  it('steps down a drop of three pixels and falls from a higher edge', () => {
    const art = ground(30, 40, 30);
    for (let y = 15; y < 30; y += 1) art[y] = '#'.repeat(10) + '.'.repeat(5) + '#'.repeat(15);
    art[18] = '#'.repeat(10) + '.'.repeat(5) + '#'.repeat(15);
    const low = ground(30, 40, 18);
    for (let y = 15; y < 18; y += 1) low[y] = '#'.repeat(10) + '.'.repeat(20);
    const stepState = stateWith(terrainFromArt(low), [lemmingAt(9, 14)]);
    run(stepState, 1);
    expect(stepState.lemmings[0]).toMatchObject({ x: 10, y: 17, action: 'walking' });

    const cliff = ground(30, 40, 30);
    for (let y = 15; y < 30; y += 1) cliff[y] = '#'.repeat(10) + '.'.repeat(20);
    const fallState = stateWith(terrainFromArt(cliff), [lemmingAt(9, 14)]);
    run(fallState, 1);
    expect(fallState.lemmings[0]).toMatchObject({ x: 10, y: 14, action: 'falling' });
  });

  it('turns at the side of the level', () => {
    const state = stateWith(terrainFromArt(ground(30, 20, 15)), [lemmingAt(29, 14)]);
    run(state, 1);
    expect(state.lemmings[0]).toMatchObject({ x: 29, dir: -1 });
  });
});

describe('faller and floater (G-02, G-04)', () => {
  it('falls three pixels per tick and lands as a walker after a short fall', () => {
    const state = stateWith(terrainFromArt(ground(10, 40, 30)), [lemmingAt(5, 10, 'falling')]);
    run(state, 1);
    expect(state.lemmings[0]).toMatchObject({ y: 13, action: 'falling', fallDistance: 3 });
    run(state, 7);
    expect(state.lemmings[0]).toMatchObject({ y: 29, action: 'walking' });
  });

  it('splats after a fall higher than SPLAT_FALL_HEIGHT and is removed after the animation', () => {
    const height = SPLAT_FALL_HEIGHT + 20;
    const state = stateWith(terrainFromArt(ground(10, height, height - 5)), [lemmingAt(5, 0, 'falling')]);
    run(state, Math.ceil(height / 3) + 1);
    expect(state.lemmings[0]?.action).toBe('splatting');
    expect(state.events.some((e) => e.type === 'splat') || state.lemmings[0]?.frame !== 0).toBe(true);
    run(state, SPLAT_TICKS);
    expect(state.lemmings[0]?.removed).toBe(true);
    expect(state.died).toBe(1);
    expect(state.outcome).toBe('lost');
  });

  it('a floater opens its umbrella and survives any height', () => {
    const height = SPLAT_FALL_HEIGHT + 40;
    const floater = lemmingAt(5, 0, 'falling');
    floater.floater = true;
    const state = stateWith(terrainFromArt(ground(10, height, height - 5)), [floater]);
    run(state, Math.ceil(FLOATER_OPEN_DISTANCE / 3));
    expect(floater.action).toBe('floating');
    run(state, height);
    expect(floater).toMatchObject({ action: 'walking', y: height - 6 });
  });

  it('a lemming that falls out of the level dies', () => {
    const state = stateWith(terrainFromArt(ground(10, 20, 30)), [lemmingAt(5, 0, 'falling')]);
    run(state, 20);
    expect(state.lemmings[0]?.removed).toBe(true);
    expect(state.died).toBe(1);
  });
});

describe('climber (G-04)', () => {
  it('climbs a wall and pulls itself over the top', () => {
    const art = ground(30, 40, 35);
    for (let y = 20; y < 35; y += 1) art[y] = '.'.repeat(10) + '#'.repeat(20);
    const climber = lemmingAt(9, 34, 'climbing');
    climber.climber = true;
    const state = stateWith(terrainFromArt(art), [climber]);
    run(state, CLIMB_TICKS_PER_PIXEL * 15);
    expect(climber).toMatchObject({ action: 'walking', x: 10, y: 19 });
  });

  it('falls back from an overhang, turned round', () => {
    const art = ground(30, 40, 35);
    for (let y = 20; y < 35; y += 1) art[y] = '.'.repeat(10) + '#'.repeat(20);
    art[22] = '.'.repeat(5) + '#'.repeat(25);
    const climber = lemmingAt(9, 34, 'climbing');
    climber.climber = true;
    const state = stateWith(terrainFromArt(art), [climber]);
    run(state, CLIMB_TICKS_PER_PIXEL * 3);
    expect(climber).toMatchObject({ action: 'falling', dir: -1, x: 8 });
  });

  it('lets go at the top of the level', () => {
    const art = ground(30, 30, 25);
    for (let y = 0; y < 25; y += 1) art[y] = '.'.repeat(10) + '#'.repeat(20);
    const climber = lemmingAt(9, 12, 'climbing');
    const state = stateWith(terrainFromArt(art), [climber]);
    run(state, CLIMB_TICKS_PER_PIXEL * 4);
    expect(climber.action).toBe('falling');
  });
});
