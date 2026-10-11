// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import {
  BASH_LOOKAHEAD,
  BASH_REACH,
  BASH_TICKS_PER_PIXEL,
  DIG_HALF_WIDTH,
  DIG_TICKS_PER_ROW,
  LEMMING_HEIGHT,
  MINE_TICKS_PER_STEP,
} from '../constants';
import { setAction, turn, type Lemming } from '../lemming';
import { emit, type GameState } from '../state';
import { canRemove, isSolid, removePixel } from '../terrain';
import { blockedAhead, followGround } from './common';

interface Area {
  readonly x0: number;
  readonly x1: number;
  readonly y0: number;
  readonly y1: number;
}

function columns(lemming: Lemming, from: number, to: number): { x0: number; x1: number } {
  const a = lemming.x + lemming.dir * from;
  const b = lemming.x + lemming.dir * to;
  return { x0: Math.min(a, b), x1: Math.max(a, b) };
}

function anySolid(state: GameState, area: Area): boolean {
  for (let y = area.y0; y <= area.y1; y += 1) for (let x = area.x0; x <= area.x1; x += 1) if (isSolid(state.terrain, x, y)) return true;
  return false;
}

function allRemovable(state: GameState, area: Area, dir: -1 | 0 | 1): boolean {
  for (let y = area.y0; y <= area.y1; y += 1) {
    for (let x = area.x0; x <= area.x1; x += 1) if (isSolid(state.terrain, x, y) && !canRemove(state.terrain, x, y, dir)) return false;
  }
  return true;
}

function clear(state: GameState, area: Area, dir: -1 | 0 | 1): void {
  for (let y = area.y0; y <= area.y1; y += 1) for (let x = area.x0; x <= area.x1; x += 1) removePixel(state.terrain, x, y, dir);
}

/**
 * Basher (vision G-07): tunnels horizontally, one pixel every BASH_TICKS_PER_PIXEL ticks. It stops
 * when nothing is left to bash within BASH_LOOKAHEAD pixels, and turns round at steel or at a
 * one-way area pointing against it (G-08).
 */
export function bash(state: GameState, lemming: Lemming): void {
  lemming.frame += 1;
  if (lemming.frame % BASH_TICKS_PER_PIXEL !== 0) return;
  if (blockedAhead(state, lemming)) {
    turn(lemming);
    setAction(lemming, 'walking');
    return;
  }
  const rows = { y0: lemming.y - LEMMING_HEIGHT + 1, y1: lemming.y };
  if (!anySolid(state, { ...columns(lemming, 1, BASH_LOOKAHEAD), ...rows })) {
    setAction(lemming, 'walking');
    return;
  }
  const reach = { ...columns(lemming, 1, BASH_REACH), ...rows };
  if (!allRemovable(state, reach, lemming.dir)) {
    emit(state, 'steel', lemming.x, lemming.y);
    turn(lemming);
    setAction(lemming, 'walking');
    return;
  }
  clear(state, reach, lemming.dir);
  lemming.x += lemming.dir;
  followGround(state, lemming);
}

/**
 * Miner (vision G-07): digs diagonally downwards, one pixel forward and one down every
 * MINE_TICKS_PER_STEP ticks; stops at steel and at one-way areas pointing against it.
 */
export function mine(state: GameState, lemming: Lemming): void {
  lemming.frame += 1;
  if (lemming.frame % MINE_TICKS_PER_STEP !== 0) return;
  const nextY = lemming.y + 1;
  const area = { ...columns(lemming, 1, BASH_REACH), y0: nextY - LEMMING_HEIGHT + 1, y1: nextY };
  if (!allRemovable(state, area, lemming.dir)) {
    emit(state, 'steel', lemming.x, lemming.y);
    setAction(lemming, 'walking');
    return;
  }
  clear(state, area, lemming.dir);
  lemming.x += lemming.dir;
  lemming.y = nextY;
  if (!isSolid(state.terrain, lemming.x, lemming.y + 1)) setAction(lemming, 'falling');
}

/**
 * Digger (vision G-07): digs straight down a hole 2 × DIG_HALF_WIDTH + 1 pixels wide, one row every
 * DIG_TICKS_PER_ROW ticks. It falls when the row below is empty and stops at steel.
 */
export function dig(state: GameState, lemming: Lemming): void {
  lemming.frame += 1;
  if (lemming.frame % DIG_TICKS_PER_ROW !== 0) return;
  const row = { x0: lemming.x - DIG_HALF_WIDTH, x1: lemming.x + DIG_HALF_WIDTH, y0: lemming.y + 1, y1: lemming.y + 1 };
  if (!anySolid(state, row)) {
    setAction(lemming, 'falling');
    return;
  }
  if (!allRemovable(state, row, 0)) {
    emit(state, 'steel', lemming.x, lemming.y);
    setAction(lemming, 'walking');
    return;
  }
  clear(state, row, 0);
  lemming.y += 1;
}
