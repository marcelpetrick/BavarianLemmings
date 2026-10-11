// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The game rules: `createGame` builds the start state of a level, `step` advances it by one tick
 * (vision G-10, G-11, G-12, R-03). `step` is deterministic: it reads nothing but its arguments.
 */
import { block } from './actions/blocking';
import { countDown, ohNo } from './actions/bombing';
import { build, shrug } from './actions/building';
import { climb } from './actions/climbing';
import { bash, dig, mine } from './actions/digging';
import { fall, float } from './actions/falling';
import { drown, exit, splat } from './actions/terminal';
import { walk } from './actions/walking';
import { assignSkill } from './assign';
import { BOMBER_COUNTDOWN_SECONDS, HATCH_OPEN_TICKS, RELEASE_RATE_MAX, TICKS_PER_SECOND, spawnInterval } from './constants';
import { TERMINAL_ACTIONS, createLemming, type Action, type Lemming } from './lemming';
import { buildTerrain, type LevelData } from './level';
import { applyObjects } from './objects';
import { seedFromText } from './rng';
import { emit, type GameState, type Intent } from './state';

type Behaviour = (state: GameState, lemming: Lemming) => void;

const BEHAVIOUR: Record<Action, Behaviour> = {
  walking: walk,
  falling: fall,
  floating: float,
  climbing: climb,
  blocking: block,
  building: build,
  shrugging: shrug,
  bashing: bash,
  mining: mine,
  digging: dig,
  ohNo,
  splatting: splat,
  drowning: drown,
  exiting: exit,
};

export function createGame(level: LevelData): GameState {
  return {
    level,
    terrain: buildTerrain(level),
    tick: 0,
    rng: seedFromText(level.id),
    lemmings: [],
    spawned: 0,
    saved: 0,
    died: 0,
    releaseRate: level.releaseRate,
    nextSpawnTick: HATCH_OPEN_TICKS,
    hatchOpen: false,
    skills: { ...level.skills },
    nuking: false,
    trapReadyTick: level.objects.map(() => 0),
    ticksLeft: level.timeSeconds * TICKS_PER_SECOND,
    outcome: 'playing',
    events: [],
  };
}

function applyIntent(state: GameState, intent: Intent): void {
  switch (intent.type) {
    case 'assign': {
      const lemming = state.lemmings[intent.lemmingId];
      if (lemming) assignSkill(state, lemming, intent.skill);
      break;
    }
    case 'releaseRate': {
      const rate = Math.min(RELEASE_RATE_MAX, Math.max(state.level.releaseRate, state.releaseRate + intent.delta));
      if (rate !== state.releaseRate) emit(state, 'releaseRate');
      state.releaseRate = rate;
      break;
    }
    case 'nuke':
      if (!state.nuking) emit(state, 'nuke');
      state.nuking = true;
      break;
  }
}

function hatches(level: LevelData): { x: number; y: number }[] {
  return level.objects.filter((object) => object.type === 'hatch');
}

function spawn(state: GameState): void {
  if (state.tick === HATCH_OPEN_TICKS) {
    state.hatchOpen = true;
    emit(state, 'hatchOpen');
  }
  if (!state.hatchOpen || state.nuking || state.spawned >= state.level.lemmings || state.tick < state.nextSpawnTick) return;
  const all = hatches(state.level);
  const hatch = all[state.spawned % all.length];
  if (!hatch) return;
  state.lemmings.push(createLemming(state.lemmings.length, hatch.x, hatch.y, 1));
  state.spawned += 1;
  state.nextSpawnTick = state.tick + spawnInterval(state.releaseRate);
  emit(state, 'spawn', hatch.x, hatch.y);
}

/** Nuke (vision G-11): every living lemming gets a bomber countdown, one per tick, oldest first. */
function nukeWave(state: GameState): void {
  if (!state.nuking) return;
  const next = state.lemmings.find((l) => !l.removed && l.bombTicks < 0 && !TERMINAL_ACTIONS.includes(l.action));
  if (next) next.bombTicks = BOMBER_COUNTDOWN_SECONDS * TICKS_PER_SECOND;
}

function finished(state: GameState): boolean {
  if (state.ticksLeft <= 0) return true;
  const allOut = state.nuking || state.spawned >= state.level.lemmings;
  return allOut && state.lemmings.every((l) => l.removed);
}

/** Advance the game by one tick. Mutates and returns `state`. */
export function step(state: GameState, intents: readonly Intent[] = []): GameState {
  state.events = [];
  if (state.outcome !== 'playing') return state;
  state.tick += 1;
  if (state.tick === 1) emit(state, 'letsGo');
  for (const intent of intents) applyIntent(state, intent);
  spawn(state);
  nukeWave(state);
  for (const lemming of state.lemmings) {
    if (lemming.removed) continue;
    if (countDown(state, lemming)) continue;
    BEHAVIOUR[lemming.action](state, lemming);
    applyObjects(state, lemming);
  }
  state.ticksLeft -= 1;
  if (finished(state)) {
    state.outcome = state.saved >= state.level.toSave ? 'won' : 'lost';
    emit(state, 'end');
  }
  return state;
}

/** Lemmings still in play (spawned, not yet saved or dead): the original's OUT counter. */
export function lemmingsOut(state: GameState): number {
  return state.lemmings.filter((l) => !l.removed).length;
}

/** Percentage helper for the status line and the result screen (vision G-10). */
export function percent(count: number, total: number): number {
  return total === 0 ? 0 : Math.floor((count * 100) / total);
}
