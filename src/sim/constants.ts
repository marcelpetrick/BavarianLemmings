// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Every number about the original game, declared once with its unit, status and source.
 *
 * Status `unverified` means: taken from community behaviour descriptions or memory, not yet confirmed
 * by a documented DOS source (plan M6.123). `design` means: our own choice, no claim about the original.
 * Sources are behaviour descriptions only (vision X-05); no value is read from original files or code.
 */
import { constant } from './constant';

const COMMUNITY = 'community behaviour descriptions (Lemmings Forums, lemmings mechanics write-ups), not yet confirmed for DOS';

// Time
export const TICKS_PER_SECOND = constant('TICKS_PER_SECOND', 17, {
  unit: 'ticks/s',
  status: 'unverified',
  source: 'community engines run the original logic at about 17 updates per second (vision.md sources, lf-fps)',
});
export const TICK_MS = constant('TICK_MS', 1000 / TICKS_PER_SECOND, {
  unit: 'ms',
  status: 'unverified',
  source: 'derived from TICKS_PER_SECOND',
});

// Playfield and level
export const SCREEN_WIDTH = constant('SCREEN_WIDTH', 320, { unit: 'px', status: 'verified', source: 'DOS VGA mode 320×200 (DOS Days)' });
export const SCREEN_HEIGHT = constant('SCREEN_HEIGHT', 200, { unit: 'px', status: 'verified', source: 'DOS VGA mode 320×200 (DOS Days)' });
export const PLAYFIELD_HEIGHT = constant('PLAYFIELD_HEIGHT', 160, { unit: 'px', status: 'unverified', source: COMMUNITY });
export const PANEL_HEIGHT = constant('PANEL_HEIGHT', 40, {
  unit: 'px',
  status: 'unverified',
  source: 'SCREEN_HEIGHT minus PLAYFIELD_HEIGHT',
});
export const LEVEL_MAX_WIDTH = constant('LEVEL_MAX_WIDTH', 1600, { unit: 'px', status: 'unverified', source: COMMUNITY });
export const LEVEL_HEIGHT = constant('LEVEL_HEIGHT', 160, { unit: 'px', status: 'unverified', source: COMMUNITY });

// Lemmings
export const LEMMING_CAP = constant('LEMMING_CAP', 80, {
  unit: 'lemmings',
  status: 'unverified',
  source: 'Lemmings Forums: the PC version allows at most 80 lemmings per level (vision G-15)',
});
export const LEMMING_HEIGHT = constant('LEMMING_HEIGHT', 10, { unit: 'px', status: 'unverified', source: COMMUNITY });
export const STEP_UP_MAX = constant('STEP_UP_MAX', 6, { unit: 'px', status: 'unverified', source: COMMUNITY });
export const STEP_DOWN_MAX = constant('STEP_DOWN_MAX', 3, { unit: 'px', status: 'unverified', source: COMMUNITY });
export const FALL_SPEED = constant('FALL_SPEED', 3, { unit: 'px/tick', status: 'unverified', source: COMMUNITY });
export const SPLAT_FALL_HEIGHT = constant('SPLAT_FALL_HEIGHT', 60, { unit: 'px', status: 'unverified', source: COMMUNITY });
export const FLOATER_OPEN_DISTANCE = constant('FLOATER_OPEN_DISTANCE', 16, { unit: 'px', status: 'unverified', source: COMMUNITY });
export const FLOAT_SPEED = constant('FLOAT_SPEED', 2, { unit: 'px/tick', status: 'unverified', source: COMMUNITY });
export const CLIMB_TICKS_PER_PIXEL = constant('CLIMB_TICKS_PER_PIXEL', 2, { unit: 'ticks', status: 'unverified', source: COMMUNITY });

// Release rate and hatch
export const RELEASE_RATE_MIN = constant('RELEASE_RATE_MIN', 1, { unit: 'rate', status: 'verified', source: 'vision G-01' });
export const RELEASE_RATE_MAX = constant('RELEASE_RATE_MAX', 99, { unit: 'rate', status: 'verified', source: 'vision G-01' });
export const HATCH_OPEN_TICKS = constant('HATCH_OPEN_TICKS', 34, { unit: 'ticks', status: 'unverified', source: COMMUNITY });

