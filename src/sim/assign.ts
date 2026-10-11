// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Skill assignment (vision G-03, C-04): which lemming under the cursor gets the skill, and which
 * actions accept which skill.
 */
import { BOMBER_COUNTDOWN_SECONDS, BUILDER_BRICKS, LEMMING_HEIGHT, SELECT_HALF_WIDTH, TICKS_PER_SECOND } from './constants';
import { GROUND_ACTIONS, TERMINAL_ACTIONS, setAction, type Action, type Lemming } from './lemming';
import type { Skill } from './skills';
import { emit, type GameState } from './state';

const TOOL_ACTION: Partial<Record<Skill, Action>> = {
  blocker: 'blocking',
  builder: 'building',
  basher: 'bashing',
  miner: 'mining',
  digger: 'digging',
};

export function canAssign(lemming: Lemming, skill: Skill): boolean {
  if (lemming.removed || TERMINAL_ACTIONS.includes(lemming.action)) return false;
  switch (skill) {
    case 'climber':
      return !lemming.climber;
    case 'floater':
      return !lemming.floater;
    case 'bomber':
      return lemming.bombTicks < 0;
    default:
      return GROUND_ACTIONS.includes(lemming.action) && lemming.action !== TOOL_ACTION[skill];
  }
}

/** Whether the point (in level pixels) lies on the lemming's selection box. */
export function isUnderCursor(lemming: Lemming, x: number, y: number): boolean {
  return Math.abs(lemming.x - x) <= SELECT_HALF_WIDTH && y >= lemming.y - LEMMING_HEIGHT && y <= lemming.y + 1;
}

/**
 * The lemming that a click at (x, y) selects: among the lemmings under the cursor, prefer one that
 * accepts the skill, then the one closest to the cursor, then the oldest. `[verify]` the original's
 * exact priority rules (plan M1.15).
 */
export function pickLemming(state: GameState, x: number, y: number, skill: Skill | null): Lemming | null {
  let best: Lemming | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const lemming of state.lemmings) {
    if (lemming.removed || !isUnderCursor(lemming, x, y)) continue;
    const accepts = skill === null || canAssign(lemming, skill);
    const distance = Math.abs(lemming.x - x) + Math.abs(lemming.y - LEMMING_HEIGHT / 2 - y);
    const score = (accepts ? 0 : 1000) + distance;
    if (score < bestScore) {
      best = lemming;
      bestScore = score;
    }
  }
  return best;
}

/** Give a skill to a lemming if a skill is left and the lemming accepts it. Returns success. */
export function assignSkill(state: GameState, lemming: Lemming, skill: Skill): boolean {
  if (state.skills[skill] <= 0 || !canAssign(lemming, skill)) return false;
  state.skills[skill] -= 1;
  switch (skill) {
    case 'climber':
      lemming.climber = true;
      break;
    case 'floater':
      lemming.floater = true;
      break;
    case 'bomber':
      lemming.bombTicks = BOMBER_COUNTDOWN_SECONDS * TICKS_PER_SECOND;
      break;
    case 'builder':
      setAction(lemming, 'building');
      lemming.bricksLeft = BUILDER_BRICKS;
      break;
    default:
      setAction(lemming, TOOL_ACTION[skill] ?? 'walking');
  }
  emit(state, 'assign', lemming.x, lemming.y);
  return true;
}

/** Seconds shown above a bomber (5, 4, 3, 2, 1), or 0 when no countdown runs. */
export function bomberDigit(lemming: Lemming): number {
  return lemming.bombTicks < 0 ? 0 : Math.ceil(lemming.bombTicks / TICKS_PER_SECOND);
}
