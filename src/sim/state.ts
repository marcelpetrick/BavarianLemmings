// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import type { Lemming } from './lemming';
import type { LevelData } from './level';
import type { Skill, SkillCounts } from './skills';
import type { Terrain } from './terrain';

/** Something the outside world reacts to (sound, effects); collected per tick, never read by the sim. */
export type SimEventType =
  | 'letsGo'
  | 'hatchOpen'
  | 'spawn'
  | 'assign'
  | 'ohNo'
  | 'explode'
  | 'splat'
  | 'drown'
  | 'exit'
  | 'trap'
  | 'brick'
  | 'builderWarn'
  | 'shrug'
  | 'fellOut'
  | 'steel'
  | 'releaseRate'
  | 'nuke'
  | 'end';

export interface SimEvent {
  readonly type: SimEventType;
  readonly x: number;
  readonly y: number;
  /** Entity identity lets rendering choose its costume without introducing themes to the simulation. */
  readonly lemmingId?: number;
}

/** Inputs to the simulation: the only thing it receives from the player (architecture.md 11). */
export type Intent =
  | { readonly type: 'assign'; readonly lemmingId: number; readonly skill: Skill }
  | { readonly type: 'releaseRate'; readonly delta: number }
  | { readonly type: 'nuke' };

export type Outcome = 'playing' | 'won' | 'lost';

export interface GameState {
  readonly level: LevelData;
  readonly terrain: Terrain;
  tick: number;
  rng: number;
  lemmings: Lemming[];
  spawned: number;
  saved: number;
  died: number;
  releaseRate: number;
  nextSpawnTick: number;
  hatchOpen: boolean;
  skills: SkillCounts;
  nuking: boolean;
  /** Tick from which each trap (by index in level.objects) is ready again. */
  trapReadyTick: number[];
  ticksLeft: number;
  outcome: Outcome;
  /** Events of the last tick only. */
  events: SimEvent[];
}

export function emit(state: GameState, type: SimEventType, x = 0, y = 0, lemmingId?: number): void {
  state.events.push(lemmingId === undefined ? { type, x, y } : { type, x, y, lemmingId });
}
