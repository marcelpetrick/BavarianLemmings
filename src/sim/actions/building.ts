// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { BRICK_WIDTH, BUILDER_TICKS_PER_BRICK, BUILDER_WARN_BRICKS, LEMMING_HEIGHT, SHRUG_TICKS } from '../constants';
import { setAction, turn, type Lemming } from '../lemming';
import { emit, type GameState } from '../state';
import { addBrickPixel, isSolid } from '../terrain';

/**
 * Builder (vision G-07): lays a brick of BRICK_WIDTH pixels every BUILDER_TICKS_PER_BRICK ticks, then
 * walks one pixel up and two forward onto it. Bumping its head or walking into a wall stops it and
 * turns it round. After the last brick it shrugs.
 */
export function build(state: GameState, lemming: Lemming): void {
  lemming.frame += 1;
  if (lemming.frame % BUILDER_TICKS_PER_BRICK !== 0) return;
  for (let i = 0; i < BRICK_WIDTH; i += 1) addBrickPixel(state.terrain, lemming.x + lemming.dir * i, lemming.y);
  lemming.bricksLeft -= 1;
  emit(state, lemming.bricksLeft < BUILDER_WARN_BRICKS ? 'builderWarn' : 'brick', lemming.x, lemming.y);
  if (isSolid(state.terrain, lemming.x, lemming.y - LEMMING_HEIGHT)) {
    turn(lemming);
    setAction(lemming, 'walking');
    return;
  }
  lemming.y -= 1;
  for (let step = 0; step < 2; step += 1) {
    if (isSolid(state.terrain, lemming.x + lemming.dir, lemming.y)) {
      turn(lemming);
      setAction(lemming, 'walking');
      return;
    }
    lemming.x += lemming.dir;
  }
  if (lemming.bricksLeft <= 0) {
    setAction(lemming, 'shrugging');
    emit(state, 'shrug', lemming.x, lemming.y);
  }
}

export function shrug(_state: GameState, lemming: Lemming): void {
  lemming.frame += 1;
  if (lemming.frame >= SHRUG_TICKS) setAction(lemming, 'walking');
}
