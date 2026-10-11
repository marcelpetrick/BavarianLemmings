// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Level objects that act on lemmings (vision G-09): exit, water, traps, and the bottom of the level.
 */
import { LEMMING_HEIGHT, TRAP_CYCLE_TICKS } from './constants';
import { setAction, type Lemming } from './lemming';
import type { Rect } from './level';
import { removeLemming } from './actions/common';
import { emit, type GameState } from './state';

/** Half the width and the height of the exit trigger area around the exit's floor point. */
const EXIT_HALF_WIDTH = 2;
const EXIT_DEPTH = 4;

const NOT_AFFECTED = new Set(['splatting', 'drowning', 'exiting', 'ohNo']);

function inRect(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
}

/** Apply exits, water, traps and the level bottom to one lemming after it moved. */
export function applyObjects(state: GameState, lemming: Lemming): void {
  if (lemming.removed) return;
  if (lemming.y - LEMMING_HEIGHT >= state.terrain.height) {
    removeLemming(state, lemming, false, 'fellOut');
    return;
  }
  if (NOT_AFFECTED.has(lemming.action)) return;
  state.level.objects.forEach((object, index) => {
    if (lemming.removed || NOT_AFFECTED.has(lemming.action)) return;
    if (object.type === 'exit') {
      if (lemming.action === 'blocking') return;
      if (Math.abs(lemming.x - object.x) <= EXIT_HALF_WIDTH && lemming.y <= object.y && lemming.y > object.y - EXIT_DEPTH) {
        setAction(lemming, 'exiting');
        lemming.bombTicks = -1;
        emit(state, 'exit', lemming.x, lemming.y);
      }
    } else if (object.type === 'water') {
      if (inRect(object, lemming.x, lemming.y)) {
        setAction(lemming, 'drowning');
        lemming.bombTicks = -1;
        emit(state, 'drown', lemming.x, lemming.y);
      }
    } else if (object.type === 'trap') {
      if (inRect(object, lemming.x, lemming.y) && (state.trapReadyTick[index] ?? 0) <= state.tick) {
        state.trapReadyTick[index] = state.tick + TRAP_CYCLE_TICKS;
        removeLemming(state, lemming, false, 'trap');
      }
    }
  });
}
