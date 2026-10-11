// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { setAction, type Lemming } from '../lemming';
import type { GameState } from '../state';
import { hasGround } from './common';

/**
 * Blocker (vision G-06): stands still and turns the others (see blockedAhead). It is freed only when
 * the ground beneath it is removed, or by its own explosion.
 */
export function block(state: GameState, lemming: Lemming): void {
  lemming.frame += 1;
  if (!hasGround(state, lemming)) setAction(lemming, 'falling');
}
