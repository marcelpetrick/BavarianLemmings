// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * A lemming is a plain record (architecture.md 6.4). Terms:
 * - *action*: what the lemming does right now (walking, falling, digging, ...).
 * - *skill*: what the player can assign (climber, ..., digger); some skills start an action,
 *   climber and floater are permanent abilities (vision G-04).
 * Position: `x` is the column of the feet, `y` the row of the feet; the lemming stands when the
 * pixel at (x, y + 1) is solid. The body occupies the rows y - LEMMING_HEIGHT + 1 .. y.
 */
export const ACTIONS = [
  'walking',
  'falling',
  'floating',
  'climbing',
  'blocking',
  'building',
  'shrugging',
  'bashing',
  'mining',
  'digging',
  'ohNo',
  'splatting',
  'drowning',
  'exiting',
] as const;
export type Action = (typeof ACTIONS)[number];
export type Direction = -1 | 1;

export interface Lemming {
  readonly id: number;
  x: number;
  y: number;
  dir: Direction;
  action: Action;
  /** Ticks spent in the current action: animation frame and action timer. */
  frame: number;
  /** Pixels fallen since the lemming last stood on ground. */
  fallDistance: number;
  climber: boolean;
  floater: boolean;
  /** Ticks until the bomber explodes; -1 when no countdown runs. */
  bombTicks: number;
  bricksLeft: number;
  /** Saved or dead; the record stays so that ids stay stable. */
  removed: boolean;
}

/** Actions that stand on the ground and accept a tool skill (builder, basher, miner, digger, blocker). */
export const GROUND_ACTIONS: readonly Action[] = ['walking', 'shrugging', 'building', 'bashing', 'mining', 'digging'];

/** Actions from which no skill can rescue the lemming any more. */
export const TERMINAL_ACTIONS: readonly Action[] = ['ohNo', 'splatting', 'drowning', 'exiting'];

export function createLemming(id: number, x: number, y: number, dir: Direction): Lemming {
  return {
    id,
    x,
    y,
    dir,
    action: 'falling',
    frame: 0,
    fallDistance: 0,
    climber: false,
    floater: false,
    bombTicks: -1,
    bricksLeft: 0,
    removed: false,
  };
}

export function setAction(lemming: Lemming, action: Action): void {
  lemming.action = action;
  lemming.frame = 0;
  if (action === 'falling') lemming.fallDistance = 0;
}

export function turn(lemming: Lemming): void {
  lemming.dir = lemming.dir === 1 ? -1 : 1;
}
