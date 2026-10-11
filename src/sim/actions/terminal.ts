// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { DROWN_TICKS, EXIT_TICKS, SPLAT_TICKS } from '../constants';
import type { Lemming } from '../lemming';
import type { GameState } from '../state';
import { removeLemming } from './common';

/** Splat, drown and exit animations: the lemming is removed when the animation ends. */
export function splat(state: GameState, lemming: Lemming): void {
  lemming.frame += 1;
  if (lemming.frame >= SPLAT_TICKS) removeLemming(state, lemming, false, null);
}

export function drown(state: GameState, lemming: Lemming): void {
  lemming.frame += 1;
  if (lemming.frame >= DROWN_TICKS) removeLemming(state, lemming, false, null);
}

export function exit(state: GameState, lemming: Lemming): void {
  lemming.frame += 1;
  if (lemming.frame >= EXIT_TICKS) removeLemming(state, lemming, true, null);
}
