// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { EXPLOSION_RADIUS, LEMMING_HEIGHT, OH_NO_TICKS } from '../constants';
import { setAction, type Lemming } from '../lemming';
import { emit, type GameState } from '../state';
import { removePixel } from '../terrain';
import { removeLemming } from './common';

const AIRBORNE = new Set(['falling', 'floating', 'climbing']);

/**
 * Bomber countdown (vision G-05): runs alongside any action. At zero, a lemming on the ground says
 * "Oh no!" and then explodes; one in the air explodes at once.
 * Returns true when the lemming exploded this tick.
 */
export function countDown(state: GameState, lemming: Lemming): boolean {
  if (lemming.bombTicks < 0) return false;
  lemming.bombTicks -= 1;
  if (lemming.bombTicks > 0) return false;
  lemming.bombTicks = -1;
  if (lemming.action === 'splatting' || lemming.action === 'drowning' || lemming.action === 'exiting') return false;
  if (AIRBORNE.has(lemming.action)) {
    explode(state, lemming);
    return true;
  }
  setAction(lemming, 'ohNo');
  emit(state, 'ohNo', lemming.x, lemming.y);
  return false;
}

export function ohNo(state: GameState, lemming: Lemming): void {
  lemming.frame += 1;
  if (lemming.frame >= OH_NO_TICKS) explode(state, lemming);
}

/** Remove a disc of terrain around the lemming's middle; steel stays (vision G-05, G-08). */
export function explode(state: GameState, lemming: Lemming): void {
  const centerX = lemming.x;
  const centerY = lemming.y - Math.floor(LEMMING_HEIGHT / 2) + 1;
  for (let dy = -EXPLOSION_RADIUS; dy <= EXPLOSION_RADIUS; dy += 1) {
    for (let dx = -EXPLOSION_RADIUS; dx <= EXPLOSION_RADIUS; dx += 1) {
      if (dx * dx + dy * dy <= EXPLOSION_RADIUS * EXPLOSION_RADIUS) removePixel(state.terrain, centerX + dx, centerY + dy, 0);
    }
  }
  removeLemming(state, lemming, false, 'explode');
}
