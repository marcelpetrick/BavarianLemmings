// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Replays (vision G-12): the intents of a game with the tick they apply to. Running a replay on the
 * same level always gives the same result; shipped levels prove they are solvable with one.
 */
import { createGame, step } from './game';
import type { LevelData } from './level';
import type { GameState, Intent } from './state';
import type { Terrain } from './terrain';

export interface ReplayEntry {
  readonly tick: number;
  readonly intent: Intent;
}

export interface Replay {
  readonly version: 1;
  readonly levelId: string;
  readonly entries: readonly ReplayEntry[];
}

/** Run a replay from the start of the level until the game ends or `maxTicks` pass. */
export function runReplay(level: LevelData, replay: Replay, maxTicks = 100_000): GameState {
  if (replay.levelId !== level.id) throw new Error(`replay is for ${replay.levelId}, not ${level.id}`);
  const state = createGame(level);
  let next = 0;
  while (state.outcome === 'playing' && state.tick < maxTicks) {
    const tick = state.tick + 1;
    const intents: Intent[] = [];
    while (next < replay.entries.length && (replay.entries[next]?.tick ?? Infinity) <= tick) {
      const entry = replay.entries[next];
      if (entry) intents.push(entry.intent);
      next += 1;
    }
    step(state, intents);
  }
  return state;
}

function fnv(hash: number, value: number): number {
  return Math.imul(hash ^ (value & 0xff), 0x01000193) >>> 0;
}

function hashNumber(hash: number, value: number): number {
  let h = hash;
  const v = Math.round(value) >>> 0;
  for (let shift = 0; shift < 32; shift += 8) h = fnv(h, v >>> shift);
  return h;
}

function hashTerrain(hash: number, terrain: Terrain): number {
  let h = hash;
  for (const byte of terrain.mask) h = fnv(h, byte);
  for (const byte of terrain.colors) h = fnv(h, byte);
  return h;
}

/** A 32-bit fingerprint of everything the rules depend on; equal states give equal hashes. */
export function hashState(state: GameState): number {
  let h = 0x811c9dc5;
  for (const value of [
    state.tick,
    state.rng,
    state.spawned,
    state.saved,
    state.died,
    state.releaseRate,
    state.nextSpawnTick,
    state.ticksLeft,
  ]) {
    h = hashNumber(h, value);
  }
  h = hashNumber(h, state.nuking ? 1 : 0);
  for (const lemming of state.lemmings) {
    for (const value of [
      lemming.id,
      lemming.x,
      lemming.y,
      lemming.dir,
      lemming.frame,
      lemming.fallDistance,
      lemming.bombTicks,
      lemming.bricksLeft,
    ]) {
      h = hashNumber(h, value);
    }
    h = hashNumber(h, (lemming.climber ? 1 : 0) | (lemming.floater ? 2 : 0) | (lemming.removed ? 4 : 0));
    for (const char of lemming.action) h = fnv(h, char.charCodeAt(0));
  }
  return hashTerrain(h, state.terrain);
}
