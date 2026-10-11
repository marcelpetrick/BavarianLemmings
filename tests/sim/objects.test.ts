// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { DROWN_TICKS, EXIT_TICKS, TRAP_CYCLE_TICKS } from '../../src/sim/constants';
import { step } from '../../src/sim/game';
import type { GameState } from '../../src/sim/state';
import { lemmingAt, stateWith, terrainFromArt } from './helpers';

const flat = Array.from({ length: 20 }, (_, y) => (y >= 15 ? '#' : '.').repeat(60));

function run(state: GameState, ticks: number): void {
  for (let i = 0; i < ticks; i += 1) step(state);
}

describe('exit, water and traps (G-09, G-10)', () => {
  it('a lemming that reaches the exit is saved', () => {
    const state = stateWith(terrainFromArt(flat), [lemmingAt(5, 14)], [{ type: 'exit', x: 8, y: 14 }]);
    run(state, 2);
    expect(state.lemmings[0]?.action).toBe('exiting');
    run(state, EXIT_TICKS);
    expect(state.saved).toBe(1);
    expect(state.outcome).toBe('won');
  });

  it('blockers ignore the exit', () => {
    const state = stateWith(terrainFromArt(flat), [lemmingAt(8, 14, 'blocking')], [{ type: 'exit', x: 8, y: 14 }]);
    run(state, 2);
    expect(state.lemmings[0]?.action).toBe('blocking');
  });

  it('water drowns a lemming', () => {
    const state = stateWith(terrainFromArt(flat), [lemmingAt(5, 14)], [{ type: 'water', x: 10, y: 10, w: 10, h: 6 }]);
    run(state, 5);
    expect(state.lemmings[0]?.action).toBe('drowning');
    run(state, DROWN_TICKS);
    expect(state.died).toBe(1);
  });

  it('a trap kills one lemming at a time', () => {
    const lemmings = [lemmingAt(9, 14, 'walking', 1, 0), lemmingAt(9, 14, 'walking', 1, 1)];
    const state = stateWith(terrainFromArt(flat), lemmings, [{ type: 'trap', x: 10, y: 10, w: 4, h: 6, kind: 'squasher' }]);
    run(state, 1);
    expect(lemmings[0]?.removed).toBe(true);
    expect(lemmings[1]?.removed).toBe(false);
    expect(state.events.map((e) => e.type)).toContain('trap');
    lemmings[1]!.dir = -1;
    lemmings[1]!.x = 11;
    run(state, TRAP_CYCLE_TICKS);
    expect(lemmings[1]?.removed).toBe(false);
  });
});
