// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { FALL_SPEED, FLOAT_SPEED, FLOATER_OPEN_DISTANCE, SPLAT_FALL_HEIGHT } from '../constants';
import { setAction, type Lemming } from '../lemming';
import { emit, type GameState } from '../state';
import { hasGround } from './common';

/**
 * Faller (vision G-02): FALL_SPEED pixels per tick. Landing after more than SPLAT_FALL_HEIGHT pixels
 * kills the lemming ("splat"). A floater opens its umbrella after FLOATER_OPEN_DISTANCE pixels.
 */
export function fall(state: GameState, lemming: Lemming): void {
  for (let pixel = 0; pixel < FALL_SPEED; pixel += 1) {
    if (hasGround(state, lemming)) {
      if (lemming.fallDistance > SPLAT_FALL_HEIGHT) {
        setAction(lemming, 'splatting');
        emit(state, 'splat', lemming.x, lemming.y);
      } else {
        setAction(lemming, 'walking');
      }
      return;
    }
    lemming.y += 1;
    lemming.fallDistance += 1;
    if (lemming.floater && lemming.fallDistance >= FLOATER_OPEN_DISTANCE) {
      setAction(lemming, 'floating');
      return;
    }
  }
  lemming.frame += 1;
}

/** Floater (vision G-04): sinks slowly at FLOAT_SPEED and always lands safely. */
export function float(state: GameState, lemming: Lemming): void {
  lemming.frame += 1;
  for (let pixel = 0; pixel < FLOAT_SPEED; pixel += 1) {
    if (hasGround(state, lemming)) {
      setAction(lemming, 'walking');
      return;
    }
    lemming.y += 1;
  }
}
