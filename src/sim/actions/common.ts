// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { BLOCKER_REACH, LEMMING_HEIGHT, STEP_DOWN_MAX } from '../constants';
import { setAction, type Lemming } from '../lemming';
import { emit, type GameState, type SimEventType } from '../state';
import { isSolid } from '../terrain';

/** True when a blocker stands within reach in the walking direction (vision G-06). */
export function blockedAhead(state: GameState, lemming: Lemming): boolean {
  for (const other of state.lemmings) {
    if (other.removed || other.action !== 'blocking' || other.id === lemming.id) continue;
    const ahead = (other.x - lemming.x) * lemming.dir;
    if (ahead > 0 && ahead <= BLOCKER_REACH && Math.abs(other.y - lemming.y) < LEMMING_HEIGHT) return true;
  }
  return false;
}

export function hasGround(state: GameState, lemming: Lemming): boolean {
  return isSolid(state.terrain, lemming.x, lemming.y + 1);
}

/**
 * After a horizontal move: stay on the ground, step down a small drop, or start falling (vision G-02).
 * Returns false when the lemming started to fall.
 */
export function followGround(state: GameState, lemming: Lemming): boolean {
  if (hasGround(state, lemming)) return true;
  for (let drop = 1; drop <= STEP_DOWN_MAX; drop += 1) {
    if (isSolid(state.terrain, lemming.x, lemming.y + 1 + drop)) {
      lemming.y += drop;
      return true;
    }
  }
  setAction(lemming, 'falling');
  return false;
}

/** The lemming leaves the level: dead, or saved when it went through the exit. */
export function removeLemming(state: GameState, lemming: Lemming, saved: boolean, event: SimEventType | null): void {
  lemming.removed = true;
  if (saved) state.saved += 1;
  else state.died += 1;
  if (event !== null) emit(state, event, lemming.x, lemming.y);
}
