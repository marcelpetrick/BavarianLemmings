// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { constantRegistry } from '../../src/sim/constant';
import {
  HATCH_OPEN_TICKS,
  LEMMING_CAP,
  OH_NO_TICKS,
  TICKS_PER_SECOND,
  BOMBER_COUNTDOWN_SECONDS,
  spawnInterval,
} from '../../src/sim/constants';
import * as game from '../../src/sim/game';
import { createGame, lemmingsOut, percent, step } from '../../src/sim/game';
import type { LevelData } from '../../src/sim/level';
import type { GameState, SimEventType } from '../../src/sim/state';
import { BASE_LEVEL } from './helpers';

const LEVEL: LevelData = {
  ...BASE_LEVEL,
  lemmings: 5,
  toSave: 3,
  timeSeconds: 120,
  terrain: [{ shape: 'rect', x: 0, y: 100, w: 320, h: 60 }],
  objects: [
    { type: 'hatch', x: 40, y: 60 },
    { type: 'exit', x: 200, y: 99 },
  ],
};

function runUntil(state: GameState, done: (s: GameState) => boolean, limit = 20_000): SimEventType[] {
  const events: SimEventType[] = [];
  while (!done(state) && state.tick < limit) {
    step(state);
    events.push(...state.events.map((e) => e.type));
  }
  return events;
}

describe('game loop (G-01, G-10, G-11)', () => {
  it('opens the hatch, then spawns at the release rate', () => {
    const state = createGame(LEVEL);
    const events = runUntil(state, (s) => s.spawned === 1);
    expect(events.slice(0, 1)).toEqual(['letsGo']);
    expect(events).toContain('hatchOpen');
    // Spawned at the hatch and already fallen three pixels in the same tick.
    expect(state.lemmings[0]).toMatchObject({ x: 40, y: 63, dir: 1, action: 'falling' });
    runUntil(state, (s) => s.spawned === 2);
    expect(state.tick).toBe(HATCH_OPEN_TICKS + spawnInterval(LEVEL.releaseRate));
  });

  it('keeps the release rate between the level minimum and 99', () => {
    const state = createGame(LEVEL);
    step(state, [{ type: 'releaseRate', delta: -10 }]);
    expect(state.releaseRate).toBe(LEVEL.releaseRate);
    expect(state.events.map((e) => e.type)).not.toContain('releaseRate');
    step(state, [{ type: 'releaseRate', delta: 100 }]);
    expect(state.releaseRate).toBe(99);
    expect(state.events.map((e) => e.type)).toContain('releaseRate');
    expect(spawnInterval(99)).toBeLessThan(spawnInterval(1));
  });

  it('wins when enough lemmings walk into the exit', () => {
    const state = createGame(LEVEL);
    const events = runUntil(state, (s) => s.outcome !== 'playing');
    expect(state.outcome).toBe('won');
    expect(state.saved).toBe(5);
    expect(events.filter((e) => e === 'exit')).toHaveLength(5);
    expect(events.at(-1)).toBe('end');
    expect(percent(state.saved, LEVEL.lemmings)).toBe(100);
    expect(percent(1, 0)).toBe(0);
    step(state);
    expect(state.events).toEqual([]);
  });

  it('loses when the time runs out', () => {
    const state = createGame({ ...LEVEL, timeSeconds: 1 });
    runUntil(state, (s) => s.outcome !== 'playing');
    expect(state.outcome).toBe('lost');
    expect(state.tick).toBe(TICKS_PER_SECOND);
  });

  it('nuke stops spawning and blows up every lemming, one per tick', () => {
    const state = createGame(LEVEL);
    runUntil(state, (s) => s.spawned === 3);
    step(state, [{ type: 'nuke' }]);
    expect(state.events.map((e) => e.type)).toContain('nuke');
    step(state, [{ type: 'nuke' }]);
    step(state);
    expect(state.lemmings.every((l) => l.bombTicks > 0)).toBe(true);
    expect(lemmingsOut(state)).toBe(3);
    runUntil(state, (s) => s.outcome !== 'playing', state.tick + BOMBER_COUNTDOWN_SECONDS * TICKS_PER_SECOND + OH_NO_TICKS + 10);
    expect(state.spawned).toBe(3);
    expect(state.outcome).toBe('lost');
    expect(state.died).toBe(3);
  });

  it('uses only hatches that exist', () => {
    const state = createGame({ ...LEVEL, objects: [{ type: 'exit', x: 200, y: 99 }] });
    runUntil(state, (s) => s.tick > HATCH_OPEN_TICKS + 5);
    expect(state.spawned).toBe(0);
  });
});

describe('constants and non-goals', () => {
  it('declares every original-game number with a source', () => {
    expect(LEMMING_CAP).toBe(80);
    for (const [name, info] of constantRegistry) {
      expect(info.source.length, name).toBeGreaterThan(0);
      expect(['verified', 'unverified', 'design'], name).toContain(info.status);
    }
  });

  it('has no two-player code paths (G-14)', () => {
    expect(Object.keys(game).sort()).toEqual(['createGame', 'lemmingsOut', 'percent', 'step']);
    expect(JSON.stringify(createGame(LEVEL), (key, value: unknown) => (key === 'terrain' ? undefined : value))).not.toMatch(/player/i);
  });
});
