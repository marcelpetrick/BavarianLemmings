// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, step } from '../../src/sim/game';
import { parseLevel } from '../../src/sim/level';
import { hashState, runReplay, type Replay } from '../../src/sim/replay';

const level = parseLevel(JSON.parse(readFileSync('assets/levels/test/flat.json', 'utf8')));

const replay: Replay = {
  version: 1,
  levelId: 'test-flat',
  entries: [
    { tick: 60, intent: { type: 'releaseRate', delta: 20 } },
    { tick: 90, intent: { type: 'assign', lemmingId: 0, skill: 'builder' } },
    { tick: 140, intent: { type: 'assign', lemmingId: 1, skill: 'bomber' } },
    { tick: 200, intent: { type: 'assign', lemmingId: 2, skill: 'digger' } },
    { tick: 260, intent: { type: 'assign', lemmingId: 3, skill: 'basher' } },
    { tick: 300, intent: { type: 'assign', lemmingId: 4, skill: 'miner' } },
    { tick: 320, intent: { type: 'assign', lemmingId: 5, skill: 'blocker' } },
  ],
};

describe('determinism (G-12)', () => {
  it('two runs of the same replay give identical states', () => {
    const first = runReplay(level, replay);
    const second = runReplay(level, replay);
    expect(first.outcome).not.toBe('playing');
    expect(hashState(first)).toBe(hashState(second));
    expect(first.tick).toBe(second.tick);
  });

  it('a different input gives a different state', () => {
    const changed: Replay = { ...replay, entries: replay.entries.slice(1) };
    expect(hashState(runReplay(level, changed, 400))).not.toBe(hashState(runReplay(level, replay, 400)));
  });

  it('the hash covers the lemming flags', () => {
    const a = createGame(level);
    for (let i = 0; i < 60; i += 1) step(a);
    const before = hashState(a);
    a.lemmings[0]!.floater = true;
    expect(hashState(a)).not.toBe(before);
  });

  it('refuses a replay recorded on another level', () => {
    expect(() => runReplay(level, { ...replay, levelId: 'fun-01' })).toThrow(/replay is for fun-01/);
  });
});