// Skills
export const SKILL_COUNT_MAX = constant('SKILL_COUNT_MAX', 99, { unit: 'skills', status: 'verified', source: 'two-digit panel counters' });
export const BOMBER_COUNTDOWN_SECONDS = constant('BOMBER_COUNTDOWN_SECONDS', 5, { unit: 's', status: 'verified', source: 'vision G-05' });
export const OH_NO_TICKS = constant('OH_NO_TICKS', 16, { unit: 'ticks', status: 'unverified', source: COMMUNITY });
export const EXPLOSION_RADIUS = constant('EXPLOSION_RADIUS', 16, {
  unit: 'px',
  status: 'design',
  source: 'owner request 2026-10-12: larger suicide-bomber blast; twice the previous radius in both themes',
});
export const BLOCKER_REACH = constant('BLOCKER_REACH', 6, { unit: 'px', status: 'unverified', source: COMMUNITY });
export const BUILDER_BRICKS = constant('BUILDER_BRICKS', 12, { unit: 'bricks', status: 'verified', source: 'vision G-07' });
export const BRICK_WIDTH = constant('BRICK_WIDTH', 6, { unit: 'px', status: 'unverified', source: COMMUNITY });
export const BUILDER_TICKS_PER_BRICK = constant('BUILDER_TICKS_PER_BRICK', 16, { unit: 'ticks', status: 'unverified', source: COMMUNITY });
export const BUILDER_WARN_BRICKS = constant('BUILDER_WARN_BRICKS', 3, { unit: 'bricks', status: 'unverified', source: COMMUNITY });
export const SHRUG_TICKS = constant('SHRUG_TICKS', 8, { unit: 'ticks', status: 'unverified', source: COMMUNITY });
export const BASH_REACH = constant('BASH_REACH', 4, { unit: 'px', status: 'unverified', source: COMMUNITY });
export const BASH_LOOKAHEAD = constant('BASH_LOOKAHEAD', 8, { unit: 'px', status: 'unverified', source: COMMUNITY });
export const BASH_TICKS_PER_PIXEL = constant('BASH_TICKS_PER_PIXEL', 2, { unit: 'ticks', status: 'unverified', source: COMMUNITY });
export const MINE_TICKS_PER_STEP = constant('MINE_TICKS_PER_STEP', 3, { unit: 'ticks', status: 'unverified', source: COMMUNITY });
export const DIG_HALF_WIDTH = constant('DIG_HALF_WIDTH', 4, { unit: 'px', status: 'unverified', source: COMMUNITY });
export const DIG_TICKS_PER_ROW = constant('DIG_TICKS_PER_ROW', 2, { unit: 'ticks', status: 'unverified', source: COMMUNITY });

// Terminal animations
export const SPLAT_TICKS = constant('SPLAT_TICKS', 16, { unit: 'ticks', status: 'unverified', source: COMMUNITY });
export const DROWN_TICKS = constant('DROWN_TICKS', 16, { unit: 'ticks', status: 'unverified', source: COMMUNITY });
export const EXIT_TICKS = constant('EXIT_TICKS', 8, { unit: 'ticks', status: 'unverified', source: COMMUNITY });
export const TRAP_CYCLE_TICKS = constant('TRAP_CYCLE_TICKS', 20, { unit: 'ticks', status: 'unverified', source: COMMUNITY });

// Assignment and nuke
export const SELECT_HALF_WIDTH = constant('SELECT_HALF_WIDTH', 5, { unit: 'px', status: 'design', source: 'about the sprite width' });
export const NUKE_TICKS_PER_LEMMING = constant('NUKE_TICKS_PER_LEMMING', 1, { unit: 'ticks', status: 'unverified', source: COMMUNITY });

// Our conveniences (vision C-05, plan assumptions)
export const FAST_FORWARD_FACTOR = constant('FAST_FORWARD_FACTOR', 4, { unit: 'x', status: 'design', source: 'plan.md assumptions, Q-D4' });

/** Ticks between two spawns at a release rate (1..99). Higher rate, shorter gap. Unverified shape (plan M6.123). */
export function spawnInterval(releaseRate: number): number {
  return Math.floor((RELEASE_RATE_MAX - releaseRate) / 2) + 4;
}
