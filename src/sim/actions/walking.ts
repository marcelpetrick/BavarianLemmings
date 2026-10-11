// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { STEP_UP_MAX } from '../constants';
import { setAction, turn, type Lemming } from '../lemming';
import type { GameState } from '../state';
import { isSolid } from '../terrain';
import { blockedAhead, followGround } from './common';

/**
 * Walker (vision G-02): one pixel per tick; steps up rises of up to STEP_UP_MAX pixels, turns at
 * higher walls (or starts climbing as a climber), steps down small drops and falls off edges.
 */
export function walk(state: GameState, lemming: Lemming): void {
  if (blockedAhead(state, lemming)) {
    turn(lemming);
    return;
  }
  const nextX = lemming.x + lemming.dir;
  if (isSolid(state.terrain, nextX, lemming.y)) {
    let rise = 1;
    while (rise <= STEP_UP_MAX && isSolid(state.terrain, nextX, lemming.y - rise)) rise += 1;
    if (rise <= STEP_UP_MAX) {
      lemming.x = nextX;
      lemming.y -= rise;
    } else if (lemming.climber) {
      setAction(lemming, 'climbing');
    } else {
      turn(lemming);
    }
    return;
  }
  lemming.x = nextX;
  followGround(state, lemming);
}
