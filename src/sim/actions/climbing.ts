// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { CLIMB_TICKS_PER_PIXEL, LEMMING_HEIGHT } from '../constants';
import { setAction, turn, type Lemming } from '../lemming';
import type { GameState } from '../state';
import { isSolid } from '../terrain';

/**
 * Climber (vision G-04): climbs the wall in front, one pixel every CLIMB_TICKS_PER_PIXEL ticks.
 * At the top it pulls itself over; under an overhang (or at the top of the level) it lets go,
 * turns and falls.
 */
export function climb(state: GameState, lemming: Lemming): void {
  lemming.frame += 1;
  if (lemming.frame % CLIMB_TICKS_PER_PIXEL !== 0) return;
  const headRow = lemming.y - LEMMING_HEIGHT;
  if (headRow < 0 || isSolid(state.terrain, lemming.x, headRow)) {
    turn(lemming);
    lemming.x += lemming.dir;
    setAction(lemming, 'falling');
    return;
  }
  lemming.y -= 1;
  if (!isSolid(state.terrain, lemming.x + lemming.dir, lemming.y)) {
    lemming.x += lemming.dir;
    setAction(lemming, 'walking');
  }
}
